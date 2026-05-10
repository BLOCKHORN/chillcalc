import { useState, useEffect, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { motion } from 'framer-motion'
import { Users, Receipt, ArrowRightLeft, Loader2, Info, Landmark, CheckCircle2, Wallet, HandCoins, ArrowRight } from 'lucide-react'
import PrivacyValue from './PrivacyValue'

const calcularBalances = (grupo) => {
  const { split_participantes: integrantes, split_gastos: gastos, split_liquidaciones: liquidaciones = [] } = grupo
  if (!integrantes || integrantes.length === 0) return []
  
  const balances = {}
  integrantes.forEach(p => balances[p.id] = 0)
  
  const totalGastado = gastos.reduce((acc, g) => acc + Number(g.monto), 0)
  const cuotaPorPersona = totalGastado / integrantes.length
  
  gastos.forEach(g => balances[g.pagado_por_id] += Number(g.monto))

  return integrantes.map(p => {
    let balanceBase = balances[p.id] - cuotaPorPersona
    const pagosHechos = liquidaciones.filter(l => l.deudor_id === p.id).reduce((acc, l) => acc + Number(l.monto), 0)
    const pagosRecibidos = liquidaciones.filter(l => l.acreedor_id === p.id).reduce((acc, l) => acc + Number(l.monto), 0)
    const balanceFinal = balanceBase + pagosHechos - pagosRecibidos

    return { 
      ...p, 
      balance: balanceFinal, 
      pagadoTotal: balances[p.id] 
    }
  })
}

export default function VistaPublicaSplit({ token }) {
  const { cargarGrupoPublico, formatCurrency } = useStore()
  
  const [grupo, setGrupo] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    // Forzar modo oscuro para consistencia de marca
    document.documentElement.classList.remove('light-mode') 
    const cargarDatos = async () => {
      const data = await cargarGrupoPublico(token)
      if (data) setGrupo(data)
      else setError(true)
      setCargando(false)
    }
    cargarDatos()
  }, [token, cargarGrupoPublico])

  const balances = useMemo(() => grupo ? calcularBalances(grupo) : [], [grupo])
  const totalGrupo = useMemo(() => grupo?.split_gastos?.reduce((acc, g) => acc + Number(g.monto), 0) || 0, [grupo])

  if (cargando) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-6">
        <div className="w-12 h-12 rounded-2xl bg-brand-emerald/10 border border-brand-emerald/20 flex items-center justify-center">
           <Loader2 size={24} className="animate-spin text-brand-emerald" />
        </div>
        <p className="font-bold uppercase tracking-[0.3em] text-[10px] opacity-40">Sincronizando Engine...</p>
      </div>
    )
  }

  if (error || !grupo) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-8 text-danger/50 border border-white/5">
          <Info size={40} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">Acceso Denegado</h1>
        <p className="text-text-muted text-[15px] font-medium max-w-xs leading-relaxed">Este enlace ha expirado o el grupo ya no se encuentra en el servidor central.</p>
        <button onClick={() => window.location.href = '/'} className="mt-10 px-8 py-3 rounded-xl bg-white text-black font-bold text-[14px]">Volver al Inicio</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-emerald selection:text-white pb-32 animate-apple">
      <div className="max-w-5xl mx-auto px-8 pt-20">
        
        <header className="mb-20 flex flex-col md:flex-row justify-between items-end gap-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-emerald flex items-center justify-center text-white shadow-lg">
                <Users size={18} strokeWidth={2.5} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-brand-emerald">EasyPocket Engine</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-white mb-2">{grupo.nombre}</h1>
            <div className="flex items-center gap-2 text-text-muted mt-4">
               <CheckCircle2 size={14} className="text-brand-emerald" />
               <p className="text-[13px] font-bold uppercase tracking-widest">{grupo.split_participantes.length} Participantes Sincronizados</p>
            </div>
          </div>
          <div className="text-right">
             <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em] mb-2">Gasto Total Acumulado</p>
             <p className="text-5xl font-bold tracking-tighter">{formatCurrency(totalGrupo)}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <section className="lg:col-span-5 space-y-8">
            <h2 className="text-[11px] font-black uppercase text-text-muted tracking-[0.3em] px-2 flex items-center gap-2">
              <ArrowRightLeft size={14} className="text-brand-emerald" /> Estado de Balances
            </h2>
            <div className="space-y-4">
              {balances.map(p => {
                const isPositive = p.balance > 0.01
                const isSettled = Math.abs(p.balance) < 0.01
                return (
                  <div key={p.id} className="card !p-8 flex items-center justify-between group hover:border-border-focus transition-all">
                     <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-full border border-border-subtle flex items-center justify-center text-[15px] font-black ${isSettled ? 'text-text-muted' : (isPositive ? 'text-brand-emerald bg-brand-emerald/5' : 'text-danger bg-danger/5')}`}>
                           {p.nombre[0].toUpperCase()}
                        </div>
                        <div>
                           <p className="text-[17px] font-bold text-white truncate">{p.nombre}</p>
                           <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mt-1">Total Aportado: {formatCurrency(p.pagadoTotal)}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className={`text-2xl font-bold tracking-tighter ${isSettled ? 'text-text-muted' : (isPositive ? 'text-brand-emerald' : 'text-danger')}`}>
                          {isPositive ? '+' : ''}{formatCurrency(isSettled ? 0 : p.balance)}
                        </p>
                     </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="lg:col-span-7 space-y-8">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[11px] font-black uppercase text-text-muted tracking-[0.3em] flex items-center gap-2">
                <Receipt size={14} className="text-brand-emerald" /> Historial de Operaciones
              </h3>
              <span className="text-[10px] font-bold text-text-muted bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest">{grupo.split_gastos.length} Registros</span>
            </div>
            
            <div className="card !p-0 overflow-hidden divide-y divide-border-subtle/50">
              {grupo.split_gastos.length > 0 ? (
                [...grupo.split_gastos].reverse().map(g => (
                  <div key={g.id} className="p-8 flex items-center justify-between group hover:bg-white/[0.01] transition-all">
                    <div className="flex items-center gap-6 overflow-hidden">
                      <div className="p-3 bg-white/5 rounded-xl border border-border-subtle text-text-muted shrink-0 group-hover:text-brand-emerald transition-colors">
                        <Receipt size={20} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[17px] font-bold text-white truncate tracking-tight">{g.descripcion}</p>
                        <p className="text-[12px] text-text-muted font-bold uppercase tracking-widest mt-1 opacity-60">
                          {g.fecha} • {grupo.split_participantes.find(p => p.id === g.pagado_por_id)?.nombre} pagó <span className="text-white">{formatCurrency(g.monto)}</span>
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-text-muted opacity-0 group-hover:opacity-100 transition-all mr-2" />
                  </div>
                ))
              ) : (
                <div className="py-32 text-center">
                  <Info size={32} className="mx-auto mb-4 opacity-20" />
                  <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">No hay actividad en el engine</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <footer className="mt-40 pt-12 border-t border-white/5 flex justify-between items-center opacity-40">
           <div className="flex items-center gap-2">
              <Landmark size={14} />
              <span className="text-[11px] font-black uppercase tracking-[0.3em]">Verified by EasyPocket Terminal</span>
           </div>
           <p className="text-[10px] font-bold">© 2026</p>
        </footer>
      </div>
    </div>
  )
}
