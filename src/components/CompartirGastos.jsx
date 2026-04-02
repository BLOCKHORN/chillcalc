import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { Users, Plus, Trash2, ArrowRight, ChevronLeft, UserPlus, Receipt, Info, Share2, Check, ArrowRightLeft, Wallet, HandCoins } from 'lucide-react'

const formatoEuros = (num) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(num || 0)

const calcularBalances = (grupo) => {
  const { split_participantes: integrantes, split_gastos: gastos } = grupo
  if (!integrantes || integrantes.length === 0) return []
  const balances = {}
  integrantes.forEach(p => balances[p.id] = 0)
  const totalGastado = gastos.reduce((acc, g) => acc + Number(g.monto), 0)
  const cuotaPorPersona = totalGastado / integrantes.length
  gastos.forEach(g => balances[g.pagado_por_id] += Number(g.monto))
  return integrantes.map(p => ({ ...p, balance: balances[p.id] - cuotaPorPersona, pagadoTotal: balances[p.id] }))
}

export default function CompartirGastos() {
  const { gruposSplit, crearGrupoSplit, eliminarGrupoSplit, agregarGastoSplit, eliminarGastoSplit, obtenerEnlaceCompartir } = useStore()
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
    let i = 0
    let j = 0

    while (i < deudores.length && j < acreedores.length) {
      const d = deudores[i]
      const a = acreedores[j]
      const monto = Math.min(d.balance, a.balance)
      
      trans.push({ de: d.nombre, para: a.nombre, monto })
      
      d.balance -= monto
      a.balance -= monto
      
      if (d.balance < 0.01) i++
      if (a.balance < 0.01) j++
    }
    return trans
  }, [balances])

  const totalGrupo = useMemo(() => {
    return grupoSeleccionado?.split_gastos?.reduce((acc, g) => acc + Number(g.monto), 0) || 0
  }, [grupoSeleccionado])

  const gastadoPorTi = useMemo(() => {
    const tu = balances.find(b => b.nombre.toLowerCase() === 'tú')
    return tu ? tu.pagadoTotal : 0
  }, [balances])

  const gastosOrdenados = useMemo(() => {
    if (!grupoSeleccionado?.split_gastos) return []
    return [...grupoSeleccionado.split_gastos].reverse()
  }, [grupoSeleccionado])

  const handleCrearGrupo = async () => {
    const amigosFiltrados = amigos.filter(a => a.trim() !== '')
    await crearGrupoSplit(nombreGrupo, amigosFiltrados)
    setPasoCreacion(false)
    setNombreGrupo('')
    setAmigos(['Tú', ''])
  }

  const handleNuevoGasto = async (e) => {
    e.preventDefault()
    if (!formGasto.desc || !formGasto.monto || !formGasto.pagadoPor) return

    const hoy = new Date()
    const fechaActual = `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`

    await agregarGastoSplit({
      grupo_id: grupoActivoId,
      descripcion: formGasto.desc,
      monto: parseFloat(formGasto.monto),
      pagado_por_id: formGasto.pagadoPor,
      fecha: fechaActual
    })
    setFormGasto({ desc: '', monto: '', pagadoPor: '' })
  }

  const handleCompartir = async () => {
    const enlace = obtenerEnlaceCompartir(grupoSeleccionado)
    
    if (!enlace) {
      alert("Error: Este grupo no tiene un enlace de invitacion generado.")
      return
    }

    const shareData = {
      title: `Gastos: ${grupoSeleccionado.nombre}`,
      text: `Unete para ver los gastos de ${grupoSeleccionado.nombre} en ChillCalc \n`,
      url: enlace
    }

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`)
        setCopiado(true)
        setTimeout(() => setCopiado(false), 2000)
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (pasoCreacion) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
        <header className="mb-8 flex items-center gap-4 pt-2">
          <button onClick={() => setPasoCreacion(false)} className="p-3 bg-surface-solid rounded-xl border border-border-subtle text-text-muted active:scale-90"><ChevronLeft size={24}/></button>
          <h2 className="text-3xl font-black text-text-main tracking-tighter leading-none">Nuevo Grupo</h2>
        </header>

        <div className="card space-y-6 p-5">
          <div>
            <label className="text-[10px] font-black uppercase text-text-muted mb-3 block px-1 tracking-widest">Nombre del Evento</label>
            <input 
              value={nombreGrupo} onChange={e => setNombreGrupo(e.target.value)}
              className="w-full bg-surface-solid border border-border-subtle rounded-xl px-4 py-4 text-text-main font-bold outline-none focus:border-brand-500" 
              placeholder="Ej: Viaje a Roma"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-text-muted mb-3 block px-1 tracking-widest">Participantes</label>
            <div className="space-y-3">
              {amigos.map((amigo, idx) => (
                <input 
                  key={idx} value={amigo} 
                  onChange={e => { const n = [...amigos]; n[idx] = e.target.value; setAmigos(n); }}
                  className="w-full bg-surface-solid border border-border-subtle rounded-xl px-4 py-3.5 text-text-main text-sm font-semibold" 
                  placeholder={`Nombre amigo ${idx + 1}`}
                />
              ))}
              <button 
                onClick={() => setAmigos([...amigos, ''])}
                className="w-full py-4 border-2 border-dashed border-border-subtle rounded-xl text-text-muted text-xs font-black uppercase tracking-widest transition-all active:bg-white/5"
              >
                <UserPlus size={16} className="inline mr-2" /> Anadir amigo
              </button>
            </div>
          </div>
          <button 
            disabled={!nombreGrupo || amigos.filter(a => a !== '').length < 2}
            onClick={handleCrearGrupo}
            className="w-full bg-brand-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
          >
            Confirmar Grupo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 px-1 md:px-0 relative w-full">
      
      {!grupoActivoId ? (
        <>
          <div className="absolute top-20 right-10 w-64 h-64 bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-40 left-10 w-48 h-48 bg-sky-500/5 rounded-full blur-[90px] pointer-events-none" />

          <header className="mb-10 flex flex-col xl:flex-row xl:justify-between xl:items-end gap-6 pt-2 relative z-10">
            <div className="w-full text-center xl:text-left">
              <p className="text-[10px] md:text-xs font-black text-text-muted uppercase tracking-widest mb-2 flex items-center justify-center xl:justify-start gap-2">
                <Users size={14} className="text-brand-400" />
                Cuentas Claras
              </p>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none text-text-main">
                Dividir Gastos
              </h1>
            </div>
            
            <button 
              onClick={() => setPasoCreacion(true)}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold bg-brand-500 text-white shadow-lg shadow-brand-500/20 active:scale-95 transition-all text-xs border border-brand-500/20 group uppercase tracking-widest w-full xl:w-auto"
            >
              <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform" /> 
              <span>Nuevo Grupo</span>
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
            {gruposSplit.map(grupo => (
              <button 
                key={grupo.id} 
                onClick={() => setGrupoActivoId(grupo.id)}
                className="bg-surface-solid/40 backdrop-blur-md border border-border-subtle/50 rounded-3xl p-6 shadow-xl shadow-black/5 flex flex-col group hover:border-brand-500/30 hover:-translate-y-1 transition-all text-left"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-brand-500/10 rounded-2xl text-brand-400 border border-brand-500/20 shadow-[0_0_15px_rgba(var(--brand-500),0.1)]">
                    <Users size={24} strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest bg-surface px-3 py-1.5 rounded-lg border border-border-subtle">
                    {grupo.split_participantes?.length} Amigos
                  </span>
                </div>
                <h3 className="text-2xl font-black text-text-main mb-2 tracking-tight line-clamp-2">{grupo.nombre}</h3>
                
                <div className="mt-auto pt-4 flex items-center gap-2 text-brand-400 font-black text-[10px] uppercase tracking-widest">
                  Ver cuentas <ArrowRight size={14} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}

            {gruposSplit.length === 0 && (
              <div className="col-span-full bg-surface-solid/40 backdrop-blur-md border-2 border-dashed border-border-subtle/50 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-4 text-text-muted/30">
                  <Users size={40} strokeWidth={2} />
                </div>
                <p className="text-text-main text-lg font-black uppercase tracking-tight mb-2">Sin viajes activos</p>
                <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Crea un grupo para empezar a dividir cuentas</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-6 relative z-10">
           <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
                <button 
                  onClick={() => setGrupoActivoId(null)} 
                  className="p-3 bg-surface-solid/60 backdrop-blur-md border border-border-subtle rounded-xl text-text-muted hover:text-text-main active:scale-90 transition-all shadow-sm shrink-0"
                >
                  <ChevronLeft size={24} />
                </button>
                <h3 className="text-3xl md:text-4xl font-black text-text-main tracking-tighter truncate leading-none pb-1">{grupoSeleccionado?.nombre}</h3>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto shrink-0">
                <button 
                  onClick={handleCompartir}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border shadow-sm active:scale-95 ${copiado ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-surface-solid/60 backdrop-blur-md text-text-main hover:border-border-subtle/80 border-border-subtle/50'}`}
                >
                  {copiado ? <><Check size={16} /> Copiado</> : <><Share2 size={16} className="text-brand-400" /> Invitar</>}
                </button>
                <button 
                  onClick={() => { if(confirm('Seguro que quieres eliminar este viaje por completo?')) { eliminarGrupoSplit(grupoSeleccionado.id); setGrupoActivoId(null); } }} 
                  className="p-3 text-danger/60 bg-danger/5 border border-danger/10 hover:text-danger hover:bg-danger/10 rounded-xl transition-all active:scale-90"
                >
                  <Trash2 size={20} />
                </button>
              </div>
           </header>

           <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-solid/60 backdrop-blur-sm p-5 rounded-2xl border border-border-subtle/50 flex flex-col justify-between shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-text-muted">
                  <Wallet size={16} />
                  <span className="text-[10px] uppercase font-black tracking-widest">Total Grupo</span>
                </div>
                <p className="text-2xl md:text-3xl font-black text-text-main truncate leading-none">{formatoEuros(totalGrupo)}</p>
              </div>
              <div className="bg-surface-solid/60 backdrop-blur-sm p-5 rounded-2xl border border-border-subtle/50 flex flex-col justify-between shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-text-muted">
                  <HandCoins size={16} />
                  <span className="text-[10px] uppercase font-black tracking-widest">Gastado por ti</span>
                </div>
                <p className="text-2xl md:text-3xl font-black text-brand-400 truncate leading-none">{formatoEuros(gastadoPorTi)}</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
             <section className="order-1">
                <h4 className="text-[10px] font-black uppercase text-text-muted mb-4 tracking-widest px-1 flex items-center gap-2">
                  <ArrowRightLeft size={12} className="text-brand-400" /> Resumen de Deudas
                </h4>
                <div className="space-y-3 mb-8">
                  {balances.map(p => (
                    <div key={p.id} className="bg-surface-solid/40 backdrop-blur-sm flex items-center justify-between p-5 rounded-2xl border border-border-subtle/50 border-l-4 shadow-sm transition-all" style={{ borderLeftColor: p.balance >= 0 ? 'var(--brand-500)' : 'var(--danger)' }}>
                       <div className="overflow-hidden mr-2">
                          <p className="text-lg font-black text-text-main truncate leading-tight">{p.nombre}</p>
                          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Pagado: <span className="text-text-main">{formatoEuros(p.pagadoTotal)}</span></p>
                       </div>
                       <div className="text-right shrink-0">
                          <p className={`text-2xl font-black leading-none mb-1 tracking-tighter ${p.balance >= 0 ? 'text-brand-400' : 'text-danger'}`}>
                            {p.balance >= 0 ? '+' : ''}{formatoEuros(p.balance)}
                          </p>
                          <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">
                            {p.balance >= 0 ? 'Le deben' : 'Debe dinero'}
                          </p>
                       </div>
                    </div>
                  ))}
                </div>

                {transferenciasSugeridas.length > 0 && (
                  <>
                    <h4 className="text-[10px] font-black uppercase text-text-muted mb-4 tracking-widest px-1 flex items-center gap-2">
                      <Check size={12} className="text-emerald-500" /> Cuadrar Gastos
                    </h4>
                    <div className="bg-surface-solid/60 backdrop-blur-md p-5 rounded-3xl border border-border-subtle/50 shadow-sm space-y-3">
                      {transferenciasSugeridas.map((t, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-surface rounded-xl border border-border-subtle">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-text-main">{t.de}</span>
                            <ArrowRight size={14} className="text-text-muted" />
                            <span className="text-sm font-black text-text-main">{t.para}</span>
                          </div>
                          <span className="text-sm font-black text-emerald-500">{formatoEuros(t.monto)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
             </section>

             <section className="order-2">
                <h4 className="text-[10px] font-black uppercase text-text-muted mb-4 tracking-widest px-1 flex items-center gap-2">
                  <Receipt size={12} className="text-brand-400" /> Registrar Gasto
                </h4>
                <form onSubmit={handleNuevoGasto} className="bg-surface-solid/60 backdrop-blur-md p-6 rounded-3xl space-y-5 border border-border-subtle/50 shadow-xl shadow-black/5">
                  <input 
                    value={formGasto.desc} 
                    onChange={e => setFormGasto({...formGasto, desc: e.target.value})} 
                    className="w-full bg-surface border border-border-subtle rounded-2xl px-5 py-4 text-sm font-bold text-text-main focus:border-brand-500 outline-none transition-all shadow-inner" 
                    placeholder="En que se gasto? (Ej: Cena, Hotel...)" 
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="number" step="0.01" 
                      value={formGasto.monto} 
                      onChange={e => setFormGasto({...formGasto, monto: e.target.value})} 
                      className="w-full bg-surface border border-border-subtle rounded-2xl px-5 py-4 text-lg font-black text-text-main outline-none focus:border-brand-500 transition-all shadow-inner" 
                      placeholder="Monto €" 
                    />
                    <select 
                      value={formGasto.pagadoPor} 
                      onChange={e => setFormGasto({...formGasto, pagadoPor: e.target.value})} 
                      className="w-full bg-surface border border-border-subtle rounded-2xl px-4 py-4 text-[11px] font-black text-text-main outline-none uppercase tracking-widest focus:border-brand-500 transition-all shadow-inner appearance-none cursor-pointer"
                    >
                      <option value="">Quien pago?</option>
                      {grupoSeleccionado.split_participantes.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-brand-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-brand-500/20 active:scale-95 transition-all">
                    Anadir al Grupo
                  </button>
                </form>

                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h4 className="text-[10px] font-black uppercase text-text-muted tracking-widest">Historial de Pagos</h4>
                    <span className="text-[9px] font-black text-brand-400 bg-brand-500/10 px-2 py-1 rounded-md uppercase tracking-widest">{gastosOrdenados.length} Movimientos</span>
                  </div>
                  <div className="space-y-3">
                    {gastosOrdenados.map(g => (
                      <div key={g.id} className="flex items-center justify-between p-4 bg-surface-solid/40 backdrop-blur-sm rounded-2xl border border-border-subtle/50 group transition-all hover:bg-surface hover:border-border-subtle">
                        <div className="overflow-hidden flex items-center gap-4">
                          <div className="p-2.5 bg-surface rounded-xl border border-border-subtle text-text-muted group-hover:text-brand-400 transition-colors">
                            <Receipt size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-text-main truncate leading-tight mb-0.5">{g.descripcion}</p>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">
                              <span>{g.fecha || 'N/A'}</span> • <span className="text-text-main">{grupoSeleccionado.split_participantes.find(p => p.id === g.pagado_por_id)?.nombre}</span> pago <span className="text-danger font-black">{formatoEuros(g.monto)}</span>
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => { if(confirm('Borrar este gasto?')) eliminarGastoSplit(g.id) }} 
                          className="p-2 text-text-muted hover:text-danger active:scale-90 transition-all md:opacity-0 md:group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                    {gastosOrdenados.length === 0 && (
                      <div className="text-center py-12 bg-surface-solid/30 border border-dashed border-border-subtle/50 rounded-3xl">
                        <Info size={28} className="mx-auto mb-3 text-text-muted/40" />
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">No hay gastos todavia</p>
                      </div>
                    )}
                  </div>
                </div>
             </section>
           </div>
        </div>
      )}
    </div>
  )
}