import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Wallet, ArrowLeftRight, Target, Users, CalendarClock } from 'lucide-react'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Inicio' },
    { id: 'cuentas', icon: Wallet, label: 'Cartera' },
    { id: 'transacciones', icon: ArrowLeftRight, label: 'Movs' },
    { id: 'suscripciones', icon: CalendarClock, label: 'Subs' },
    { id: 'objetivos', icon: Target, label: 'Metas' },
    { id: 'compartir', icon: Users, label: 'Grupos' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface-solid border-t border-border-subtle px-2 sm:px-4 pb-6 pt-3 flex justify-between items-center backdrop-blur-md bg-opacity-95">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const activo = location.pathname === `/${tab.id}`

        let claseTutorial = ''
        if (tab.id === 'cuentas') claseTutorial = 'tour-mobile-cuentas'
        if (tab.id === 'transacciones') claseTutorial = 'tour-mobile-transacciones'
        if (tab.id === 'suscripciones') claseTutorial = 'tour-mobile-suscripciones'
        if (tab.id === 'objetivos') claseTutorial = 'tour-mobile-objetivos'
        if (tab.id === 'compartir') claseTutorial = 'tour-mobile-compartir'

        return (
          <button
            key={tab.id}
            onClick={() => navigate(`/${tab.id}`)}
            className={`flex flex-col items-center gap-1 transition-all flex-1 ${activo ? 'text-brand-500 scale-110' : 'text-text-muted hover:text-text-main'} ${claseTutorial}`}
          >
            <Icon size={22} strokeWidth={activo ? 2.5 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}