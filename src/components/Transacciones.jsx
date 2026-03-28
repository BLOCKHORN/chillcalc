import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { ArrowDownRight, ArrowUpRight, Trash2, Edit2, Tags, Filter, Calendar, X, Plus } from 'lucide-react'
import ModalTransaccion from './ModalTransaccion'
import ModalCategorias from './ModalCategorias'

const formatoEuros = (num) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(num || 0)

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
    return c ? c.nombre : 'Cuenta eliminada'
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 md:pb-12 px-1 md:px-0 relative w-full">
      
      {/* Soft Glow Backlight */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-40 left-10 w-48 h-48 bg-sky-500/5 rounded-full blur-[90px] pointer-events-none" />

      <header className="mb-10 flex flex-col xl:flex-row xl:justify-between xl:items-end gap-6 pt-2 relative z-10">
        <div className="w-full text-center xl:text-left">
          <p className="text-[10px] md:text-xs font-black text-text-muted uppercase tracking-widest mb-2 flex items-center justify-center xl:justify-start gap-2">
            <ArrowRightLeft size={14} className="text-brand-400" />
            Historial
          </p>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none text-text-main">
            Movimientos
          </h1>
        </div>
        
        {/* Controles y Filtros */}
        <div className="grid grid-cols-2 lg:flex lg:flex-row gap-3 w-full xl:w-auto">
          <div className="flex items-center bg-surface-solid/60 backdrop-blur-md border border-border-subtle/50 rounded-xl px-4 py-3 gap-2 shadow-sm transition-all hover:border-border-subtle/80">
            <Calendar size={16} className="text-brand-400 shrink-0" />
            <select 
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="bg-transparent text-[11px] lg:text-xs font-bold text-text-main focus:outline-none cursor-pointer w-full uppercase tracking-wider"
            >
              <option value="todos">Todos los Meses</option>
              {mesesDisponibles.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-surface-solid/60 backdrop-blur-md border border-border-subtle/50 rounded-xl px-4 py-3 gap-2 shadow-sm transition-all hover:border-border-subtle/80">
            <Filter size={16} className="text-brand-400 shrink-0" />
            <select 
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="bg-transparent text-[11px] lg:text-xs font-bold text-text-main focus:outline-none cursor-pointer w-full uppercase tracking-wider"
            >
              <option value="todas">Todas las Categorías</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => setModalCategoriasAbierto(true)} 
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold border border-border-subtle/50 bg-surface-solid/60 backdrop-blur-md text-text-main text-xs hover:border-border-subtle/80 hover:bg-surface-solid transition-all shadow-sm group"
          >
            <Tags size={16} className="text-text-muted group-hover:text-text-main transition-colors" />
            <span className="hidden lg:inline uppercase tracking-widest">Etiquetas</span>
          </button>
          
          <button 
            onClick={() => setModalAbierto(true)} 
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 active:scale-95 transition-all text-xs border border-brand-500/20 shadow-lg shadow-brand-500/5 group uppercase tracking-widest"
          >
            <Plus size={16} className="group-hover:rotate-90 transition-transform" />
            <span className="hidden lg:inline">Operación</span>
          </button>
        </div>
      </header>

      {(filtroCategoria !== 'todas' || filtroMes !== 'todos') && (
        <div className="mb-6 flex justify-center xl:justify-start relative z-10 animate-in fade-in duration-300">
          <button 
            onClick={limpiarFiltros}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-danger/10 text-danger border border-danger/20 text-[10px] font-black uppercase tracking-widest hover:bg-danger/20 transition-colors shadow-sm"
          >
            <X size={12} strokeWidth={3} /> Limpiar Filtros
          </button>
        </div>
      )}

      {/* Lista de Transacciones (Glassmorphism) */}
      <div className="bg-surface-solid/40 backdrop-blur-xl border border-border-subtle/50 rounded-3xl overflow-hidden shadow-2xl shadow-black/5 relative z-10">
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
              <div className="w-16 h-16 bg-surface-solid rounded-2xl border border-border-subtle/50 flex items-center justify-center mb-4 text-text-muted/30">
                <ListFilter size={32} strokeWidth={2} />
              </div>
              <p className="text-text-main text-sm font-black uppercase tracking-widest mb-1">Cero Movimientos</p>
              <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-6">No hay registros que coincidan con los filtros.</p>
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