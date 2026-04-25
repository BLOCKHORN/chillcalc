import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { ArrowDownRight, ArrowUpRight, ArrowRightLeft, Trash2, Edit2, Tags, Filter, Calendar, X, Plus } from 'lucide-react'
import ModalTransaccion from './ModalTransaccion'
import ModalCategorias from './ModalCategorias'

const formatoEuros = (num) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(num || 0)

const PALETA_COLORES = {
  slate: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
  orange: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  yellow: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  cyan: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  sky: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
  blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  indigo: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
  purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  pink: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
  rose: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
  red: 'text-red-500 bg-red-500/10 border-red-500/20',
  brand: 'text-brand-400 bg-brand-500/10 border-brand-500/20'
}

export default function Transacciones() {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalCategoriasAbierto, setModalCategoriasAbierto] = useState(false)
  const [transaccionEditando, setTransaccionEditando] = useState(null)
  
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [filtroMes, setFiltroMes] = useState('todos')

  const transacciones = useStore(state => state.transacciones)
  const categorias = useStore(state => state.categorias)
  const cuentas = useStore(state => state.cuentas)
  const eliminarTransaccion = useStore(state => state.eliminarTransaccion)

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
      const mesAño = `${mes}/${año}`
      const coincideMes = filtroMes === 'todos' || mesAño === filtroMes
      return coincideCat && coincideMes
    })
  }, [transacciones, filtroCategoria, filtroMes])

  const getNombreCuenta = (id) => {
    const c = cuentas.find(x => x.id === id)
    return c ? c.nombre : 'Cuenta'
  }

  const limpiarFiltros = () => {
    setFiltroCategoria('todas')
    setFiltroMes('todos')
  }

  const abrirEdicion = (tx) => {
    setTransaccionEditando(tx)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setTransaccionEditando(null)
    setModalAbierto(false)
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-1 relative w-full">
      
      <div className="absolute top-20 right-10 w-64 h-64 bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-40 left-10 w-48 h-48 bg-sky-500/5 rounded-full blur-[90px] pointer-events-none" />

      <header className="mb-8 pt-2 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-[10px] md:text-xs font-black text-text-muted uppercase tracking-widest mb-2 flex items-center justify-center md:justify-start gap-2">
              <ArrowRightLeft size={14} className="text-brand-400" />
              Historial
            </p>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none text-text-main text-center md:text-left">
              Movimientos
            </h1>
          </div>
          
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <button 
              onClick={() => setModalCategoriasAbierto(true)} 
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border-subtle bg-surface-solid/60 backdrop-blur-md text-text-muted hover:text-text-main transition-all active:scale-95 text-xs font-black uppercase tracking-widest"
            >
              <Tags size={16} strokeWidth={3} /> Categorías
            </button>
            <button 
              onClick={() => setModalAbierto(true)} 
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black bg-brand-500 text-white shadow-lg shadow-brand-500/20 active:scale-95 transition-all text-xs uppercase tracking-widest"
            >
              <Plus size={16} strokeWidth={3} /> Operación
            </button>
          </div>
        </div>

        <div className="space-y-4 bg-surface-solid/40 p-5 rounded-3xl border border-border-subtle/50 backdrop-blur-md shadow-xl mb-8">
          <div className="flex flex-col gap-3">
            <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] px-1 flex items-center gap-2">
              <Filter size={10} /> Categorías
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFiltroCategoria('todas')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${filtroCategoria === 'todas' ? 'bg-text-main text-surface-solid border-text-main shadow-lg' : 'bg-surface text-text-muted border-border-subtle hover:border-text-muted'}`}
              >
                Todas
              </button>
              {categorias.map(cat => (
                <button
                  key={cat.nombre}
                  onClick={() => setFiltroCategoria(cat.nombre)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${filtroCategoria === cat.nombre ? `${PALETA_COLORES[cat.color] || PALETA_COLORES.slate} border-current shadow-md scale-105` : 'bg-surface text-text-muted border-border-subtle hover:bg-surface-solid'}`}
                >
                  <span>{cat.emoji}</span>
                  {cat.nombre}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-border-subtle/30">
            <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] px-1 flex items-center gap-2">
              <Calendar size={10} /> Periodo
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFiltroMes('todos')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${filtroMes === 'todos' ? 'bg-brand-500 text-white border-brand-500 shadow-lg' : 'bg-surface text-text-muted border-border-subtle hover:border-text-muted'}`}
              >
                Siempre
              </button>
              {mesesDisponibles.map(m => (
                <button
                  key={m}
                  onClick={() => setFiltroMes(m)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${filtroMes === m ? 'bg-brand-500/20 text-brand-400 border-brand-400 shadow-md' : 'bg-surface text-text-muted border-border-subtle hover:bg-surface-solid'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="bg-surface-solid/40 backdrop-blur-xl border border-border-subtle/50 rounded-3xl overflow-hidden shadow-2xl relative z-10">
        <div className="w-full flex flex-col">
          {transaccionesFiltradas.length > 0 ? (
            transaccionesFiltradas.map(t => {
              const esIngreso = t.tipo === 'ingreso'
              return (
                <div key={t.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-5 border-b border-border-subtle/50 last:border-0 hover:bg-surface-solid/60 transition-colors group relative">
                  
                  <div className="flex items-center gap-4 mb-4 lg:mb-0 w-full lg:w-1/2">
                    <div className={`p-3 rounded-2xl border flex-shrink-0 ${esIngreso ? 'bg-brand-500/10 text-brand-400 border-brand-500/20 shadow-[0_0_15px_rgba(var(--brand-500),0.1)]' : 'bg-danger/10 text-danger border-danger/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]'}`}>
                      {esIngreso ? <ArrowUpRight size={20} strokeWidth={3} /> : <ArrowDownRight size={20} strokeWidth={3} />}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-black text-text-main text-base lg:text-lg leading-none truncate mb-1.5 group-hover:text-brand-400 transition-colors">
                        {t.desc || t.categoria}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-text-muted font-bold uppercase tracking-widest">
                        <span className="text-text-main bg-surface rounded-md px-1.5 py-0.5 border border-border-subtle/50">{t.categoria}</span> 
                        <span>•</span>
                        <span>{t.fecha}</span>
                        <span>•</span>
                        <span className="truncate max-w-[100px] lg:max-w-[150px]">{getNombreCuenta(t.cuentaId)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-6 border-t border-border-subtle/30 lg:border-t-0 pt-4 lg:pt-0 w-full lg:w-1/2">
                    <div className={`text-xl lg:text-2xl font-black tracking-tighter ${esIngreso ? 'text-text-main' : 'text-danger'}`}>
                      {esIngreso ? '+' : '-'}{formatoEuros(t.monto)}
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => abrirEdicion(t)}
                        className="p-2 text-text-muted hover:text-text-main hover:bg-surface rounded-xl border border-transparent hover:border-border-subtle/50 transition-all active:scale-90"
                      >
                        <Edit2 size={18} strokeWidth={2.5} />
                      </button>
                      <button 
                        onClick={() => eliminarTransaccion(t.id)}
                        className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-xl border border-transparent hover:border-danger/20 transition-all active:scale-90"
                      >
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <p className="text-text-main text-sm font-black uppercase tracking-widest mb-1">Cero Movimientos</p>
              <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-6 opacity-60">No hay registros con estos filtros.</p>
              <button 
                onClick={limpiarFiltros} 
                className="px-6 py-3 rounded-xl bg-surface-solid border border-border-subtle text-text-main text-xs font-bold hover:bg-surface hover:border-border-subtle/80 transition-all shadow-sm active:scale-95"
              >
                Restablecer Vista
              </button>
            </div>
          )}
        </div>
      </div>

      <ModalTransaccion 
        isOpen={modalAbierto} 
        onClose={cerrarModal} 
        editarDatos={transaccionEditando} 
      />
      <ModalCategorias isOpen={modalCategoriasAbierto} onClose={() => setModalCategoriasAbierto(false)} />
    </div>
  )
}