import { useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, Wallet, ArrowLeftRight, Target, Users, 
  CalendarClock, CalendarDays, BarChart3, ShieldAlert 
} from 'lucide-react'
import { useStore } from '../store/useStore'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { rolUsuario } = useStore()

  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Inicio' },
    { id: 'cuentas', icon: Wallet, label: 'Cartera' },
    { id: 'transacciones', icon: ArrowLeftRight, label: 'Movs' },
    { id: 'suscripciones', icon: CalendarClock, label: 'Subs' },
    { id: 'fire', icon: BarChart3, label: 'Sims' },
    { id: 'calendario', icon: CalendarDays, label: 'Cal' },
    { id: 'objetivos', icon: Target, label: 'Metas' },
    { id: 'compartir', icon: Users, label: 'Grupos' },
  ]

  if (rolUsuario === 'admin') {
    tabs.push({ id: 'admin', icon: ShieldAlert, label: 'Admin' })
  }

  const tourClass = {
    cuentas: 'tour-mobile-cuentas',
    transacciones: 'tour-mobile-transacciones',
    suscripciones: 'tour-mobile-suscripciones',
    objetivos: 'tour-mobile-objetivos',
    compartir: 'tour-mobile-compartir',
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface-solid/95 border-t border-border-subtle px-6 pb-8 pt-4 flex justify-start items-center overflow-x-auto no-scrollbar backdrop-blur-xl gap-8">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const activo = location.pathname === `/${tab.id}`

        return (
          <button
            key={tab.id}
            onClick={() => navigate(`/${tab.id}`)}
            className={`relative flex flex-col items-center gap-1.5 transition-all shrink-0 min-w-[45px] ${
              activo ? 'text-brand-emerald scale-110' : 'text-text-muted active:text-text-main'
            } ${tourClass[tab.id] ?? ''}`}
          >
            <div className={`p-1 rounded-lg transition-colors ${activo ? 'bg-brand-emerald/10' : ''}`}>
              <Icon size={20} strokeWidth={activo ? 2.5 : 2} />
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${activo ? 'text-brand-emerald' : 'text-text-muted'}`}>
              {tab.label}
            </span>
          </button>
        )
      })}
      {/* Spacer to allow scrolling past the last item */}
      <div className="w-10 shrink-0" />
    </nav>
  )
}