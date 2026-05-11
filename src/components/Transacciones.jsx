import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Edit2, Trash2, Search, Filter, ArrowLeftRight, CreditCard, ChevronRight, ArrowRight
} from 'lucide-react'
import ModalTransaccion from './ModalTransaccion'
import ModalCategorias from './ModalCategorias'
import PrivacyValue from './PrivacyValue'

export default function Transacciones() {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalCategoriasAbierto, setModalCategoriasAbierto] = useState(false)
  const [transaccionEditando, setTransaccionEditando] = useState(null)
  
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [filtroMes, setFiltroMes] = useState('todos')

  const { transacciones, categorias, cuentas, eliminarTransaccion, getBankLogo, formatCurrency } = useStore()

  const mesesDisponibles = useMemo(() => {
    const meses = transacciones.map(t => {
      const [dia, mes, año] = t.fecha.split('/')
      return `${mes}/${año}`
    })
    return [...new Set(meses)].sort((a, b) => {
      const [mA, yA] = a.split('/')
      const [mB, yB] = b.split('/')
      return new Date(yB, mB - 1) - new Date(yA, mA - 1)
    })
  }, [transacciones])

  const transaccionesFiltradas = useMemo(() => {
    return transacciones.filter(t => {
      const coincideCat = filtroCategoria === 'todas' || t.categoria === filtroCategoria
      const [dia, mes, año] = t.fecha.split('/')
      const coincideMes = filtroMes === 'todos' || `${mes}/${año}` === filtroMes
      return coincideCat && coincideMes
    })
  }, [transacciones, filtroCategoria, filtroMes])

  const getCuentaInfo = (id) => {
    const c = cuentas.find(x => x.id === id)
    return c || { nombre: 'Entidad' }
  }

  const abrirEdicion = (tx) => {
    setTransaccionEditando(tx)
    setModalAbierto(true)
  }

  return (
    <>
      <div className="min-h-screen pb-24 pt-12 px-8 max-w-7xl mx-auto animate-apple">
        
        <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
               <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald shadow-[0_0_8px_#008f58]" />
               <h2 className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">Audit & Integrity Log</h2>
            </div>
            <h1 className="text-6xl font-bold tracking-tight text-text-main">Movimientos</h1>
          </div>
          <div className="flex gap-3">
             <button 
               onClick={() => setModalCategoriasAbierto(true)}
               className="px-6 py-3 rounded-xl bg-white/[0.02] border border-border-subtle text-text-main font-bold text-[13px] hover:bg-white/[0.05] transition-all"
             >
               Etiquetas
             </button>
             <button 
               onClick={() => setModalAbierto(true)}
               className="px-6 py-3 rounded-xl bg-text-main text-bg-app font-bold text-[14px] hover:opacity-90 active:scale-95 transition-all shadow-xl"
             >
               Operación
             </button>
          </div>
        </header>

        {/* Modern Filter Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           <div className="lg:col-span-1 space-y-6 md:space-y-8">
              
              {/* Filtro Temporal - Scrollable on mobile */}
              <div className="card !p-5 md:!p-6 overflow-hidden">
                 <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-4 md:mb-6">Filtro Temporal</h3>
                 <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto no-scrollbar scroll-smooth pb-1 md:pb-0">
                    <button 
                      onClick={() => setFiltroMes('todos')} 
                      className={`whitespace-nowrap px-4 py-2.5 rounded-lg text-[13px] font-bold transition-all shrink-0 ${filtroMes === 'todos' ? 'text-brand-emerald bg-brand-emerald/10 border border-brand-emerald/20' : 'text-text-muted hover:text-text-main bg-white/[0.02] border border-transparent'}`}
                    >
                      Completo
                    </button>
                    {mesesDisponibles.map(m => (
                       <button 
                        key={m} 
                        onClick={() => setFiltroMes(m)} 
                        className={`whitespace-nowrap px-4 py-2.5 rounded-lg text-[13px] font-bold transition-all shrink-0 ${filtroMes === m ? 'text-brand-emerald bg-brand-emerald/10 border border-brand-emerald/20' : 'text-text-muted hover:text-text-main bg-white/[0.02] border border-transparent'}`}
                       >
                        {m}
                       </button>
                    ))}
                 </div>
              </div>

              {/* Categorías - Scrollable on mobile */}
              <div className="card !p-5 md:!p-6 overflow-hidden relative">
                 <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-4 md:mb-6">Categorías</h3>
                 <div className="flex md:flex-wrap gap-2 overflow-x-auto md:overflow-y-auto no-scrollbar scroll-smooth pb-1 md:pb-0">
                    <button 
                      onClick={() => setFiltroCategoria('todas')} 
                      className={`whitespace-nowrap px-4 py-2 rounded-full text-[11px] font-bold border transition-all shrink-0 ${filtroCategoria === 'todas' ? 'bg-brand-emerald border-brand-emerald text-white' : 'border-border-subtle text-text-muted hover:text-text-main bg-white/[0.02]'}`}
                    >
                      Todas
                    </button>
                    {categorias.map(cat => (
                       <button 
                        key={cat.id} 
                        onClick={() => setFiltroCategoria(cat.nombre)} 
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-[11px] font-bold border transition-all shrink-0 ${filtroCategoria === cat.nombre ? 'bg-brand-emerald border-brand-emerald text-white' : 'border-border-subtle text-text-muted hover:text-text-main bg-white/[0.02]'}`}
                       >
                          {cat.nombre}
                       </button>
                    ))}
                 </div>
                 {/* Indicador de scroll lateral para móvil */}
                 <div className="absolute right-0 top-[60%] bottom-2 w-8 bg-gradient-to-l from-surface to-transparent pointer-events-none md:hidden" />
              </div>
           </div>

           <div className="lg:col-span-3 card !p-0 overflow-hidden">
              {transaccionesFiltradas.length > 0 ? (
                 <div className="divide-y divide-border-subtle/50">
                    {transaccionesFiltradas.map((t) => {
                       const esIngreso = t.tipo === 'ingreso'
                       const cuenta = getCuentaInfo(t.cuentaId)
                       const logoUrl = getBankLogo(cuenta.nombre)
                       
                       return (
                          <div key={t.id} className="group p-6 flex items-center justify-between hover:bg-white/[0.01] transition-all">
                             <div className="flex items-center gap-6">
                                <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-border-subtle flex items-center justify-center overflow-hidden shrink-0">
                                   {logoUrl ? (
                                      <img src={logoUrl} alt={cuenta.nombre} className="w-full h-full object-contain p-2" />
                                   ) : (
                                      <CreditCard size={18} className="text-text-muted" strokeWidth={1.5} />
                                   )}
                                </div>
                                <div>
                                   <p className="text-[15px] font-bold text-text-main tracking-tight group-hover:text-brand-emerald transition-colors">{t.desc || t.categoria}</p>
                                   <div className="flex items-center gap-2.5 text-[11px] font-bold text-text-muted uppercase tracking-widest mt-1 opacity-50">
                                      <span>{t.fecha}</span>
                                      <span>•</span>
                                      <span>{cuenta.nombre}</span>
                                   </div>
                                </div>
                             </div>

                             <div className="flex items-center gap-10">
                                <div className={`text-[16px] font-bold tracking-tight ${esIngreso ? 'text-brand-emerald' : 'text-text-muted opacity-80'}`}>
                                   {esIngreso ? '+' : '-'}<PrivacyValue value={formatCurrency(t.monto)} />
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                   <button onClick={() => abrirEdicion(t)} className="p-1.5 text-text-muted hover:text-text-main transition-colors">
                                      <Edit2 size={14} />
                                   </button>
                                   <button onClick={() => eliminarTransaccion(t.id)} className="p-1.5 text-text-muted hover:text-danger transition-colors">
                                      <Trash2 size={14} />
                                   </button>
                                </div>
                             </div>
                          </div>
                       )
                    })}
                 </div>
              ) : (
                 <div className="py-32 text-center">
                    <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">No activity records found</p>
                 </div>
              )}
           </div>
        </div>
      </div>

      <ModalTransaccion 
        isOpen={modalAbierto} 
        onClose={() => {setTransaccionEditando(null); setModalAbierto(false)}} 
        editarDatos={transaccionEditando} 
      />
      <ModalCategorias isOpen={modalCategoriasAbierto} onClose={() => setModalCategoriasAbierto(false)} />
    </>
  )
}
