import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { 
  ArrowRight, Zap, Shield, Cpu, BarChart3, Lock, Smartphone, TrendingUp, 
  CheckCircle2, CreditCard, PieChart, Users, ArrowUpRight, Check, Play,
  Wallet, Landmark, Receipt, Sparkles
} from 'lucide-react'
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
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 ${isScrolled ? 'py-4' : 'py-6'}`}>
      <div className={`max-w-6xl mx-auto flex items-center justify-between px-8 py-3 rounded-2xl border transition-all duration-500 ${isScrolled ? 'bg-white/80 backdrop-blur-xl border-slate-200 shadow-xl shadow-slate-200/50' : 'bg-transparent border-transparent'}`}>
        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
            <Zap size={20} fill="currentColor" />
          </div>
          <span className={`text-xl font-black tracking-tighter uppercase ${isScrolled ? 'text-slate-950' : 'text-white'}`}>EasyPocket</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {['Ecosistema', 'Seguridad', 'Institucional'].map((item) => (
            <a key={item} href="#" className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${isScrolled ? 'text-slate-500 hover:text-slate-950' : 'text-white/60 hover:text-white'}`}>
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-5">
          <button 
            onClick={() => navigate('/login')}
            className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all ${isScrolled ? 'text-slate-950' : 'text-white/80 hover:text-white'}`}
          >
            {sesion ? 'Panel' : 'Acceso'}
          </button>
          <button 
            onClick={() => navigate('/login')}
            className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${isScrolled ? 'bg-slate-950 text-white shadow-lg hover:bg-slate-800' : 'bg-white text-slate-950 shadow-2xl hover:bg-slate-100'}`}
          >
            Abrir Cuenta
          </button>
        </div>
      </div>
    </nav>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const { cargarStatsPublicas } = useStore()
  const [sesion, setSesion] = useState(null)
  const [stats, setStats] = useState({ total_cuentas: 0, total_movimientos: 0 })
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    Promise.all([supabase.auth.getSession(), cargarStatsPublicas()]).then(([{ data: { session } }, publicStats]) => {
      setSesion(session); setStats(publicStats); setCargando(false)
    })
  }, [])

  if (cargando) return <div className="h-screen bg-slate-50" />

  return (
    <div className="bg-white text-slate-950 selection:bg-slate-950 selection:text-white font-sans antialiased overflow-x-hidden">
      <Navbar sesion={sesion} navigate={navigate} />

      {/* --- HERO: THE NEW STANDARD --- */}
      <section className="relative min-h-[90vh] flex flex-col items-center pt-48 pb-20 px-6 bg-slate-950 overflow-hidden">
        {/* Abstract Background Detail */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_#334155_0%,_transparent_50%)]" />
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-10"
          >
             <Sparkles size={14} className="text-amber-400" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Infraestructura Financiera Profesional</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 1 }}
            className="text-6xl md:text-9xl font-black tracking-[-0.05em] leading-[0.85] text-white mb-12 uppercase"
          >
            Tu dinero,<br />
            <span className="text-slate-500">sin ruido.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="text-xl md:text-2xl text-white/40 max-w-2xl mx-auto mb-16 font-light leading-relaxed tracking-tight"
          >
            EasyPocket es la terminal definitiva para gestionar patrimonio neto, inversiones en tiempo real y finanzas compartidas. Precisión bancaria con diseño de nueva generación.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <button
              onClick={() => navigate('/login')}
              className="group bg-white text-slate-950 px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 transition-all shadow-[0_20px_60px_rgba(255,255,255,0.1)] active:scale-95 flex items-center gap-3"
            >
              Comenzar Ahora <ArrowRight size={16} strokeWidth={4} />
            </button>
            <button className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">
              Explorar Protocolos
            </button>
          </motion.div>
        </div>

        {/* Hero App Mockup - Minimal & Elegant */}
        <motion.div 
           initial={{ opacity: 0, y: 100 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
           className="mt-32 w-full max-w-6xl aspect-[16/8] bg-slate-900 rounded-t-[3rem] border-x border-t border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] p-10 relative overflow-hidden"
        >
           <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent pointer-events-none" />
           <div className="flex gap-4 items-center mb-12">
              <div className="w-3 h-3 rounded-full bg-red-500/20" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
              <div className="w-3 h-3 rounded-full bg-green-500/20" />
              <div className="ml-4 w-40 h-2 bg-white/5 rounded-full" />
           </div>
           <div className="grid grid-cols-12 gap-8 h-full">
              <div className="col-span-3 space-y-4">
                 <div className="h-40 rounded-3xl bg-white/5 border border-white/5" />
                 <div className="h-40 rounded-3xl bg-white/5 border border-white/5" />
              </div>
              <div className="col-span-9 rounded-3xl bg-white/5 border border-white/5 p-10">
                 <div className="flex justify-between items-start mb-12">
                    <div className="space-y-3">
                       <div className="w-20 h-2 bg-white/10 rounded-full" />
                       <div className="w-48 h-10 bg-white/20 rounded-xl" />
                    </div>
                    <div className="w-32 h-32 rounded-full border-[12px] border-white/5 border-t-white/20" />
                 </div>
                 <div className="space-y-4">
                    {[1,2,3].map(i => <div key={i} className="h-12 rounded-2xl bg-white/5" />)}
                 </div>
              </div>
           </div>
        </motion.div>
      </section>

      {/* --- VALUE PROP: THE CLEAN SLATE --- */}
      <section className="py-40 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
           <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-6 block">Diseño Funcional</span>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.95] mb-8">
                TU BANCO,<br />
                EN TU BOLSILLO.
              </h2>
              <p className="text-xl text-slate-500 leading-relaxed font-medium mb-12">
                Hemos eliminado la complejidad de la banca tradicional. Una interfaz centrada en los datos que te permite tomar decisiones informadas en segundos.
              </p>
              <div className="space-y-6">
                 {[
                   { icon: Landmark, t: "Gestión Multicuenta", d: "Sincroniza todas tus entidades en un solo lugar." },
                   { icon: TrendingUp, t: "Inversiones en Vivo", d: "Precios de mercado automáticos y rentabilidad neta." },
                   { icon: Users, t: "Shared Pocket", d: "Divide gastos sin dramas, con transparencia total." }
                 ].map((item, i) => (
                   <div key={i} className="flex gap-6 items-start">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-950 shadow-sm border border-slate-200">
                         <item.icon size={22} />
                      </div>
                      <div>
                         <h4 className="text-lg font-black tracking-tight">{item.t}</h4>
                         <p className="text-sm text-slate-500 font-medium">{item.d}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="grid grid-cols-2 gap-6">
              <div className="pt-20 space-y-6">
                 <div className="aspect-square bg-slate-50 rounded-[2.5rem] border border-slate-200 p-8 flex flex-col justify-between shadow-xl shadow-slate-200/20">
                    <Receipt className="text-slate-950" size={32} />
                    <h4 className="text-xl font-black tracking-tighter">Historial<br />Auditado</h4>
                 </div>
                 <div className="aspect-[4/5] bg-slate-950 rounded-[2.5rem] p-8 flex flex-col justify-between text-white shadow-2xl">
                    <Shield className="text-white" size={32} />
                    <h4 className="text-xl font-black tracking-tighter">Integridad<br />Total</h4>
                 </div>
              </div>
              <div className="space-y-6">
                 <div className="aspect-[4/5] bg-slate-100 rounded-[2.5rem] border border-slate-200 p-8 flex flex-col justify-between shadow-xl shadow-slate-200/20">
                    <BarChart3 className="text-slate-950" size={32} />
                    <h4 className="text-xl font-black tracking-tighter">Análisis<br />Predictivo</h4>
                 </div>
                 <div className="aspect-square bg-white rounded-[2.5rem] border border-slate-200 p-8 flex flex-col justify-between shadow-xl shadow-slate-200/20">
                    <Smartphone className="text-slate-950" size={32} />
                    <h4 className="text-xl font-black tracking-tighter">Acceso<br />PWA</h4>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* --- STATS: DATA INTEGRITY --- */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
         <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-20">
            <div className="text-center md:text-left">
               <h3 className="text-5xl font-black tracking-tighter mb-2">{stats.total_movimientos.toLocaleString()}+</h3>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Transacciones Seguras</p>
            </div>
            <div className="text-center md:text-left">
               <h3 className="text-5xl font-black tracking-tighter mb-2">POSTGRES</h3>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Motor de Base de Datos</p>
            </div>
            <div className="text-center md:text-left">
               <h3 className="text-5xl font-black tracking-tighter mb-2">99.9%</h3>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Uptime Garantizado</p>
            </div>
         </div>
      </section>

      {/* --- FINAL CTA: THE TERMINAL CALL --- */}
      <section className="py-60 px-6 text-center">
         <div className="max-w-4xl mx-auto">
            <h2 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] mb-16 uppercase">
               Toma el<br />control <span className="text-slate-300">hoy.</span>
            </h2>
            <button 
              onClick={() => navigate('/login')}
              className="px-16 py-8 rounded-2xl bg-slate-950 text-white font-black uppercase tracking-[0.3em] text-xs shadow-2xl hover:bg-slate-800 transition-all active:scale-95"
            >
              Activar Terminal Personal
            </button>
         </div>
      </section>

      {/* --- FOOTER: INSTITUTIONAL --- */}
      <footer className="py-20 px-8 border-t border-slate-100 font-medium">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-slate-400">
            <div className="flex items-center gap-3">
               <div className="w-7 h-7 rounded-lg bg-slate-950 flex items-center justify-center text-white">
                  <Zap size={16} fill="currentColor" />
               </div>
               <span className="text-lg font-black tracking-tighter text-slate-950 uppercase">EasyPocket</span>
            </div>
            <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest">
               <a href="#" className="hover:text-slate-950 transition-colors">Privacidad</a>
               <a href="#" className="hover:text-slate-950 transition-colors">Términos</a>
               <a href="#" className="hover:text-slate-950 transition-colors">Seguridad</a>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">© 2026 EasyPocket Terminal. Built for Precision.</p>
         </div>
      </footer>
    </div>
  )
}
