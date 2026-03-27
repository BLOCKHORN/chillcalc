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

  // Configuración de colores para Recharts según el tema
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
      // No contabilizar como ingreso/gasto operativo si la cuenta es de inversión
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Activity size={14} className="text-brand-500" />
            Patrimonio Neto
          </p>
          <h1 className="text-5xl font-black tracking-tighter text-gradient mb-4 md:mb-0">
            {formatoEuros(patrimonioActual)}
          </h1>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button 
            onClick={toggleTema}
            className="p-2 rounded-lg bg-white/5 border border-border-subtle text-slate-400 hover:text-brand-400 transition-all"
            title="Cambiar tema"
          >
            {esOscuro ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button 
            onClick={() => abrirModal('ingreso')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20 hover:bg-brand-500/20 transition-all"
          >
            <Plus size={18} />
            Ingreso
          </button>
          <button 
            onClick={() => abrirModal('gasto')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 transition-all"
          >
            <Plus size={18} />
            Gasto
          </button>
          <button 
            onClick={handleSync}
            disabled={cargando}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold bg-white/5 border border-white/10 text-text-main hover:bg-white/10 transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={cargando ? 'animate-spin' : ''} />
            {cargando ? '...' : 'Sincronizar'}
          </button>
        </div>
      </header>

      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar mb-10">
        {cuentas.map(cuenta => (
          <div key={cuenta.id} className="min-w-[180px] card p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-text-muted">
              <div className="p-1.5 bg-white/5 rounded-md text-brand-400">{getIcon(cuenta.icono)}</div>
              <span className="text-xs font-bold uppercase tracking-wider truncate">{cuenta.nombre}</span>
            </div>
            <p className="text-lg font-bold text-text-main">{formatoEuros(cuenta.saldo)}</p>
          </div>
        ))}
      </div>

      <div className="card p-0 mb-6 overflow-hidden">
        <div className="p-6 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-brand-400" size={20} />
            <h2 className="text-sm font-bold text-text-main uppercase tracking-widest">Tendencia Global</h2>
          </div>
          <div className="flex bg-surface-solid rounded-lg p-1 border border-border-subtle">
            {[{ val: 7, label: '7D' }, { val: 30, label: '30D' }, { val: 180, label: '6M' }, { val: 'all', label: 'MAX' }].map(btn => (
              <button key={btn.val} onClick={() => setTrendRango(btn.val)} className={`px-3 py-1 text-xs font-semibold rounded-md ${trendRango === btn.val ? 'bg-white/10 text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'}`}>
                {btn.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-72 w-full p-4 pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <ReLineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={coloresGrafico.grid} />
              <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{ fill: coloresGrafico.texto, fontSize: 11 }} minTickGap={30} />
              <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fill: coloresGrafico.texto, fontSize: 11 }} tickFormatter={(val) => new Intl.NumberFormat('es-ES', { notation: "compact" }).format(val)} width={60} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: coloresGrafico.tooltipBg, 
                  border: `1px solid ${coloresGrafico.tooltipBorde}`, 
                  borderRadius: '12px',
                  color: 'var(--text-main)'
                }} 
                formatter={(val) => [formatoEuros(val), 'Saldo']} 
              />
              <Line type="monotone" dataKey="saldo" stroke={coloresGrafico.linea} strokeWidth={3} dot={false} />
            </ReLineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Wallet className="text-blue-500" size={20} />
              <h2 className="text-sm font-bold text-text-main uppercase tracking-widest">Análisis de {filtroMes}</h2>
            </div>
            <div className="flex items-center bg-surface-solid border border-border-subtle rounded-lg px-2 py-1 gap-2">
              <Calendar size={14} className="text-text-muted" />
              <select 
                value={filtroMes}
                onChange={(e) => { setFiltroMes(e.target.value); setCatSeleccionada(null); }}
                className="bg-transparent text-[10px] font-bold text-text-main focus:outline-none cursor-pointer uppercase"
              >
                {opcionesMeses.map(m => (
                  <option key={m} value={m}>{m === mesActualStr ? `Actual (${m})` : m}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-8">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-2">Resultado Operativo</p>
            <p className={`text-4xl font-black tracking-tight ${ingresos - gastos >= 0 ? 'text-text-main' : 'text-danger'}`}>
              {ingresos - gastos >= 0 ? '+' : ''}{formatoEuros(ingresos - gastos)}
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-solid border border-border-subtle rounded-xl">
              <div className="flex items-center gap-3">
                <ArrowUpRight className="text-brand-400" />
                <div>
                  <p className="text-[10px] text-text-muted uppercase font-bold">Ingresos Reales</p>
                  <p className="font-bold text-text-main text-lg">{formatoEuros(ingresos)}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-solid border border-border-subtle rounded-xl">
              <div className="flex items-center gap-3">
                <ArrowDownRight className="text-danger" />
                <div>
                  <p className="text-[10px] text-text-muted uppercase font-bold">Gastos Operativos</p>
                  <p className="font-bold text-text-main text-lg">{formatoEuros(gastos)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              {catSeleccionada ? (
                <button onClick={() => setCatSeleccionada(null)} className="p-1 hover:bg-white/10 rounded-md text-text-muted">
                  <ChevronLeft size={20} />
                </button>
              ) : (
                <BarChart3 className="text-warning" size={20} />
              )}
              <h2 className="text-sm font-bold text-text-main uppercase tracking-widest">
                {catSeleccionada ? `Detalle: ${catSeleccionada}` : 'Gastos por Categoría'}
              </h2>
            </div>
          </div>

          {categorias.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted gap-2">
              <ListFilter size={24} /> 
              <p className="text-xs">Sin movimientos operativos en {filtroMes}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 flex-1">
              {!catSeleccionada ? (
                <>
                  {(mostrarTodasCats ? categorias : categorias.slice(0, 4)).map((cat, idx) => (
                    <button key={cat.nombre} onClick={() => setCatSeleccionada(cat.nombre)} className="group w-full text-left">
                      <div className="flex justify-between items-end mb-1.5">
                        <span className="text-xs font-bold text-text-muted group-hover:text-text-main transition-colors flex items-center gap-1">
                          {cat.nombre} <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-all" />
                        </span>
                        <span className="text-xs font-black text-text-main">{formatoEuros(cat.valor)}</span>
                      </div>
                      <div className="w-full bg-surface-solid rounded-full h-1.5 border border-border-subtle overflow-hidden">
                        <div className="bg-danger h-full transition-all duration-500" style={{ width: `${(cat.valor / (categorias[0]?.valor || 1)) * 100}%`, opacity: 1 - (idx * 0.15) }} />
                      </div>
                    </button>
                  ))}
                  {categorias.length > 4 && (
                    <button onClick={() => setMostrarTodasCats(!mostrarTodasCats)} className="text-[10px] font-bold text-text-muted hover:text-text-main uppercase mt-4 tracking-widest text-center">
                      {mostrarTodasCats ? 'Ocultar' : `Ver todas (${categorias.length})`}
                    </button>
                  )}
                </>
              ) : (
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                  {catDetalle?.transacciones.map(t => (
                    <div key={t.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                      <div>
                        <p className="text-xs font-bold text-text-main">{t.desc || t.categoria}</p>
                        <p className="text-[10px] text-text-muted">{t.fecha}</p>
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