import { useState } from 'react'
import { useStore } from '../store/useStore'
import { X } from 'lucide-react'

export default function ModalCuenta({ isOpen, onClose }) {
  const agregarCuenta = useStore(state => state.agregarCuenta)
  
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState('banco')
  const [saldo, setSaldo] = useState('')
  const [tae, setTae] = useState('')
  const [icono, setIcono] = useState('bank')
  const [ticker, setTicker] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const nuevaCuenta = {
      nombre,
      tipo,
      saldo: parseFloat(saldo) || 0,
      tae: tipo === 'remunerada' ? parseFloat(tae) || 0 : 0,
      icono,
      ticker: tipo === 'inversion' ? ticker : '',
      capitalInvertido: tipo === 'inversion' ? parseFloat(saldo) || 0 : 0,
      precioPromedio: tipo === 'inversion' ? 1 : 1
    }

    agregarCuenta(nuevaCuenta)
    
    setNombre('')
    setTipo('banco')
    setSaldo('')
    setTae('')
    setTicker('')
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
            placeholder="Nombre (Ej: XTB, Trade Republic...)" 
            value={nombre} onChange={e => setNombre(e.target.value)} required 
          />
          
          <select 
            className="w-full bg-surface border border-border-subtle rounded-lg px-4 py-3 text-text-main"
            value={tipo} onChange={e => setTipo(e.target.value)}
          >
            <option value="banco">Banco / Efectivo</option>
            <option value="inversion">Inversión (Acciones/ETF)</option>
            <option value="remunerada">Cuenta Ahorro (Remunerada)</option>
          </select>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase mb-1.5 ml-1">Saldo (€)</label>
              <input 
                type="number" step="0.01" 
                className="w-full bg-surface border border-border-subtle rounded-lg px-4 py-3 text-text-main" 
                placeholder="0.00" 
                value={saldo} onChange={e => setSaldo(e.target.value)} required 
              />
            </div>
            
            {tipo === 'remunerada' && (
              <div>
                <label className="block text-[10px] font-bold text-brand-500 uppercase mb-1.5 ml-1">Interés TAE (%)</label>
                <input 
                  type="number" step="0.01" 
                  className="w-full bg-surface border border-brand-500/30 rounded-lg px-4 py-3 text-text-main focus:border-brand-500 outline-hidden" 
                  placeholder="4.00" 
                  value={tae} onChange={e => setTae(e.target.value)} required 
                />
              </div>
            )}
          </div>

          {tipo === 'inversion' && (
            <input 
              className="w-full bg-surface border border-brand-500/30 rounded-lg px-4 py-3 text-text-main" 
              placeholder="Ticker (Ej: VUSA.L o SPY.US)" 
              value={ticker} onChange={e => setTicker(e.target.value)} required
            />
          )}

          <button type="submit" className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-lg transition-colors mt-2">
            Crear Cuenta
          </button>
        </form>
      </div>
    </div>
  )
}