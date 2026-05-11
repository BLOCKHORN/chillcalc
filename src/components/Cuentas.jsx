import { useState, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { Wallet, Settings2, Trash2, Globe, Plus, Star, ChevronRight, ArrowRight } from 'lucide-react'
import ModalCuenta from './ModalCuenta'
import ModalEditarCuenta from './ModalEditarCuenta'
import ModalEliminarCuenta from './ModalEliminarCuenta'
import PrivacyValue from './PrivacyValue'

export default function Cuentas() {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [cuentaEditando, setCuentaEditando] = useState(null)
  const [cuentaEliminando, setCuentaEliminando] = useState(null)
  
  const { cuentas, marcarFavorita, formatCurrency, getBankLogo } = useStore()
  const [logoErrors, setLogoErrors] = useState({})

  return (
    <>
      <div className="pb-32 pt-4 md:pt-16 px-0 md:px-8 max-w-7xl mx-auto animate-apple">
        
        <header className="mb-12 md:mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-12 px-2 md:px-0">
          <div>
            <h2 className="text-[11px] md:text-[13px] font-bold text-text-muted uppercase tracking-[0.2em] mb-3 md:mb-4">Activos y Pasivos Consolidados</h2>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-text-main">Entities</h1>
          </div>

          <button 
            onClick={() => setModalAbierto(true)} 
            className="w-full md:w-auto px-8 py-4 rounded-xl bg-text-main text-bg-app font-bold text-[14px] md:text-[15px] hover:opacity-90 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"
          >
            <Plus size={18} strokeWidth={2.5} /> New Entity
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {cuentas.map(c => {
            const esInversion = c.tipo === 'inversion'
            const esRemunerada = c.tipo === 'remunerada'
            const valSaldo = Number(c.saldo || 0)
            const valInvertido = Number(c.capitalInvertido || 0)
            const beneficio = esInversion ? (valSaldo - valInvertido) : 0
            const pct = esInversion && valInvertido > 0 ? (beneficio / valInvertido) * 100 : 0
            const logoUrl = getBankLogo(c.nombre)
            const hasError = logoErrors[c.id]

            return (
              <div key={c.id} className="card !p-0 overflow-hidden flex flex-col group hover:border-border-focus">
                <div className="p-10 flex-1">
                   <div className="flex justify-between items-start mb-12">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-border-subtle flex items-center justify-center overflow-hidden">
                         {logoUrl && !hasError ? (
                           <img 
                             src={logoUrl} 
                             alt={c.nombre} 
                             className="w-full h-full object-contain p-2" 
                             onError={() => setLogoErrors(prev => ({ ...prev, [c.id]: true }))}
                           />
                         ) : (
                           <Wallet size={24} className="text-text-muted" strokeWidth={1.5} />
                         )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                         <button onClick={() => setCuentaEditando(c.id)} className="p-2 text-text-muted hover:text-text-main transition-colors">
                            <Settings2 size={18} />
                         </button>
                         <button onClick={() => setCuentaEliminando(c.id)} className="p-2 text-text-muted hover:text-danger transition-colors">
                            <Trash2 size={18} />
                         </button>
                      </div>
                   </div>

                   <div className="mb-8">
                      <h3 className="text-xl font-bold text-text-main tracking-tight">{c.nombre}</h3>
                      <p className="text-[12px] font-bold text-text-muted uppercase tracking-[0.2em] mt-2">{c.tipo}</p>
                   </div>

                   <div className="flex justify-between items-end">
                      <div>
                         <p className="text-4xl font-bold text-text-main tracking-tighter">
                            <PrivacyValue value={formatCurrency(valSaldo)} />
                         </p>
                         {c.favorita && (
                           <div className="flex items-center gap-2 mt-4 text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60">
                              <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#fff]" />
                              Primary Account
                           </div>
                         )}
                      </div>
                      <button 
                        onClick={() => marcarFavorita(c.id)}
                        className={`p-3 rounded-xl transition-all ${c.favorita ? 'text-white bg-white/10' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
                      >
                        <Star size={20} fill={c.favorita ? "currentColor" : "none"} strokeWidth={1.5} />
                      </button>
                   </div>
                </div>

                {(esInversion || esRemunerada) && (
                  <div className="px-10 py-8 bg-white/[0.02] border-t border-border-subtle flex justify-between items-center">
                     {esInversion ? (
                        <>
                          <span className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em]">{c.ticker || 'Asset'}</span>
                          <span className={`text-[15px] font-bold ${beneficio >= 0 ? 'text-text-main' : 'text-danger'}`}>
                             {beneficio >= 0 ? '+' : ''}{pct.toFixed(2)}%
                          </span>
                        </>
                     ) : (
                        <>
                          <span className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em]">Yield Performance</span>
                          <span className="text-[15px] font-bold text-text-main">+{c.tae}% APY</span>
                        </>
                     )}
                  </div>
                )}
              </div>
            )
          })}

          <button 
            onClick={() => setModalAbierto(true)}
            className="h-full min-h-[320px] border-2 border-dashed border-border-subtle rounded-2xl flex flex-col items-center justify-center gap-6 text-text-muted hover:text-text-main hover:border-white/20 hover:bg-white/[0.01] transition-all group"
          >
            <div className="w-16 h-16 rounded-full border border-border-subtle flex items-center justify-center group-hover:scale-110 transition-transform">
               <Plus size={32} strokeWidth={1.5} />
            </div>
            <p className="text-[14px] font-bold tracking-tight">Expand Portfolio</p>
          </button>
        </div>
      </div>

      <ModalCuenta isOpen={modalAbierto} onClose={() => setModalAbierto(false)} />
      {cuentaEditando && (
        <ModalEditarCuenta isOpen={true} cuentaId={cuentaEditando} onClose={() => setCuentaEditando(null)} />
      )}
      {cuentaEliminando && (
        <ModalEliminarCuenta isOpen={true} cuentaId={cuentaEliminando} onClose={() => setCuentaEliminando(null)} />
      )}
    </>
  )
}
