import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, Wallet, ArrowRightLeft, Target, LogOut, Users, 
  Sun, Moon, CalendarClock, ShieldAlert, Eye, EyeOff, BarChart3, CalendarDays,
  Command, ChevronRight
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { tema, toggleTema, rolUsuario, modoPrivacidad, toggleModoPrivacidad } = useStore()
  const [email, setEmail] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setEmail(user.email)
    })
  }, [])

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  const navItems = [
    { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
    { id: 'cuentas', label: 'Mis Cuentas', icon: Wallet },
    { id: 'transacciones', label: 'Movimientos', icon: ArrowRightLeft },
    { id: 'suscripciones', label: 'Suscripciones', icon: CalendarClock },
    { id: 'fire', label: 'Simuladores', icon: BarChart3 },
    { id: 'calendario', label: 'Calendario', icon: CalendarDays },
    { id: 'objetivos', label: 'Objetivos', icon: Target },
    { id: 'compartir', label: 'Dividir Gastos', icon: Users },
  ]

  if (rolUsuario === 'admin') {
    navItems.push({ id: 'admin', label: 'Terminal Admin', icon: ShieldAlert })
  }

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen bg-black border-r border-border-subtle flex flex-col z-50">
      
      {/* Brand Identity */}
      <div className="flex items-center gap-3 px-6 py-10">
        <div className="w-8 h-8 rounded-lg bg-brand-emerald flex items-center justify-center text-white shadow-xl shadow-brand-emerald/20">
          <Command size={16} strokeWidth={3} />
        </div>
        <span className="font-bold text-lg tracking-tighter text-white uppercase">
          EASYPOCKET<span className="text-brand-emerald">.</span>
        </span>
      </div>
      
      {/* Navigation */}
      <nav className="flex flex-col px-3 overflow-y-auto no-scrollbar flex-1 gap-1">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = location.pathname === `/${id}`
          
          return (
            <button
              key={id}
              onClick={() => navigate(`/${id}`)}
              className={clsx(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 group relative",
                isActive 
                  ? "text-white bg-white/[0.04]" 
                  : "text-text-muted hover:text-white hover:bg-white/[0.02]"
              )}
            >
              <Icon 
                size={16} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={clsx(
                  "transition-colors duration-300",
                  isActive ? "text-brand-emerald" : "text-text-muted group-hover:text-white"
                )} 
              />
              <span className="relative z-10">{label}</span>
              {isActive && (
                <motion.div 
                  layoutId="active-nav-bg"
                  className="absolute inset-0 bg-white/[0.01] rounded-xl border border-white/5"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 bg-white/[0.005] border-t border-border-subtle">
        
        <button 
          onClick={toggleModoPrivacidad}
          className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-[12px] font-bold text-text-muted hover:text-white transition-all group mb-2"
        >
          <div className="flex items-center gap-3">
             {modoPrivacidad ? <Eye size={15} className="text-brand-emerald" /> : <EyeOff size={15} />}
             <span>Modo Incógnito</span>
          </div>
          <div className={clsx(
            "w-6 h-3 rounded-full border border-border-subtle relative transition-colors", 
            modoPrivacidad && "bg-brand-emerald border-brand-emerald"
          )}>
             <div className={clsx(
               "absolute top-0.5 w-1.5 h-1.5 rounded-full transition-all", 
               modoPrivacidad ? "right-0.5 bg-white" : "left-0.5 bg-text-muted"
             )} />
          </div>
        </button>

        <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-border-subtle flex items-center gap-3">
           <div className="w-7 h-7 rounded-full bg-brand-emerald/10 border border-brand-emerald/20 flex items-center justify-center text-[10px] font-black text-brand-emerald shrink-0">
              {email ? email[0].toUpperCase() : '?'}
           </div>
           <div className="flex-1 overflow-hidden">
              <p className="text-[12px] font-bold text-white truncate">{email || 'Invitado'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                 <div className="w-1 h-1 rounded-full bg-brand-emerald animate-pulse" />
                 <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">En línea</p>
              </div>
           </div>
        </div>

        <button 
          onClick={cerrarSesion}
          className="mt-2 flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[12px] font-bold text-danger/50 hover:text-danger hover:bg-danger/5 transition-all"
        >
          <LogOut size={15} />
          Cerrar Sesión
        </button>
      </div>

    </aside>
  )
}
