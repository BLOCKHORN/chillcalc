import { useState } from 'react'
import { useStore } from '../store/useStore'
import { X, Trash2, Plus, AlertCircle } from 'lucide-react'

export default function ModalCategorias({ isOpen, onClose }) {
  const { categorias, transacciones, agregarCategoria, eliminarCategoria } = useStore()
  const [nuevaCategoria, setNuevaCategoria] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleAgregar = (e) => {
    e.preventDefault()
    const cat = nuevaCategoria.trim()
    if (!cat) return
    
    if (categorias.some(c => c.toLowerCase() === cat.toLowerCase())) {
      setError('Esta categoría ya existe.')
      return
    }

    agregarCategoria(cat)
    setNuevaCategoria('')
    setError('')
  }

  const handleEliminar = (cat) => {
    const enUso = transacciones.some(t => t.categoria === cat)
    if (enUso) {
      setError(`No puedes eliminar "${cat}" porque está siendo usada en una transacción.`)
      return
    }
    eliminarCategoria(cat)
    setError('')
  }

  const cerrarYLimpiar = () => {
    setError('')
    setNuevaCategoria('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-solid border border-border-subtle rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[85vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-border-subtle shrink-0">
          <div>
            <h3 className="text-xl font-bold text-white">Categorías</h3>
            <p className="text-xs text-slate-400 mt-1">Gestiona tus etiquetas de flujo de caja</p>
          </div>
          <button onClick={cerrarYLimpiar} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-lg flex items-start gap-2 text-danger text-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {categorias.length === 0 ? (
              <p className="text-center text-slate-500 py-4 text-sm">No hay categorías configuradas.</p>
            ) : (
              categorias.map(cat => {
                const enUso = transacciones.some(t => t.categoria === cat)
                return (
                  <div key={cat} className="flex items-center justify-between p-3 bg-surface border border-border-subtle rounded-lg group">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{cat}</span>
                      {enUso && <span className="text-[10px] bg-white/5 text-slate-400 px-2 py-0.5 rounded-full">En uso</span>}
                    </div>
                    <button 
                      onClick={() => handleEliminar(cat)}
                      disabled={enUso}
                      className={`p-1.5 rounded-md transition-colors ${enUso ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-danger hover:bg-danger/10'}`}
                      title={enUso ? "No se puede eliminar porque está en uso" : "Eliminar categoría"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="p-6 border-t border-border-subtle shrink-0 bg-surface/50 rounded-b-2xl">
          <form onSubmit={handleAgregar} className="flex gap-2">
            <input
              type="text"
              value={nuevaCategoria}
              onChange={(e) => {
                setNuevaCategoria(e.target.value)
                setError('')
              }}
              className="flex-1 bg-surface border border-border-subtle rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-500 text-sm"
              placeholder="Nueva etiqueta..."
            />
            <button 
              type="submit" 
              disabled={!nuevaCategoria.trim()}
              className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-bold transition-colors flex items-center gap-2 text-sm"
            >
              <Plus size={18} />
              Añadir
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}