import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { getMarketPrice } from '../services/marketService'

export const useStore = create((set, get) => ({
  userId: null,
  rolUsuario: 'usuario',
  cuentas: [],
  transacciones: [],
  objetivos: [],
  categorias: [], 
  gruposSplit: [],
  suscripciones: [],
  presupuestos: [],
  notasDiarias: [],
  insights: [],
  vistaActual: 'dashboard',
  tema: 'dark',
  toast: null,
  modoPrivacidad: false,

  toggleModoPrivacidad: () => set(state => ({ modoPrivacidad: !state.modoPrivacidad })),

  getHoyFormatted: () => {
    const hoy = new Date()
    return `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`
  },

  formatCurrency: (amount) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount || 0)
  },

  getBankLogo: (nombre) => {
    if (!nombre) return null
    const n = nombre.toLowerCase()
    const banks = {
      'bbva': 'www.bbva.es',
      'ing': 'www.ing.es',
      'revolut': 'www.revolut.com',
      'santander': 'www.santander.com',
      'caixabank': 'www.caixabank.es',
      'bankinter': 'www.bankinter.com',
      'sabadell': 'www.bancosabadell.com',
      'n26': 'n26.com',
      'abanca': 'www.abanca.com',
      'openbank': 'www.openbank.es',
      'xtb': 'www.xtb.com',
      'trade republic': 'traderepublic.com',
      'coinbase': 'www.coinbase.com',
      'binance': 'www.binance.com',
      'kraken': 'www.kraken.com',
      'degiro': 'www.degiro.es',
      'netflix': 'www.netflix.com',
      'spotify': 'www.spotify.com',
      'disney': 'www.disneyplus.com',
      'amazon': 'www.amazon.es',
      'hbo': 'www.max.com',
      'apple': 'www.apple.com',
      'google': 'www.google.com',
      'microsoft': 'www.microsoft.com',
      'chatgpt': 'openai.com',
      'midjourney': 'midjourney.com',
      'adobe': 'www.adobe.com',
      'canva': 'www.canva.com',
      'figma': 'www.figma.com'
    }
    const key = Object.keys(banks).find(k => n.includes(k))
    return key ? `https://www.google.com/s2/favicons?domain=${banks[key]}&sz=128` : null
  },

  mostrarToast: (mensaje, tipo = 'info') => {
    set({ toast: { mensaje, tipo } })
    setTimeout(() => set({ toast: null }), 3000)
  },

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
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return
    
    const currentUserId = session.user.id
    set({ userId: currentUserId })

    const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', currentUserId).single()
    if (perfil) set({ rolUsuario: perfil.rol })

    // Ejecutamos cada petición por separado para que un 404 no rompa el resto
    const fetchTable = async (table, query = null) => {
      try {
        let base = supabase.from(table).select(query || '*')
        if (table === 'cuentas') base = base.eq('user_id', currentUserId).order('created_at', { ascending: true })
        else if (table === 'transacciones') base = base.eq('user_id', currentUserId).order('created_at', { ascending: false })
        else if (table === 'objetivos') base = base.eq('user_id', currentUserId).order('created_at', { ascending: true })
        else if (table === 'categorias') base = base.eq('user_id', currentUserId).order('nombre', { ascending: true })
        else if (table === 'suscripciones') base = base.eq('user_id', currentUserId).order('proximo_cobro', { ascending: true })
        else base = base.eq('user_id', currentUserId)
        
        const { data, error } = await base
        if (error) throw error
        return data || []
      } catch (err) {
        console.warn(`Aviso: No se pudo cargar la tabla [${table}]. Es posible que no esté creada aún.`, err.message)
        return []
      }
    }

    const [
      dataCuentas, dataTransacciones, dataObjetivos, 
      dataCategorias, dataSplit, dataSuscripciones, 
      dataPresupuestos, dataNotas
    ] = await Promise.all([
      fetchTable('cuentas'),
      fetchTable('transacciones'),
      fetchTable('objetivos'),
      fetchTable('categorias'),
      fetchTable('split_grupos', '*, split_participantes(*), split_gastos(*), split_liquidaciones(*)'),
      fetchTable('suscripciones'),
      fetchTable('presupuestos'),
      fetchTable('notas_diarias')
    ])

    const listaCategorias = dataCategorias.map(c => ({
      id: c.id,
      nombre: c.nombre,
      emoji: c.emoji || '',
      color: c.color || 'slate'
    }))

    const cuentasMapeadas = dataCuentas.map(c => ({
      ...c,
      capitalInvertido: Number(c.capital_invertido || 0),
      precioPromedio: Number(c.precio_promedio || 1),
      precioActual: Number(c.precio_actual || 0),
      tae: Number(c.tae || 0),
      saldo: Number(c.saldo || 0),
      moneda: c.moneda || 'EUR',
      favorita: Boolean(c.favorita)
    }))

    const transaccionesMapeadas = dataTransacciones.map(t => ({
      ...t,
      cuentaId: t.cuenta_id,
      cuentaDestinoId: t.cuenta_destino_id,
      precioCompra: t.precio_compra,
      desc: t.descripcion
    }))

    const objetivosMapeados = dataObjetivos.map(o => ({
      ...o,
      aportacionExtra: o.aportacion_extra
    }))

    set({ 
      cuentas: cuentasMapeadas, 
      transacciones: transaccionesMapeadas, 
      objetivos: objetivosMapeados,
      categorias: listaCategorias,
      gruposSplit: dataSplit,
      suscripciones: dataSuscripciones,
      presupuestos: dataPresupuestos,
      notasDiarias: dataNotas
    })
    
    get().generarInsights()
    get().actualizarPreciosMercado()   
  },

  guardarNota: async (fecha, contenido) => {
    const { userId, cargarDatosNube, mostrarToast } = get()
    try {
      const { data: existente } = await supabase.from('notas_diarias').select('id').eq('user_id', userId).eq('fecha', fecha).single()
      if (existente) {
        await supabase.from('notas_diarias').update({ contenido }).eq('id', existente.id)
      } else {
        await supabase.from('notas_diarias').insert([{ user_id: userId, fecha, contenido }])
      }
      await cargarDatosNube()
      mostrarToast('Nota guardada', 'success')
    } catch (e) {
      console.error(e)
      mostrarToast('Error al guardar nota (¿Creaste la tabla?)', 'error')
    }
  },

  generarInsights: () => {
    const { transacciones, presupuestos } = get()
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear

    const insights = []

    presupuestos.forEach(p => {
      const gastoActual = transacciones
        .filter(t => t.categoria === p.categoria && t.tipo === 'gasto' && t.categoria !== 'Ajuste')
        .filter(t => {
          const partes = t.fecha.split('/')
          return parseInt(partes[1]) === currentMonth && parseInt(partes[2]) === currentYear
        })
        .reduce((s, t) => s + t.monto, 0)

      if (gastoActual > p.limite * 0.9) {
        insights.push({
          id: `budget-${p.categoria}`,
          tipo: 'warning',
          titulo: `Límite en ${p.categoria}`,
          mensaje: `Has consumido el ${(gastoActual/p.limite*100).toFixed(0)}% de tu presupuesto.`
        })
      }
    })

    const categoriasUnicas = [...new Set(transacciones.map(t => t.categoria))].filter(cat => cat !== 'Ajuste')
    categoriasUnicas.forEach(cat => {
      const getGasto = (m, y) => transacciones
        .filter(t => t.categoria === cat && t.tipo === 'gasto' && t.categoria !== 'Ajuste')
        .filter(t => {
          const partes = t.fecha.split('/')
          return parseInt(partes[1]) === m && parseInt(partes[2]) === y
        })
        .reduce((s, t) => s + t.monto, 0)

      const actual = getGasto(currentMonth, currentYear)
      const anterior = getGasto(prevMonth, prevYear)

      if (anterior > 100 && actual > anterior * 1.2) {
        insights.push({
          id: `trend-${cat}`,
          tipo: 'info',
          titulo: `Aumento en ${cat}`,
          mensaje: `Tus gastos han subido un ${((actual/anterior-1)*100).toFixed(0)}% este mes.`
        })
      }
    })

    set({ insights })
  },

  actualizarPresupuesto: async (categoria, limite) => {
    const { userId, cargarDatosNube } = get()
    const { data: existente } = await supabase.from('presupuestos').select('id').eq('user_id', userId).eq('categoria', categoria).single()
    
    if (existente) {
      await supabase.from('presupuestos').update({ limite: Number(limite) }).eq('id', existente.id)
    } else {
      await supabase.from('presupuestos').insert([{ user_id: userId, categoria, limite: Number(limite) }])
    }
    await cargarDatosNube()
  },

  agregarCategoria: async (nuevaCat) => {
    const uId = get().userId
    if (!uId) return
    const insertData = { 
      user_id: uId, 
      nombre: nuevaCat.nombre,
      emoji: nuevaCat.emoji || '',
      color: nuevaCat.color || 'slate'
    }
    const { data, error } = await supabase.from('categorias').insert([insertData]).select().single()
    if (!error && data) {
      set(state => ({ categorias: [...state.categorias, { id: data.id, ...insertData }] }))
    }
  },

  eliminarCategoria: async (id) => {
    const { error } = await supabase.from('categorias').delete().eq('id', id)
    if (!error) {
      set(state => ({ categorias: state.categorias.filter(c => c.id !== id) }))
    }
  },

  actualizarPreciosMercado: async (idEspecifico = null) => {
    const { cuentas } = get()
    const cuentasInversion = cuentas.filter(c => c.tipo === 'inversion' && c.ticker && (!idEspecifico || c.id === idEspecifico))
    if (cuentasInversion.length === 0) return
    try {
      const promesas = cuentasInversion.map(async (c) => {
        const precioReal = await getMarketPrice(c.ticker, c.moneda)
        if (precioReal && precioReal > 0) {
          const { error } = await supabase.from('cuentas').update({ precio_actual: precioReal }).eq('id', c.id)
          if (error) throw error
          return { id: c.id, precioActual: precioReal }
        }
        return null
      })
      await Promise.all(promesas)
      await get().cargarDatosNube()
    } catch (error) {
      console.error("Error actualizando precios:", error)
    }
  },

  agregarCuenta: async (nuevaCuenta) => {
    const { userId, cargarDatosNube, mostrarToast } = get()
    if (!userId) return
    try {
      const saldoInicial = Number(nuevaCuenta.saldo)
      const cuentaInsert = {
        user_id: userId,
        nombre: nuevaCuenta.nombre,
        tipo: nuevaCuenta.tipo,
        saldo: 0,
        icono: nuevaCuenta.icono,
        ticker: nuevaCuenta.ticker,
        tae: Number(nuevaCuenta.tae || 0),
        capital_invertido: 0,
        precio_promedio: Number(nuevaCuenta.precioPromedio || 1),
        moneda: nuevaCuenta.moneda || 'EUR'
      }
      const { data: cuentaCreada, error } = await supabase.from('cuentas').insert([cuentaInsert]).select().single()
      if (error) throw error
      
      if (saldoInicial > 0 && nuevaCuenta.tipo !== 'inversion') {
        const hoy = new Date()
        const fechaHoy = `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`
        
        const txInsert = {
          user_id: userId,
          cuenta_id: cuentaCreada.id,
          monto: saldoInicial,
          descripcion: 'Saldo Inicial',
          categoria: 'Ajuste',
          tipo: 'ingreso',
          fecha: fechaHoy
        }
        await supabase.from('transacciones').insert([txInsert])
      }
      await cargarDatosNube()
      mostrarToast('Cuenta creada con éxito', 'success')
    } catch (error) {
      console.error(error)
      mostrarToast('Error al crear cuenta', 'error')
    }
  },

  editarCuenta: async (id, datos) => {
    const { cargarDatosNube, mostrarToast, cuentas, userId, getHoyFormatted } = get()
    try {
      const cuentaOriginal = cuentas.find(c => c.id === id)
      if (!cuentaOriginal) return
      
      const updateData = {
        nombre: datos.nombre,
        tae: Number(datos.tae || 0),
        ticker: datos.ticker,
        capital_invertido: datos.capitalInvertido !== undefined ? Number(datos.capitalInvertido) : undefined,
        precio_promedio: datos.precioPromedio !== undefined ? Number(datos.precioPromedio) : undefined,
        moneda: datos.moneda
      }

      // Si el saldo ha cambiado, lo actualizamos directamente
      if (datos.saldo !== undefined && Number(datos.saldo) !== Number(cuentaOriginal.saldo)) {
        updateData.saldo = Number(datos.saldo)
      }

      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key])
      
      const { error } = await supabase.from('cuentas').update(updateData).eq('id', id)
      if (error) throw error
      
      if (datos.saldo !== undefined && Number(datos.saldo) !== Number(cuentaOriginal.saldo)) {
        const diferencia = Number(datos.saldo) - Number(cuentaOriginal.saldo)
        const txInsert = {
          user_id: userId,
          cuenta_id: id,
          monto: Math.abs(diferencia),
          descripcion: 'Ajuste de Saldo Manual',
          categoria: 'Ajuste',
          tipo: diferencia > 0 ? 'ingreso' : 'gasto',
          fecha: getHoyFormatted()
        }
        await supabase.from('transacciones').insert([txInsert])
      }
      
      await cargarDatosNube()
      mostrarToast('Cuenta actualizada', 'success')
    } catch (error) {
      console.error(error)
      mostrarToast('Error al editar cuenta', 'error')
    }
  },

  eliminarCuenta: async (id) => {
    const { cargarDatosNube, mostrarToast } = get()
    try {
      const { error } = await supabase.from('cuentas').delete().eq('id', id)
      if (error) throw error
      await cargarDatosNube()
      mostrarToast('Cuenta eliminada', 'success')
    } catch {
      mostrarToast('No se pudo eliminar la cuenta', 'error')
    }
  },

  marcarFavorita: async (id) => {
    const { cargarDatosNube } = get()
    try {
      await supabase.from('cuentas').update({ favorita: false }).not('id', 'eq', id)
      const { error } = await supabase.from('cuentas').update({ favorita: true }).eq('id', id)
      if (error) throw error
      await cargarDatosNube()
    } catch (error) {
      console.error(error)
    }
  },

  agregarTransaccion: async (tx) => {
    const { userId, cargarDatosNube, mostrarToast } = get()
    if (!userId) return
    try {
      const txInsert = {
        user_id: userId,
        cuenta_id: tx.cuentaId,
        cuenta_destino_id: tx.tipo === 'transferencia' ? tx.cuentaDestinoId : null,
        monto: Number(tx.monto),
        descripcion: tx.desc || tx.descripcion,
        categoria: tx.tipo === 'transferencia' ? 'Traspaso' : tx.categoria,
        tipo: tx.tipo,
        fecha: tx.fecha,
        precio_compra: tx.precioCompra
      }
      const { error } = await supabase.from('transacciones').insert([txInsert])
      if (error) throw error
      await cargarDatosNube()
      mostrarToast('Transacción registrada', 'success')
    } catch {
      mostrarToast('Error al registrar transacción', 'error')
    }
  },

  editarTransaccion: async (id, tx) => {
    const { cargarDatosNube, mostrarToast } = get()
    try {
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
      if (error) throw error
      await cargarDatosNube()
      mostrarToast('Transacción actualizada', 'success')
    } catch {
      mostrarToast('Error al actualizar transacción', 'error')
    }
  },

  eliminarTransaccion: async (id) => {
    const { cargarDatosNube, mostrarToast } = get()
    try {
      const { error } = await supabase.from('transacciones').delete().eq('id', id)
      if (error) throw error
      await cargarDatosNube()
      mostrarToast('Transacción eliminada', 'success')
    } catch {
      mostrarToast('Error al eliminar transacción', 'error')
    }
  },

  agregarObjetivo: async (nuevoObjetivo) => {
    const uId = get().userId
    if (!uId) return
    const objetivoInsert = {
      user_id: uId,
      nombre: nuevoObjetivo.nombre,
      meta: Number(nuevoObjetivo.meta),
      aportacion_extra: Number(nuevoObjetivo.aportacion_extra || 0),
      tasa: Number(nuevoObjetivo.tasa || 0)
    }
    const { data, error } = await supabase.from('objetivos').insert([objetivoInsert]).select().single()
    if (!error && data) {
      set(state => ({ objetivos: [...state.objetivos, { ...data, aportacionExtra: data.aportacion_extra }] }))
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
      set(state => ({
        objetivos: state.objetivos.map(o => o.id === id ? { ...o, ...updateData, aportacionExtra: updateData.aportacion_extra || o.aportacionExtra } : o)
      }))
    }
  },

  eliminarObjetivo: async (id) => {
    const { error } = await supabase.from('objetivos').delete().eq('id', id)
    if (!error) {
      set(state => ({ objetivos: state.objetivos.filter(o => o.id !== id) }))
    }
  },

  crearGrupoSplit: async (nombre, participantesNombres) => {
    const { userId: uId, cargarDatosNube, mostrarToast } = get()
    if (!uId) {
      mostrarToast('Debes iniciar sesión para crear grupos', 'error')
      return false
    }
    
    try {
      // Generamos un UUID real para evitar errores de sintaxis en la DB
      const shareToken = crypto.randomUUID()
      
      const { data, error } = await supabase.from('split_grupos').insert([{ 
        nombre, 
        user_id: uId,
        share_token: shareToken
      }]).select()
      
      if (error) {
        console.error("Error al crear grupo:", error)
        throw error
      }

      const grupo = data && data.length > 0 ? data[0] : null
      
      if (!grupo) {
        throw new Error("No se pudo obtener el grupo creado. Verifica los permisos (RLS).")
      }

      const parts = participantesNombres.map(n => ({ grupo_id: grupo.id, nombre: n }))
      const { error: errorParts } = await supabase.from('split_participantes').insert(parts)
      
      if (errorParts) {
         console.error("Error al crear participantes:", errorParts)
         await supabase.from('split_grupos').delete().eq('id', grupo.id)
         throw errorParts
      }
      
      await cargarDatosNube()
      mostrarToast('Grupo de gastos creado', 'success')
      return true
    } catch (err) {
      console.error(err)
      mostrarToast(`Error: ${err.message || 'No se pudo crear el grupo'}`, 'error')
      return false
    }
  },

  eliminarGrupoSplit: async (id) => {
    const { cargarDatosNube, mostrarToast } = get()
    try {
      const { error } = await supabase.from('split_grupos').delete().eq('id', id)
      if (error) throw error
      await cargarDatosNube()
      mostrarToast('Grupo eliminado', 'success')
    } catch (err) {
      console.error(err)
      mostrarToast('Error al eliminar grupo', 'error')
    }
  },

  agregarGastoSplit: async (gasto) => {
    const { cargarDatosNube, mostrarToast } = get()
    try {
      const { error } = await supabase.from('split_gastos').insert([gasto])
      if (error) throw error
      await cargarDatosNube()
      mostrarToast('Gasto registrado', 'success')
      return true
    } catch (err) {
      console.error(err)
      mostrarToast('Error al registrar gasto', 'error')
      return false
    }
  },

  eliminarGastoSplit: async (id) => {
    const { cargarDatosNube, mostrarToast } = get()
    try {
      const { error } = await supabase.from('split_gastos').delete().eq('id', id)
      if (error) throw error
      await cargarDatosNube()
      mostrarToast('Gasto eliminado', 'success')
    } catch (err) {
      console.error(err)
      mostrarToast('Error al eliminar gasto', 'error')
    }
  },

  registrarLiquidacionSplit: async (liquidacion) => {
    const { cargarDatosNube, mostrarToast } = get()
    try {
      const { error } = await supabase.from('split_liquidaciones').insert([liquidacion])
      if (error) throw error
      await cargarDatosNube()
      mostrarToast('Pago registrado', 'success')
    } catch (err) {
      console.error(err)
      mostrarToast('Error al registrar pago', 'error')
    }
  },

  eliminarLiquidacionSplit: async (id) => {
    const { cargarDatosNube, mostrarToast } = get()
    try {
      const { error } = await supabase.from('split_liquidaciones').delete().eq('id', id)
      if (error) throw error
      await cargarDatosNube()
      mostrarToast('Liquidación eliminada', 'success')
    } catch (err) {
      console.error(err)
      mostrarToast('Error al eliminar liquidación', 'error')
    }
  },
  
  cargarGrupoPublico: async (token) => {
    if (!token) return null
    const { data: grupo, error } = await supabase.from('split_grupos').select('*, split_participantes(*), split_gastos(*), split_liquidaciones(*)').eq('share_token', token).single()
    if (error) return null
    return grupo
  },

  obtenerEnlaceCompartir: (grupo) => {
    if (!grupo || !grupo.share_token) return null
    const baseUrl = window.location.origin
    return `${baseUrl}/split/${grupo.share_token}`
  },

  agregarSuscripcion: async (sub) => {
    const uId = get().userId
    if (!uId) return
    const insertData = {
      user_id: uId,
      nombre: sub.nombre,
      monto: Number(sub.monto),
      frecuencia: sub.frecuencia,
      proximo_cobro: sub.proximoCobro,
      cuenta_id: sub.cuentaId,
      categoria: sub.categoria
    }
    const { data, error } = await supabase.from('suscripciones').insert([insertData]).select().single()
    if (!error && data) {
      set(state => ({ suscripciones: [...state.suscripciones, data] }))
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
    if (sub.frecuencia === 'mensual') fechaCobro.setMonth(fechaCobro.getMonth() + 1)
    else if (sub.frecuencia === 'anual') fechaCobro.setFullYear(fechaCobro.getFullYear() + 1)
    const nuevoProximoCobro = `${fechaCobro.getFullYear()}-${String(fechaCobro.getMonth() + 1).padStart(2, '0')}-${String(fechaCobro.getDate()).padStart(2, '0')}`
    const { error } = await supabase.from('suscripciones').update({ proximo_cobro: nuevoProximoCobro }).eq('id', id)
    if (!error) {
      set(state => ({ suscripciones: state.suscripciones.map(s => s.id === id ? { ...s, proximo_cobro: nuevoProximoCobro } : s) }))
    }
  },

  patrimonioTotal: () => get().cuentas.reduce((acc, c) => acc + (Number(c.saldo) || 0), 0),

  cargarStatsPublicas: async () => {
    try {
      const { count: cuentasCount, error: err1 } = await supabase.from('cuentas').select('*', { count: 'exact', head: true })
      const { count: txCount, error: err2 } = await supabase.from('transacciones').select('*', { count: 'exact', head: true })
      
      if (err1 || err2) throw new Error("Fallo al cargar stats públicas")
      
      return {
        total_cuentas: cuentasCount || 0,
        total_movimientos: txCount || 0
      }
    } catch (e) {
      console.warn("Aviso: No se pudieron obtener estadísticas públicas:", e.message)
      return { total_cuentas: 0, total_movimientos: 0 }
    }
  },

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
      // Excluimos la categoría 'Ajuste' y cuentas de inversión de las métricas de gasto mensual
      return mes === mesActual && año === añoActual && cuenta?.tipo !== 'inversion' && t.categoria !== 'Ajuste'
    })
    const ingresos = txsMes.filter(t => t.tipo === 'ingreso').reduce((acc, t) => acc + Number(t.monto), 0)
    const gastos = txsMes.filter(t => t.tipo === 'gasto').reduce((acc, t) => acc + Number(t.monto), 0)
    return { ingresos, gastos, balance: ingresos - gastos }
  },

  metricasInversion: () => {
    const inversiones = get().cuentas.filter(c => c.tipo === 'inversion')
    const invertido = inversiones.reduce((acc, c) => acc + Number(c.capital_invertido || 0), 0)
    const valorActual = inversiones.reduce((acc, c) => acc + Number(c.saldo || 0), 0)
    const rendimiento = invertido > 0 ? ((valorActual - invertido) / invertido) * 100 : 0
    return { invertido, valorActual, rendimiento }
  }
}))