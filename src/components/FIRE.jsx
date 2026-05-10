import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { motion } from 'framer-motion'
import { TrendingUp, Target, Calculator, Info, Flame, Sparkles, Landmark, Coins, ArrowRight, PieChart as ChartIcon, Calendar, ArrowUpRight, TrendingDown } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Legend } from 'recharts'
import PrivacyValue from './PrivacyValue'

export default function FIRE() {
  const { patrimonioTotal, formatCurrency } = useStore()
  const [activeTab, setActiveTab] = useState('fire')
  
  // Parámetros FIRE
  const [ahorroMensual, setAhorroMensual] = useState(1000)
  const [rendimientoEsperado, setRendimientoEsperado] = useState(7)
  const [inflacion, setInflacion] = useState(2.5)
  const [tasaRetiro, setTasaRetiro] = useState(4)
  const [gastosMensualesFIRE, setGastosMensualesFIRE] = useState(2000)

  // Parámetros Interés Compuesto Avanzado
  const [capitalInicial, setCapitalInicial] = useState(5000)
  const [aportacionMensual, setAportacionMensual] = useState(200)
  const [años, setAños] = useState(20)
  const [interes, setInteres] = useState(8)

  const patrimonioActual = patrimonioTotal()

  const dataFIRE = useMemo(() => {
    const netReturn = (rendimientoEsperado - inflacion) / 100
    const monthlyReturn = Math.pow(1 + netReturn, 1/12) - 1
    const targetPatrimonio = (gastosMensualesFIRE * 12) / (tasaRetiro / 100)
    let data = []
    let saldo = patrimonioActual
    let meses = 0
    while (saldo < targetPatrimonio && meses < 600) {
      if (meses % 12 === 0) data.push({ año: meses / 12, saldo: Math.round(saldo), meta: Math.round(targetPatrimonio) })
      saldo = (saldo * (1 + monthlyReturn)) + ahorroMensual
      meses++
    }
    data.push({ año: Math.ceil(meses / 12), saldo: Math.round(saldo), meta: Math.round(targetPatrimonio) })
    return { data, targetPatrimonio, tiempoRestante: (meses / 12).toFixed(1) }
  }, [patrimonioActual, ahorroMensual, rendimientoEsperado, inflacion, tasaRetiro, gastosMensualesFIRE])

  const dataCompuesto = useMemo(() => {
    let data = []
    let saldo = capitalInicial
    let totalInvertido = capitalInicial
    const r = interes / 100 / 12
    
    for (let m = 0; m <= años * 12; m++) {
      if (m % 12 === 0) {
        data.push({ 
          año: m / 12, 
          total: Math.round(saldo),
          invertido: Math.round(totalInvertido),
          beneficio: Math.round(saldo - totalInvertido)
        })
      }
      saldo = (saldo * (1 + r)) + aportacionMensual
      totalInvertido += aportacionMensual
    }
    return data
  }, [capitalInicial, aportacionMensual, años, interes])

  const statsCompuesto = dataCompuesto[dataCompuesto.length - 1]

  return (
    <div className="min-h-screen pb-32 pt-12 px-8 max-w-7xl mx-auto animate-apple">
      
      <div className="flex gap-4 mb-16 p-1 bg-white/5 border border-border-subtle rounded-2xl w-fit">
         <button 
           onClick={() => setActiveTab('fire')}
           className={`px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all ${activeTab === 'fire' ? 'bg-white text-black shadow-lg' : 'text-text-muted hover:text-white'}`}
         >
           Independencia (FIRE)
         </button>
         <button 
           onClick={() => setActiveTab('compuesto')}
           className={`px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all ${activeTab === 'compuesto' ? 'bg-white text-black shadow-lg' : 'text-text-muted hover:text-white'}`}
         >
           Interés Compuesto
         </button>
      </div>

      {activeTab === 'fire' ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-10">
             <div className="card !p-10">
                <h3 className="text-lg font-bold mb-10 flex items-center gap-3">
                   <Target size={20} strokeWidth={1.5} className="text-brand-emerald" /> Parámetros FIRE
                </h3>
                <div className="space-y-12">
                   <div className="space-y-6">
                      <div className="flex justify-between">
                         <label className="text-[11px] font-black text-text-muted uppercase tracking-widest">Ahorro Mensual</label>
                         <span className="text-[15px] font-bold text-text-main">{formatCurrency(ahorroMensual)}</span>
                      </div>
                      <input type="range" min="0" max="10000" step="100" value={ahorroMensual} onChange={(e) => setAhorroMensual(Number(e.target.value))} className="w-full accent-white" />
                   </div>
                   <div className="space-y-6">
                      <div className="flex justify-between">
                         <label className="text-[11px] font-black text-text-muted uppercase tracking-widest">Gasto en Retiro</label>
                         <span className="text-[15px] font-bold text-text-main">{formatCurrency(gastosMensualesFIRE)}</span>
                      </div>
                      <input type="range" min="500" max="15000" step="100" value={gastosMensualesFIRE} onChange={(e) => setGastosMensualesFIRE(Number(e.target.value))} className="w-full accent-white" />
                   </div>
                   <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">ROI Neto (%)</label>
                         <input type="number" value={rendimientoEsperado} onChange={(e) => setRendimientoEsperado(Number(e.target.value))} className="w-full bg-white/5 border border-border-subtle rounded-xl p-4 text-[16px] font-bold outline-none focus:border-brand-emerald" />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Retiro Safe (%)</label>
                         <input type="number" value={tasaRetiro} onChange={(e) => setTasaRetiro(Number(e.target.value))} className="w-full bg-white/5 border border-border-subtle rounded-xl p-4 text-[16px] font-bold outline-none focus:border-brand-emerald" />
                      </div>
                   </div>
                </div>
             </div>
             <div className="card bg-brand-emerald/5 !p-10 border-brand-emerald/20">
                <div className="flex items-start gap-6">
                   <Flame size={32} className="text-brand-emerald shrink-0" />
                   <div>
                      <h4 className="font-bold text-[17px] mb-2 text-brand-emerald">Objetivo FIRE</h4>
                      <p className="text-[14px] text-text-muted leading-relaxed font-medium">Necesitas acumular <span className="text-text-main font-black"><PrivacyValue value={formatCurrency(dataFIRE.targetPatrimonio)} /></span> para ser libre.</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="lg:col-span-8 space-y-10">
             <div className="card !p-12">
                <div className="flex justify-between items-start mb-12">
                   <div>
                      <h3 className="text-xl font-bold tracking-tight">Proyección de Libertad</h3>
                      <p className="text-sm text-text-muted mt-1">Horizonte temporal: <span className="text-text-main font-bold">{dataFIRE.tiempoRestante} Años</span></p>
                   </div>
                </div>
                <div className="h-[400px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dataFIRE.data}>
                         <defs>
                            <linearGradient id="fireGrad" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#008f58" stopOpacity={0.1}/>
                               <stop offset="95%" stopColor="#008f58" stopOpacity={0}/>
                            </linearGradient>
                         </defs>
                         <CartesianGrid vertical={false} stroke="#2c2c2e" strokeDasharray="3 3" />
                         <XAxis dataKey="año" hide />
                         <YAxis hide domain={['auto', 'auto']} />
                         <Tooltip 
                            contentStyle={{ backgroundColor: '#1c1c1e', border: 'none', borderRadius: '16px', fontSize: '13px' }}
                            formatter={(val) => [formatCurrency(val), 'Patrimonio']}
                         />
                         <Area type="monotone" dataKey="saldo" stroke="#008f58" strokeWidth={3} fillOpacity={1} fill="url(#fireGrad)" />
                         <Area type="monotone" dataKey="meta" stroke="rgba(255,255,255,0.1)" strokeDasharray="10 10" fill="transparent" />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
             </div>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           {/* Inputs Panel */}
           <div className="lg:col-span-4 space-y-8">
              <div className="card !p-10">
                 <h3 className="text-lg font-bold mb-12 flex items-center gap-3">
                    <Sparkles size={20} className="text-brand-emerald" /> Planificación de Riqueza
                 </h3>
                 <div className="space-y-10">
                    <div className="space-y-4">
                       <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">Inversión Inicial (€)</label>
                       <input type="number" value={capitalInicial} onChange={(e) => setCapitalInicial(Number(e.target.value))} className="w-full bg-white/5 border border-border-subtle rounded-xl p-5 text-[22px] font-bold text-text-main outline-none focus:border-brand-emerald transition-all shadow-inner" />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">Aportación Mensual (€)</label>
                       <input type="number" value={aportacionMensual} onChange={(e) => setAportacionMensual(Number(e.target.value))} className="w-full bg-white/5 border border-border-subtle rounded-xl p-5 text-[22px] font-bold text-text-main outline-none focus:border-brand-emerald transition-all shadow-inner" />
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Plazo (Años)</label>
                          <input type="number" value={años} onChange={(e) => setAños(Number(e.target.value))} className="w-full bg-white/5 border border-border-subtle rounded-xl p-4 text-[16px] font-bold text-text-main outline-none" />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Interés (%)</label>
                          <input type="number" value={interes} onChange={(e) => setInteres(Number(e.target.value))} className="w-full bg-white/5 border border-border-subtle rounded-xl p-4 text-[16px] font-bold text-text-main outline-none" />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="card !p-10 border-brand-emerald/10 bg-brand-emerald/[0.01]">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-brand-emerald/20 flex items-center justify-center text-brand-emerald">
                       <ArrowUpRight size={22} strokeWidth={2.5} />
                    </div>
                    <h4 className="font-bold text-[17px] tracking-tight">Análisis de Resultados</h4>
                 </div>
                 <div className="space-y-6">
                    <div className="flex justify-between items-center">
                       <span className="text-[14px] text-text-muted font-medium">Total Invertido</span>
                       <span className="text-[16px] font-bold text-text-main">{formatCurrency(statsCompuesto.invertido)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[14px] text-text-muted font-medium">Beneficio Neto</span>
                       <span className="text-[16px] font-bold text-brand-emerald">+{formatCurrency(statsCompuesto.beneficio)}</span>
                    </div>
                    <div className="h-px bg-border-subtle my-2" />
                    <div className="flex justify-between items-center">
                       <span className="text-[15px] font-bold text-text-main">Patrimonio Final</span>
                       <span className="text-[20px] font-black text-text-main"><PrivacyValue value={formatCurrency(statsCompuesto.total)} /></span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Results Panel */}
           <div className="lg:col-span-8 space-y-8">
              <div className="card !p-12">
                 <div className="flex justify-between items-center mb-16">
                    <div>
                       <h3 className="text-2xl font-bold tracking-tight mb-2">Curva de Crecimiento</h3>
                       <p className="text-sm text-text-muted">Proyección detallada del interés compuesto a {años} años.</p>
                    </div>
                    <div className="flex gap-10">
                       <div className="text-right">
                          <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">Invertido</p>
                          <div className="w-16 h-1.5 bg-white/10 rounded-full ml-auto" />
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-brand-emerald uppercase tracking-[0.2em] mb-2">Total</p>
                          <div className="w-16 h-1.5 bg-brand-emerald rounded-full ml-auto shadow-[0_0_10px_#008f58]" />
                       </div>
                    </div>
                 </div>

                 <div className="h-[450px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={dataCompuesto}>
                          <defs>
                             <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#008f58" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#008f58" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid vertical={false} stroke="#2c2c2e" strokeDasharray="3 3" />
                          <XAxis dataKey="año" axisLine={false} tickLine={false} tick={{ fill: '#6e6e73', fontSize: 11, fontWeight: '700' }} />
                          <YAxis hide domain={['auto', 'auto']} />
                          <Tooltip 
                             contentStyle={{ backgroundColor: '#1c1c1e', border: 'none', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.4)', fontSize: '13px' }}
                             formatter={(val) => [formatCurrency(val), 'Capital']}
                             labelFormatter={(label) => `Año ${label}`}
                          />
                          <Area type="monotone" dataKey="total" stroke="#008f58" strokeWidth={3} fillOpacity={1} fill="url(#totalGrad)" />
                          <Area type="monotone" dataKey="invertido" stroke="rgba(255,255,255,0.2)" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="card !p-8 flex items-center justify-between group hover:border-brand-emerald/20 transition-all">
                    <div>
                       <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em] mb-3">Multiplicador</p>
                       <p className="text-3xl font-bold text-text-main">x{(statsCompuesto.total / statsCompuesto.invertido).toFixed(2)}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-border-subtle flex items-center justify-center text-brand-emerald">
                       <TrendingUp size={24} />
                    </div>
                 </div>
                 <div className="card !p-8 flex items-center justify-between group hover:border-brand-emerald/20 transition-all">
                    <div>
                       <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em] mb-3">Poder del Interés</p>
                       <p className="text-3xl font-bold text-brand-emerald">{((statsCompuesto.beneficio / statsCompuesto.total) * 100).toFixed(1)}%</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-border-subtle flex items-center justify-center text-brand-emerald">
                       <Landmark size={24} />
                    </div>
                 </div>
              </div>
           </div>
        </motion.div>
      )}
    </div>
  )
}
