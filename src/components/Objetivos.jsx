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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-8 px-1 md:px-0">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-2">
        <div className="w-full text-center md:text-left">
          <h2 className="text-3xl md:text-2xl font-black md:font-bold text-text-main mb-1 tracking-tighter md:tracking-normal">
            Tus Metas
          </h2>
          <p className="text-[10px] md:text-sm text-text-muted uppercase font-bold tracking-widest">
            Proyección y objetivos de capital
          </p>
        </div>
        <button 
          onClick={handleNuevo} 
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white py-3 md:py-2 px-6 rounded-xl active:scale-95 transition-all text-sm font-bold shadow-lg shadow-brand-500/20"
        >
          <Plus size={18} /> Nuevo Objetivo
        </button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {objetivos.map(obj => {
          const proyeccion = calcularProyeccion(patrimonio, obj.meta, obj.aportacionExtra, obj.tasa)
          
          let fechaEstimada = null
          if (!proyeccion.imposible && !proyeccion.alcanzado) {
            const fecha = new Date()
            fecha.setMonth(fecha.getMonth() + proyeccion.meses)
            fechaEstimada = fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
          }

          return (
            <div key={obj.id} className={`card flex flex-col p-4 md:p-6 ${proyeccion.alcanzado ? 'border-brand-500/50' : ''}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${proyeccion.alcanzado ? 'bg-brand-500/20 text-brand-400 border-brand-500/30' : 'bg-surface-solid text-text-muted border-border-subtle'}`}>
                    <Target size={22} />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-text-main text-base md:text-lg truncate">{obj.nombre}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] uppercase font-bold text-text-muted">Meta: {formatoEuros(obj.meta)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => handleEditar(obj.id)} className="p-2.5 text-text-muted hover:text-text-main bg-surface-solid rounded-lg border border-border-subtle transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => eliminarObjetivo(obj.id)} className="p-2.5 text-text-muted hover:text-danger bg-surface-solid rounded-lg border border-border-subtle transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mb-2 flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-text-muted">Progreso</span>
                <span className={proyeccion.alcanzado ? 'text-brand-400' : 'text-text-main'}>
                  {proyeccion.progreso.toFixed(1)}%
                </span>
              </div>
              
              <div className="w-full bg-surface-solid rounded-full h-2.5 overflow-hidden border border-border-subtle mb-6">
                <div 
                  className={`${proyeccion.alcanzado ? 'bg-brand-500' : 'bg-linear-to-r from-brand-600 to-brand-400'} h-full transition-all duration-1000 ease-out`} 
                  style={{ width: `${proyeccion.progreso}%` }}
                />
              </div>

              {proyeccion.imposible ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-danger/10 border border-danger/20 rounded-xl">
                  <AlertCircle className="text-danger mb-2" size={24} />
                  <p className="text-danger text-xs font-bold uppercase text-center">Inviable</p>
                  <p className="text-text-muted text-[10px] text-center mt-1">Aumenta tu ahorro mensual o la rentabilidad esperada.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {!proyeccion.alcanzado && (
                    <div className="bg-surface-solid border border-border-subtle rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] uppercase font-black tracking-tighter text-text-muted mb-1">Tiempo Estimado</p>
                        <p className="text-xl md:text-2xl font-black text-text-main tracking-tighter leading-none">
                          {proyeccion.anos > 0 && `${proyeccion.anos} ${proyeccion.anos === 1 ? 'Año' : 'Años'} `}
                          {proyeccion.mesesResto > 0 && `${proyeccion.mesesResto} ${proyeccion.mesesResto === 1 ? 'Mes' : 'Meses'}`}
                          {proyeccion.anos === 0 && proyeccion.mesesResto === 0 && '¡Ya casi!'}
                        </p>
                        <p className="text-[11px] font-bold text-brand-400 mt-2 capitalize">
                           Para {fechaEstimada}
                        </p>
                      </div>
                      <div className="p-3 bg-brand-500/10 rounded-xl text-brand-400">
                        <CalendarClock size={24} />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-surface-solid p-3 md:p-4 rounded-xl border border-border-subtle">
                      <div className="flex items-center gap-2 mb-1.5 text-text-muted">
                        <Wallet size={12} />
                        <span className="text-[9px] uppercase font-black tracking-tighter">Aportado</span>
                      </div>
                      <p className="text-sm md:text-base font-bold text-text-main truncate">{formatoEuros(proyeccion.totalAportado)}</p>
                      <p className="text-[9px] font-bold text-text-muted mt-0.5">{formatoEuros(obj.aportacionExtra)}/mes</p>
                    </div>

                    <div className="bg-surface-solid p-3 md:p-4 rounded-xl border border-border-subtle">
                      <div className="flex items-center gap-2 mb-1.5 text-text-muted">
                        <TrendingUp size={12} />
                        <span className="text-[9px] uppercase font-black tracking-tighter">Interés</span>
                      </div>
                      <p className={`text-sm md:text-base font-bold truncate ${proyeccion.totalIntereses > 0 ? 'text-brand-400' : 'text-text-muted'}`}>
                        {formatoEuros(proyeccion.totalIntereses)}
                      </p>
                      <p className="text-[9px] font-bold text-text-muted mt-0.5">{obj.tasa}% anual</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <ModalObjetivo 
        isOpen={modalAbierto} 
        onClose={() => setModalAbierto(false)} 
        objetivoEditandoId={objetivoEditando}
      />
    </div>
  )
}