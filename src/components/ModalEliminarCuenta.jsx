import { useStore } from '../store/useStore'
import { AlertTriangle } from 'lucide-react'

export default function ModalEliminarCuenta({ isOpen, onClose, cuentaId }) {
  const { cuentas, eliminarCuenta } = useStore()
  const cuenta = cuentas.find(c => c.id === cuentaId)

  if (!isOpen || !cuenta) return null

  const handleEliminar = () => {
    eliminarCuenta(cuentaId)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-solid border border-danger/30 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
        
        <div className="mx-auto w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mb-4">
          <AlertTriangle size={32} />
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">¿Eliminar {cuenta.nombre}?</h3>
        
        <p className="text-sm text-slate-400 mb-6">
          Esta acción no se puede deshacer. Se eliminarán permanentemente la cuenta y 
          <span className="text-white font-bold"> todas las transacciones</span> asociadas a ella.
        </p>

        <div className="flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 py-3 rounded-lg font-bold bg-surface border border-border-subtle hover:bg-white/5 text-white transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={handleEliminar} 
            className="flex-1 py-3 rounded-lg font-bold bg-danger hover:bg-red-600 text-white transition-all"
          >
            Sí, eliminar
          </button>
        </div>

      </div>
    </div>
  )
}