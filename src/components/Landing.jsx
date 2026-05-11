import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { ArrowRight, Command, TrendingUp, Shield, Zap, Globe, Cpu, Users, PieChart } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useStore } from '../store/useStore'

const Navbar = ({ sesion, navigate }) => {
  const [isScrolled, setIsScrolled] = useState(false)
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-1000 px-6 ${isScrolled ? 'py-4' : 'py-8'}`}>
      <div className={`max-w-7xl mx-auto flex items-center justify-between px-10 py-3 rounded-full border border-white/5 transition-all duration-700 ${isScrolled ? 'bg-black/80 backdrop-blur-3xl shadow-2xl' : 'bg-transparent'}`}>
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-black shadow-2xl transition-transform duration-700 group-hover:scale-110">
            <Command size={22} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-bold tracking-tighter text-white uppercase">EasyPocket</span>
        </div>

        <div className="hidden md:flex items-center gap-12">
          {[
            { label: 'Inteligencia', id: 'intelligence' },
            { label: 'Seguridad', id: 'security' },
            { label: 'Engine', id: 'engine' }
          ].map((item) => (
            <a 
              key={item.id} 
              href={`#${item.id}`} 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-[10px] font-black text-white/30 hover:text-white uppercase tracking-[0.4em] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-8">
          <button 
            onClick={() => navigate('/login')}
            className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/50 hover:text-white transition-colors"
          >
            {sesion ? 'Panel' : 'Acceso'}
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-[0.4em] bg-white text-black hover:bg-brand-emerald hover:text-white transition-all active:scale-95 shadow-xl shadow-white/5"
          >
            Terminal
          </button>
        </div>
      </div>
    </nav>
  )
}

