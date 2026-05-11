import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Target, CalendarClock, TrendingUp, Wallet, AlertCircle, Edit2, Trash2, Plus } from 'lucide-react'
import ModalObjetivo from './ModalObjetivo'

const formatoEuros = (num) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(num || 0)

const calcularProyeccion = (saldoActual, meta, aportacion, tasaAnual) => {
  const progreso = Math.min(100, (saldoActual / meta) * 100)
  
  if (saldoActual >= meta) {
    return { progreso, alcanzado: true, meses: 0, anos: 0, mesesResto: 0, totalAportado: 0, totalIntereses: 0 }
  }

  const tasaMensual = (tasaAnual || 0) / 100 / 12
  let meses = 0

  if (tasaMensual === 0) {
    if (aportacion <= 0) return { imposible: true, progreso }
    meses = Math.ceil((meta - saldoActual) / aportacion)
  } else {
    if (aportacion <= 0 && saldoActual <= 0) return { imposible: true, progreso }
    if (aportacion <= 0) {
      meses = Math.ceil(Math.log(meta / saldoActual) / Math.log(1 + tasaMensual))
    } else {
      const x = (meta + aportacion / tasaMensual) / (saldoActual + aportacion / tasaMensual)
      if (x <= 0) return { imposible: true, progreso }
      meses = Math.ceil(Math.log(x) / Math.log(1 + tasaMensual))
    }
  }

  if (meses < 0 || !isFinite(meses)) return { imposible: true, progreso }

  const totalAportado = aportacion * meses
  const totalIntereses = meta - saldoActual - totalAportado

  return {
    progreso,
    alcanzado: false,
    imposible: false,
    meses,
    anos: Math.floor(meses / 12),
    mesesResto: meses % 12,
    totalAportado,
    totalIntereses
  }
}

