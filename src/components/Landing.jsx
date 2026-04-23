import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Wallet, Activity } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useStore } from '../store/useStore'

export default function Landing() {
  const navigate = useNavigate()
  const { cargarStatsPublicas } = useStore()
  const [sesion, setSesion] = useState(null)
  const [stats, setStats] = useState({ total_cuentas: 0, total_movimientos: 0 })
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.auth.getSession(),
      cargarStatsPublicas()
    ]).then(([{ data: { session } }, publicStats]) => {
      setSesion(session)
      setStats(publicStats)
      setCargando(false)
    })
  }, [])

  if (cargando) return <div className="h-screen bg-bg-app" />

  return (
    <div className="h-screen bg-bg-app overflow-hidden flex flex-col items-center justify-center relative px-6 text-center">
      {/* Fondo decorativo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-brand-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
      
      <div className="relative z-10 flex flex-col items-center max-w-2xl">
        <div className="w-20 h-20 rounded-2xl border border-border-subtle/50 overflow-hidden shadow-2xl shadow-brand-500/20 mb-8 shrink-0">
          <img src="/apple-touch-icon.png" alt="EasyPocket Logo" className="w-full h-full object-cover" />
        </div>
        
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter text-text-main mb-6">
          EasyPocket<span className="text-brand-500">.</span>
        </h1>
        
        <p className="text-lg sm:text-xl font-medium text-text-muted mb-10 max-w-md mx-auto leading-relaxed">
          Control absoluto de tu patrimonio y gastos compartidos en un solo lugar.
        </p>
        
        {/* BOTÓN MEJORADO */}
        <button
          onClick={() => navigate(sesion ? '/dashboard' : '/login')}
          className="group relative flex items-center justify-center gap-3 bg-brand-500 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-brand-400 hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(var(--brand-500-rgb),0.3)] border border-white/10 overflow-hidden"
        >
          {/* Efecto de brillo sutil al pasar el ratón */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          <span className="relative z-10">
            {sesion ? 'Ir al panel de control' : 'Empezar ahora gratis'}
          </span>
          <ArrowRight size={20} strokeWidth={3} className="relative z-10 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Stats Section */}
        <div className="flex gap-8 mt-12 pt-8 border-t border-border-subtle/30">
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-text-main font-black text-xl">
              <Wallet size={18} className="text-brand-400" />
              {stats.total_cuentas.toLocaleString()}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60">Cuentas creadas</span>
          </div>
          
          <div className="w-px h-10 bg-border-subtle/30" />

          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-text-main font-black text-xl">
              <Activity size={18} className="text-brand-400" />
              {stats.total_movimientos.toLocaleString()}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60">Transacciones registradas</span>
          </div>
        </div>
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