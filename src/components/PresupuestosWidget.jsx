import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { motion } from 'framer-motion'
import { Target, ChevronRight, PieChart, Sparkles, ShieldCheck, Zap } from 'lucide-react'
import ModalPresupuesto from './ModalPresupuesto'

export default function PresupuestosWidget() {
  const { transacciones, presupuestos, formatCurrency, categorias } = useStore()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [catSel, setCatSel] = useState(null)
  
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const presupuestosCalculados = presupuestos.map(p => {
    const gastado = transacciones
      .filter(t => t.categoria === p.categoria && t.tipo === 'gasto')
      .filter(t => {
        const partes = t.fecha.split('/')
        return parseInt(partes[1]) === currentMonth && parseInt(partes[2]) === currentYear
      })
      .reduce((s, t) => s + t.monto, 0)
    
    return { ...p, gastado }
  })

  const abrirConfig = (cat = null) => {
    setCatSel(cat)
    setModalAbierto(true)
  }

  // Mapeo de colores "Apple" para categorías
  const getCategoryColor = (catName) => {
    const cat = categorias.find(c => c.nombre === catName)
    if (!cat) return 'bg-white opacity-40'
    
    const colors = {
      'emerald': 'bg-brand-emerald',
      'rose': 'bg-danger',
      'orange': 'bg-warning',
      'blue': 'bg-info',
      'purple': 'bg-purple-500',
      'pink': 'bg-pink-500',
      'yellow': 'bg-yellow-400',
      'slate': 'bg-slate-400'
    }
    return colors[cat.color] || 'bg-white opacity-40'
  }

  return (
    <div className="card !p-10">
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
           <div className="w-9 h-9 rounded-xl bg-white/5 border border-border-subtle flex items-center justify-center text-white opacity-80">
              <Target size={18} strokeWidth={1.5} />
           </div>
           <h3 className="text-lg font-bold text-text-main tracking-tight">Presupuestos</h3>
        </div>
        <button onClick={() => abrirConfig()} className="text-[12px] font-bold text-text-muted hover:text-white transition-all flex items-center gap-1">
          Configurar <ChevronRight size={14} />
        </button>
      </div>

      {presupuestos.length === 0 ? (
        <div className="py-12 text-center opacity-20">
           <PieChart size={32} className="mx-auto mb-4" />
           <p className="text-[11px] font-black uppercase tracking-[0.3em]">Sin límites definidos</p>
        </div>
      ) : (
        <div className="space-y-10">
          {presupuestosCalculados.map(p => {
            const pct = (p.gastado / p.limite) * 100
            const isDanger = pct > 95
            const barColor = isDanger ? 'bg-danger' : getCategoryColor(p.categoria)

            return (
              <div key={p.id} className="space-y-4 cursor-pointer group" onClick={() => abrirConfig(p.categoria)}>
                <div className="flex justify-between items-end">
                   <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${barColor.replace('bg-', 'bg-')}`} />
                      <div>
                         <p className="text-[15px] font-bold text-text-main tracking-tight group-hover:text-brand-emerald transition-colors">{p.categoria}</p>
                         <p className="text-[12px] text-text-muted font-medium mt-0.5">{formatCurrency(p.gastado)} de {formatCurrency(p.limite)}</p>
                      </div>
                   </div>
                   <span className={`text-[12px] font-black tracking-widest ${isDanger ? 'text-danger' : 'text-text-muted'}`}>
                      {pct.toFixed(0)}%
                   </span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, pct)}%` }}
                      className={`h-full transition-colors ${barColor}`}
                   />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ModalPresupuesto 
        isOpen={modalAbierto} 
        onClose={() => setModalAbierto(false)} 
        categoriaInicial={catSel} 
      />
    </div>
  )
}
