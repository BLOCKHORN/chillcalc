import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import ModalPresupuesto from './ModalPresupuesto'
import PrivacyValue from './PrivacyValue'

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

  const getCategoryTheme = (catName) => {
    const cat = categorias.find(c => c.nombre === catName)
    const themes = {
      'emerald': { bg: 'bg-brand-emerald' },
      'rose': { bg: 'bg-red-600' },
      'orange': { bg: 'bg-orange-600' },
      'blue': { bg: 'bg-blue-600' },
      'purple': { bg: 'bg-purple-600' },
      'pink': { bg: 'bg-pink-600' },
      'yellow': { bg: 'bg-yellow-500' },
      'slate': { bg: 'bg-slate-600' }
    }
    return themes[cat?.color] || themes['slate']
  }

  return (
    <div className="card !p-8">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-2">
           <div className="w-1 h-4 bg-brand-emerald" />
           <div>
              <h3 className="text-[14px] font-black text-text-main uppercase tracking-[0.2em]">Presupuestos</h3>
           </div>
        </div>
        <button onClick={() => abrirConfig()} className="p-1 text-text-muted hover:text-white transition-all">
          <Plus size={18} />
        </button>
      </div>

      {presupuestos.length === 0 ? (
        <div className="py-8 text-center opacity-10">
           <p className="text-[10px] font-black uppercase tracking-[0.4em]">Sin límites definidos</p>
        </div>
      ) : (
        <div className="space-y-8">
          {presupuestosCalculados.map(p => {
            const pct = (p.gastado / p.limite) * 100
            const isDanger = pct > 95
            const theme = getCategoryTheme(p.categoria)

            return (
              <div key={p.id} className="space-y-3 cursor-pointer group" onClick={() => abrirConfig(p.categoria)}>
                <div className="flex justify-between items-end px-1">
                   <div>
                      <p className="text-[13px] font-bold text-text-main tracking-tight group-hover:text-brand-emerald transition-colors uppercase">{p.categoria}</p>
                      <p className="text-[11px] text-text-muted font-bold mt-0.5">
                         <PrivacyValue value={formatCurrency(p.gastado)} /> / {formatCurrency(p.limite)}
                      </p>
                   </div>
                   <span className={`text-[11px] font-black tracking-widest ${isDanger ? 'text-red-500' : 'text-text-muted'}`}>
                      {pct.toFixed(0)}%
                   </span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, pct)}%` }}
                      className={`h-full transition-colors ${isDanger ? 'bg-red-600' : theme.bg}`}
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
