import { useState, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { Building2, CreditCard, Banknote, LineChart, Wallet, Settings2, Trash2, Globe, Plus, Star } from 'lucide-react'
import ModalCuenta from './ModalCuenta'
import ModalEditarCuenta from './ModalEditarCuenta'
import ModalEliminarCuenta from './ModalEliminarCuenta'

const formatoEuros = (num) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(num || 0)

export default function Cuentas() {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [cuentaEditando, setCuentaEditando] = useState(null)
  const [cuentaEliminando, setCuentaEliminando] = useState(null)
  
  const cuentas = useStore(state => state.cuentas)
  const marcarFavorita = useStore(state => state.marcarFavorita)

  const getIcon = useCallback((icono) => {
    const props = { size: 20, className: "text-text-main group-hover:text-brand-400 transition-colors" }
    switch(icono) {
      case 'bank': return <Building2 {...props} />
      case 'card': return <CreditCard {...props} />
      case 'cash': return <Banknote {...props} />
      case 'chart': return <LineChart size={20} className="text-brand-400 drop-shadow-[0_0_8px_rgba(var(--brand-500),0.5)]" />
      default: return <Wallet {...props} />
    }
  }, [])

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 md:pb-0 px-1 md:px-0 relative w-full">
      
      {/* Soft Glow Backlight */}
      <div className="absolute top-10 left-20 w-72 h-72 bg-brand-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-40 right-10 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-2 relative z-10">
        <div className="w-full text-center md:text-left">
          <p className="text-[10px] md:text-xs font-black text-text-muted uppercase tracking-widest mb-2 flex items-center justify-center md:justify-start gap-2">
            <Wallet size={14} className="text-brand-400" />
            Tu Bóveda
          </p>
          <h2 className="text-5xl md:text-6xl font-black text-text-main mb-1 tracking-tighter leading-none">
            Cuentas
          </h2>
        </div>

        <div className="flex w-full md:w-auto md:ml-auto">
          <button 
            onClick={() => setModalAbierto(true)} 
            className="flex-1 md:flex-none flex items-center justify-center gap-2.5 px-6 py-3.5 md:py-3 rounded-xl font-bold bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 active:scale-95 transition-all text-sm w-full md:w-auto border border-brand-500/20 shadow-lg shadow-brand-500/5 group uppercase tracking-widest"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform"/> 
            <span>Nueva Cuenta</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
        {cuentas.map(c => {
          const esInversion = c.tipo === 'inversion'
          const esRemunerada = c.tipo === 'remunerada'
          
          const valSaldo = Number(c.saldo || 0)
          const valInvertido = Number(c.capitalInvertido || 0)
          const valTae = Number(c.tae || 0)
          
          const beneficio = esInversion ? (valSaldo - valInvertido) : 0
          const pct = esInversion && valInvertido > 0 ? (beneficio / valInvertido) * 100 : 0
          
          const gananciaAnual = esRemunerada ? (valSaldo * (valTae / 100)) : 0
          const gananciaMensual = gananciaAnual / 12

          return (
            <div key={c.id} className={`bg-surface-solid/40 backdrop-blur-xl border rounded-3xl p-6 flex flex-col justify-between min-h-[200px] group relative transition-all duration-300 hover:-translate-y-1 shadow-xl shadow-black/5 overflow-hidden ${c.favorita ? 'border-yellow-500/50 hover:border-yellow-400/80' : 'border-border-subtle/50 hover:border-border-subtle/80'}`}>
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-surface-solid/60 rounded-2xl border border-border-subtle/50 shadow-sm group-hover:bg-surface transition-colors">
                    {getIcon(c.icono)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-lg text-text-main leading-none truncate max-w-[120px]">{c.nombre}</h3>
                      <button 
                        onClick={() => marcarFavorita(c.id)}
                        className={`p-1 rounded transition-all active:scale-90 ${c.favorita ? 'text-yellow-400' : 'text-text-muted/30 hover:text-yellow-400/70'}`}
                        title={c.favorita ? "Cuenta Favorita" : "Marcar como Favorita"}
                      >
                        <Star size={16} fill={c.favorita ? "currentColor" : "none"} strokeWidth={c.favorita ? 1 : 2.5} />
                      </button>
                    </div>
                    <span className="text-[9px] uppercase font-black tracking-widest text-text-muted mt-1.5 block">
                      {esRemunerada ? 'Cuenta Ahorro' : c.tipo}
                    </span>
                  </div>
                </div>
                
                {/* Botones de acción elegantes */}
                <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setCuentaEditando(c.id)} 
                    className="p-2 text-text-muted hover:text-brand-400 bg-surface-solid md:bg-surface-solid/50 rounded-xl border border-border-subtle/50 hover:border-brand-500/30 transition-all active:scale-90"
                  >
                    <Settings2 size={16} strokeWidth={2.5} />
                  </button>
                  <button 
                    onClick={() => setCuentaEliminando(c.id)} 
                    className="p-2 text-text-muted hover:text-danger bg-surface-solid md:bg-surface-solid/50 rounded-xl border border-border-subtle/50 hover:border-danger/30 transition-all active:scale-90"
                  >
                    <Trash2 size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-end">
                <p className="text-3xl md:text-4xl font-black text-text-main tracking-tighter leading-none mb-2">
                  {formatoEuros(valSaldo)}
                </p>
                
                {esInversion && (
                  <div className="mt-5 space-y-3 pt-4 border-t border-border-subtle/30">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-lg border border-brand-500/20 uppercase tracking-widest">
                        {c.ticker || 'Sin Ticker'}
                      </span>
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] text-text-muted uppercase font-black tracking-widest mb-0.5">Rendimiento</span>
                        <span className={`text-[11px] font-black tracking-wider ${beneficio > 0.01 ? 'text-brand-400' : beneficio < -0.01 ? 'text-danger' : 'text-text-muted'}`}>
                          {beneficio > 0.01 ? '+' : ''}{formatoEuros(beneficio)} ({pct.toFixed(2)}%)
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] uppercase font-black p-3 bg-surface-solid/50 rounded-xl border border-border-subtle/50">
                      <span className="text-text-muted flex items-center gap-1.5">
                        <Globe size={12} className="text-brand-400 opacity-70" /> Mercado
                      </span>
                      <span className="text-text-main text-xs">
                        {c.precioActual > 0 ? formatoEuros(c.precioActual) : '---'}
                      </span>
                    </div>
                  </div>
                )}

                {esRemunerada && (
                  <div className="mt-5 pt-4 border-t border-border-subtle/30 flex flex-col gap-3">
                    <div className="inline-flex">
                      <span className="text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                        +{valTae.toFixed(2)}% TAE
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-4 bg-surface-solid/50 rounded-xl border border-border-subtle/50 p-3">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-text-muted uppercase font-black tracking-widest mb-0.5">Mensual</span>
                        <span className="text-text-main text-xs font-black">+{formatoEuros(gananciaMensual)}</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[8px] text-text-muted uppercase font-black tracking-widest mb-0.5">Anual</span>
                        <span className="text-text-main text-xs font-black">+{formatoEuros(gananciaAnual)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <ModalCuenta isOpen={modalAbierto} onClose={() => setModalAbierto(false)} />
      {cuentaEditando && (
        <ModalEditarCuenta isOpen={true} cuentaId={cuentaEditando} onClose={() => setCuentaEditando(null)} />
      )}
      {cuentaEliminando && (
        <ModalEliminarCuenta isOpen={true} cuentaId={cuentaEliminando} onClose={() => setCuentaEliminando(null)} />
      )}
    </div>
  )
}