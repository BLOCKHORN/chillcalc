import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { ArrowDownRight, ArrowUpRight, Trash2, Edit2, Tags, Filter, Calendar, X } from 'lucide-react'
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8 flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6">
        <div>
          <h2 className="text-2xl font-bold text-text-main mb-1">Historial de Movimientos</h2>
          <p className="text-sm text-text-muted">Gestiona y audita tus flujos</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center bg-surface-solid border border-border-subtle rounded-lg px-3 py-2 gap-2">
            <Calendar size={16} className="text-text-muted" />
            <select 
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="bg-transparent text-sm text-text-main focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos los meses</option>
              {mesesDisponibles.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-surface-solid border border-border-subtle rounded-lg px-3 py-2 gap-2">
            <Filter size={16} className="text-text-muted" />
            <select 
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="bg-transparent text-sm text-text-main focus:outline-none cursor-pointer"
            >
              <option value="todas">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {(filtroCategoria !== 'todas' || filtroMes !== 'todos') && (
            <button 
              onClick={limpiarFiltros}
              className="p-2 text-text-muted hover:text-text-main transition-colors"
            >
              <X size={20} />
            </button>
          )}

          <div className="h-10 w-[1px] bg-border-subtle mx-1 hidden sm:block"></div>

          <button 
            onClick={() => setModalCategoriasAbierto(true)} 
            className="px-4 py-2 rounded-lg font-medium border border-border-subtle bg-surface text-text-main hover:bg-surface-hover transition-colors flex items-center gap-2"
          >
            <Tags size={18} />
            Categorías
          </button>
          
          <button onClick={() => setModalAbierto(true)} className="btn-primary text-white">
            Registrar Operación
          </button>
        </div>
      </header>

      <div className="card p-0 overflow-hidden">
        <div className="w-full">
          {transaccionesFiltradas.length > 0 ? (
            transaccionesFiltradas.map(t => {
              const esIngreso = t.tipo === 'ingreso'
              return (
                <div key={t.id} className="flex items-center justify-between p-4 border-b border-border-subtle last:border-0 hover:bg-surface-hover transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${esIngreso ? 'bg-brand-500/20 text-brand-400' : 'bg-danger/20 text-danger'}`}>
                      {esIngreso ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                    </div>
                    <div>
                      <p className="font-semibold text-text-main">{t.desc || t.categoria}</p>
                      <p className="text-xs text-text-muted">{t.fecha} · <span className="text-text-main">{t.categoria}</span> · {getNombreCuenta(t.cuentaId)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`font-bold ${esIngreso ? 'text-brand-400' : 'text-danger'}`}>
                      {esIngreso ? '+' : '-'}{formatoEuros(t.monto)}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => abrirEdicion(t)}
                        className="p-2 text-text-muted hover:text-text-main hover:bg-surface-solid rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => eliminarTransaccion(t.id)}
                        className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-12 text-center">
              <p className="text-text-muted text-sm mb-1">No hay transacciones que coincidan con los filtros</p>
              <button onClick={limpiarFiltros} className="text-brand-400 text-xs font-bold hover:underline">Mostrar todo</button>
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