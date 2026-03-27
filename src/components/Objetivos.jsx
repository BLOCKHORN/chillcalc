import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Target, CalendarClock, TrendingUp, Wallet, AlertCircle, Edit2, Trash2 } from 'lucide-react'
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-text-main mb-1">Objetivos Financieros</h2>
          <p className="text-sm text-text-muted">Proyección y metas de capital</p>
        </div>
        <button onClick={handleNuevo} className="btn-primary text-white">Nuevo Objetivo</button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {objetivos.map(obj => {
          const proyeccion = calcularProyeccion(patrimonio, obj.meta, obj.aportacionExtra, obj.tasa)
          
          let fechaEstimada = null
          if (!proyeccion.imposible && !proyeccion.alcanzado) {
            const fecha = new Date()
            fecha.setMonth(fecha.getMonth() + proyeccion.meses)
            fechaEstimada = fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
          }

          return (
            <div key={obj.id} className={`card flex flex-col ${proyeccion.alcanzado ? 'border-brand-500/50' : ''}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${proyeccion.alcanzado ? 'bg-brand-500/20 text-brand-400' : 'bg-surface-solid text-text-muted'}`}>
                    <Target size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-main text-lg">{obj.nombre}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-text-muted">Meta: {formatoEuros(obj.meta)}</p>
                      {proyeccion.alcanzado && <span className="text-xs font-bold text-brand-400">¡Alcanzado!</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEditar(obj.id)} className="p-2 text-text-muted hover:text-text-main hover:bg-surface-solid rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => eliminarObjetivo(obj.id)} className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mb-2 flex justify-between text-xs font-semibold">
                <span className="text-text-muted">Progreso actual</span>
                <span className="text-text-main">{proyeccion.progreso.toFixed(1)}%</span>
              </div>
              
              <div className="w-full bg-surface-solid rounded-full h-3 overflow-hidden border border-border-subtle mb-6">
                <div 
                  className={`${proyeccion.alcanzado ? 'bg-brand-500' : 'bg-linear-to-r from-brand-600 to-brand-400'} h-full transition-all duration-1000 ease-out`} 
                  style={{ width: `${proyeccion.progreso}%` }}
                />
              </div>

              {proyeccion.imposible ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-danger/10 border border-danger/20 rounded-xl">
                  <AlertCircle className="text-danger mb-2" size={28} />
                  <p className="text-danger text-sm font-semibold text-center">Matemáticamente imposible</p>
                  <p className="text-text-muted text-xs text-center mt-1">Añade una aportación mensual mayor a 0 o incrementa la tasa de interés.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {!proyeccion.alcanzado && (
                    <div className="bg-surface-solid border border-border-subtle rounded-xl p-5 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Tiempo Estimado</p>
                        <p className="text-2xl font-black text-text-main tracking-tight">
                          {proyeccion.anos > 0 && `${proyeccion.anos} años `}
                          {proyeccion.mesesResto > 0 && `${proyeccion.mesesResto} meses`}
                          {proyeccion.anos === 0 && proyeccion.mesesResto === 0 && 'Menos de 1 mes'}
                        </p>
                        <p className="text-sm font-semibold text-brand-400 mt-1 capitalize">
                           {fechaEstimada}
                        </p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-full text-brand-400 hidden sm:block">
                        <CalendarClock size={28} />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-surface-solid p-4 rounded-xl border border-border-subtle">
                      <div className="flex items-center gap-2 mb-2 text-text-muted">
                        <Wallet size={14} />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Total Aportado</span>
                      </div>
                      <p className="text-lg font-bold text-text-main">{formatoEuros(proyeccion.totalAportado)}</p>
                      <p className="text-xs text-text-muted mt-1">{formatoEuros(obj.aportacionExtra)} / mes</p>
                    </div>

                    <div className="bg-surface-solid p-4 rounded-xl border border-border-subtle">
                      <div className="flex items-center gap-2 mb-2 text-text-muted">
                        <TrendingUp size={14} />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Interés Generado</span>
                      </div>
                      <p className={`text-lg font-bold ${proyeccion.totalIntereses > 0 ? 'text-brand-400' : 'text-danger'}`}>
                        {formatoEuros(proyeccion.totalIntereses)}
                      </p>
                      <p className="text-xs text-text-muted mt-1">Al {obj.tasa}% anual</p>
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