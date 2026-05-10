import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { X, Target, Percent, Sparkles, ShieldCheck, Zap } from 'lucide-react'

export default function ModalPresupuesto({ isOpen, onClose, categoriaInicial }) {
  const { actualizarPresupuesto, presupuestos, categorias } = useStore()
  const [categoria, setCategoria] = useState('')
  const [limite, setLimite] = useState('')

  useEffect(() => {
    if (categoriaInicial) {
      setCategoria(categoriaInicial)
      const exist = presupuestos.find(p => p.categoria === categoriaInicial)
      if (exist) setLimite(exist.limite)
      else setLimite('')
    } else {
      setCategoria('')
      setLimite('')
    }
  }, [categoriaInicial, presupuestos, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    await actualizarPresupuesto(categoria, limite)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-surface border border-border-subtle rounded-[2rem] shadow-2xl overflow-hidden animate-apple">
        <div className="p-10 border-b border-border-subtle flex justify-between items-center bg-white/[0.01]">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-brand-emerald/10 flex items-center justify-center text-brand-emerald">
                <Target size={22} strokeWidth={2.5} />
             </div>
             <div>
                <h2 className="text-2xl font-bold text-text-main tracking-tight">Límite de Gasto</h2>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mt-1">Control de Presupuesto</p>
             </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-colors text-text-muted">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
               <ShieldCheck size={14} className="text-brand-emerald" />
               <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">Categoría del Activo</label>
            </div>
            <select 
              value={categoria} 
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full bg-bg-app border border-border-subtle rounded-xl p-5 text-[16px] font-bold text-text-main outline-none focus:border-brand-emerald transition-all appearance-none"
              required
            >
              <option value="">Seleccionar Categoría</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
               <Zap size={14} className="text-brand-emerald" />
               <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">Techo Mensual (EUR)</label>
            </div>
            <div className="relative">
               <input 
                 type="number" 
                 value={limite} 
                 onChange={(e) => setLimite(e.target.value)}
                 className="w-full bg-bg-app border border-border-subtle rounded-xl p-5 text-[28px] font-bold text-text-main outline-none focus:border-brand-emerald transition-all"
                 placeholder="0.00"
                 required
               />
               <span className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted font-bold text-lg">€</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-border-subtle flex items-start gap-4">
             <Info size={18} className="text-text-muted shrink-0 mt-0.5" />
             <p className="text-[13px] text-text-muted leading-relaxed font-medium">
                Al establecer un límite, el sistema te notificará cuando el gasto acumulado en esta categoría supere el 90% del capital asignado.
             </p>
          </div>

          <button type="submit" className="w-full btn-primary py-5 rounded-xl text-[15px] font-bold shadow-2xl flex items-center justify-center gap-3">
             <Sparkles size={18} fill="currentColor" /> Aplicar Restricción
          </button>
        </form>
      </div>
    </div>
  )
}
