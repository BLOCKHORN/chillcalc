import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { getMarketPrice } from '../services/marketService'

export const useStore = create((set, get) => ({
  cuentas: [],
  transacciones: [],
  objetivos: [],
  categorias: [], 
  gruposSplit: [],
  suscripciones: [],
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

    const [resCuentas, resTransacciones, resObjetivos, resCategorias, resSplit, resSuscripciones] = await Promise.all([
      supabase.from('cuentas').select('*').order('created_at', { ascending: true }),
      supabase.from('transacciones').select('*').order('created_at', { ascending: false }),
      supabase.from('objetivos').select('*').order('created_at', { ascending: true }),
      supabase.from('categorias').select('*').order('nombre', { ascending: true }),
      supabase.from('split_grupos').select('*, split_participantes(*), split_gastos(*)').order('created_at', { ascending: false }),
      supabase.from('suscripciones').select('*').order('proximo_cobro', { ascending: true })
    ])

    let listaCategorias = resCategorias.data?.map(c => ({
      id: c.id,
      nombre: c.nombre,
      emoji: c.emoji || '🏷️',
      color: c.color || 'slate'
    })) || []
    
    if (listaCategorias.length === 0) {
      const basicas = [
        { nombre: 'Alimentación', emoji: '🍽️', color: 'orange' },
        { nombre: 'Vivienda', emoji: '🏠', color: 'blue' },
        { nombre: 'Transporte', emoji: '🚗', color: 'emerald' },
        { nombre: 'Ocio', emoji: '🎮', color: 'purple' },
        { nombre: 'Salud', emoji: '❤️', color: 'rose' },
        { nombre: 'Educación', emoji: '📚', color: 'yellow' },
        { nombre: 'Compras', emoji: '🛍️', color: 'pink' },
        { nombre: 'Otros', emoji: '🏷️', color: 'slate' }
      ]
      
      const inserts = basicas.map(cat => ({ 
        user_id: user.id, 
        nombre: cat.nombre,
        emoji: cat.emoji,
        color: cat.color
      }))
      
      const { data } = await supabase.from('categorias').insert(inserts).select()
      listaCategorias = data?.map(c => ({ id: c.id, nombre: c.nombre, emoji: c.emoji, color: c.color })) || basicas
    }

    const cuentasMapeadas = (resCuentas.data || []).map(c => ({
      ...c,
      capitalInvertido: Number(c.capital_invertido || 0),
      precioPromedio: Number(c.precio_promedio || 1),
      precioActual: Number(c.precio_actual || 0),
      tae: Number(c.tae || 0),
      saldo: Number(c.saldo || 0),
      moneda: c.moneda || 'EUR'
    }))

    const transaccionesMapeadas = (resTransacciones.data || []).map(t => ({
      ...t,
      cuentaId: t.cuenta_id,
      cuentaDestinoId: t.cuenta_destino_id,
      precioCompra: t.precio_compra,
      desc: t.descripcion
    }))

    const objetivosMapeados = (resObjetivos.data || []).map(o => ({
      ...o,
      aportacionExtra: o.aportacion_extra
    }))

    set({ 
      cuentas: cuentasMapeadas, 
      transacciones: transaccionesMapeadas, 
      objetivos: objetivosMapeados,
      categorias: listaCategorias,
      gruposSplit: resSplit.data || [],
      suscripciones: resSuscripciones.data || []
    })
    get().actualizarPreciosMercado()   
  },

  agregarCategoria: async (nuevaCat) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('categorias').insert([{ 
      user_id: user.id, 
      nombre: nuevaCat.nombre,
      emoji: nuevaCat.emoji || '🏷️',
      color: nuevaCat.color || 'slate'
    }])
    
    if (!error) {
      await get().cargarDatosNube()
    }
  },

  eliminarCategoria: async (id) => {
    const { error } = await supabase.from('categorias').delete().eq('id', id)
    if (!error) {
      await get().cargarDatosNube()
    }
  },

  actualizarPreciosMercado: async (idEspecifico = null) => {
    const { cuentas } = get()
    const nuevasCuentas = JSON.parse(JSON.stringify(cuentas))
    let exitoGlobal = false

    for (let i = 0; i < nuevasCuentas.length; i++) {
      const c = nuevasCuentas[i]
      if (c.tipo === 'inversion' && c.ticker && (!idEspecifico || c.id === idEspecifico)) {
        const precioReal = await getMarketPrice(c.ticker, c.moneda)
        if (precioReal && precioReal > 0) {
          const participaciones = Number(c.capitalInvertido) / (Number(c.precioPromedio) || 1)
          const nuevoSaldo = participaciones * precioReal
          
          nuevasCuentas[i].precioActual = precioReal
          nuevasCuentas[i].saldo = nuevoSaldo
          exitoGlobal = true
          
          await supabase.from('cuentas').update({ 
            saldo: nuevoSaldo, 
            precio_actual: precioReal 
          }).eq('id', c.id)
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
      capital_invertido: Number(nuevaCuenta.capitalInvertido || 0),
      precio_promedio: Number(nuevaCuenta.precioPromedio || 1),
      moneda: nuevaCuenta.moneda || 'EUR'
    }

    const { data, error } = await supabase.from('cuentas').insert([cuentaInsert]).select()
    if (!error && data) {
      const cuentaFormateada = { 
        ...data[0], 
        capitalInvertido: data[0].capital_invertido, 
        precioPromedio: data[0].precio_promedio,
        tae: data[0].tae,
        moneda: data[0].moneda || 'EUR'
      }
      set((state) => ({ cuentas: [...state.cuentas, cuentaFormateada] }))
    }
  },

  editarCuenta: async (id, datos) => {
    const cuentaActual = get().cuentas.find(c => c.id === id)
    if (!cuentaActual) return

    let saldoFinal = Number(datos.saldo)
    if (datos.tipo === 'inversion' || cuentaActual.tipo === 'inversion') {
      const capital = datos.capitalInvertido !== undefined ? Number(datos.capitalInvertido) : Number(cuentaActual.capitalInvertido)
      const promedio = datos.precioPromedio !== undefined ? Number(datos.precioPromedio) : Number(cuentaActual.precioPromedio)
      const pActual = cuentaActual.precioActual || promedio
      
      saldoFinal = (capital / (promedio || 1)) * pActual
    }

    const updateData = {
      nombre: datos.nombre,
      saldo: saldoFinal,
      tae: Number(datos.tae || 0),
      ticker: datos.ticker !== undefined ? datos.ticker : cuentaActual.ticker,
      capital_invertido: datos.capitalInvertido !== undefined ? Number(datos.capitalInvertido) : undefined,
      precio_promedio: datos.precioPromedio !== undefined ? Number(datos.precioPromedio) : undefined,
      moneda: datos.moneda !== undefined ? datos.moneda : cuentaActual.moneda
    }

    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key])

    const { error } = await supabase.from('cuentas').update(updateData).eq('id', id)

    if (!error) {
      set((state) => ({
        cuentas: state.cuentas.map(c => c.id === id ? { ...c, ...datos, saldo: saldoFinal } : c)
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
      cuenta_destino_id: tx.tipo === 'transferencia' ? tx.cuentaDestinoId : null,
      monto: Number(tx.monto),
      descripcion: tx.desc || tx.descripcion,
      categoria: tx.tipo === 'transferencia' ? 'Traspaso' : tx.categoria,
      tipo: tx.tipo,
      fecha: tx.fecha,
      precio_compra: tx.precioCompra
    }

    const { data, error } = await supabase.from('transacciones').insert([txInsert]).select()
    if (error) {
      console.error("Error al guardar transacción:", error)
      return
    }

    set((state) => {
      const nuevasCuentas = state.cuentas.map(c => {
        const nc = { ...c }
        let actualizarDB = false

        if (nc.id === tx.cuentaId) {
          if (tx.tipo === 'transferencia') {
            nc.saldo = Number(nc.saldo) - Number(tx.monto)
            actualizarDB = true
          } else if (nc.tipo === 'inversion') {
            const monto = Number(tx.monto)
            const precioCompra = Number(tx.precioCompra || nc.precioActual || nc.precioPromedio || 1)
            const partAnteriores = nc.precioPromedio > 0 ? nc.capitalInvertido / nc.precioPromedio : 0
            const partNuevas = monto / precioCompra
            nc.capitalInvertido = Number(nc.capitalInvertido) + monto
            nc.precioPromedio = nc.capitalInvertido / (partAnteriores + partNuevas)
            nc.saldo = (partAnteriores + partNuevas) * (nc.precioActual || precioCompra)
            actualizarDB = true
          } else {
            nc.saldo = Number(nc.saldo) + (tx.tipo === 'ingreso' ? Number(tx.monto) : -Number(tx.monto))
            actualizarDB = true
          }
        }

        if (tx.tipo === 'transferencia' && nc.id === tx.cuentaDestinoId) {
          nc.saldo = Number(nc.saldo) + Number(tx.monto)
          actualizarDB = true
        }

        if (actualizarDB) {
          supabase.from('cuentas').update({ 
            saldo: nc.saldo, 
            capital_invertido: nc.capitalInvertido, 
            precio_promedio: nc.precioPromedio 
          }).eq('id', nc.id).then(({ error: updateError }) => {
            if (updateError) console.error("Error al actualizar cuenta:", updateError)
          })
        }

        return nc
      })
      
      const txFormateada = { 
        ...data[0], 
        cuentaId: data[0].cuenta_id, 
        cuentaDestinoId: data[0].cuenta_destino_id,
        desc: data[0].descripcion, 
        precioCompra: data[0].precio_compra 
      }
      return { transacciones: [txFormateada, ...state.transacciones], cuentas: nuevasCuentas }
    })
  },

  editarTransaccion: async (id, tx) => {
    const { transacciones } = get()
    const txVieja = transacciones.find(t => t.id === id)
    if (!txVieja) return

    const txUpdate = {
      cuenta_id: tx.cuentaId,
      cuenta_destino_id: tx.tipo === 'transferencia' ? tx.cuentaDestinoId : null,
      monto: Number(tx.monto),
      descripcion: tx.desc || tx.descripcion,
      categoria: tx.tipo === 'transferencia' ? 'Traspaso' : tx.categoria,
      tipo: tx.tipo,
      fecha: tx.fecha,
      precio_compra: tx.precioCompra
    }

    const { error } = await supabase.from('transacciones').update(txUpdate).eq('id', id).select()
    if (error) {
      console.error("Error al editar transacción:", error)
      return
    }

    await get().cargarDatosNube()
  },

  eliminarTransaccion: async (id) => {
    const tx = get().transacciones.find(t => t.id === id)
    if (!tx) return
    const { error } = await supabase.from('transacciones').delete().eq('id', id)
    if (error) {
      console.error("Error al eliminar transacción:", error)
      return
    }
    
    set((state) => {
      const nuevasCuentas = state.cuentas.map(c => {
        const nc = { ...c }
        let actualizarDB = false

        if (nc.id === tx.cuentaId) {
          if (tx.tipo === 'transferencia') {
            nc.saldo = Number(nc.saldo) + Number(tx.monto)
            actualizarDB = true
          } else if (nc.tipo === 'inversion') {
            const monto = Number(tx.monto)
            const precioCompra = Number(tx.precioCompra || nc.precioPromedio || 1)
            const partEliminadas = monto / precioCompra
            const partTotales = nc.precioPromedio > 0 ? nc.capitalInvertido / nc.precioPromedio : 0
            const partRestantes = Math.max(0, partTotales - partEliminadas)
            nc.capitalInvertido = Math.max(0, nc.capitalInvertido - monto)
            nc.precioPromedio = partRestantes > 0 ? nc.capitalInvertido / partRestantes : 0
            nc.saldo = partRestantes * (nc.precioActual || nc.precioPromedio)
            actualizarDB = true
          } else {
            nc.saldo = Number(nc.saldo) + (tx.tipo === 'ingreso' ? -Number(tx.monto) : Number(tx.monto))
            actualizarDB = true
          }
        }

        if (tx.tipo === 'transferencia' && nc.id === tx.cuentaDestinoId) {
          nc.saldo = Number(nc.saldo) - Number(tx.monto)
          actualizarDB = true
        }

        if (actualizarDB) {
          supabase.from('cuentas').update({ 
            saldo: nc.saldo, 
            capital_invertido: nc.capitalInvertido, 
            precio_promedio: nc.precioPromedio 
          }).eq('id', nc.id).then(({ error: updateError }) => {
            if (updateError) console.error("Error al revertir saldo de cuenta:", updateError)
          })
        }

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
      aportacion_extra: Number(nuevoObjetivo.aportacion_extra || 0),
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

  crearGrupoSplit: async (nombre, participantesNombres) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: grupo, error } = await supabase.from('split_grupos').insert([{ nombre, user_id: user.id }]).select().single()
    if (grupo && !error) {
      const parts = participantesNombres.map(n => ({ grupo_id: grupo.id, nombre: n }))
      await supabase.from('split_participantes').insert(parts)
      await get().cargarDatosNube()
    }
  },

  eliminarGrupoSplit: async (id) => {
    const { error } = await supabase.from('split_grupos').delete().eq('id', id)
    if (!error) {
      set(state => ({ gruposSplit: state.gruposSplit.filter(g => g.id !== id) }))
    }
  },

  agregarGastoSplit: async (gasto) => {
    const { error } = await supabase.from('split_gastos').insert([gasto])
    if (!error) {
      await get().cargarDatosNube()
    }
  },

  eliminarGastoSplit: async (id) => {
    const { error } = await supabase.from('split_gastos').delete().eq('id', id)
    if (!error) {
      await get().cargarDatosNube()
    }
  },

  cargarGrupoPublico: async (token) => {
    const { data: grupo, error } = await supabase
      .from('split_grupos')
      .select('*, split_participantes(*), split_gastos(*)')
      .eq('share_token', token)
      .single()

    if (error || !grupo) return null
    return grupo
  },

  obtenerEnlaceCompartir: (grupo) => {
    if (!grupo || !grupo.share_token) return null
    const baseUrl = window.location.origin
    return `${baseUrl}/split/${grupo.share_token}`
  },

  agregarSuscripcion: async (sub) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase.from('suscripciones').insert([{
      user_id: user.id,
      nombre: sub.nombre,
      monto: Number(sub.monto),
      frecuencia: sub.frecuencia,
      proximo_cobro: sub.proximoCobro,
      cuenta_id: sub.cuentaId,
      categoria: sub.categoria
    }]).select()

    if (!error && data) {
      set(state => ({
        suscripciones: [...state.suscripciones, data[0]].sort((a, b) => new Date(a.proximo_cobro) - new Date(b.proximo_cobro))
      }))
    }
  },

  eliminarSuscripcion: async (id) => {
    const { error } = await supabase.from('suscripciones').delete().eq('id', id)
    if (!error) {
      set(state => ({ suscripciones: state.suscripciones.filter(s => s.id !== id) }))
    }
  },

  pagarSuscripcion: async (id) => {
    const sub = get().suscripciones.find(s => s.id === id)
    if (!sub) return

    const hoy = new Date()
    const fechaTx = `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`

    await get().agregarTransaccion({
      cuentaId: sub.cuenta_id,
      monto: sub.monto,
      desc: sub.nombre,
      categoria: sub.categoria,
      tipo: 'gasto',
      fecha: fechaTx
    })

    const [year, month, day] = sub.proximo_cobro.split('-')
    const fechaCobro = new Date(year, month - 1, day)
    
    if (sub.frecuencia === 'mensual') {
      fechaCobro.setMonth(fechaCobro.getMonth() + 1)
    } else if (sub.frecuencia === 'anual') {
      fechaCobro.setFullYear(fechaCobro.getFullYear() + 1)
    }

    const nuevoProximoCobro = `${fechaCobro.getFullYear()}-${String(fechaCobro.getMonth() + 1).padStart(2, '0')}-${String(fechaCobro.getDate()).padStart(2, '0')}`

    const { error } = await supabase.from('suscripciones').update({ proximo_cobro: nuevoProximoCobro }).eq('id', id)
    
    if (!error) {
      set(state => ({
        suscripciones: state.suscripciones.map(s => s.id === id ? { ...s, proximo_cobro: nuevoProximoCobro } : s).sort((a, b) => new Date(a.proximo_cobro) - new Date(b.proximo_cobro))
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