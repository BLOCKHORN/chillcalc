import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Plus, Trash2, ArrowRight, ChevronLeft, UserPlus, 
  Receipt, Share2, Check, ArrowRightLeft, Wallet, HandCoins, 
  User, Send, X, MoreHorizontal, Info, Globe, ShieldCheck, Zap, ChevronRight
} from 'lucide-react'
import PrivacyValue from './PrivacyValue'

const calcularBalances = (grupo) => {
  const { split_participantes: integrantes, split_gastos: gastos, split_liquidaciones: liquidaciones = [] } = grupo
  if (!integrantes || integrantes.length === 0) return []
  
  const balances = {}
  integrantes.forEach(p => balances[p.id] = 0)
  
  const totalGastado = gastos.reduce((acc, g) => acc + Number(g.monto), 0)
  const cuotaPorPersona = totalGastado / integrantes.length
  
  gastos.forEach(g => balances[g.pagado_por_id] += Number(g.monto))

  return integrantes.map(p => {
    let balanceBase = balances[p.id] - cuotaPorPersona
    const pagosHechos = liquidaciones.filter(l => l.deudor_id === p.id).reduce((acc, l) => acc + Number(l.monto), 0)
    const pagosRecibidos = liquidaciones.filter(l => l.acreedor_id === p.id).reduce((acc, l) => acc + Number(l.monto), 0)
    const balanceFinal = balanceBase + pagosHechos - pagosRecibidos

    return { 
      ...p, 
      balance: balanceFinal, 
      pagadoTotal: balances[p.id] 
    }
  })
}

