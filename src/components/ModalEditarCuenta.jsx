import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { X } from 'lucide-react'

export default function ModalEditarCuenta({ isOpen, onClose, cuentaId }) {
  const { cuentas, editarCuenta } = useStore()
  const [nombre, setNombre] = useState('')
  const [saldo, setSaldo] = useState('')
  const [tae, setTae] = useState('')
  const [tipo, setTipo] = useState('')

  useEffect(() => {
    const cuenta = cuentas.find(c => c.id === cuentaId)
    if (cuenta) {
      setNombre(cuenta.nombre)
      setSaldo(cuenta.saldo)
      setTae(cuenta.tae || 0)
      setTipo(cuenta.tipo)
    }
  }, [cuentaId, cuentas, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const datosActualizados = {
      nombre,
      saldo: parseFloat(saldo) || 0,
      tae: tipo === 'remunerada' ? parseFloat(tae) || 0 : 0
    }
    editarCuenta(cuentaId, datosActualizados)
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
            <label className="block text-[10px] font-bold text-text-muted uppercase mb-1.5 ml-1">Nombre</label>
            <input 
              className="w-full bg-surface border border-border-subtle rounded-lg px-4 py-3 text-text-main" 
              value={nombre} onChange={e => setNombre(e.target.value)} 
              required
            />
          </div>

          <div className={tipo === 'remunerada' ? "grid grid-cols-2 gap-4" : ""}>
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase mb-1.5 ml-1">Saldo Actual (€)</label>
              <input 
                type="number" step="0.01" 
                className="w-full bg-surface border border-border-subtle rounded-lg px-4 py-3 text-text-main font-bold" 
                value={saldo} onChange={e => setSaldo(e.target.value)} 
                required
              />
            </div>

            {tipo === 'remunerada' && (
              <div>
                <label className="block text-[10px] font-bold text-brand-500 uppercase mb-1.5 ml-1">Interés TAE (%)</label>
                <input 
                  type="number" step="0.01" 
                  className="w-full bg-surface border border-brand-500/30 rounded-lg px-4 py-3 text-text-main focus:border-brand-500 outline-hidden" 
                  value={tae} onChange={e => setTae(e.target.value)} 
                  required
                />
              </div>
            )}
          </div>

          <p className="text-[10px] text-brand-400 mt-1 px-1">
            ⚠️ Al cambiar el saldo ajustarás manualmente el patrimonio sin registrar una transacción.
          </p>

          <button type="submit" className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-lg transition-colors mt-2">
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  )
}