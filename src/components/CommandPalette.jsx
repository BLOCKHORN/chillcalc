import { useState, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { Search, Wallet, ArrowRight, Zap, TrendingDown, TrendingUp, CreditCard, Banknote, List, X } from 'lucide-react'

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { transacciones, cuentas, setVistaActual } = useStore()

  // Atajo de teclado: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const filteredItems = useMemo(() => {
    if (!query) return []
    const q = query.toLowerCase()
    
    const items = [
      // Acciones rápidas
      { id: 'v-dashboard', title: 'Ir al Dashboard', type: 'action', icon: <Zap size={18} />, action: () => setVistaActual('dashboard') },
      { id: 'v-cuentas', title: 'Ver mis Cuentas', type: 'action', icon: <Wallet size={18} />, action: () => setVistaActual('cuentas') },
      { id: 'v-transacciones', title: 'Ver Movimientos', type: 'action', icon: <List size={18} />, action: () => setVistaActual('transacciones') },
    ]

    // Buscar en transacciones
    const txMatches = transacciones
      .filter(t => (t.desc || t.categoria).toLowerCase().includes(q))
      .slice(0, 5)
      .map(t => ({
        id: `tx-${t.id}`,
        title: t.desc || t.categoria,
        subtitle: `${t.tipo === 'gasto' ? '-' : '+'}${t.monto}€ • ${t.fecha}`,
        type: 'transacción',
        icon: t.tipo === 'gasto' ? <TrendingDown size={18} className="text-danger" /> : <TrendingUp size={18} className="text-brand-400" />,
        action: () => setVistaActual('transacciones')
      }))

    // Buscar en cuentas
    const cuentaMatches = cuentas
      .filter(c => c.nombre.toLowerCase().includes(q))
      .map(c => ({
        id: `cuenta-${c.id}`,
        title: c.nombre,
        subtitle: `Saldo: ${c.saldo}€`,
        type: 'cuenta',
        icon: <CreditCard size={18} />,
        action: () => setVistaActual('cuentas')
      }))

    return [...items.filter(i => i.title.toLowerCase().includes(q)), ...cuentaMatches, ...txMatches]
  }, [query, transacciones, cuentas, setVistaActual])

  const handleAction = (action) => {
    action()
    setIsOpen(false)
    setQuery('')
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-[15vh] px-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: -20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: -20 }}
        className="relative w-full max-w-xl bg-surface-solid border border-border-subtle rounded-[2rem] shadow-2xl overflow-hidden"
      >
        <div className="flex items-center px-6 py-5 border-b border-border-subtle">
          <Search size={22} className="text-brand-400 mr-4 shrink-0" />
          <input 
            autoFocus
            placeholder="Escribe para buscar comandos, cuentas o transacciones..."
            className="flex-1 bg-transparent border-none outline-none text-text-main font-bold placeholder:text-text-muted/50 text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-surface rounded-lg border border-border-subtle text-[10px] font-black text-text-muted uppercase tracking-widest">
            Esc
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3 custom-scrollbar">
          {filteredItems.length > 0 ? (
            <div className="space-y-1">
              {filteredItems.map(item => (
                <button 
                  key={item.id}
                  onClick={() => handleAction(item.action)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-brand-500/10 rounded-2xl transition-all group text-left border border-transparent hover:border-brand-500/20"
                >
                  <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-text-muted group-hover:text-brand-400 transition-colors">
                    {item.icon}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-black text-text-main truncate">{item.title}</p>
                    {item.subtitle && <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">{item.subtitle}</p>}
                  </div>
                  <div className="text-[10px] font-black text-text-muted opacity-0 group-hover:opacity-100 uppercase tracking-widest flex items-center gap-1">
                    Ir <ArrowRight size={12} />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-text-muted opacity-40">
              <Zap size={40} className="mb-4" />
              <p className="text-xs font-black uppercase tracking-widest">
                {query ? 'No se encontraron resultados' : 'Empieza a escribir para filtrar'}
              </p>
            </div>
          )}
        </div>

        <div className="p-4 bg-surface border-t border-border-subtle flex items-center justify-between text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><ArrowRight size={10} /> Seleccionar</span>
            <span className="flex items-center gap-1"><Search size={10} /> Buscar</span>
          </div>
          <span>EasyPocket Terminal v2.0</span>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}
