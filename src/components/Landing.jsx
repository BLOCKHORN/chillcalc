import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Landing({ onAcceder }) {
  const [sesion, setSesion] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session)
      setCargando(false)
    })
  }, [])

  if (cargando) return <div className="h-screen bg-bg-app" />

  return (
    <div className="h-screen bg-bg-app overflow-hidden flex flex-col items-center justify-center relative px-6 text-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-brand-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
      
      <div className="relative z-10 flex flex-col items-center max-w-2xl">
        <div className="w-20 h-20 rounded-2xl border border-border-subtle/50 overflow-hidden shadow-2xl shadow-brand-500/20 mb-8 shrink-0">
          <img src="/apple-touch-icon.png" alt="EasyPocket Logo" className="w-full h-full object-cover" />
        </div>
        
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter text-text-main mb-6">
          EasyPocket<span className="text-brand-500">.</span>
        </h1>
        
        <p className="text-lg sm:text-xl font-medium text-text-muted mb-12 max-w-md mx-auto leading-relaxed">
          Control absoluto de tu patrimonio, cuentas y gastos compartidos en un solo lugar.
        </p>
        
        <button
          onClick={() => onAcceder(sesion ? 'dashboard' : 'login')}
          className="group relative flex items-center justify-center gap-3 bg-text-main text-bg-app px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-brand-500/20"
        >
          {sesion ? 'Ir al panel' : 'Iniciar Sesión / Registrarte'}
          <ArrowRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="absolute bottom-8 left-0 w-full text-center z-10">
        <Link 
          to="/privacidad" 
          className="text-xs font-bold text-text-muted hover:text-text-main uppercase tracking-widest transition-colors"
        >
          Política de Privacidad
        </Link>
      </div>
    </div>
  )
}