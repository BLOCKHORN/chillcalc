import { useStore } from '../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

export default function InsightsWidget() {
  const insights = useStore(state => state.insights)

  if (insights.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-2">
         <div className="w-1 h-3 bg-brand-emerald" />
         <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Heurística de Red</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {insights.map((insight) => (
            <motion.div 
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="p-6 rounded-2xl bg-surface border border-border-subtle flex items-center justify-between group hover:bg-surface-hover transition-all"
            >
              <div>
                <h4 className="font-bold text-[14px] text-text-main mb-1 uppercase tracking-tight">{insight.titulo}</h4>
                <p className="text-[12px] text-text-muted leading-relaxed font-medium">{insight.mensaje}</p>
              </div>
              <ChevronRight size={16} className="text-text-muted opacity-20 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
