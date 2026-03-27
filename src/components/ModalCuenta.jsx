import { useState } from 'react'
import { useStore } from '../store/useStore'
import { X } from 'lucide-react'

export default function ModalCuenta({ isOpen, onClose }) {
  const agregarCuenta = useStore(state => state.agregarCuenta)
  
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState('banco')
  const [saldo, setSaldo] = useState('')
  const [icono, setIcono] = useState('bank')
  const [ticker, setTicker] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const nuevaCuenta = {
      id: Date.now(),
      nombre,
      tipo,
      saldo: parseFloat(saldo) || 0,
      icono,
      ...(tipo === 'inversion' && { ticker, capitalInvertido: parseFloat(saldo) || 0, precioPromedio: 1 })
    }
    agregarCuenta(nuevaCuenta)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-solid border border-border-subtle rounded-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-text-main">Nueva Cuenta</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-main"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            className="w-full bg-surface border border-border-subtle rounded-lg px-4 py-3 text-text-main" 
            placeholder="Nombre (Ej: XTB, BBVA...)" 
            value={nombre} onChange={e => setNombre(e.target.value)} required 
          />
          <select 
            className="w-full bg-surface border border-border-subtle rounded-lg px-4 py-3 text-text-main"
            value={tipo} onChange={e => setTipo(e.target.value)}
          >
            <option value="banco">Banco / Efectivo</option>
            <option value="inversion">Inversión (Acciones/ETF)</option>
            <option value="remunerada">Cuenta Ahorro</option>
          </select>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-2">Saldo Inicial (€)</label>
            <input 
              type="number" step="0.01" 
              className="w-full bg-surface border border-border-subtle rounded-lg px-4 py-3 text-text-main" 
              placeholder="0.00" 
              value={saldo} onChange={e => setSaldo(e.target.value)} required 
            />
          </div>
          {tipo === 'inversion' && (
            <input 
              className="w-full bg-surface border border-brand-500/30 rounded-lg px-4 py-3 text-text-main" 
              placeholder="Ticker (Ej: SPY.US)" 
              value={ticker} onChange={e => setTicker(e.target.value)} 
            />
          )}
          <button type="submit" className="btn-primary text-white mt-2">Crear Cuenta</button>
        </form>
      </div>
    </div>
  )
}