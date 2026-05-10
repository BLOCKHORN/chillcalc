import { useState, useMemo, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowUpRight, ArrowDownRight, Wallet, ArrowRight, StickyNote, X, Save, Edit3 } from 'lucide-react'

export default function Calendario() {
  const { transacciones, suscripciones, formatCurrency, notasDiarias, guardarNota } = useStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // Estado para el modal de notas
  const [diaSeleccionado, setDiaSeleccionado] = useState(null)
  const [textoNota, setTextoNota] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const days = new Date(year, month + 1, 0).getDate()
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1
    return { days, offset: adjustedFirstDay }
  }, [currentDate])

  const flowData = useMemo(() => {
    const data = {}
    transacciones.forEach(tx => {
      const [d, m, y] = tx.fecha.split('/')
      if (parseInt(m) === currentDate.getMonth() + 1 && parseInt(y) === currentDate.getFullYear()) {
        const dia = parseInt(d)
        if (!data[dia]) data[dia] = { ingresos: 0, gastos: 0, items: [] }
        if (tx.tipo === 'ingreso') data[dia].ingresos += tx.monto
        else if (tx.tipo === 'gasto') data[dia].gastos += tx.monto
        data[dia].items.push(tx)
      }
    })
    suscripciones.forEach(sub => {
      const [y, m, d] = sub.proximo_cobro.split('-')
      if (parseInt(m) === currentDate.getMonth() + 1 && parseInt(y) === currentDate.getFullYear()) {
        const dia = parseInt(d)
        if (!data[dia]) data[dia] = { ingresos: 0, gastos: 0, items: [] }
        data[dia].gastos += sub.monto
        data[dia].items.push({ ...sub, esSuscripcion: true })
      }
    })
    return data
  }, [transacciones, suscripciones, currentDate])

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1))
  }

  const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })

  const abrirNota = (dia) => {
    const fechaStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    const notaExistente = notasDiarias.find(n => n.fecha === fechaStr)
    setDiaSeleccionado(dia)
    setTextoNota(notaExistente ? notaExistente.contenido : '')
  }

  const manejarGuardarNota = async () => {
    setIsSaving(true)
    const fechaStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(diaSeleccionado).padStart(2, '0')}`
    await guardarNota(fechaStr, textoNota)
    setIsSaving(false)
    setDiaSeleccionado(null)
  }

  return (
    <div className="pb-32 pt-16 px-8 max-w-7xl mx-auto animate-apple">
      <header className="mb-20 flex flex-col md:flex-row justify-between items-end gap-12">
        <div>
          <p className="text-[13px] font-bold text-text-muted uppercase tracking-[0.2em] mb-4">Flujo de Caja Mensual</p>
          <h1 className="text-7xl font-bold tracking-tight text-text-main capitalize">{monthName}</h1>
        </div>
        
        <div className="flex gap-4">
          <button onClick={() => changeMonth(-1)} className="p-4 rounded-xl bg-surface border border-border-subtle hover:bg-surface-hover transition-all">
            <ChevronLeft size={24} />
          </button>
          <button onClick={() => changeMonth(1)} className="p-4 rounded-xl bg-surface border border-border-subtle hover:bg-surface-hover transition-all">
            <ChevronRight size={24} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-px bg-border-subtle border border-border-subtle rounded-2xl overflow-hidden shadow-2xl">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
          <div key={day} className="bg-surface p-6 text-center border-b border-border-subtle">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">{day}</span>
          </div>
        ))}

        {Array.from({ length: daysInMonth.offset }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-bg-app/40 min-h-[160px]" />
        ))}

        {Array.from({ length: daysInMonth.days }).map((_, i) => {
          const day = i + 1
          const dayData = flowData[day]
          const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear()
          const fechaStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const tieneNota = notasDiarias.some(n => n.fecha === fechaStr && n.contenido)

          return (
            <div 
              key={day} 
              onClick={() => abrirNota(day)}
              className={`bg-surface min-h-[160px] p-6 border-b border-r border-border-subtle/50 flex flex-col justify-between group hover:bg-white/[0.01] transition-all cursor-pointer ${isToday ? 'bg-white/[0.03]' : ''}`}
            >
               <div className="flex justify-between items-start">
                  <span className={`text-[17px] font-bold ${isToday ? 'text-white underline underline-offset-8 decoration-2' : 'text-text-muted group-hover:text-text-main'}`}>{day}</span>
                  <div className="flex flex-col items-end gap-1.5">
                    {tieneNota && <StickyNote size={12} className="text-brand-emerald" />}
                    {dayData && (
                       <>
                          {dayData.ingresos > 0 && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_#fff]" />}
                          {dayData.gastos > 0 && <div className="w-1.5 h-1.5 rounded-full bg-text-muted" />}
                       </>
                    )}
                  </div>
               </div>

               <div className="space-y-1">
                  {dayData && (
                    <>
                      {dayData.ingresos > 0 && (
                        <p className="text-[11px] font-bold text-text-main truncate">+{formatCurrency(dayData.ingresos)}</p>
                      )}
                      {dayData.gastos > 0 && (
                        <p className="text-[11px] font-bold text-text-muted truncate">-{formatCurrency(dayData.gastos)}</p>
                      )}
                    </>
                  )}
               </div>
            </div>
          )
        })}
      </div>

      {/* Resumen Final */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-10">
         {[
           { label: "Entradas Totales", val: Object.values(flowData).reduce((a,b) => a + b.ingresos, 0), icon: ArrowUpRight },
           { label: "Salidas Totales", val: Object.values(flowData).reduce((a,b) => a + b.gastos, 0), icon: ArrowDownRight },
           { label: "Posición Neta", val: Object.values(flowData).reduce((a,b) => a + b.ingresos - b.gastos, 0), icon: Wallet }
         ].map((item, i) => (
           <div key={i} className="card !p-10 flex items-center justify-between group hover:border-white/20 transition-all">
              <div>
                 <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em] mb-4">{item.label}</p>
                 <p className="text-3xl font-bold text-text-main tracking-tight">{formatCurrency(item.val)}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-border-subtle flex items-center justify-center text-text-main group-hover:scale-110 transition-transform">
                 <item.icon size={28} strokeWidth={1.5} />
              </div>
           </div>
         ))}
      </div>

      {/* Modal de Notas Diarias */}
      <AnimatePresence>
        {diaSeleccionado && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-surface border border-border-subtle rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-border-subtle flex justify-between items-center">
                <div>
                   <h3 className="text-xl font-bold text-text-main tracking-tight">Notas del Día {diaSeleccionado}</h3>
                   <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Bitácora Financiera</p>
                </div>
                <button onClick={() => setDiaSeleccionado(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                 <textarea 
                   autoFocus
                   value={textoNota}
                   onChange={(e) => setTextoNota(e.target.value)}
                   placeholder="Escribe recordatorios, contexto de gastos o planes para este día..."
                   className="w-full h-40 bg-bg-app border border-border-subtle rounded-xl p-5 text-[15px] font-medium text-text-main outline-none focus:border-white transition-all resize-none"
                 />
                 <button 
                   onClick={manejarGuardarNota}
                   disabled={isSaving}
                   className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                   {isSaving ? 'Guardando...' : <><Save size={18} /> Guardar Anotación</>}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
