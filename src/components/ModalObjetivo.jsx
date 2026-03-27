import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { X } from 'lucide-react'

export default function ModalObjetivo({ isOpen, onClose, objetivoEditandoId }) {
  const { objetivos, agregarObjetivo, editarObjetivo } = useStore()
  
  const [nombre, setNombre] = useState('')
  const [meta, setMeta] = useState('')
  const [aportacionExtra, setAportacionExtra] = useState('')
  const [tasa, setTasa] = useState('10')

  useEffect(() => {
    if (objetivoEditandoId) {
      const obj = objetivos.find(o => o.id === objetivoEditandoId)
      if (obj) {
        setNombre(obj.nombre)
        setMeta(obj.meta)
        setAportacionExtra(obj.aportacionExtra || 0)
        setTasa(obj.tasa || 10)
      }
    } else {
      setNombre('')
      setMeta('')
      setAportacionExtra('')
      setTasa('10')
    }
  }, [objetivoEditandoId, isOpen, objetivos])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!nombre.trim() || !meta) return

    const datos = {
      nombre: nombre.trim(),
      meta: parseFloat(meta),
      aportacionExtra: parseFloat(aportacionExtra) || 0,
      tasa: parseFloat(tasa) || 0
    }

    if (objetivoEditandoId) {
      editarObjetivo(objetivoEditandoId, datos)
    } else {
      agregarObjetivo({ id: Date.now(), ...datos })
    }
    
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-solid border border-border-subtle rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-border-subtle">
          <h3 className="text-xl font-bold text-white">
            {objetivoEditandoId ? 'Editar Objetivo' : 'Nuevo Objetivo'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nombre del Objetivo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-surface border border-border-subtle rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500"
              placeholder="Ej: Libertad Financiera, Casa..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Cantidad Meta (€)</label>
            <input
              type="number"
              step="0.01"
              value={meta}
              onChange={(e) => setMeta(e.target.value)}
              className="w-full bg-surface border border-border-subtle rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500"
              placeholder="Ej: 100000"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Aportación Mes (€)</label>
              <input
                type="number"
                step="0.01"
                value={aportacionExtra}
                onChange={(e) => setAportacionExtra(e.target.value)}
                className="w-full bg-surface border border-border-subtle rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500"
                placeholder="Ej: 300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Rentabilidad (%)</label>
              <input
                type="number"
                step="0.01"
                value={tasa}
                onChange={(e) => setTasa(e.target.value)}
                className="w-full bg-surface border border-border-subtle rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500"
                placeholder="Ej: 10"
              />
            </div>
          </div>

          <button type="submit" className="mt-4 w-full py-3 rounded-lg font-bold bg-brand-600 hover:bg-brand-500 text-white transition-all">
            {objetivoEditandoId ? 'Guardar Cambios' : 'Crear Objetivo'}
          </button>
        </form>
      </div>
    </div>
  )
}