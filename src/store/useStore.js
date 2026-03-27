import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { getMarketPrice } from '../services/marketService'

export const useStore = create((set, get) => ({
  cuentas: [],
  transacciones: [],
  objetivos: [],
  categorias: ['Alimentación', 'Vivienda', 'Transporte', 'Ocio', 'Salud', 'Educación', 'Compras', 'Otros'],
  vistaActual: 'dashboard',
  tema: 'dark',

  setVistaActual: (vista) => set({ vistaActual: vista }),

  toggleTema: () => {
    const nuevoTema = get().tema === 'dark' ? 'light' : 'dark'
    set({ tema: nuevoTema })
    if (nuevoTema === 'light') {
      document.documentElement.classList.add('light-mode')
    } else {
      document.documentElement.classList.remove('light-mode')
    }
  },

  cargarDatosNube: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [resCuentas, resTransacciones, resObjetivos] = await Promise.all([
      supabase.from('cuentas').select('*').order('created_at', { ascending: true }),
      supabase.from('transacciones').select('*').order('created_at', { ascending: false }),
      supabase.from('objetivos').select('*').order('created_at', { ascending: true })
    ])

    const cuentasMapeadas = (resCuentas.data || []).map(c => ({
      ...c,
      capitalInvertido: c.capital_invertido,
      precioPromedio: c.precio_promedio,
      precioActual: c.precio_actual,
      tae: c.tae || 0
    }))

    const transaccionesMapeadas = (resTransacciones.data || []).map(t => ({
      ...t,
      cuentaId: t.cuenta_id,
      precioCompra: t.precio_compra
    }))

    const objetivosMapeados = (resObjetivos.data || []).map(o => ({
      ...o,
      aportacionExtra: o.aportacion_extra
    }))

    set({ cuentas: cuentasMapeadas, transacciones: transaccionesMapeadas, objetivos: objetivosMapeados })
  },

  actualizarPreciosMercado: async () => {
    const { cuentas } = get()
    const nuevasCuentas = JSON.parse(JSON.stringify(cuentas))
    let exitoGlobal = false

    for (let i = 0; i < nuevasCuentas.length; i++) {
      if (nuevasCuentas[i].tipo === 'inversion' && nuevasCuentas[i].ticker) {
        const precioReal = await getMarketPrice(nuevasCuentas[i].ticker)
        if (precioReal && precioReal > 0) {
          nuevasCuentas[i].precioActual = precioReal
          const participaciones = nuevasCuentas[i].capitalInvertido / nuevasCuentas[i].precioPromedio
          nuevasCuentas[i].saldo = participaciones * precioReal
          exitoGlobal = true
          
          await supabase.from('cuentas').update({ 
            saldo: nuevasCuentas[i].saldo, 
            precio_actual: precioReal 
          }).eq('id', nuevasCuentas[i].id)
        }
      }
    }
    if (exitoGlobal) set({ cuentas: nuevasCuentas })
  },

  agregarCuenta: async (nuevaCuenta) => {
    const { data: { user } } = await supabase.auth.getUser()
    const cuentaInsert = {
      user_id: user.id,
      nombre: nuevaCuenta.nombre,
      tipo: nuevaCuenta.tipo,
      saldo: Number(nuevaCuenta.saldo),
      icono: nuevaCuenta.icono,
      ticker: nuevaCuenta.ticker,
      tae: Number(nuevaCuenta.tae || 0),
      capital_invertido: nuevaCuenta.capitalInvertido || 0,
      precio_promedio: nuevaCuenta.precioPromedio || 1
    }

    const { data, error } = await supabase.from('cuentas').insert([cuentaInsert]).select()
    if (!error && data) {
      const cuentaFormateada = { 
        ...data[0], 
        capitalInvertido: data[0].capital_invertido, 
        precioPromedio: data[0].precio_promedio,
        tae: data[0].tae
      }
      set((state) => ({ cuentas: [...state.cuentas, cuentaFormateada] }))
    }
  },

  editarCuenta: async (id, datos) => {
    const { error } = await supabase.from('cuentas').update({
      nombre: datos.nombre,
      saldo: Number(datos.saldo),
      tae: Number(datos.tae || 0)
    }).eq('id', id)

    if (!error) {
      set((state) => ({
        cuentas: state.cuentas.map(c => c.id === id ? { ...c, ...datos, saldo: Number(datos.saldo ?? c.saldo), tae: Number(datos.tae ?? c.tae) } : c)
      }))
    }
  },

  eliminarCuenta: async (id) => {
    const { error } = await supabase.from('cuentas').delete().eq('id', id)
    if (!error) {
      set((state) => ({
        cuentas: state.cuentas.filter(c => c.id !== id),
        transacciones: state.transacciones.filter(t => t.cuentaId !== id)
      }))
    }
  },

  agregarTransaccion: async (tx) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    const txInsert = {
      user_id: user.id,
      cuenta_id: tx.cuentaId,
      monto: tx.monto,
      descripcion: tx.desc || tx.descripcion,
      categoria: tx.categoria,
      tipo: tx.tipo,
      fecha: tx.fecha,
      precio_compra: tx.precioCompra
    }

    const { data, error } = await supabase.from('transacciones').insert([txInsert]).select()
    if (error) return

    set((state) => {
      const nuevasCuentas = state.cuentas.map(c => {
        if (c.id !== tx.cuentaId) return c
        const nc = { ...c }
        if (nc.tipo === 'inversion') {
          const monto = Number(tx.monto)
          const precioCompra = Number(tx.precioCompra || nc.precioActual || nc.precioPromedio || 1)
          const partAnteriores = nc.precioPromedio > 0 ? nc.capitalInvertido / nc.precioPromedio : 0
          const partNuevas = monto / precioCompra
          nc.capitalInvertido = Number(nc.capitalInvertido) + monto
          nc.precioPromedio = nc.capitalInvertido / (partAnteriores + partNuevas)
          nc.saldo = (partAnteriores + partNuevas) * (nc.precioActual || precioCompra)
        } else {
          nc.saldo = Number(nc.saldo) + (tx.tipo === 'ingreso' ? Number(tx.monto) : -Number(tx.monto))
        }
        
        supabase.from('cuentas').update({ 
          saldo: nc.saldo, 
          capital_invertido: nc.capitalInvertido, 
          precio_promedio: nc.precioPromedio 
        }).eq('id', nc.id)
        
        return nc
      })
      
      const txFormateada = { ...data[0], cuentaId: data[0].cuenta_id, desc: data[0].descripcion, precioCompra: data[0].precio_compra }
      return { transacciones: [txFormateada, ...state.transacciones], cuentas: nuevasCuentas }
    })
  },

  eliminarTransaccion: async (id) => {
    const tx = get().transacciones.find(t => t.id === id)
    if (!tx) return

    const { error } = await supabase.from('transacciones').delete().eq('id', id)
    if (error) return

    set((state) => {
      const nuevasCuentas = state.cuentas.map(c => {
        if (c.id !== tx.cuentaId) return c
        const nc = { ...c }
        if (nc.tipo === 'inversion') {
          const monto = Number(tx.monto)
          const precioCompra = Number(tx.precioCompra || nc.precioPromedio || 1)
          const partEliminadas = monto / precioCompra
          const partTotales = nc.precioPromedio > 0 ? nc.capitalInvertido / nc.precioPromedio : 0
          const partRestantes = Math.max(0, partTotales - partEliminadas)
          nc.capitalInvertido = Math.max(0, nc.capitalInvertido - monto)
          nc.precioPromedio = partRestantes > 0 ? nc.capitalInvertido / partRestantes : 0
          nc.saldo = partRestantes * (nc.precioActual || nc.precioPromedio)
        } else {
          nc.saldo = Number(nc.saldo) + (tx.tipo === 'ingreso' ? -Number(tx.monto) : Number(tx.monto))
        }
        
        supabase.from('cuentas').update({ 
          saldo: nc.saldo, 
          capital_invertido: nc.capitalInvertido, 
          precio_promedio: nc.precioPromedio 
        }).eq('id', nc.id)
        
        return nc
      })
      return { transacciones: state.transacciones.filter(t => t.id !== id), cuentas: nuevasCuentas }
    })
  },

  agregarObjetivo: async (nuevoObjetivo) => {
    const { data: { user } } = await supabase.auth.getUser()
    const objetivoInsert = {
      user_id: user.id,
      nombre: nuevoObjetivo.nombre,
      meta: Number(nuevoObjetivo.meta),
      aportacion_extra: Number(nuevoObjetivo.aportacionExtra || 0),
      tasa: Number(nuevoObjetivo.tasa || 0)
    }

    const { data, error } = await supabase.from('objetivos').insert([objetivoInsert]).select()
    if (!error && data) {
      const objFormateado = { ...data[0], aportacionExtra: data[0].aportacion_extra }
      set((state) => ({ objetivos: [...state.objetivos, objFormateado] }))
    }
  },

  editarObjetivo: async (id, datos) => {
    const updateData = {
      nombre: datos.nombre,
      meta: datos.meta !== undefined ? Number(datos.meta) : undefined,
      aportacion_extra: datos.aportacionExtra !== undefined ? Number(datos.aportacionExtra) : undefined,
      tasa: datos.tasa !== undefined ? Number(datos.tasa) : undefined
    }

    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key])

    const { error } = await supabase.from('objetivos').update(updateData).eq('id', id)
    if (!error) {
      set((state) => ({
        objetivos: state.objetivos.map(o => o.id === id ? { ...o, ...datos } : o)
      }))
    }
  },

  eliminarObjetivo: async (id) => {
    const { error } = await supabase.from('objetivos').delete().eq('id', id)
    if (!error) {
      set((state) => ({
        objetivos: state.objetivos.filter(o => o.id !== id)
      }))
    }
  },

  patrimonioTotal: () => get().cuentas.reduce((acc, c) => acc + (Number(c.saldo) || 0), 0),

  metricasMesActual: () => {
    const hoy = new Date()
    const mesActual = hoy.getMonth() + 1
    const añoActual = hoy.getFullYear()
    const { transacciones, cuentas } = get()
    const txsMes = transacciones.filter(t => {
      if (!t.fecha) return false
      const partes = t.fecha.split('/')
      if (partes.length < 3) return false
      const mes = parseInt(partes[1])
      const año = parseInt(partes[2])
      const cuenta = cuentas.find(c => c.id === t.cuentaId)
      return mes === mesActual && año === añoActual && cuenta?.tipo !== 'inversion'
    })
    const ingresos = txsMes.filter(t => t.tipo === 'ingreso').reduce((acc, t) => acc + Number(t.monto), 0)
    const gastos = txsMes.filter(t => t.tipo === 'gasto').reduce((acc, t) => acc + Number(t.monto), 0)
    return { ingresos, gastos, balance: ingresos - gastos }
  },

  metricasInversion: () => {
    const inversiones = get().cuentas.filter(c => c.tipo === 'inversion')
    const invertido = inversiones.reduce((acc, c) => acc + Number(c.capitalInvertido || 0), 0)
    const valorActual = inversiones.reduce((acc, c) => acc + Number(c.saldo || 0), 0)
    const rendimiento = invertido > 0 ? ((valorActual - invertido) / invertido) * 100 : 0
    return { invertido, valorActual, rendimiento }
  }
}))