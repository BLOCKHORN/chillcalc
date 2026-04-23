import { useState, useEffect, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { Users, Receipt, ArrowRightLeft, Loader2, Info } from 'lucide-react'

const formatoEuros = (num) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(num || 0)

const calcularBalances = (grupo) => {
  const { split_participantes: integrantes, split_gastos: gastos } = grupo
  if (!integrantes || integrantes.length === 0) return []
  const balances = {}
  integrantes.forEach(p => balances[p.id] = 0)
  const totalGastado = gastos.reduce((acc, g) => acc + Number(g.monto), 0)
  const cuotaPorPersona = totalGastado / integrantes.length
  gastos.forEach(g => balances[g.pagado_por_id] += Number(g.monto))
  return integrantes.map(p => ({ ...p, balance: balances[p.id] - cuotaPorPersona, pagadoTotal: balances[p.id] }))
}

export default function VistaPublicaSplit({ token }) {
  const { cargarGrupoPublico } = useStore()
  
  const [grupo, setGrupo] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    document.documentElement.classList.remove('light-mode') 
    
    const cargarDatos = async () => {
      const data = await cargarGrupoPublico(token)
      if (data) {
        setGrupo(data)
      } else {
        setError(true)
      }
      setCargando(false)
    }

    cargarDatos()
  }, [token, cargarGrupoPublico])

  const balances = useMemo(() => grupo ? calcularBalances(grupo) : [], [grupo])

  if (cargando) {
    return (
      <div className="min-h-screen bg-bg-app flex flex-col items-center justify-center text-brand-400 gap-4">
        <Loader2 size={32} className="animate-spin" />
        <p className="font-black uppercase tracking-widest text-[10px] text-text-muted">Cargando cuentas...</p>
      </div>
    )
  }

  if (error || !grupo) {
    return (
      <div className="min-h-screen bg-bg-app flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-surface-solid rounded-full flex items-center justify-center mb-6 text-danger/50">
          <Info size={40} />
        </div>
        <h1 className="text-2xl font-black text-text-main mb-2">Enlace caducado o invalido</h1>
        <p className="text-text-muted text-sm font-bold max-w-xs">Parece que este grupo ya no existe o el enlace es incorrecto. Pide que te vuelvan a invitar.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-app text-text-main pb-20">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        
        <header className="mb-8 pt-4">
          <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start opacity-70">
            <Users size={14} className="text-brand-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-400">EasyPocket Shared</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-center sm:text-left leading-tight">
            {grupo.nombre}
          </h1>
          <p className="text-center sm:text-left text-xs font-bold text-text-muted uppercase tracking-widest mt-2">
            {grupo.split_participantes.length} Participantes
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section>
            <h2 className="text-[10px] font-black uppercase text-text-muted mb-4 tracking-widest px-1 flex items-center gap-2">
              <ArrowRightLeft size={12} className="text-brand-400" /> Resumen de Deudas
            </h2>
            <div className="space-y-3">
              {balances.map(p => (
                <div key={p.id} className="bg-surface-solid/60 backdrop-blur-md flex items-center justify-between p-5 rounded-2xl border border-border-subtle/50 border-l-4 shadow-md" style={{ borderLeftColor: p.balance >= 0 ? 'var(--brand-500)' : 'var(--danger)' }}>
                   <div className="overflow-hidden mr-2">
                      <p className="text-lg font-black text-text-main truncate leading-tight">{p.nombre}</p>
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Pagado: <span className="text-text-main">{formatoEuros(p.pagadoTotal)}</span></p>
                   </div>
                   <div className="text-right shrink-0">
                      <p className={`text-2xl font-black leading-none mb-1 tracking-tighter ${p.balance >= 0 ? 'text-brand-400' : 'text-danger'}`}>
                        {p.balance >= 0 ? '+' : ''}{formatoEuros(p.balance)}
                      </p>
                      <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">
                        {p.balance >= 0 ? 'Le deben' : 'Debe dinero'}
                      </p>
                   </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-[10px] font-black uppercase text-text-muted tracking-widest flex items-center gap-2">
                <Receipt size={12} className="text-brand-400" /> Historial de Pagos
              </h3>
              <span className="text-[9px] font-black text-brand-400 bg-brand-500/10 px-2 py-1 rounded-md uppercase tracking-widest">{grupo.split_gastos.length} Movimientos</span>
            </div>
            <div className="space-y-3">
              {grupo.split_gastos.map(g => (
                <div key={g.id} className="flex items-center justify-between p-4 bg-surface-solid/40 rounded-2xl border border-border-subtle/50">
                  <div className="overflow-hidden flex items-center gap-4">
                    <div className="p-2.5 bg-surface rounded-xl border border-border-subtle text-text-muted">
                      <Receipt size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-text-main truncate leading-tight mb-0.5">{g.descripcion}</p>
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">
                        <span>{g.fecha || 'N/A'}</span> • <span className="text-text-main">{grupo.split_participantes.find(p => p.id === g.pagado_por_id)?.nombre}</span> pago <span className="text-brand-400 font-black">{formatoEuros(g.monto)}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {grupo.split_gastos.length === 0 && (
                <div className="text-center py-10 opacity-50 bg-surface-solid/30 rounded-2xl border border-dashed border-border-subtle">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Aun no hay gastos registrados.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}