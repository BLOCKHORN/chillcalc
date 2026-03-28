import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { Users, Plus, Trash2, ArrowRight, ChevronLeft, UserPlus, Receipt, Info } from 'lucide-react'

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
  const { gruposSplit, crearGrupoSplit, eliminarGrupoSplit, agregarGastoSplit, eliminarGastoSplit } = useStore()
  const [grupoActivoId, setGrupoActivoId] = useState(null)
  const [pasoCreacion, setPasoCreacion] = useState(false)
  
  const [nombreGrupo, setNombreGrupo] = useState('')
  const [amigos, setAmigos] = useState(['Tú', ''])
  const [formGasto, setFormGasto] = useState({ desc: '', monto: '', pagadoPor: '' })

  const grupoSeleccionado = gruposSplit.find(g => g.id === grupoActivoId)
  const balances = useMemo(() => grupoSeleccionado ? calcularBalances(grupoSeleccionado) : [], [grupoSeleccionado])

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
    await agregarGastoSplit({
      grupo_id: grupoActivoId,
      descripcion: formGasto.desc,
      monto: parseFloat(formGasto.monto),
      pagado_por_id: formGasto.pagadoPor
    })
    setFormGasto({ desc: '', monto: '', pagadoPor: '' })
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
                <UserPlus size={16} className="inline mr-2" /> Añadir amigo
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 px-1 md:px-0">
      {!grupoActivoId ? (
        <>
          <header className="mb-8 flex flex-col md:flex-row justify-between items-center md:items-end gap-6 pt-2">
            <div className="w-full text-center md:text-left">
              <h2 className="text-4xl md:text-3xl font-black text-text-main tracking-tighter leading-tight">Dividir Gastos</h2>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-2">Cuentas claras entre amigos</p>
            </div>
            <button 
              onClick={() => setPasoCreacion(true)}
              className="w-full md:w-auto bg-brand-500 text-white py-4 px-8 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-500/20 active:scale-95 transition-all"
            >
              <Plus size={18} className="inline mr-1" /> Nuevo Grupo
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gruposSplit.map(grupo => (
              <button 
                key={grupo.id} 
                onClick={() => setGrupoActivoId(grupo.id)}
                className="card group hover:border-brand-500/50 transition-all text-left relative overflow-hidden p-5"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-brand-500/10 rounded-xl text-brand-400 border border-brand-500/20">
                    <Users size={24} />
                  </div>
                  <span className="text-[9px] font-black text-text-muted uppercase bg-surface-solid px-3 py-1.5 rounded-lg border border-border-subtle shadow-sm">
                    {grupo.split_participantes?.length} Amigos
                  </span>
                </div>
                <h3 className="text-xl font-black text-text-main mb-1 truncate tracking-tight">{grupo.nombre}</h3>
                <div className="flex items-center gap-2 text-brand-400 font-black text-[10px] uppercase tracking-widest mt-4">
                  Abrir grupo <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
            {gruposSplit.length === 0 && (
              <div className="col-span-full text-center py-16 border-2 border-dashed border-border-subtle rounded-2xl opacity-50">
                <Users size={48} className="mx-auto mb-4 text-text-muted" />
                <p className="text-sm font-bold text-text-main">No tienes viajes activos</p>
                <p className="text-[10px] uppercase font-bold text-text-muted mt-2 tracking-widest">Crea un grupo para empezar</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-6">
           <header className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <button onClick={() => setGrupoActivoId(null)} className="p-3 bg-surface-solid border border-border-subtle rounded-xl text-text-muted active:scale-90 transition-all shadow-sm">
                  <ChevronLeft size={24} />
                </button>
                <h3 className="text-2xl font-black text-text-main tracking-tighter truncate max-w-[200px] sm:max-w-none">{grupoSeleccionado?.nombre}</h3>
              </div>
              <button 
                onClick={() => { if(confirm('¿Seguro que quieres eliminar este viaje?')) { eliminarGrupoSplit(grupoSeleccionado.id); setGrupoActivoId(null); } }} 
                className="p-3 text-danger/50 hover:text-danger hover:bg-danger/10 rounded-xl transition-all active:scale-90"
              >
                <Trash2 size={24} />
              </button>
           </header>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <section className="order-2 lg:order-1">
                <h4 className="text-[10px] font-black uppercase text-text-muted mb-4 tracking-widest px-1">Resumen de Deudas</h4>
                <div className="space-y-3">
                  {balances.map(p => (
                    <div key={p.id} className="card flex items-center justify-between p-4 border-l-4 shadow-sm transition-transform active:scale-[0.98]" style={{ borderColor: p.balance >= 0 ? 'var(--brand-500)' : 'var(--danger)' }}>
                       <div className="overflow-hidden mr-2">
                          <p className="text-base font-black text-text-main truncate">{p.nombre}</p>
                          <p className="text-[9px] font-bold text-text-muted uppercase">Pagado: {formatoEuros(p.pagadoTotal)}</p>
                       </div>
                       <div className="text-right shrink-0">
                          <p className={`text-lg font-black leading-none mb-1 ${p.balance >= 0 ? 'text-brand-400' : 'text-danger'}`}>
                            {p.balance >= 0 ? '+' : ''}{formatoEuros(p.balance)}
                          </p>
                          <p className="text-[8px] font-black text-text-muted uppercase tracking-tighter">
                            {p.balance >= 0 ? 'Le deben' : 'Debe dinero'}
                          </p>
                       </div>
                    </div>
                  ))}
                </div>
             </section>

             <section className="order-1 lg:order-2">
                <h4 className="text-[10px] font-black uppercase text-text-muted mb-4 tracking-widest px-1">Registrar Nuevo Gasto</h4>
                <form onSubmit={handleNuevoGasto} className="card p-5 space-y-4 border-brand-500/20 bg-brand-500/[0.03]">
                  <input 
                    value={formGasto.desc} 
                    onChange={e => setFormGasto({...formGasto, desc: e.target.value})} 
                    className="w-full bg-surface-solid border border-border-subtle rounded-xl px-4 py-4 text-sm font-bold text-text-main focus:border-brand-500 outline-none placeholder:text-text-muted/40" 
                    placeholder="¿En qué se gastó? (Cena, Hotel...)" 
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="number" step="0.01" 
                      value={formGasto.monto} 
                      onChange={e => setFormGasto({...formGasto, monto: e.target.value})} 
                      className="w-full bg-surface-solid border border-border-subtle rounded-xl px-4 py-4 text-sm font-black text-text-main outline-none focus:border-brand-500" 
                      placeholder="Monto €" 
                    />
                    <select 
                      value={formGasto.pagadoPor} 
                      onChange={e => setFormGasto({...formGasto, pagadoPor: e.target.value})} 
                      className="w-full bg-surface-solid border border-border-subtle rounded-xl px-2 py-4 text-[10px] font-black text-text-main outline-none uppercase tracking-tighter focus:border-brand-500"
                    >
                      <option value="">¿Quién pagó?</option>
                      {grupoSeleccionado.split_participantes.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-brand-500 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand-500/20 active:scale-95 transition-all">
                    Añadir Gasto al Grupo
                  </button>
                </form>

                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h4 className="text-[10px] font-black uppercase text-text-muted tracking-widest">Historial de Pagos</h4>
                    <span className="text-[9px] font-bold text-text-muted uppercase">{grupoSeleccionado.split_gastos.length} Movimientos</span>
                  </div>
                  <div className="space-y-2">
                    {grupoSeleccionado.split_gastos.map(g => (
                      <div key={g.id} className="flex items-center justify-between p-4 bg-surface-solid rounded-2xl border border-border-subtle group transition-all">
                        <div className="overflow-hidden flex items-center gap-3">
                          <div className="p-2 bg-white/5 rounded-lg text-text-muted"><Receipt size={16}/></div>
                          <div>
                            <p className="text-xs font-bold text-text-main truncate leading-tight">{g.descripcion}</p>
                            <p className="text-[9px] text-text-muted font-bold uppercase mt-0.5">
                              {grupoSeleccionado.split_participantes.find(p => p.id === g.pagado_por_id)?.nombre} • {formatoEuros(g.monto)}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => { if(confirm('¿Borrar este gasto?')) eliminarGastoSplit(g.id) }} 
                          className="p-2 text-text-muted hover:text-danger active:scale-90 transition-all md:opacity-0 md:group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                    {grupoSeleccionado.split_gastos.length === 0 && (
                      <div className="text-center py-10 card bg-transparent border-dashed border-2 border-border-subtle opacity-30">
                        <Info size={24} className="mx-auto mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No hay gastos todavía</p>
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