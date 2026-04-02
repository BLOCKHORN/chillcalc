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

    // CORRECCIÓN: Guardar SIEMPRE el id real. Y NUNCA insertar por defecto si está vacío.
    const listaCategorias = resCategorias.data?.map(c => ({
      id: c.id,
      nombre: c.nombre,
      emoji: c.emoji || '🏷️',
      color: c.color || 'slate'
    })) || []

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
    } else {
      console.error("Error al crear categoría:", error)
    }
  },

  eliminarCategoria: async (id) => {
    // Solo borramos por ID, es la única forma segura.
    const { error } = await supabase.from('categorias').delete().eq('id', id)
    
    if (!error) {
      await get().cargarDatosNube()
    } else {
      console.error("Error al eliminar categoría:", error)
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
      await get().cargarDatosNube()
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
      await get().cargarDatosNube()
    }
  },

  eliminarCuenta: async (id) => {
    const { error } = await supabase.from('cuentas').delete().eq('id', id)
    if (!error) {
      await get().cargarDatosNube()
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

    const { error: txError } = await supabase.from('transacciones').insert([txInsert])
    
    if (txError) {
      alert("Error en BD: " + txError.message)
      return
    }

    const cuentaOrigen = get().cuentas.find(c => String(c.id) === String(tx.cuentaId))
    
    if (cuentaOrigen) {
      let nuevoSaldoOrigen = Number(cuentaOrigen.saldo)
      
      if (tx.tipo === 'gasto' || tx.tipo === 'transferencia') {
        nuevoSaldoOrigen -= Number(tx.monto)
      } else if (tx.tipo === 'ingreso' && cuentaOrigen.tipo !== 'inversion') {
        nuevoSaldoOrigen += Number(tx.monto)
      }

      await supabase.from('cuentas').update({ saldo: nuevoSaldoOrigen }).eq('id', cuentaOrigen.id)
    }

    if (tx.tipo === 'transferencia') {
      const cuentaDestino = get().cuentas.find(c => String(c.id) === String(tx.cuentaDestinoId))
      if (cuentaDestino) {
        const nuevoSaldoDestino = Number(cuentaDestino.saldo) + Number(tx.monto)
        await supabase.from('cuentas').update({ saldo: nuevoSaldoDestino }).eq('id', cuentaDestino.id)
      }
    }

    if (cuentaOrigen?.tipo === 'inversion' && tx.tipo === 'ingreso') {
         const monto = Number(tx.monto)
         const precioCompra = Number(tx.precioCompra || cuentaOrigen.precioActual || cuentaOrigen.precioPromedio || 1)
         const partAnteriores = cuentaOrigen.precioPromedio > 0 ? cuentaOrigen.capitalInvertido / cuentaOrigen.precioPromedio : 0
         const partNuevas = monto / precioCompra
         const nuevoCapital = Number(cuentaOrigen.capitalInvertido) + monto
         const nuevoPromedio = nuevoCapital / (partAnteriores + partNuevas)
         const saldoFinal = (partAnteriores + partNuevas) * (cuentaOrigen.precioActual || precioCompra)

         await supabase.from('cuentas').update({
             saldo: saldoFinal,
             capital_invertido: nuevoCapital,
             precio_promedio: nuevoPromedio
         }).eq('id', cuentaOrigen.id)
    }

    await get().cargarDatosNube()
  },

  editarTransaccion: async (id, tx) => {
    const txVieja = get().transacciones.find(t => String(t.id) === String(id))
    if (!txVieja) return

    const cuentasActualizadas = JSON.parse(JSON.stringify(get().cuentas))

    const revertirSaldo = (cuentaId, tipo, monto, destinoId) => {
      const cOrigen = cuentasActualizadas.find(c => String(c.id) === String(cuentaId))
      if (cOrigen) {
        if (tipo === 'gasto' || tipo === 'transferencia') cOrigen.saldo += Number(monto)
        if (tipo === 'ingreso' && cOrigen.tipo !== 'inversion') cOrigen.saldo -= Number(monto)
      }
      if (tipo === 'transferencia') {
        const cDestino = cuentasActualizadas.find(c => String(c.id) === String(destinoId))
        if (cDestino) cDestino.saldo -= Number(monto)
      }
    }

    const aplicarSaldo = (cuentaId, tipo, monto, destinoId) => {
      const cOrigen = cuentasActualizadas.find(c => String(c.id) === String(cuentaId))
      if (cOrigen) {
        if (tipo === 'gasto' || tipo === 'transferencia') cOrigen.saldo -= Number(monto)
        if (tipo === 'ingreso' && cOrigen.tipo !== 'inversion') cOrigen.saldo += Number(monto)
      }
      if (tipo === 'transferencia') {
        const cDestino = cuentasActualizadas.find(c => String(c.id) === String(destinoId))
        if (cDestino) cDestino.saldo += Number(monto)
      }
    }

    revertirSaldo(txVieja.cuentaId, txVieja.tipo, txVieja.monto, txVieja.cuentaDestinoId)
    aplicarSaldo(tx.cuentaId, tx.tipo, tx.monto, tx.cuentaDestinoId)

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

    const { error } = await supabase.from('transacciones').update(txUpdate).eq('id', id)
    if (error) {
      alert("Error al editar en BD: " + error.message)
      return
    }

    const cuentasAfectadas = [...new Set([
      String(txVieja.cuentaId), String(txVieja.cuentaDestinoId),
      String(tx.cuentaId), String(tx.cuentaDestinoId)
    ].filter(Boolean))]

    for (let cid of cuentasAfectadas) {
      const cuenta = cuentasActualizadas.find(c => String(c.id) === cid)
      if (cuenta) {
        await supabase.from('cuentas').update({ saldo: cuenta.saldo }).eq('id', cuenta.id)
      }
    }

    await get().cargarDatosNube()
  },

  eliminarTransaccion: async (id) => {
    const tx = get().transacciones.find(t => String(t.id) === String(id))
    if (!tx) return

    const { error: delError } = await supabase.from('transacciones').delete().eq('id', id)
    if (delError) {
      alert("Error al eliminar en BD: " + delError.message)
      return
    }

    const cuentaOrigen = get().cuentas.find(c => String(c.id) === String(tx.cuentaId))
    if (cuentaOrigen) {
      let saldoRevertido = Number(cuentaOrigen.saldo)
      if (tx.tipo === 'gasto' || tx.tipo === 'transferencia') {
        saldoRevertido += Number(tx.monto)
      } else if (tx.tipo === 'ingreso' && cuentaOrigen.tipo !== 'inversion') {
        saldoRevertido -= Number(tx.monto)
      }
      await supabase.from('cuentas').update({ saldo: saldoRevertido }).eq('id', cuentaOrigen.id)
    }

    if (tx.tipo === 'transferencia') {
      const cuentaDestino = get().cuentas.find(c => String(c.id) === String(tx.cuentaDestinoId))
      if (cuentaDestino) {
         const saldoRevertidoDestino = Number(cuentaDestino.saldo) - Number(tx.monto)
         await supabase.from('cuentas').update({ saldo: saldoRevertidoDestino }).eq('id', cuentaDestino.id)
      }
    }

    await get().cargarDatosNube()
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
    const { error } = await supabase.from('objetivos').insert([objetivoInsert])
    if (!error) {
      await get().cargarDatosNube()
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
      await get().cargarDatosNube()
    }
  },

  eliminarObjetivo: async (id) => {
    const { error } = await supabase.from('objetivos').delete().eq('id', id)
    if (!error) {
      await get().cargarDatosNube()
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
      await get().cargarDatosNube()
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
    const { error } = await supabase.from('suscripciones').insert([{
      user_id: user.id,
      nombre: sub.nombre,
      monto: Number(sub.monto),
      frecuencia: sub.frecuencia,
      proximo_cobro: sub.proximoCobro,
      cuenta_id: sub.cuentaId,
      categoria: sub.categoria
    }])

    if (!error) {
      await get().cargarDatosNube()
    }
  },

  eliminarSuscripcion: async (id) => {
    const { error } = await supabase.from('suscripciones').delete().eq('id', id)
    if (!error) {
      await get().cargarDatosNube()
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
      await get().cargarDatosNube()
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