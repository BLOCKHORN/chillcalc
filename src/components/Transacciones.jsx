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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-8 px-1 md:px-0">
      <header className="mb-8 flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 pt-2">
        <div className="w-full text-center lg:text-left">
          <h2 className="text-3xl lg:text-2xl font-black lg:font-bold text-text-main mb-1 tracking-tighter lg:tracking-normal">
            Movimientos
          </h2>
          <p className="text-[10px] lg:text-sm text-text-muted uppercase font-bold tracking-widest">
            Historial y auditoría de flujos
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:flex lg:flex-row gap-2 w-full lg:w-auto">
          <div className="flex items-center bg-surface-solid border border-border-subtle rounded-xl px-3 py-3 lg:py-2 gap-2">
            <Calendar size={14} className="text-text-muted shrink-0" />
            <select 
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="bg-transparent text-[11px] lg:text-sm font-bold text-text-main focus:outline-none cursor-pointer w-full uppercase"
            >
              <option value="todos">Meses</option>
              {mesesDisponibles.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-surface-solid border border-border-subtle rounded-xl px-3 py-3 lg:py-2 gap-2">
            <Filter size={14} className="text-text-muted shrink-0" />
            <select 
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="bg-transparent text-[11px] lg:text-sm font-bold text-text-main focus:outline-none cursor-pointer w-full uppercase"
            >
              <option value="todas">Categorías</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => setModalCategoriasAbierto(true)} 
            className="flex items-center justify-center gap-2 px-4 py-3 lg:py-2 rounded-xl font-bold border border-border-subtle bg-surface-solid text-text-main text-sm active:scale-95 transition-all"
          >
            <Tags size={18} />
            <span className="lg:inline">Etiquetas</span>
          </button>
          
          <button 
            onClick={() => setModalAbierto(true)} 
            className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white py-3 lg:py-2 px-6 rounded-xl active:scale-95 transition-all text-sm font-bold shadow-lg shadow-brand-500/20"
          >
            <Plus size={18} /> Operación
          </button>
        </div>
      </header>

      {(filtroCategoria !== 'todas' || filtroMes !== 'todos') && (
        <div className="mb-4 flex justify-center lg:justify-start">
          <button 
            onClick={limpiarFiltros}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-[10px] font-black uppercase tracking-widest"
          >
            <X size={12} /> Limpiar Filtros
          </button>
        </div>
      )}

      <div className="card p-0 overflow-hidden border-border-subtle">
        <div className="w-full">
          {transaccionesFiltradas.length > 0 ? (
            transaccionesFiltradas.map(t => {
              const esIngreso = t.tipo === 'ingreso'
              return (
                <div key={t.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border-b border-border-subtle last:border-0 hover:bg-surface transition-colors group relative">
                  <div className="flex items-center gap-4 mb-3 lg:mb-0">
                    <div className={`p-2.5 rounded-xl border ${esIngreso ? 'bg-brand-500/10 text-brand-400 border-brand-500/20' : 'bg-danger/10 text-danger border-danger/20'}`}>
                      {esIngreso ? <ArrowUpRight size={20} strokeWidth={2.5} /> : <ArrowDownRight size={20} strokeWidth={2.5} />}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-text-main text-sm lg:text-base leading-tight truncate">
                        {t.desc || t.categoria}
                      </p>
                      <p className="text-[10px] lg:text-xs text-text-muted font-medium mt-0.5">
                        <span className="text-brand-400 font-bold uppercase">{t.categoria}</span> · {t.fecha} · {getNombreCuenta(t.cuentaId)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 border-border-subtle/50 pt-3 lg:pt-0">
                    <div className={`text-base lg:text-lg font-black tracking-tight ${esIngreso ? 'text-brand-400' : 'text-danger'}`}>
                      {esIngreso ? '+' : '-'}{formatoEuros(t.monto)}
                    </div>
                    
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => abrirEdicion(t)}
                        className="p-2.5 text-text-muted hover:text-text-main bg-surface-solid lg:bg-transparent rounded-lg border border-border-subtle lg:border-transparent transition-all active:scale-90"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => eliminarTransaccion(t.id)}
                        className="p-2.5 text-text-muted hover:text-danger bg-surface-solid lg:bg-transparent rounded-lg border border-border-subtle lg:border-transparent transition-all active:scale-90"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-16 text-center">
              <p className="text-text-muted text-[10px] font-black uppercase tracking-widest mb-4">Cero movimientos encontrados</p>
              <button onClick={limpiarFiltros} className="px-6 py-2 rounded-xl bg-surface-solid border border-border-subtle text-text-main text-xs font-bold hover:bg-surface transition-all">
                Restablecer vista
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