import { useEffect, useState } from 'react'
import { LayoutDashboard, Wallet, ArrowRightLeft, Target, Command, LogOut, Users, Sun, Moon, CalendarClock } from 'lucide-react'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import clsx from 'clsx'

export default function Sidebar() {
  const { vistaActual, setVistaActual, tema, toggleTema } = useStore()
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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cuentas', label: 'Cuentas', icon: Wallet },
    { id: 'transacciones', label: 'Transacciones', icon: ArrowRightLeft },
    { id: 'suscripciones', label: 'Suscripciones', icon: CalendarClock },
    { id: 'objetivos', label: 'Objetivos', icon: Target },
    { id: 'compartir', label: 'Dividir Gastos', icon: Users },
  ]

  return (
    <aside className="w-64 bg-surface-solid/80 backdrop-blur-xl border-r border-border-subtle/50 p-6 flex flex-col h-screen sticky top-0 transition-colors duration-300 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      
      <div className="flex items-center gap-3 px-3 mb-10 mt-2">
        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 border border-brand-400/30 relative group cursor-default">
          <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <Command size={18} strokeWidth={2.5} className="relative z-10" />
        </div>
        <span className="font-black text-2xl tracking-tight text-text-main">
          EasyPocket<span className="text-brand-500"></span>
        </span>
      </div>
      
      <nav className="flex flex-col gap-2">
        <div className="px-3 mb-2 text-[10px] font-black text-text-muted uppercase tracking-widest opacity-80">
          Menú Principal
        </div>
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setVistaActual(id)}
            className={clsx(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all w-full text-left group relative overflow-hidden",
              vistaActual === id 
                ? "text-brand-400 bg-brand-500/10 shadow-inner border border-brand-500/20" 
                : "text-text-muted hover:text-text-main hover:bg-surface-solid border border-transparent"
            )}
          >
            <Icon 
              size={18} 
              strokeWidth={vistaActual === id ? 2.5 : 2} 
              className={clsx(
                "transition-all duration-300",
                vistaActual === id ? "text-brand-400 drop-shadow-[0_0_8px_rgba(var(--brand-500),0.5)]" : "text-text-muted group-hover:text-text-main group-hover:scale-110"
              )}
            />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-border-subtle/50 flex flex-col gap-3">
        
        <button 
          onClick={toggleTema}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-text-muted hover:text-text-main hover:bg-surface-solid border border-transparent transition-all w-full text-left group"
        >
          {tema === 'dark' ? (
            <Sun size={18} strokeWidth={2} className="group-hover:text-amber-400 group-hover:rotate-90 transition-all duration-500" />
          ) : (
            <Moon size={18} strokeWidth={2} className="group-hover:text-indigo-400 group-hover:-rotate-12 transition-all duration-500" />
          )}
          {tema === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
        </button>

        <div className="px-3 py-2 flex items-center gap-3 bg-surface-solid/50 rounded-xl border border-border-subtle/30 shadow-inner my-1">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-surface to-surface-solid border border-border-subtle flex items-center justify-center text-xs font-black text-text-main uppercase shrink-0 shadow-sm">
            {email ? email.substring(0, 2) : 'US'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-black text-text-main leading-none truncate">{email || 'Cargando...'}</span>
            <span className="text-[9px] text-text-muted mt-1 uppercase tracking-widest font-bold">Base de datos Activa</span>
          </div>
        </div>

        <button 
          onClick={cerrarSesion}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-text-muted hover:text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20 transition-all w-full text-left group"
        >
          <LogOut size={18} strokeWidth={2} className="group-hover:-translate-x-1 transition-transform" />
          Cerrar sesión
        </button>
      </div>

    </aside>
  )
}