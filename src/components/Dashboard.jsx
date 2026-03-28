import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { 
  Activity, ArrowUpRight, ArrowDownRight, Wallet, 
  BarChart3, ListFilter, Building2, 
  CreditCard, Banknote, LineChart, ChevronLeft, ArrowRight, Calendar, RefreshCw, Plus, Sun, Moon, TrendingUp
} from 'lucide-react'
import { 
  LineChart as ReLineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
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
  const { patrimonioTotal, transacciones, cuentas, actualizarPreciosMercado, tema, toggleTema } = useStore()
  
  const [modalAbierto, setModalAbierto] = useState(false)
  const [tipoInicial, setTipoInicial] = useState('gasto')
  const [trendRango, setTrendRango] = useState(30)
  const [catSeleccionada, setCatSeleccionada] = useState(null)
  const [mostrarTodasCats, setMostrarTodasCats] = useState(false)
  const [cargando, setCargando] = useState(false)
  
  const hoy = new Date()
  const mesActualStr = `${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`
  const [filtroMes, setFiltroMes] = useState(mesActualStr)

  const patrimonioActual = patrimonioTotal()
  const esOscuro = tema === 'dark'

  const coloresGrafico = {
    texto: esOscuro ? '#64748b' : '#94a3b8',
    grid: esOscuro ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    linea: esOscuro ? '#10b981' : '#059669',
    tooltipBg: esOscuro ? '#18181b' : '#ffffff',
    tooltipBorde: esOscuro ? '#27272a' : '#e2e8f0'
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
      txsPorDia[fechaTx] = (txsPorDia[fechaTx] || 0) + (tx.tipo === 'ingreso' ? tx.monto : -tx.monto)
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
      return coincideMes && cuenta?.tipo !== 'inversion'
    })

    let ing = 0, gas = 0
    const catMap = {}
    txsFiltradas.forEach(tx => {
      if (tx.tipo === 'ingreso') ing += tx.monto
      else {
        gas += tx.monto
        if (!catMap[tx.categoria]) catMap[tx.categoria] = { total: 0, items: [] }
        catMap[tx.categoria].total += tx.monto
        catMap[tx.categoria].items.push(tx)
      }
    })

    const cats = Object.keys(catMap)
      .map(nombre => ({ nombre, valor: catMap[nombre].total, transacciones: catMap[nombre].items }))
      .sort((a, b) => b.valor - a.valor)

    return { ingresos: ing, gastos: gas, categorias: cats }
  }, [transacciones, filtroMes, cuentas])

  const { ingresos, gastos, categorias } = stats
  const catDetalle = categorias.find(c => c.nombre === catSeleccionada)

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-12 w-full">
      
      {/* Cabecera Modificada */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-2">
        <div className="w-full text-center md:text-left">
          <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center justify-center md:justify-start gap-1.5">
            <Activity size={12} className="text-brand-500" />
            Patrimonio Neto
          </p>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gradient leading-none">
            {formatoEuros(patrimonioActual)}
          </h1>
        </div>
        
        <div className="grid grid-cols-2 md:flex gap-3 w-full md:w-auto md:ml-auto">
          <button 
            onClick={() => abrirModal('ingreso')}
            className="flex items-center justify-center gap-2 px-6 py-3.5 md:py-2.5 rounded-xl font-bold bg-success/10 text-success hover:bg-success/20 active:scale-95 transition-all text-sm w-full md:w-auto border border-success/20"
          >
            <Plus size={18} /> Ingreso
          </button>
          <button 
            onClick={() => abrirModal('gasto')}
            className="flex items-center justify-center gap-2 px-6 py-3.5 md:py-2.5 rounded-xl font-bold bg-danger/10 text-danger hover:bg-danger/20 active:scale-95 transition-all text-sm w-full md:w-auto border border-danger/20"
          >
            <Plus size={18} /> Gasto
          </button>
        </div>
      </header>

      <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4 mb-4">
        {cuentas.map(cuenta => (
          <div key={cuenta.id} className="min-w-[150px] md:min-w-[180px] card p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-text-muted">
              <div className="p-1.5 bg-white/5 rounded-md text-brand-400">{getIcon(cuenta.icono)}</div>
              <span className="text-[10px] font-bold uppercase tracking-wider truncate">{cuenta.nombre}</span>
            </div>
            <p className="text-base md:text-lg font-bold text-text-main">{formatoEuros(cuenta.saldo)}</p>
          </div>
        ))}
      </div>

      <div className="card p-0 mb-6 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-brand-400" size={18} />
            <h2 className="text-[10px] md:text-sm font-bold text-text-main uppercase tracking-widest">Tendencia</h2>
          </div>
          <div className="flex bg-surface-solid rounded-lg p-1 border border-border-subtle">
            {[{ val: 7, label: '7D' }, { val: 30, label: '30D' }, { val: 'all', label: 'MAX' }].map(btn => (
              <button key={btn.val} onClick={() => setTrendRango(btn.val)} className={`px-2 md:px-3 py-1 text-[10px] font-semibold rounded-md ${trendRango === btn.val ? 'bg-white/10 text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'}`}>
                {btn.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-56 md:h-72 w-full p-2 pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <ReLineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={coloresGrafico.grid} />
              <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{ fill: coloresGrafico.texto, fontSize: 10 }} minTickGap={40} />
              <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fill: coloresGrafico.texto, fontSize: 10 }} tickFormatter={(val) => new Intl.NumberFormat('es-ES', { notation: "compact" }).format(val)} width={40} />
              <Tooltip 
                contentStyle={{ backgroundColor: coloresGrafico.tooltipBg, border: `1px solid ${coloresGrafico.tooltipBorde}`, borderRadius: '12px', fontSize: '12px' }} 
                formatter={(val) => [formatoEuros(val), 'Saldo']} 
              />
              <Line type="monotone" dataKey="saldo" stroke={coloresGrafico.linea} strokeWidth={3} dot={false} />
            </ReLineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Wallet className="text-blue-500" size={18} />
              <h2 className="text-[10px] md:text-sm font-bold text-text-main uppercase tracking-widest">Análisis</h2>
            </div>
            <select 
              value={filtroMes}
              onChange={(e) => { setFiltroMes(e.target.value); setCatSeleccionada(null); }}
              className="bg-surface-solid border border-border-subtle rounded-lg px-2 py-1 text-[10px] font-bold text-text-main focus:outline-none"
            >
              {opcionesMeses.map(m => (
                <option key={m} value={m}>{m === mesActualStr ? `Mes Actual` : m}</option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-1">Balance del mes</p>
            <p className={`text-4xl font-black tracking-tight ${ingresos - gastos >= 0 ? 'text-text-main' : 'text-danger'}`}>
              {ingresos - gastos >= 0 ? '+' : ''}{formatoEuros(ingresos - gastos)}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-4 bg-surface-solid border border-border-subtle rounded-xl">
              <ArrowUpRight className="text-brand-400" size={24} />
              <div>
                <p className="text-[10px] text-text-muted uppercase font-bold">Ingresos</p>
                <p className="font-bold text-text-main text-lg">{formatoEuros(ingresos)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-surface-solid border border-border-subtle rounded-xl">
              <ArrowDownRight className="text-danger" size={24} />
              <div>
                <p className="text-[10px] text-text-muted uppercase font-bold">Gastos</p>
                <p className="font-bold text-text-main text-lg">{formatoEuros(gastos)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card flex flex-col p-5 min-h-[350px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {catSeleccionada ? (
                <button onClick={() => setCatSeleccionada(null)} className="p-1 hover:bg-white/10 rounded-md text-text-muted">
                  <ChevronLeft size={20} />
                </button>
              ) : (
                <BarChart3 className="text-warning" size={18} />
              )}
              <h2 className="text-[10px] md:text-sm font-bold text-text-main uppercase tracking-widest">
                {catSeleccionada ? catSeleccionada : 'Gastos'}
              </h2>
            </div>
          </div>

          {categorias.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted gap-2 py-8">
              <ListFilter size={24} className="opacity-20" /> 
              <p className="text-[10px] uppercase font-bold tracking-widest">Sin movimientos</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5 flex-1">
              {!catSeleccionada ? (
                <>
                  {(mostrarTodasCats ? categorias : categorias.slice(0, 5)).map((cat, idx) => (
                    <button key={cat.nombre} onClick={() => setCatSeleccionada(cat.nombre)} className="group w-full text-left active:opacity-70 transition-all">
                      <div className="flex justify-between items-end mb-1.5">
                        <span className="text-[10px] font-bold text-text-muted group-hover:text-text-main uppercase">
                          {cat.nombre}
                        </span>
                        <span className="text-xs font-black text-text-main">{formatoEuros(cat.valor)}</span>
                      </div>
                      <div className="w-full bg-surface-solid rounded-full h-1.5 border border-border-subtle overflow-hidden">
                        <div className="bg-danger h-full" style={{ width: `${(cat.valor / (categorias[0]?.valor || 1)) * 100}%`, opacity: 1 - (idx * 0.12) }} />
                      </div>
                    </button>
                  ))}
                  {categorias.length > 5 && (
                    <button onClick={() => setMostrarTodasCats(!mostrarTodasCats)} className="text-[10px] font-bold text-brand-400 uppercase mt-2 tracking-widest text-center">
                      {mostrarTodasCats ? 'Ver menos' : `Ver todas (${categorias.length})`}
                    </button>
                  )}
                </>
              ) : (
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[250px] pr-1">
                  {catDetalle?.transacciones.map(t => (
                    <div key={t.id} className="flex justify-between items-center p-3.5 bg-surface-solid rounded-xl border border-border-subtle">
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-text-main truncate">{t.desc || t.categoria}</p>
                        <p className="text-[9px] text-text-muted uppercase font-bold">{t.fecha}</p>
                      </div>
                      <span className="text-xs font-black text-danger">-{formatoEuros(t.monto)}</span>
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