export default function Objetivos() {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [objetivoEditando, setObjetivoEditando] = useState(null)
  const objetivos = useStore(state => state.objetivos)
  const eliminarObjetivo = useStore(state => state.eliminarObjetivo)
  const patrimonio = useStore(state => state.patrimonioTotal())

  const handleNuevo = () => {
    setObjetivoEditando(null)
    setModalAbierto(true)
  }

  const handleEditar = (id) => {
    setObjetivoEditando(id)
    setModalAbierto(true)
  }

  return (
    <>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-1 relative w-full">
        
        <div className="absolute top-10 right-20 w-72 h-72 bg-brand-emerald/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 left-10 w-64 h-64 bg-brand-emerald/5 rounded-full blur-[100px] pointer-events-none" />

        <header className="mb-10 pt-2 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="w-full text-center md:text-left">
              <p className="text-[10px] md:text-xs font-black text-text-muted uppercase tracking-widest mb-2 flex items-center justify-center md:justify-start gap-2">
                <Target size={14} className="text-brand-emerald" />
                Metas y Proyección
              </p>
              <h1 className="text-5xl md:text-6xl font-black text-text-main mb-1 tracking-tighter leading-none">
                Tus Objetivos
              </h1>
            </div>
            
            <div className="flex w-full md:w-auto md:mr-14">
              <button 
                onClick={handleNuevo} 
                className="flex-1 md:flex-none flex items-center justify-center gap-2.5 px-6 py-3.5 md:py-3 rounded-xl font-bold bg-brand-emerald/10 text-brand-emerald hover:bg-brand-emerald/20 active:scale-95 transition-all text-sm w-full md:w-auto border border-brand-emerald/20 shadow-lg shadow-brand-emerald/5 group uppercase tracking-widest"
              >
                <Plus size={18} className="group-hover:rotate-90 transition-transform"/> 
                <span>Nuevo Objetivo</span>
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 relative z-10">
          {objetivos.map(obj => {
            const proyeccion = calcularProyeccion(patrimonio, obj.meta, obj.aportacionExtra, obj.tasa)
            
            let fechaEstimada = null
            if (!proyeccion.imposible && !proyeccion.alcanzado) {
              const fecha = new Date()
              fecha.setMonth(fecha.getMonth() + proyeccion.meses)
              fechaEstimada = fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
            }

            return (
              <div key={obj.id} className={`bg-surface-solid/40 backdrop-blur-xl border border-border-subtle/50 rounded-3xl p-6 flex flex-col shadow-xl shadow-black/5 group transition-all duration-300 hover:-translate-y-1 hover:border-border-subtle/80 ${proyeccion.alcanzado ? 'border-brand-emerald/30 bg-brand-emerald/5' : ''}`}>
                
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl border shrink-0 transition-colors ${proyeccion.alcanzado ? 'bg-brand-emerald/20 text-brand-emerald border-brand-emerald/30 shadow-[0_0_15px_rgba(0,143,88,0.1)]' : 'bg-surface-solid/60 text-text-muted border-border-subtle/50 group-hover:bg-surface group-hover:text-brand-emerald'}`}>
                      <Target size={24} strokeWidth={2.5} />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-black text-lg text-text-main leading-none truncate mb-1.5">{obj.nombre}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] uppercase font-black tracking-widest text-text-muted bg-surface-solid px-2 py-0.5 rounded-md border border-border-subtle/50">
                          Meta: <span className="text-text-main">{formatoEuros(obj.meta)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditar(obj.id)} className="p-2 text-text-muted hover:text-brand-emerald bg-surface-solid md:bg-surface-solid/50 rounded-xl border border-border-subtle/50 hover:border-brand-emerald/30 transition-all active:scale-90">
                      <Edit2 size={16} strokeWidth={2.5} />
                    </button>
                    <button onClick={() => eliminarObjetivo(obj.id)} className="p-2 text-text-muted hover:text-danger bg-surface-solid md:bg-surface-solid/50 rounded-xl border border-border-subtle/50 hover:border-danger/30 transition-all active:scale-90">
                      <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                <div className="mb-6 bg-surface-solid/50 p-4 rounded-2xl border border-border-subtle/30">
                  <div className="mb-2.5 flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Progreso Actual</span>
                    <span className={`text-2xl font-black leading-none tracking-tighter ${proyeccion.alcanzado ? 'text-brand-emerald' : 'text-text-main'}`}>
                      {proyeccion.progreso.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-surface-solid rounded-full h-3 overflow-hidden border border-border-subtle/50 relative shadow-inner">
                    <div className="absolute inset-0 bg-brand-emerald/20 blur-md rounded-full" style={{ width: `${proyeccion.progreso}%` }} />
                    <div 
                      className={`${proyeccion.alcanzado ? 'bg-brand-emerald' : 'bg-brand-emerald'} h-full rounded-full transition-all duration-1000 ease-out relative z-10`} 
                      style={{ width: `${proyeccion.progreso}%` }}
                    />
                  </div>
                </div>

                {proyeccion.imposible ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 bg-danger/10 border border-danger/20 rounded-2xl">
                    <AlertCircle className="text-danger mb-3" size={32} strokeWidth={2} />
                    <p className="text-danger text-sm font-black uppercase tracking-widest text-center mb-1">Cálculo Inviable</p>
                    <p className="text-danger/70 text-[10px] font-bold uppercase tracking-wider text-center max-w-[80%]">
                      Aumenta tu aportación mensual o la rentabilidad esperada.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 mt-auto">
                    {!proyeccion.alcanzado && (
                      <div className="bg-surface-solid/60 backdrop-blur-sm border border-border-subtle/50 rounded-2xl p-5 flex items-center justify-between group-hover:border-border-subtle/80 transition-colors">
                        <div>
                          <p className="text-[9px] uppercase font-black tracking-widest text-text-muted mb-1.5">Tiempo Estimado</p>
                          <p className="text-2xl md:text-3xl font-black text-text-main tracking-tighter leading-none mb-1">
                            {proyeccion.anos > 0 && `${proyeccion.anos} ${proyeccion.anos === 1 ? 'Año' : 'Años'} `}
                            {proyeccion.mesesResto > 0 && `${proyeccion.mesesResto} ${proyeccion.mesesResto === 1 ? 'Mes' : 'Meses'}`}
                            {proyeccion.anos === 0 && proyeccion.mesesResto === 0 && '¡Ya casi!'}
                          </p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-brand-emerald opacity-80">
                             Meta: {fechaEstimada}
                          </p>
                        </div>
                        <div className="p-4 bg-brand-emerald/10 rounded-2xl text-brand-emerald border border-brand-emerald/20 shadow-[0_0_15px_rgba(0,143,88,0.05)]">
                          <CalendarClock size={28} strokeWidth={2} />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-surface-solid/60 backdrop-blur-sm p-4 rounded-2xl border border-border-subtle/50 flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-3 text-text-muted">
                          <Wallet size={14} />
                          <span className="text-[9px] uppercase font-black tracking-widest">Aportado</span>
                        </div>
                        <div>
                          <p className="text-lg md:text-xl font-black text-text-main truncate leading-none mb-1">{formatoEuros(proyeccion.totalAportado)}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-brand-emerald">+{formatoEuros(obj.aportacionExtra)}/mes</p>
                        </div>
                      </div>

                      <div className="bg-surface-solid/60 backdrop-blur-sm p-4 rounded-2xl border border-border-subtle/50 flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-3 text-text-muted">
                          <TrendingUp size={14} />
                          <span className="text-[9px] uppercase font-black tracking-widest">Interés</span>
                        </div>
                        <div>
                          <p className={`text-lg md:text-xl font-black truncate leading-none mb-1 ${proyeccion.totalIntereses > 0 ? 'text-brand-emerald' : 'text-text-main'}`}>
                            {formatoEuros(proyeccion.totalIntereses)}
                          </p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">{obj.tasa}% anual</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <ModalObjetivo 
        isOpen={modalAbierto} 
        onClose={() => setModalAbierto(false)} 
        objetivoEditandoId={objetivoEditando}
      />
    </>
  )
}
