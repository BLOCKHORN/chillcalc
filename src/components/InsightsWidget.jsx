import { useStore } from '../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, AlertCircle, TrendingUp, ChevronRight, Zap } from 'lucide-react'

export default function InsightsWidget() {
  const insights = useStore(state => state.insights)

  if (insights.length === 0) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-2">
         <div className="w-5 h-5 rounded-full bg-brand-emerald/10 flex items-center justify-center">
            <Sparkles size={12} className="text-brand-emerald" />
         </div>
         <span className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">Inteligencia de Datos</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {insights.map((insight) => (
            <motion.div 
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="p-6 rounded-2xl bg-surface border border-border-subtle flex gap-5 group hover:bg-surface-hover transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-border-subtle flex items-center justify-center shrink-0">
                {insight.tipo === 'warning' ? <AlertCircle size={20} className="text-danger" /> : <Zap size={20} className="text-info" />}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-[15px] text-text-main mb-1 tracking-tight">{insight.titulo}</h4>
                <p className="text-[13px] text-text-muted leading-relaxed font-medium">{insight.mensaje}</p>
              </div>
              <div className="opacity-20 group-hover:opacity-100 transition-opacity self-center">
                 <ChevronRight size={18} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
