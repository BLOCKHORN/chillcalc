import { useState } from 'react'
import { useStore } from '../store/useStore'
import { X, Trash2, Plus, AlertCircle } from 'lucide-react'

export default function ModalCategorias({ isOpen, onClose }) {
  const { categorias, transacciones, agregarCategoria, eliminarCategoria } = useStore()
  const [nuevaCategoria, setNuevaCategoria] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleAgregar = async (e) => {
    e.preventDefault()
    const cat = nuevaCategoria.trim()
    if (!cat) return
    
    if (categorias.some(c => c.toLowerCase() === cat.toLowerCase())) {
      setError('Esta categoría ya existe')
      return
    }

    await agregarCategoria(cat)
    setNuevaCategoria('')
    setError('')
  }

  const handleEliminar = async (cat) => {
    const enUso = transacciones.some(t => t.categoria === cat)
    if (enUso) {
      setError(`No se puede eliminar "${cat}" porque tiene transacciones asociadas`)
      return
    }
    await eliminarCategoria(cat)
    setError('')
  }

  const cerrarYLimpiar = () => {
    setError('')
    setNuevaCategoria('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-solid border-t sm:border border-border-subtle rounded-t-2xl sm:rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-border-subtle shrink-0">
          <div>
            <h3 className="text-xl font-bold text-text-main">Categorías</h3>
            <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mt-1">Gestionar etiquetas</p>
          </div>
          <button onClick={cerrarYLimpiar} className="p-2 text-text-muted hover:text-text-main transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {error && (
            <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-start gap-3 text-danger text-xs font-bold uppercase tracking-tight">
              <AlertCircle size={18} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {categorias.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">Cargando categorías...</p>
              </div>
            ) : (
              categorias.map(cat => {
                const enUso = transacciones.some(t => t.categoria === cat)
                return (
                  <div key={cat} className="flex items-center justify-between p-4 bg-surface-solid border border-border-subtle rounded-xl group transition-all">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-text-main text-sm">{cat}</span>
                      {enUso && (
                        <span className="text-[8px] font-black uppercase tracking-tighter bg-white/5 text-text-muted px-2 py-1 rounded-md border border-border-subtle">
                          En uso
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => handleEliminar(cat)}
                      disabled={enUso}
                      className={`p-2 rounded-lg transition-all ${enUso ? 'opacity-20 cursor-not-allowed' : 'text-text-muted hover:text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20'}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="p-6 border-t border-border-subtle shrink-0 bg-surface-solid/50 pb-10 sm:pb-6">
          <form onSubmit={handleAgregar} className="flex gap-2">
            <input
              type="text"
              value={nuevaCategoria}
              onChange={(e) => {
                setNuevaCategoria(e.target.value)
                setError('')
              }}
              className="flex-1 bg-surface-solid border border-border-subtle rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand-500 text-sm font-medium"
              placeholder="Nueva etiqueta..."
            />
            <button 
              type="submit" 
              disabled={!nuevaCategoria.trim()}
              className="bg-brand-500 hover:bg-brand-600 disabled:opacity-30 text-white px-5 py-3 rounded-xl font-bold transition-all flex items-center gap-2 text-sm shadow-lg shadow-brand-500/20 active:scale-95"
            >
              <Plus size={20} />
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}