export default function CompartirGastos() {
  const { 
    gruposSplit, crearGrupoSplit, eliminarGrupoSplit, 
    agregarGastoSplit, eliminarGastoSplit, obtenerEnlaceCompartir, 
    registrarLiquidacionSplit, formatCurrency 
  } = useStore()

  const [grupoActivoId, setGrupoActivoId] = useState(null)
  const [pasoCreacion, setPasoCreacion] = useState(false)
  
  const [nombreGrupo, setNombreGrupo] = useState('')
  const [amigos, setAmigos] = useState(['Tú', ''])
  const [formGasto, setFormGasto] = useState({ desc: '', monto: '', pagadoPor: '' })
  const [copiado, setCopiado] = useState(false)

  const grupoSeleccionado = gruposSplit.find(g => g.id === grupoActivoId)
  const balances = useMemo(() => grupoSeleccionado ? calcularBalances(grupoSeleccionado) : [], [grupoSeleccionado])

  const transferenciasSugeridas = useMemo(() => {
    if (!balances.length) return []
    const deudores = balances.filter(b => b.balance < -0.01).map(b => ({ ...b, balance: Math.abs(b.balance) })).sort((a, b) => b.balance - a.balance)
    const acreedores = balances.filter(b => b.balance > 0.01).map(b => ({ ...b })).sort((a, b) => b.balance - a.balance)
    
    const trans = []
    let i = 0, j = 0
    while (i < deudores.length && j < acreedores.length) {
      const d = deudores[i], a = acreedores[j]
      const monto = Math.min(d.balance, a.balance)
      trans.push({ de: d.nombre, deId: d.id, para: a.nombre, paraId: a.id, monto })
      d.balance -= monto; a.balance -= monto
      if (d.balance < 0.01) i++
      if (a.balance < 0.01) j++
    }
    return trans
  }, [balances])

  const stats = useMemo(() => {
    if (!grupoSeleccionado) return { total: 0, porPersona: 0 }
    const total = grupoSeleccionado.split_gastos?.reduce((acc, g) => acc + Number(g.monto), 0) || 0
    return { 
      total, 
      porPersona: total / (grupoSeleccionado.split_participantes?.length || 1) 
    }
  }, [grupoSeleccionado])

  const handleCrearGrupo = async () => {
    const amigosFiltrados = amigos.filter(a => a.trim() !== '')
    await crearGrupoSplit(nombreGrupo, amigosFiltrados)
    setPasoCreacion(false); setNombreGrupo(''); setAmigos(['Tú', ''])
  }

  const handleNuevoGasto = async (e) => {
    e.preventDefault()
    if (!formGasto.desc || !formGasto.monto || !formGasto.pagadoPor) return
    const hoy = new Date()
    const fecha = `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`
    await agregarGastoSplit({
      grupo_id: grupoActivoId,
      descripcion: formGasto.desc,
      monto: parseFloat(formGasto.monto),
      pagado_por_id: formGasto.pagadoPor,
      fecha
    })
    setFormGasto({ desc: '', monto: '', pagadoPor: '' })
  }

  const handleCompartir = async () => {
    const enlace = obtenerEnlaceCompartir(grupoSeleccionado)
    if (!enlace) return
    try {
      await navigator.clipboard.writeText(enlace)
      setCopiado(true); setTimeout(() => setCopiado(false), 2000)
    } catch (err) { console.error(err) }
  }

  const handleMarcarPagado = async (trans) => {
    if (window.confirm(`¿Confirmas liquidación de ${formatCurrency(trans.monto)}?`)) {
      await registrarLiquidacionSplit({
        grupo_id: grupoActivoId,
        deudor_id: trans.deId,
        acreedor_id: trans.paraId,
        monto: trans.monto
      })
    }
  }

  if (pasoCreacion) {
    return (
      <div className="pb-32 pt-12 px-8 max-w-2xl mx-auto animate-apple">
        <header className="mb-16 flex items-center gap-6">
          <button onClick={() => setPasoCreacion(false)} className="p-4 bg-white/5 rounded-full border border-border-subtle hover:bg-white/10 transition-all shadow-xl"><ChevronLeft size={24}/></button>
          <div>
             <h2 className="text-4xl font-bold tracking-tight text-text-main">Nuevo Engine</h2>
             <p className="text-sm text-text-muted mt-1 uppercase tracking-widest font-bold">Inicialización de Protocolo</p>
          </div>
        </header>

        <div className="card space-y-12 !p-12 border-white/10 bg-white/[0.01]">
          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase text-text-muted tracking-[0.3em]">Identificador del Proyecto</label>
            <input 
              value={nombreGrupo} onChange={e => setNombreGrupo(e.target.value)}
              className="w-full bg-black border border-border-subtle rounded-2xl p-6 text-2xl font-bold text-text-main outline-none focus:border-brand-emerald transition-all shadow-inner" 
              placeholder="Ej: VIAJE_ROMA_2024"
            />
          </div>
          <div className="space-y-6">
            <label className="text-[11px] font-black uppercase text-text-muted tracking-[0.3em]">Nodos Participantes</label>
            <div className="space-y-3">
              {amigos.map((amigo, idx) => (
                <div key={idx} className="relative group">
                   <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted/30 font-black text-[10px]">{idx + 1}</div>
                   <input 
                    value={amigo} 
                    onChange={e => { const n = [...amigos]; n[idx] = e.target.value; setAmigos(n); }}
                    className="w-full bg-black border border-border-subtle rounded-xl py-4 pl-12 pr-12 text-[16px] font-bold text-text-main outline-none focus:border-brand-emerald transition-all" 
                    placeholder={idx === 0 ? "Tú (Operador)" : `Socio ${idx + 1}`}
                  />
                  {idx > 1 && (
                    <button onClick={() => setAmigos(amigos.filter((_, i) => i !== idx))} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all p-2">
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
              <button 
                onClick={() => setAmigos([...amigos, ''])}
                className="w-full py-5 border border-dashed border-border-subtle rounded-2xl text-text-muted text-[11px] font-black uppercase tracking-[0.3em] hover:text-white hover:bg-white/[0.02] transition-all"
              >
                <Plus size={16} className="inline mr-2" /> Vincular Socio
              </button>
            </div>
          </div>
          <button 
            disabled={!nombreGrupo || amigos.filter(a => a !== '').length < 2}
            onClick={handleCrearGrupo}
            className="w-full btn-primary py-6 rounded-2xl text-[15px] font-bold shadow-2xl disabled:opacity-20"
          >
            Sincronizar Shared Engine
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-32 pt-12 px-8 max-w-7xl mx-auto animate-apple">
      {!grupoActivoId ? (
        <>
          <header className="mb-24 flex flex-col md:flex-row justify-between items-end gap-12">
            <div>
              <p className="text-[13px] font-semibold text-text-muted mb-3 tracking-tight uppercase">Protocolos de Colaboración</p>
              <h1 className="text-7xl md:text-8xl font-bold tracking-tight text-text-main">Shared<span className="text-brand-emerald">.</span></h1>
            </div>
            <button 
              onClick={() => setPasoCreacion(true)}
              className="px-10 py-5 rounded-full bg-text-main text-bg-app font-bold text-[15px] hover:opacity-90 active:scale-95 transition-all shadow-2xl flex items-center gap-3"
            >
              <Plus size={20} strokeWidth={3} /> Nuevo Engine
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {gruposSplit.map(grupo => (
              <div 
                key={grupo.id} 
                onClick={() => setGrupoActivoId(grupo.id)}
                className="card !p-0 overflow-hidden cursor-pointer group hover:border-border-focus transition-all flex flex-col h-[320px]"
              >
                <div className="p-10 flex-1">
                   <div className="flex justify-between items-start mb-12">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-border-subtle flex items-center justify-center text-text-main group-hover:scale-105 transition-transform">
                         <Users size={28} strokeWidth={1.5} />
                      </div>
                      <div className="px-4 py-1.5 rounded-full bg-brand-emerald/5 border border-brand-emerald/20 text-[10px] font-black text-brand-emerald uppercase tracking-widest">
                        {grupo.split_participantes?.length} Nodos
                      </div>
                   </div>
                   <h3 className="text-3xl font-bold text-text-main tracking-tight leading-[1.1]">{grupo.nombre}</h3>
                </div>
                
                <div className="p-10 border-t border-border-subtle bg-white/[0.01] flex items-center justify-between">
                   <span className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">Estado Activo</span>
                   <ArrowRight size={20} className="text-text-muted group-hover:text-brand-emerald group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}

            {gruposSplit.length === 0 && (
              <div className="col-span-full card border-dashed !bg-transparent border-border-subtle/50 py-40 text-center">
                 <ShieldCheck size={48} className="mx-auto mb-8 text-text-muted opacity-20" strokeWidth={1} />
                 <h3 className="text-2xl font-bold text-text-main mb-4 tracking-tight">Arquitectura Compartida Inactiva</h3>
                 <p className="text-sm text-text-muted max-w-sm mx-auto leading-relaxed">Inicializa un Shared Engine para gestionar capital distribuido con total integridad técnica.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-20">
           <header className="flex flex-col md:flex-row md:items-end justify-between gap-12">
              <div className="flex items-center gap-8 overflow-hidden">
                <button 
                  onClick={() => setGrupoActivoId(null)} 
                  className="p-4 bg-white/5 rounded-full border border-border-subtle hover:bg-white/10 transition-all shrink-0 shadow-xl"
                >
                  <ChevronLeft size={28} />
                </button>
                <div className="overflow-hidden">
                   <p className="text-[13px] font-semibold text-text-muted mb-2 tracking-tight uppercase">Engine en Ejecución</p>
                   <h1 className="text-6xl font-bold tracking-tight text-text-main truncate leading-none">{grupoSeleccionado?.nombre}</h1>
                </div>
              </div>
              
              <div className="flex gap-4 shrink-0">
                <button 
                  onClick={handleCompartir}
                  className={`px-8 py-4 rounded-xl text-[14px] font-bold transition-all border shadow-2xl flex items-center gap-3 active:scale-95 ${copiado ? 'bg-brand-emerald text-white border-brand-emerald' : 'bg-white/5 text-text-main border-border-subtle hover:bg-white/10'}`}
                >
                  {copiado ? <><Check size={20} /> Token Copiado</> : <><Share2 size={20} className="text-brand-emerald" /> Generar Acceso</>}
                </button>
                <button 
                  onClick={() => { if(confirm('¿Desmantelar este Shared Engine?')) { eliminarGrupoSplit(grupoSeleccionado.id); setGrupoActivoId(null); } }} 
                  className="p-4 text-text-muted border border-border-subtle hover:text-danger hover:bg-danger/5 rounded-xl transition-all"
                >
                  <Trash2 size={22} />
                </button>
              </div>
           </header>

           {/* Metrics Grid */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="card !p-10 border-white/5 bg-white/[0.01]">
                <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em] mb-6">Capital Acumulado</p>
                <p className="text-5xl font-bold text-text-main tracking-tighter"><PrivacyValue value={formatCurrency(stats.total)} /></p>
              </div>
              <div className="card !p-10 border-white/5 bg-white/[0.01]">
                <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em] mb-6">Ratio por Nodo</p>
                <p className="text-5xl font-bold text-text-main tracking-tighter"><PrivacyValue value={formatCurrency(stats.porPersona)} /></p>
              </div>
              <div className="card !p-10 border-brand-emerald/20 bg-brand-emerald/[0.02]">
                <p className="text-[11px] font-black text-brand-emerald uppercase tracking-[0.3em] mb-6">Tu Posición Neta</p>
                <p className="text-5xl font-bold text-brand-emerald tracking-tighter">
                   <PrivacyValue value={formatCurrency(balances.find(b => b.nombre === 'Tú')?.balance || 0)} />
                </p>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              {/* Balances Section */}
              <div className="lg:col-span-5 space-y-12">
                 <section>
                    <div className="flex items-center justify-between mb-10 px-2">
                       <h4 className="text-[11px] font-black uppercase text-text-muted tracking-[0.4em]">Auditoría de Balances</h4>
                       <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald shadow-[0_0_8px_#008f58]" />
                          <span className="text-[10px] font-bold text-text-muted uppercase">Sincronizado</span>
                       </div>
                    </div>
                    <div className="space-y-4">
                       {balances.map(p => {
                          const isSettled = Math.abs(p.balance) < 0.01
                          const isPositive = p.balance > 0
                          return (
                            <div key={p.id} className="p-8 rounded-3xl bg-white/[0.01] border border-border-subtle flex items-center justify-between group hover:border-white/20 transition-all">
                               <div className="flex items-center gap-6">
                                  <div className={`w-14 h-14 rounded-2xl border border-border-subtle flex items-center justify-center text-[18px] font-bold ${isSettled ? 'text-text-muted bg-white/5' : (isPositive ? 'text-brand-emerald bg-brand-emerald/10 border-brand-emerald/20' : 'text-danger bg-danger/10 border-danger/20')}`}>
                                     {p.nombre[0].toUpperCase()}
                                  </div>
                                  <div>
                                     <p className="text-[18px] font-bold text-text-main tracking-tight">{p.nombre}</p>
                                     <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mt-1.5 opacity-60">Fondo: {formatCurrency(p.pagadoTotal)}</p>
                                  </div>
                               </div>
                               <div className="text-right">
                                  <p className={`text-2xl font-bold tracking-tighter ${isSettled ? 'text-text-muted' : (isPositive ? 'text-brand-emerald' : 'text-danger')}`}>
                                    {isPositive ? '+' : ''}<PrivacyValue value={formatCurrency(isSettled ? 0 : p.balance)} />
                                  </p>
                               </div>
                            </div>
                          )
                       })}
                    </div>
                 </section>

                 {transferenciasSugeridas.length > 0 && (
                   <section className="animate-apple">
                      <h4 className="text-[11px] font-black uppercase text-text-muted mb-10 tracking-[0.4em] px-2 flex items-center gap-3">
                         <Zap size={14} className="text-brand-emerald" /> Resolución de Conflictos
                      </h4>
                      <div className="card !p-8 border-brand-emerald/20 bg-brand-emerald/[0.01] space-y-4 shadow-[0_20px_50px_rgba(0,143,88,0.05)]">
                         {transferenciasSugeridas.map((t) => (
                           <div key={`${t.deId}-${t.paraId}`} className="flex items-center justify-between p-6 bg-black border border-border-subtle rounded-2xl group hover:border-brand-emerald transition-all shadow-inner">
                              <div className="flex items-center gap-5">
                                 <span className="text-[15px] font-bold text-text-main">{t.de}</span>
                                 <ArrowRight size={16} className="text-text-muted opacity-20" />
                                 <span className="text-[15px] font-bold text-text-main">{t.para}</span>
                              </div>
                              <div className="flex items-center gap-8">
                                 <span className="text-[18px] font-black text-brand-emerald"><PrivacyValue value={formatCurrency(t.monto)} /></span>
                                 <button 
                                   onClick={() => handleMarcarPagado(t)}
                                   className="px-6 py-2.5 bg-brand-emerald text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-brand-emerald/20"
                                 >
                                   Liquidar
                                 </button>
                              </div>
                           </div>
                         ))}
                      </div>
                   </section>
                 )}
              </div>

              {/* Transactions Section */}
              <div className="lg:col-span-7 space-y-16">
                 <section>
                    <h4 className="text-[11px] font-black uppercase text-text-muted mb-10 tracking-[0.4em] px-2 flex items-center gap-3">
                       <Plus size={14} className="text-brand-emerald" /> Registro de Operación
                    </h4>
                    <form onSubmit={handleNuevoGasto} className="card !p-12 space-y-10 border-white/10 bg-white/[0.01] shadow-2xl">
                       <div className="space-y-4">
                          <label className="text-[11px] font-black uppercase text-text-muted tracking-[0.3em]">Descripción del Concepto</label>
                          <input 
                            value={formGasto.desc} onChange={e => setFormGasto({...formGasto, desc: e.target.value})} 
                            className="w-full bg-black border border-border-subtle rounded-xl p-6 text-[18px] font-bold text-text-main outline-none focus:border-white transition-all shadow-inner" 
                            placeholder="Cena institucional, Transporte, Logística..." 
                          />
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-4">
                             <label className="text-[11px] font-black uppercase text-text-muted tracking-[0.3em]">Cuantía Atómica</label>
                             <div className="relative">
                                <input 
                                  type="number" step="0.01" value={formGasto.monto} onChange={e => setFormGasto({...formGasto, monto: e.target.value})} 
                                  className="w-full bg-black border border-border-subtle rounded-xl p-6 text-3xl font-black text-text-main outline-none focus:border-brand-emerald transition-all" 
                                  placeholder="0.00" 
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-text-muted font-bold text-xl">€</span>
                             </div>
                          </div>
                          <div className="space-y-4">
                             <label className="text-[11px] font-black uppercase text-text-muted tracking-[0.3em]">Nodo Pagador</label>
                             <div className="relative">
                                <select 
                                  value={formGasto.pagadoPor} onChange={e => setFormGasto({...formGasto, pagadoPor: e.target.value})} 
                                  className="w-full bg-black border border-border-subtle rounded-xl p-6 text-[15px] font-bold text-text-main outline-none appearance-none cursor-pointer focus:border-brand-emerald shadow-inner"
                                >
                                  <option value="">Seleccionar Nodo...</option>
                                  {grupoSeleccionado.split_participantes.map((p) => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                  ))}
                                </select>
                                <ChevronRight size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-text-muted rotate-90 pointer-events-none" />
                             </div>
                          </div>
                       </div>
                       <button type="submit" className="w-full btn-primary py-6 rounded-2xl text-[15px] font-bold shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4 transition-all">
                          <Send size={20} strokeWidth={2.5} /> Ejecutar Operación
                       </button>
                    </form>

                    <div className="space-y-4">
                       <div className="flex items-center justify-between mb-8 px-2">
                          <h4 className="text-[11px] font-black uppercase text-text-muted tracking-[0.4em]">Historial Técnico</h4>
                          <div className="px-3 py-1 rounded-full border border-border-subtle text-[9px] font-black text-text-muted uppercase tracking-widest">{grupoSeleccionado.split_gastos.length} Entradas</div>
                       </div>
                       {[...grupoSeleccionado.split_gastos].reverse().map(g => {
                          const pagador = grupoSeleccionado.split_participantes.find(p => p.id === g.pagado_por_id)
                          return (
                            <div key={g.id} className="flex items-center justify-between p-8 bg-white/[0.01] border border-border-subtle rounded-3xl group transition-all hover:bg-white/[0.02] hover:border-white/10">
                               <div className="flex items-center gap-8 overflow-hidden">
                                  <div className="p-4 bg-white/5 rounded-2xl border border-border-subtle text-text-muted group-hover:text-brand-emerald transition-colors shrink-0">
                                     <Receipt size={22} strokeWidth={1.5} />
                                  </div>
                                  <div className="overflow-hidden">
                                     <p className="text-[19px] font-bold text-text-main truncate tracking-tight mb-1">{g.descripcion}</p>
                                     <p className="text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] opacity-60">
                                        {g.fecha} • {pagador?.nombre} ejecutó <span className="text-text-main">{formatCurrency(g.monto)}</span>
                                     </p>
                                  </div>
                               </div>
                               <button 
                                 onClick={() => { if(confirm('¿Eliminar registro de auditoría?')) eliminarGastoSplit(g.id) }} 
                                 className="p-3 text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                               >
                                 <Trash2 size={20} />
                               </button>
                            </div>
                          )
                       })}
                       {grupoSeleccionado.split_gastos.length === 0 && (
                         <div className="py-40 text-center card border-dashed !bg-transparent border-border-subtle/50">
                            <Info size={40} className="mx-auto mb-6 text-text-muted opacity-10" strokeWidth={1} />
                            <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.4em]">Sin registros de actividad</p>
                         </div>
                       )}
                    </div>
                 </section>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
