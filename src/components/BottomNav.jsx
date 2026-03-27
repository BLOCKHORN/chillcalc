import { LayoutDashboard, Wallet, ArrowLeftRight, Target } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function BottomNav() {
  const { vistaActual, setVistaActual } = useStore()

  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Inicio' },
    { id: 'cuentas', icon: Wallet, label: 'Cartera' },
    { id: 'transacciones', icon: ArrowLeftRight, label: 'Movimientos' },
    { id: 'objetivos', icon: Target, label: 'Metas' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface-solid border-t border-border-subtle px-6 pb-6 pt-3 flex justify-between items-center backdrop-blur-md bg-opacity-95">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const activo = vistaActual === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => setVistaActual(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all ${activo ? 'text-brand-500 scale-110' : 'text-text-muted'}`}
          >
            <Icon size={24} strokeWidth={activo ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}