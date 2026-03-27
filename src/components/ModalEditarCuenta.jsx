import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { X } from 'lucide-react'

export default function ModalEditarCuenta({ isOpen, onClose, cuentaId }) {
  const { cuentas, editarCuenta } = useStore()
  const [nombre, setNombre] = useState('')
  const [saldo, setSaldo] = useState('')

  useEffect(() => {
    const cuenta = cuentas.find(c => c.id === cuentaId)
    if (cuenta) {
      setNombre(cuenta.nombre)
      setSaldo(cuenta.saldo)
    }
  }, [cuentaId, cuentas])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    editarCuenta(cuentaId, { nombre, saldo })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-solid border border-border-subtle rounded-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-text-main">Editar Cuenta</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-main"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-2">Nombre</label>
            <input 
              className="w-full bg-surface border border-border-subtle rounded-lg px-4 py-3 text-text-main" 
              value={nombre} onChange={e => setNombre(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-2">Saldo Actual (€)</label>
            <input 
              type="number" step="0.01" 
              className="w-full bg-surface border border-border-subtle rounded-lg px-4 py-3 text-text-main font-bold" 
              value={saldo} onChange={e => setSaldo(e.target.value)} 
            />
            <p className="text-[10px] text-brand-400 mt-2">⚠️ Al cambiar este valor ajustarás manualmente el patrimonio total.</p>
          </div>
          <button type="submit" className="btn-primary text-white mt-2">Guardar Cambios</button>
        </form>
      </div>
    </div>
  )
}