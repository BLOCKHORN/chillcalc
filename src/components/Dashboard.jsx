import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { motion } from 'framer-motion'
import { 
  ArrowUpRight, ArrowDownRight, Wallet, 
  Plus, TrendingUp, TrendingDown, Bell, Landmark, ChevronRight,
  PieChart as PieIcon, LineChart as ChartIcon, Calendar, ArrowRight
} from 'lucide-react'
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import ModalTransaccion from './ModalTransaccion'
import InsightsWidget from './InsightsWidget'
import PresupuestosWidget from './PresupuestosWidget'
import PrivacyValue from './PrivacyValue'

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
    patrimonioTotal, transacciones, cuentas, 
    setVistaActual, tema, getBankLogo, formatCurrency
  } = useStore()
  
  const [modalAbierto, setModalAbierto] = useState(false)
  const [tipoInicial, setTipoInicial] = useState('gasto')
  const [trendRango, setTrendRango] = useState(30)
  
  const hoy = new Date()
  const mesActualStr = `${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`
  const [filtroMes, setFiltroMes] = useState(mesActualStr)

  const patrimonioActual = patrimonioTotal()
  const esOscuro = tema === 'dark'

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
      return `${m}/${a}` === filtroMes && t.tipo !== 'transferencia'
    })
    let gas = txsFiltradas.filter(t => t.tipo === 'gasto').reduce((acc, t) => acc + t.monto, 0)
    const catMap = {}
    txsFiltradas.filter(t => t.tipo === 'gasto').forEach(tx => {
      if (!catMap[tx.categoria]) catMap[tx.categoria] = 0
      catMap[tx.categoria] += tx.monto
    })
    const cats = Object.keys(catMap).map(nombre => ({ nombre, valor: catMap[nombre] })).sort((a, b) => b.valor - a.valor)
    return { gastos: gas, categorias: cats }
  }, [transacciones, filtroMes])

  const abrirModal = (tipo) => {
    setTipoInicial(tipo)
    setModalAbierto(true)
  }

  return (
    <div className="min-h-screen pb-24 pt-12 px-8 max-w-7xl mx-auto animate-apple">
      
      {/* AI Intelligence Row - Tighter */}
      <div className="mb-12">
         <InsightsWidget />
      </div>

      {/* Hero Header - Tighter */}
      <header className="mb-16 flex flex-col md:flex-row justify-between items-end gap-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald shadow-[0_0_8px_#008f58]" />
             <h2 className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">Patrimonio Consolidado</h2>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-text-main">
            <PrivacyValue value={formatCurrency(patrimonioActual)} />
          </h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => abrirModal('ingreso')}
            className="px-6 py-3 rounded-xl bg-text-main text-bg-app font-bold text-[14px] hover:opacity-90 active:scale-95 transition-all"
          >
            Añadir Capital
          </button>
          <button 
            onClick={() => abrirModal('gasto')}
            className="px-6 py-3 rounded-xl bg-white/[0.03] border border-border-subtle text-text-main font-bold text-[14px] hover:bg-white/[0.08] transition-all active:scale-95"
          >
            Gasto
          </button>
        </div>
      </header>

      {/* Main Grid - Tighter gap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Performance Chart */}
        <div className="lg:col-span-8 card !p-10">
          <div className="flex justify-between items-center mb-10">
             <div>
                <h3 className="text-lg font-bold text-text-main tracking-tight">Evolución</h3>
                <p className="text-[12px] text-text-muted mt-1">Capital neto en el tiempo</p>
             </div>
             <div className="flex bg-bg-app border border-border-subtle p-1 rounded-lg">
                {[{ val: 7, label: '7D' }, { val: 30, label: '1M' }, { val: 'all', label: 'Max' }].map(btn => (
                  <button 
                    key={btn.val} 
                    onClick={() => setTrendRango(btn.val)} 
                    className={`px-4 py-1.5 text-[10px] font-bold rounded-md transition-all ${trendRango === btn.val ? 'bg-surface text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                  >
                    {btn.label}
                  </button>
                ))}
             </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="appleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#008f58" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#008f58" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#2c2c2e" strokeDasharray="3 3" />
                <XAxis dataKey="fecha" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1c1c1e', border: '1px solid #2c2c2e', borderRadius: '12px', fontSize: '12px' }}
                   formatter={(val) => [formatCurrency(val), 'Saldo']}
                />
                <Area type="monotone" dataKey="saldo" stroke="#008f58" strokeWidth={2} fillOpacity={1} fill="url(#appleGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-8">
           {/* Accounts Summary */}
           <div className="card !p-8">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-[15px] font-bold tracking-tight">Entidades</h3>
                 <button onClick={() => setVistaActual('cuentas')} className="p-1.5 text-text-muted hover:text-brand-emerald transition-colors">
                    <ArrowRight size={16} />
                 </button>
              </div>
              <div className="space-y-6">
                 {cuentas.slice(0, 4).map(cuenta => {
                   const logoUrl = getBankLogo(cuenta.nombre)
                   return (
                     <div key={cuenta.id} onClick={() => setVistaActual('cuentas')} className="flex items-center justify-between group cursor-pointer">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-border-subtle flex items-center justify-center overflow-hidden">
                           {logoUrl ? (
                             <img src={logoUrl} alt={cuenta.nombre} className="w-full h-full object-contain p-2" />
                           ) : (
                             <Wallet size={18} strokeWidth={1.5} className="text-text-muted" />
                           )}
                         </div>
                         <div className="overflow-hidden">
                           <p className="text-[14px] font-bold text-text-main tracking-tight truncate">{cuenta.nombre}</p>
                           <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{cuenta.tipo}</p>
                         </div>
                       </div>
                       <p className="text-[14px] font-bold text-text-main"><PrivacyValue value={formatCurrency(cuenta.saldo)} /></p>
                     </div>
                   )
                 })}
              </div>
           </div>

           <PresupuestosWidget />
        </div>

        {/* Expenses Distribution */}
        <div className="lg:col-span-12 card !p-10">
           <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="w-full md:w-1/4">
                 <h3 className="text-[15px] font-bold mb-1 tracking-tight text-text-muted uppercase tracking-widest">Gasto Mensual</h3>
                 <p className="text-4xl font-bold text-text-main tracking-tighter mb-6">
                    <PrivacyValue value={formatCurrency(stats.gastos)} />
                 </p>
                 <select 
                    value={filtroMes}
                    onChange={(e) => setFiltroMes(e.target.value)}
                    className="bg-white/[0.02] border border-border-subtle rounded-lg px-4 py-2 text-[12px] font-bold text-text-main outline-none w-full"
                 >
                    {Array.from(new Set(transacciones.map(t => t.fecha.split('/').slice(1).join('/')))).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                 </select>
              </div>

              <div className="w-full md:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                 {stats.categorias.slice(0, 4).map((cat) => {
                    const pct = (cat.valor / stats.gastos) * 100
                    return (
                       <div key={cat.nombre} className="p-6 rounded-2xl bg-white/[0.01] border border-border-subtle flex flex-col justify-between h-32">
                          <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] truncate">{cat.nombre}</p>
                          <div>
                             <p className="text-xl font-bold text-text-main tracking-tight">
                                <PrivacyValue value={formatCurrency(cat.valor)} />
                             </p>
                             <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                   initial={{ width: 0 }}
                                   animate={{ width: `${pct}%` }}
                                   className="h-full bg-brand-emerald" 
                                />
                             </div>
                          </div>
                       </div>
                    )
                 })}
              </div>
           </div>
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