const ArchitecturalSection = ({ id, src, title, desc, reverse = false }) => (
  <div id={id} className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-32 py-60 scroll-mt-20 px-4`}>
    <div className="w-full lg:w-3/5 aspect-video rounded-[4rem] overflow-hidden border border-white/5 shadow-2xl relative group">
      <img src={src} className="w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:scale-105 transition-transform duration-[3000ms] ease-out" alt={title} />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
    </div>
    <div className="w-full lg:w-2/5 space-y-12">
       <h3 className="text-6xl md:text-8xl font-bold tracking-tighter text-white uppercase leading-[0.85]">{title}</h3>
       <p className="text-2xl md:text-3xl text-white/30 font-light leading-tight tracking-tighter uppercase italic">{desc}</p>
       <div className="w-24 h-0.5 bg-brand-emerald opacity-50 shadow-[0_0_20px_#008f58]" />
    </div>
  </div>
)

export default function Landing() {
  const navigate = useNavigate()
  const { cargarStatsPublicas } = useStore()
  const [sesion, setSesion] = useState(null)
  const [stats, setStats] = useState({ total_cuentas: 0, total_movimientos: 0 })
  const [cargando, setCargando] = useState(true)

  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const scaleImage = useTransform(scrollYProgress, [0, 1], [1, 0.9])
  const opacityText = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  useEffect(() => {
    Promise.all([supabase.auth.getSession(), cargarStatsPublicas()]).then(([{ data: { session } }, publicStats]) => {
      setSesion(session); setStats(publicStats); setCargando(false)
    })
  }, [cargarStatsPublicas])

  if (cargando) return <div className="h-screen bg-black" />

  return (
    <div className="bg-black text-white selection:bg-brand-emerald selection:text-white overflow-x-hidden font-sans antialiased">
      <Navbar sesion={sesion} navigate={navigate} />

      {/* --- HERO: THE WEALTH TERMINAL --- */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden pt-40 md:pt-48">
        
        {/* Webflow-style Background Details */}
        <div className="absolute inset-0 z-0">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_#1e293b_0%,_transparent_60%)] opacity-30" />
           <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
        </div>
        <motion.div style={{ y: yText, opacity: opacityText }} className="relative z-10 text-center max-w-5xl">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-10 uppercase">
            TU PATRIMONIO,<br />
            <span className="text-white/20">BAJO CONTROL.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-16 leading-relaxed font-medium">
            Easypocket es la terminal de alta fidelidad diseñada para gestionar capital, inversiones y gastos compartidos con precisión técnica y elegancia.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <button
              onClick={() => navigate('/login')}
              className="group bg-white text-black px-12 py-5 rounded-full font-bold uppercase tracking-[0.4em] text-[10px] hover:scale-105 transition-all shadow-[0_0_80px_rgba(255,255,255,0.1)] active:scale-95 flex items-center gap-4"
            >
              Acceder al Terminal
              <ArrowRight size={18} strokeWidth={3} />
            </button>
            <div className="flex -space-x-3">
               {[1,2,3,4].map(i => (
                 <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-white/5 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="w-full h-full object-cover opacity-80" />
                 </div>
               ))}
               <div className="w-8 h-8 rounded-full border-2 border-black bg-brand-emerald flex items-center justify-center text-[9px] font-black">+2k</div>
            </div>
          </div>
        </motion.div>

        {/* New Hero Image: Integrated Wealth/Tech Concept */}
        <motion.div 
          style={{ scale: scaleImage }}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-32 w-full max-w-6xl aspect-video relative rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl"
        >
          <img 
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2500" 
            className="w-full h-full object-cover opacity-80 mix-blend-luminosity" 
            alt="Wealth Terminal Interface"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          
          {/* Subtle Overlay Badge */}
          <div className="absolute top-10 left-10 p-6 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/5 shadow-2xl">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Market Protocol: Active</p>
             </div>
          </div>
        </motion.div>
      </section>

      {/* --- STATS: INSTITUTIONAL --- */}
      <section className="py-40 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-12 grid grid-cols-1 md:grid-cols-3 gap-32">
          <div>
            <h2 className="text-6xl font-bold tracking-tighter mb-4">{stats.total_movimientos.toLocaleString()}+</h2>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">Operaciones Sincronizadas</p>
          </div>
          <div>
            <h2 className="text-6xl font-bold tracking-tighter mb-4">99.9%</h2>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">Disponibilidad Total</p>
          </div>
          <div>
            <h2 className="text-6xl font-bold tracking-tighter mb-4">AES-256</h2>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">Protocolo de Privacidad</p>
          </div>
        </div>
      </section>

      {/* --- ARCHITECTURAL CONTENT --- */}
      <section className="max-w-7xl mx-auto px-12 pb-60">
        
        <ArchitecturalSection 
          id="intelligence"
          src="https://images.unsplash.com/photo-1611974714024-4607a55746ee?auto=format&fit=crop&q=80&w=2000"
          title="Inteligencia Atómica"
          desc="Heurística de Red de Alta Precisión para el análisis de flujos de capital."
        />

        <div id="security" className="grid grid-cols-1 md:grid-cols-2 gap-40 py-60 border-y border-white/5 scroll-mt-20">
           <div className="space-y-12">
              <h2 className="text-8xl md:text-[10rem] font-bold tracking-tighter leading-none">SAFE.</h2>
              <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.8em]">Seguridad por Diseño</p>
           </div>
           <div className="space-y-12 flex flex-col justify-center px-4">
              <h4 className="text-5xl font-bold tracking-tight uppercase text-brand-emerald">Integridad Bancaria</h4>
              <p className="text-2xl text-white/40 font-light leading-relaxed tracking-tighter uppercase">Cifrado a nivel de servidor y disparadores PostgreSQL para garantizar precisión absoluta.</p>
           </div>
        </div>

        <ArchitecturalSection 
          id="engine"
          src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=2500"
          title="Shared Engine"
          desc="Protocolos de Liquidación de Capital Colaborativo y Proyectos Distribuidos."
          reverse
        />

        <div className="py-80 text-center space-y-24">
           <h2 className="text-[14vw] font-bold tracking-[-0.08em] leading-none mb-32 uppercase">
              EL FUTURO<br />
              <span className="text-transparent bg-clip-text bg-linear-to-b from-brand-emerald to-brand-emerald/10 text-glow">ES TUYO.</span>
           </h2>
           <button 
             onClick={() => navigate('/login')}
             className="px-32 py-16 rounded-full bg-white text-black font-bold uppercase tracking-[0.8em] text-[15px] shadow-[0_0_180px_rgba(255,255,255,0.25)] hover:scale-105 transition-all active:scale-95"
           >
             Activar Acceso
           </button>
        </div>

      </section>

      {/* --- FOOTER: INSTITUTIONAL --- */}
      <footer className="py-40 px-12 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-40 opacity-20 transition-opacity hover:opacity-100 duration-1000">
          <div className="max-w-xs space-y-12 px-4">
            <div className="flex items-center gap-4">
              <Command size={24} className="text-white" strokeWidth={3} />
              <span className="text-2xl font-bold tracking-tighter uppercase">EasyPocket</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] leading-relaxed">
              Global Standard of Personal Finance. Built for Riches. Designed for Precision.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-40 px-4">
             <ul className="space-y-8 text-[12px] font-bold uppercase tracking-[0.4em]">
                <li>System Core</li>
                <li>Audit Log</li>
                <li>FIRE Engine</li>
             </ul>
             <ul className="space-y-8 text-[12px] font-bold uppercase tracking-[0.4em] text-white/50">
                <li>Privacy</li>
                <li>Security</li>
                <li>Legal</li>
             </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
