import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { 
  Activity, ArrowUpRight, ArrowDownRight, Wallet, 
  BarChart3, ListFilter, Building2, 
  CreditCard, Banknote, LineChart, ChevronLeft, Calendar, Plus, TrendingUp,
  Percent, AlertCircle, Check, CalendarClock
} from 'lucide-react'
import { 
  LineChart as ReLineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import ModalTransaccion from './ModalTransaccion'

const formatoEuros = (num) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(num || 0)

const parseFecha = (fechaStr) => {
  const [dia, mes, año] = fechaStr.split('/')
  return new Date(año, mes - 1, dia)
}

const inicioDelDia = (fecha) => {
  const d = new Date(fecha)
  d.setHours(0, 0, 0, 0)
  return d
}

export default function Dashboard() {
  const { 
    patrimonioTotal, transacciones, cuentas, suscripciones, 
    pagarSuscripcion, setVistaActual, actualizarPreciosMercado, 
    tema, categorias: categoriasGlobales 
  } = useStore()
  
  const [modalAbierto, setModalAbierto] = useState(false)
  const [tipoInicial, setTipoInicial] = useState('gasto')
  const [trendRango, setTrendRango] = useState(30)
  const [catSeleccionada, setCatSeleccionada] = useState(null)
  const [cargando, setCargando] = useState(false)
  
  const hoy = new Date()
  const mesActualStr = `${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`
  const [filtroMes, setFiltroMes] = useState(mesActualStr)

  const diaHoy = String(hoy.getDate()).padStart(2, '0')
  const mesHoy = String(hoy.getMonth() + 1).padStart(2, '0')
  const anoHoy = hoy.getFullYear()
  const fechaHoyStr = `${diaHoy}/${mesHoy}/${anoHoy}`
  const fechaSQLHoyStr = `${anoHoy}-${mesHoy}-${diaHoy}`

  const transaccionesHoy = useMemo(() => {
    return transacciones.filter(t => t.fecha === fechaHoyStr && t.tipo === 'gasto')
  }, [transacciones, fechaHoyStr])

  const gastadoHoy = useMemo(() => {
    return transaccionesHoy.reduce((acc, t) => acc + t.monto, 0)
  }, [transaccionesHoy])

  const suscripcionesPendientes = useMemo(() => {
    return suscripciones.filter(sub => sub.proximo_cobro <= fechaSQLHoyStr)
  }, [suscripciones, fechaSQLHoyStr])

  const patrimonioActual = patrimonioTotal()
  const esOscuro = tema === 'dark'

  const coloresGrafico = {
    texto: esOscuro ? '#94a3b8' : '#64748b',
    grid: esOscuro ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
    linea: esOscuro ? '#10b981' : '#059669',
    tooltipBg: esOscuro ? '#18181b' : '#ffffff',
    tooltipBorde: esOscuro ? '#27272a' : '#e2e8f0'
  }

  const mapaColores = {
    orange: '#f97316',
    blue: '#3b82f6',
    emerald: '#10b981',
    purple: '#a855f7',
    rose: '#f43f5e',
    yellow: '#eab308',
    pink: '#ec4899',
    slate: '#64748b'
  }

  const handleSync = async () => {
    setCargando(true)
    try {
      await actualizarPreciosMercado()
    } catch (e) {
      console.error(e)
    } finally {
      setCargando(false)
    }
  }

  const abrirModal = (tipo) => {
    setTipoInicial(tipo)
    setModalAbierto(true)
  }

  const procesarPagoSuscripcion = async (id, nombre) => {
    if(confirm(`¿Confirmas el pago de ${nombre}? Se registrará el gasto y se actualizará la fecha de cobro.`)) {
      await pagarSuscripcion(id)
    }
  }

  const getIcon = (icono) => {
    switch(icono) {
      case 'bank': return <Building2 size={16} />
      case 'card': return <CreditCard size={16} />
      case 'cash': return <Banknote size={16} />
      case 'chart': return <LineChart size={16} />
      default: return <Wallet size={16} />
    }
  }

  const opcionesMeses = useMemo(() => {
    const meses = transacciones.map(t => {
      const [_, m, a] = t.fecha.split('/')
      return `${m}/${a}`
    })
    const unicos = [...new Set([mesActualStr, ...meses])]
    return unicos.sort((a, b) => {
      const [mA, yA] = a.split('/')
      const [mB, yB] = b.split('/')
      return new Date(yB, mB - 1) - new Date(yA, mA - 1)
    })
  }, [transacciones, mesActualStr])

  const trendData = useMemo(() => {
    const start = inicioDelDia(new Date())
    let fechaInicio = new Date(start)
    if (trendRango !== 'all') fechaInicio.setDate(start.getDate() - trendRango + 1)
    
    const data = []
    let saldoIterativo = patrimonioActual
    let txsPorDia = {}

    transacciones.forEach(tx => {
      const fechaTx = inicioDelDia(parseFecha(tx.fecha)).getTime()
      if (tx.tipo !== 'transferencia') {
        txsPorDia[fechaTx] = (txsPorDia[fechaTx] || 0) + (tx.tipo === 'ingreso' ? tx.monto : -tx.monto)
      }
    })

    let cursor = new Date(start)
    while (cursor >= fechaInicio) {
      data.unshift({
        fecha: cursor.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        saldo: saldoIterativo,
      })
      if (txsPorDia[cursor.getTime()]) saldoIterativo -= txsPorDia[cursor.getTime()]
      cursor.setDate(cursor.getDate() - 1)
    }
    return data
  }, [patrimonioActual, transacciones, trendRango])

  const stats = useMemo(() => {
    const txsFiltradas = transacciones.filter(t => {
      const [_, m, a] = t.fecha.split('/')
      const coincideMes = `${m}/${a}` === filtroMes
      const cuenta = cuentas.find(c => c.id === t.cuentaId)
      return coincideMes && cuenta?.tipo !== 'inversion' && t.tipo !== 'transferencia'
    })

    let ing = 0, gas = 0
    const catMap = {}
    txsFiltradas.forEach(tx => {
      if (tx.tipo === 'ingreso') ing += tx.monto
      else if (tx.tipo === 'gasto') {
        gas += tx.monto
        if (!catMap[tx.categoria]) catMap[tx.categoria] = { total: 0, items: [] }
        catMap[tx.categoria].total += tx.monto
        catMap[tx.categoria].items.push(tx)
      }
    })

    const cats = Object.keys(catMap)
      .map(nombre => ({ nombre, valor: catMap[nombre].total, transacciones: catMap[nombre].items }))
      .sort((a, b) => b.valor - a.valor)

    const tasaAhorro = ing > 0 ? Math.max(0, ((ing - gas) / ing) * 100) : 0

    return { ingresos: ing, gastos: gas, categorias: cats, tasaAhorro }
  }, [transacciones, filtroMes, cuentas])

  const { ingresos, gastos, categorias, tasaAhorro } = stats
  const catDetalle = categorias.find(c => c.nombre === catSeleccionada)

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 md:pb-12 w-full">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-2 relative">
        <div className="absolute -top-12 -left-20 w-60 h-60 bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -top-10 -right-20 w-40 h-40 bg-pink-500/5 rounded-full blur-[90px] pointer-events-none" />

        <div className="w-full text-center md:text-left z-10">
          <p className="text-[10px] md:text-xs font-black text-text-muted uppercase tracking-widest mb-2 flex items-center justify-center md:justify-start gap-2">
            <Activity size={14} className="text-brand-400" />
            Patrimonio Neto
          </p>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none text-text-main">
            {formatoEuros(patrimonioActual)}
          </h1>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto md:ml-auto z-10 shrink-0">
          <button 
            onClick={() => abrirModal('ingreso')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2.5 px-6 py-3.5 md:py-3 rounded-xl font-bold bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 active:scale-95 transition-all text-sm w-full md:w-auto border border-brand-500/20 shadow-lg shadow-brand-500/5 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform"/> Ingreso
          </button>
          <button 
            onClick={() => abrirModal('gasto')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2.5 px-6 py-3.5 md:py-3 rounded-xl font-bold bg-danger/10 text-danger hover:bg-danger/20 active:scale-95 transition-all text-sm w-full md:w-auto border border-danger/20 shadow-lg shadow-danger/5 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform"/> Gasto
          </button>
        </div>
      </header>

      {suscripcionesPendientes.length > 0 && (
        <div className="mb-6 z-10 relative">
          <div className="bg-danger/10 border border-danger/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-danger/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-danger text-white rounded-xl shadow-inner shrink-0 hidden sm:block">
                <CalendarClock size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-sm font-black text-danger uppercase tracking-widest flex items-center gap-2 mb-1">
                  <AlertCircle size={14} className="sm:hidden" />
                  {suscripcionesPendientes.length} {suscripcionesPendientes.length === 1 ? 'Cobro pendiente' : 'Cobros pendientes'}
                </h3>
                <p className="text-xs font-bold text-text-main opacity-80">
                  {suscripcionesPendientes.map(s => s.nombre).join(', ')}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={() => setVistaActual('suscripciones')}
                className="flex-1 sm:flex-none px-4 py-3 sm:py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-surface border border-border-subtle text-text-muted hover:text-text-main transition-colors text-center"
              >
                Ver Todas
              </button>
              {suscripcionesPendientes.length === 1 ? (
                <button 
                  onClick={() => procesarPagoSuscripcion(suscripcionesPendientes[0].id, suscripcionesPendientes[0].nombre)}
                  className="flex-1 sm:flex-none px-4 py-3 sm:py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-danger text-white hover:bg-danger/90 transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5"
                >
                  <Check size={14} strokeWidth={3} /> Pagar Ya
                </button>
              ) : (
                <button 
                  onClick={() => setVistaActual('suscripciones')}
                  className="flex-1 sm:flex-none px-4 py-3 sm:py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-danger text-white hover:bg-danger/90 transition-all active:scale-95 shadow-md text-center"
                >
                  Pagar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4 mb-6 z-10 relative">
        {cuentas.map(cuenta => (
          <div key={cuenta.id} className="min-w-[170px] md:min-w-[200px] bg-surface-solid/40 backdrop-blur-lg border border-border-subtle/50 rounded-2xl shadow-xl shadow-brand-500/5 p-5 flex flex-col gap-3 group transition-all hover:border-border-subtle/80 hover:-translate-y-1">
            <div className="flex items-center gap-2.5 text-text-muted">
              <div className="p-2 bg-surface rounded-lg text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                {getIcon(cuenta.icono)}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest truncate">{cuenta.nombre}</span>
            </div>
            <p className="text-xl md:text-2xl font-black text-text-main leading-tight tracking-tight">
              {formatoEuros(cuenta.saldo)}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6 z-10 relative">
        <div className="bg-surface-solid/40 backdrop-blur-md border border-border-subtle/50 rounded-3xl p-0 overflow-hidden shadow-2xl shadow-black/5 flex flex-col">
          <div className="p-5 md:p-6 border-b border-border-subtle/50 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="text-brand-400" size={18} />
              <h2 className="text-[10px] md:text-sm font-black text-text-main uppercase tracking-widest leading-none">Tendencia Global</h2>
            </div>
            <div className="flex bg-surface-solid rounded-lg p-1 border border-border-subtle shadow-inner">
              {[{ val: 7, label: '7D' }, { val: 30, label: '30D' }, { val: 'all', label: 'MAX' }].map(btn => (
                <button key={btn.val} onClick={() => setTrendRango(btn.val)} className={`px-2.5 md:px-3.5 py-1.5 text-[10px] font-bold rounded-md transition-colors ${trendRango === btn.val ? 'bg-surface text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'}`}>
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-52 md:h-64 w-full p-2 pt-8 pr-6">
            <ResponsiveContainer width="100%" height="100%">
              <ReLineChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={coloresGrafico.grid} />
                <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{ fill: coloresGrafico.texto, fontSize: 10, fontWeight: 'bold' }} minTickGap={50} />
                <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fill: coloresGrafico.texto, fontSize: 10, fontWeight: 'bold' }} tickFormatter={(val) => new Intl.NumberFormat('es-ES', { notation: "compact" }).format(val)} width={40} />
                <Tooltip 
                  contentStyle={{ backgroundColor: coloresGrafico.tooltipBg, border: `1px solid ${coloresGrafico.tooltipBorde}`, borderRadius: '14px', fontSize: '11px', fontWeight: 'bold', padding: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                  cursor={{ stroke: esOscuro ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', strokeWidth: 1 }}
                  formatter={(val) => [formatoEuros(val), 'Saldo']} 
                />
                <Line type="monotone" dataKey="saldo" stroke={coloresGrafico.linea} strokeWidth={3} dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: coloresGrafico.linea }} />
              </ReLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-solid/40 backdrop-blur-md border border-border-subtle/50 rounded-3xl p-6 shadow-2xl shadow-black/5 flex flex-col justify-between h-full min-h-[300px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <Calendar className="text-danger" size={18} />
              <h2 className="text-[10px] md:text-sm font-black text-text-main uppercase tracking-widest leading-none">Gastado Hoy</h2>
            </div>
            <span className="text-[10px] font-bold text-text-muted bg-surface px-2.5 py-1 rounded-md border border-border-subtle">
              {fechaHoyStr}
            </span>
          </div>

          <div className="mb-6">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">Total gastado</p>
            <p className={`text-5xl font-black tracking-tighter ${gastadoHoy > 0 ? 'text-danger' : 'text-text-main'}`}>
              {gastadoHoy > 0 ? '-' : ''}{formatoEuros(gastadoHoy)}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[140px] custom-scrollbar pr-2 flex flex-col gap-2">
            {transaccionesHoy.length > 0 ? (
              transaccionesHoy.map(t => (
                <div key={t.id} className="flex justify-between items-center p-3.5 bg-surface rounded-xl border border-border-subtle hover:border-border-subtle/80 transition-colors">
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-text-main truncate">{t.desc || t.categoria}</p>
                    <p className="text-[9px] text-text-muted uppercase font-black tracking-widest mt-0.5">{t.categoria}</p>
                  </div>
                  <span className="text-xs font-black text-danger">-{formatoEuros(t.monto)}</span>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-text-muted opacity-60 mt-4">
                <ListFilter size={24} className="mb-2" />
                <span className="text-[10px] font-black uppercase tracking-widest">Día invicto</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 z-10 relative">
        <div className="bg-surface-solid/40 backdrop-blur-md border border-border-subtle/50 rounded-3xl p-6 shadow-2xl shadow-black/5 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <Wallet className="text-sky-500" size={18} />
              <h2 className="text-[10px] md:text-sm font-black text-text-main uppercase tracking-widest leading-none">Análisis Mensual</h2>
            </div>
            <select 
              value={filtroMes}
              onChange={(e) => { setFiltroMes(e.target.value); setCatSeleccionada(null); }}
              className="bg-surface border border-border-subtle rounded-lg px-3 py-2 text-[10px] font-bold text-text-main focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-sm"
            >
              {opcionesMeses.map(m => (
                <option key={m} value={m}>{m === mesActualStr ? `Mes Actual` : m}</option>
              ))}
            </select>
          </div>

          <div className="mb-8 p-5 bg-surface-solid/60 rounded-2xl border border-border-subtle/50 relative overflow-hidden group">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <Percent size={12} className="text-brand-400" /> Tasa de Ahorro
                </p>
                <p className={`text-4xl font-black tracking-tighter ${tasaAhorro > 20 ? 'text-brand-400' : tasaAhorro > 0 ? 'text-warning' : 'text-danger'}`}>
                  {tasaAhorro.toFixed(1)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Salud Financiera</p>
                <p className="text-[10px] font-bold text-text-main">
                  {tasaAhorro >= 30 ? '🔥 Excelente' : tasaAhorro >= 15 ? '✅ Saludable' : '⚠️ Ajustado'}
                </p>
              </div>
            </div>
            <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border-subtle shadow-inner">
               <div 
                className={`h-full transition-all duration-1000 ease-out rounded-full ${tasaAhorro > 20 ? 'bg-brand-500' : tasaAhorro > 0 ? 'bg-warning' : 'bg-danger'}`}
                style={{ width: `${Math.min(100, tasaAhorro)}%` }}
               />
            </div>
          </div>

          <div className="mb-8">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">Balance neto</p>
            <p className={`text-5xl font-black tracking-tighter ${ingresos - gastos >= 0 ? 'text-text-main' : 'text-danger'}`}>
              {ingresos - gastos >= 0 ? '+' : ''}{formatoEuros(ingresos - gastos)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-5 bg-surface rounded-xl border border-border-subtle group transition-colors hover:border-brand-500/30">
              <ArrowUpRight className="text-brand-400 group-hover:scale-110 transition-transform" size={26} />
              <div>
                <p className="text-[10px] text-text-muted uppercase font-black tracking-widest leading-none mb-1">Ingresos</p>
                <p className="font-black text-text-main text-lg tracking-tight leading-tight">{formatoEuros(ingresos)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-5 bg-surface rounded-xl border border-border-subtle group transition-colors hover:border-danger/30">
              <ArrowDownRight className="text-danger group-hover:scale-110 transition-transform" size={26} />
              <div>
                <p className="text-[10px] text-text-muted uppercase font-black tracking-widest leading-none mb-1">Gastos</p>
                <p className="font-black text-text-main text-lg tracking-tight leading-tight">{formatoEuros(gastos)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-solid/40 backdrop-blur-md border border-border-subtle/50 rounded-3xl flex flex-col p-6 min-h-[350px] shadow-2xl shadow-black/5 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              {catSeleccionada ? (
                <button onClick={() => setCatSeleccionada(null)} className="p-1.5 hover:bg-surface rounded-lg text-text-muted hover:text-text-main transition-colors">
                  <ChevronLeft size={20} />
                </button>
              ) : (
                <BarChart3 className="text-warning" size={18} />
              )}
              <h2 className="text-[10px] md:text-sm font-black text-text-main uppercase tracking-widest leading-none">
                {catSeleccionada ? catSeleccionada : 'Distribución'}
              </h2>
            </div>
          </div>

          {categorias.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted gap-3 py-8">
              <ListFilter size={32} className="opacity-20" /> 
              <p className="text-[10px] uppercase font-black tracking-widest">Sin movimientos</p>
            </div>
          ) : (
            <div className="flex flex-col flex-1 h-full">
              {!catSeleccionada ? (
                <div className="flex flex-col md:flex-row items-center gap-6 flex-1 h-full pt-2">
                  <div className="w-48 h-48 shrink-0 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categorias}
                          dataKey="valor"
                          nameKey="nombre"
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={85}
                          stroke="none"
                          paddingAngle={2}
                          onClick={(entry) => setCatSeleccionada(entry.nombre)}
                        >
                          {categorias.map((entry, index) => {
                            const catConfig = categoriasGlobales.find(c => c.nombre === entry.nombre)
                            const hexColor = mapaColores[catConfig?.color] || mapaColores.slate
                            return <Cell key={`cell-${index}`} fill={hexColor} className="cursor-pointer outline-none hover:opacity-80 transition-all" />
                          })}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: coloresGrafico.tooltipBg, border: `1px solid ${coloresGrafico.tooltipBorde}`, borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', padding: '10px 14px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                          itemStyle={{ color: coloresGrafico.texto }}
                          formatter={(val) => formatoEuros(val)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Gastos</span>
                      <span className="text-sm font-black text-text-main leading-none mt-1">{formatoEuros(gastos)}</span>
                    </div>
                  </div>

                  <div className="flex-1 w-full flex flex-col gap-1 overflow-y-auto max-h-[220px] custom-scrollbar pr-2">
                    {categorias.map(cat => {
                      const catConfig = categoriasGlobales.find(c => c.nombre === cat.nombre)
                      const hexColor = mapaColores[catConfig?.color] || mapaColores.slate
                      return (
                        <button key={cat.nombre} onClick={() => setCatSeleccionada(cat.nombre)} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-solid/50 border border-transparent hover:border-border-subtle/50 transition-all w-full text-left group">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: hexColor }} />
                            <span className="text-[11px] font-black text-text-main uppercase tracking-widest truncate">{cat.nombre}</span>
                          </div>
                          <span className="text-xs font-black text-text-main">{formatoEuros(cat.valor)}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 overflow-y-auto max-h-[250px] pr-1 custom-scrollbar">
                  {catDetalle?.transacciones.map(t => (
                    <div key={t.id} className="flex justify-between items-center p-4 bg-surface rounded-xl border border-border-subtle hover:border-border-subtle/80 transition-colors">
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-text-main truncate mb-1">{t.desc || t.categoria}</p>
                        <p className="text-[9px] text-text-muted uppercase font-black tracking-widest">{t.fecha}</p>
                      </div>
                      <span className="text-sm font-black text-danger">-{formatoEuros(t.monto)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ModalTransaccion 
        isOpen={modalAbierto} 
        onClose={() => setModalAbierto(false)} 
        tipoInicial={tipoInicial}
      />
    </div>
  )
}