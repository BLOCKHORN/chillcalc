import { useEffect, useState } from 'react'
import { LayoutDashboard, Wallet, ArrowRightLeft, Target, Command, LogOut, Users } from 'lucide-react'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import clsx from 'clsx'

export default function Sidebar() {
  const { vistaActual, setVistaActual } = useStore()
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
    { id: 'objetivos', label: 'Objetivos', icon: Target },
    { id: 'compartir', label: 'Dividir Gastos', icon: Users },
  ]

  return (
    <aside className="w-64 bg-surface-solid border-r border-border-subtle p-6 flex flex-col h-screen sticky top-0 transition-colors duration-300">
      
      <div className="flex items-center gap-3 px-3 mb-12">
        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 border border-brand-400/30">
          <Command size={18} strokeWidth={2.5} />
        </div>
        <span className="font-black text-2xl tracking-tight text-text-main">
          ChillCalc<span className="text-brand-500">.</span>
        </span>
      </div>
      
      <nav className="flex flex-col gap-1.5">
        <div className="px-3 mb-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">
          Menú Principal
        </div>
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setVistaActual(id)}
            className={clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-left group",
              vistaActual === id 
                ? "bg-surface text-text-main border border-border-subtle shadow-sm" 
                : "text-text-muted hover:text-text-main hover:bg-surface border border-transparent"
            )}
          >
            <Icon 
              size={18} 
              strokeWidth={vistaActual === id ? 2.5 : 2} 
              className={vistaActual === id ? "text-brand-400" : "text-text-muted group-hover:text-text-main transition-colors"}
            />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-border-subtle flex flex-col gap-4">
        <div className="px-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface border border-border-subtle flex items-center justify-center text-xs font-bold text-text-muted uppercase shrink-0">
            {email ? email.substring(0, 2) : 'US'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-text-main leading-none truncate">{email || 'Cargando...'}</span>
            <span className="text-[10px] text-text-muted mt-1">Conectado a Supabase</span>
          </div>
        </div>

        <button 
          onClick={cerrarSesion}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors w-full text-left mx-1"
        >
          <LogOut size={18} strokeWidth={2} />
          Cerrar sesión
        </button>
      </div>

    </aside>
  )
}