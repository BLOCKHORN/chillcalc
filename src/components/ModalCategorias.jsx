import { useState } from 'react'
import { useStore } from '../store/useStore'
import { X, Trash2, Plus, AlertCircle, Palette } from 'lucide-react'

// Mapeo de colores a clases de Tailwind (necesario porque Tailwind no compila clases dinámicas partidas)
const PALETA_COLORES = {
  slate: { bg: 'bg-slate-500', pill: 'text-slate-400 bg-slate-400/10 border-slate-400/20' },
  orange: { bg: 'bg-orange-500', pill: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  amber: { bg: 'bg-amber-500', pill: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  yellow: { bg: 'bg-yellow-500', pill: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  emerald: { bg: 'bg-emerald-500', pill: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  cyan: { bg: 'bg-cyan-500', pill: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
  sky: { bg: 'bg-sky-500', pill: 'text-sky-400 bg-sky-400/10 border-sky-400/20' },
  blue: { bg: 'bg-blue-500', pill: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  indigo: { bg: 'bg-indigo-500', pill: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' },
  purple: { bg: 'bg-purple-500', pill: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  pink: { bg: 'bg-pink-500', pill: 'text-pink-400 bg-pink-400/10 border-pink-400/20' },
  rose: { bg: 'bg-rose-500', pill: 'text-rose-400 bg-rose-400/10 border-rose-400/20' },
  red: { bg: 'bg-red-500', pill: 'text-red-500 bg-red-500/10 border-red-500/20' },
  brand: { bg: 'bg-brand-500', pill: 'text-brand-400 bg-brand-500/10 border-brand-500/20' }
}

export default function ModalCategorias({ isOpen, onClose }) {
  const { categorias, transacciones, agregarCategoria, eliminarCategoria } = useStore()
  
  const [nuevaCategoria, setNuevaCategoria] = useState('')
  const [nuevoEmoji, setNuevoEmoji] = useState('🏷️')
  const [nuevoColor, setNuevoColor] = useState('brand')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleAgregar = async (e) => {
    e.preventDefault()
    const catNombre = nuevaCategoria.trim()
    if (!catNombre) return
    
    // Aseguramos que no exista otra categoría con ese nombre (ignorando mayúsculas)
    if (categorias.some(c => c.nombre.toLowerCase() === catNombre.toLowerCase())) {
      setError('Esta categoría ya existe')
      return
    }

    // Enviamos el objeto completo a Supabase.
    // OJO: agregarCategoria en useStore.js DEBE hacer un await get().cargarDatosNube() al final.
    await agregarCategoria({
      nombre: catNombre,
      emoji: nuevoEmoji || '🏷️',
      color: nuevoColor
    })
    
    // Reseteamos el formulario
    setNuevaCategoria('')
    setNuevoEmoji('🏷️')
    setNuevoColor('brand')
    setError('')
  }

  // Ahora pasamos la categoría entera para tener el ID y el Nombre
  const handleEliminar = async (cat) => {
    // Si tienes guardado categoriaId en las transacciones úsalo. Si no, usamos el nombre como fallback.
    const enUso = transacciones.some(t => t.categoriaId === cat.id || t.categoria === cat.nombre)
    
    if (enUso) {
      setError(`No se puede eliminar "${cat.nombre}" porque tiene transacciones asociadas`)
      return
    }
    
    // IMPORTANTE: Le pasamos el ID a eliminarCategoria, no el nombre.
    // Esto requiere el cambio en useStore.js que te pasé antes.
    await eliminarCategoria(cat.id || cat.nombre)
    setError('')
  }

  const cerrarYLimpiar = () => {
    setError('')
    setNuevaCategoria('')
    setNuevoEmoji('🏷️')
    setNuevoColor('brand')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-surface-solid border-t sm:border border-border-subtle rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center p-6 border-b border-border-subtle shrink-0 bg-surface-solid/80 backdrop-blur-sm z-10">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-text-main tracking-tight">Etiquetas</h3>
            <p className="text-[10px] uppercase font-black tracking-widest text-text-muted mt-1">Personaliza tus categorías</p>
          </div>
          <button onClick={cerrarYLimpiar} className="p-2.5 text-text-muted hover:text-text-main bg-surface rounded-xl border border-border-subtle transition-all active:scale-90">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Lista de Categorías */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {error && (
            <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-2xl flex items-start gap-3 text-danger text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top-2">
              <AlertCircle size={16} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {categorias.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">Cargando categorías...</p>
              </div>
            ) : (
              categorias.map(cat => {
                // Comprobamos si la categoría está siendo usada. (Fallback a nombre por si tienes transacciones viejas)
                const enUso = transacciones.some(t => t.categoriaId === cat.id || t.categoria === cat.nombre)
                const estiloPill = PALETA_COLORES[cat.color]?.pill || PALETA_COLORES['slate'].pill

                return (
                  // Usamos cat.id preferiblemente para la key
                  <div key={cat.id || cat.nombre} className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-border-subtle hover:border-border-subtle/80 transition-colors group">
                    <div className="flex items-center gap-4">
                      {/* Píldora visual */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border shadow-sm ${estiloPill}`}>
                        {cat.emoji}
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="font-black text-text-main text-sm">{cat.nombre}</span>
                        {enUso && (
                          <span className="text-[8px] font-black uppercase tracking-widest text-text-muted mt-0.5 opacity-60">
                            En uso
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleEliminar(cat)}
                      disabled={enUso}
                      className={`p-2.5 rounded-xl transition-all ${enUso ? 'opacity-20 cursor-not-allowed' : 'text-text-muted hover:text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20 active:scale-90'}`}
                    >
                      <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Creador de nueva categoría */}
        <div className="p-5 sm:p-6 border-t border-border-subtle shrink-0 bg-surface-solid/90 backdrop-blur-md pb-10 sm:pb-6">
          <form onSubmit={handleAgregar} className="flex flex-col gap-4">
            
            {/* Fila principal: Emoji + Nombre + Botón */}
            <div className="flex gap-2">
              <div className="relative group">
                <input
                  type="text"
                  maxLength="2"
                  value={nuevoEmoji}
                  onChange={(e) => setNuevoEmoji(e.target.value)}
                  className="w-14 h-14 bg-surface border border-border-subtle rounded-2xl text-center text-2xl focus:outline-none focus:border-brand-500 shadow-inner transition-all"
                  title="Añadir un emoji"
                />
              </div>
              
              <input
                type="text"
                value={nuevaCategoria}
                onChange={(e) => {
                  setNuevaCategoria(e.target.value)
                  setError('')
                }}
                className="flex-1 bg-surface border border-border-subtle rounded-2xl px-4 text-text-main focus:outline-none focus:border-brand-500 text-sm font-bold shadow-inner transition-all placeholder:text-text-muted/50"
                placeholder="Nombre (ej. Viajes)"
              />
              
              <button 
                type="submit" 
                disabled={!nuevaCategoria.trim()}
                className="w-14 h-14 bg-brand-500 hover:bg-brand-600 disabled:opacity-30 disabled:scale-100 text-white rounded-2xl font-bold transition-all flex items-center justify-center shadow-lg shadow-brand-500/20 active:scale-90"
              >
                <Plus size={24} strokeWidth={3} />
              </button>
            </div>

            {/* Selector de color */}
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-1.5 px-1">
                <Palette size={12} /> Selecciona un color
              </span>
              <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 px-1">
                {Object.entries(PALETA_COLORES).map(([colorKey, clases]) => (
                  <button
                    key={colorKey}
                    type="button"
                    onClick={() => setNuevoColor(colorKey)}
                    className={`w-8 h-8 rounded-full shrink-0 border-2 transition-all hover:scale-110 active:scale-95 ${clases.bg} ${nuevoColor === colorKey ? 'border-white shadow-[0_0_12px_rgba(255,255,255,0.3)] scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  />
                ))}
              </div>
            </div>

          </form>
        </div>

      </div>
    </div>
  )
}