import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { X, Globe, TrendingUp, Wallet, Percent } from 'lucide-react'

export default function ModalEditarCuenta({ isOpen, onClose, cuentaId }) {
  const { cuentas, editarCuenta } = useStore()
  const [nombre, setNombre] = useState('')
  const [saldo, setSaldo] = useState('')
  const [tae, setTae] = useState('')
  const [tipo, setTipo] = useState('')
  const [ticker, setTicker] = useState('')
  const [capitalInvertido, setCapitalInvertido] = useState('')
  const [precioPromedio, setPrecioPromedio] = useState('')

  useEffect(() => {
    const cuenta = cuentas.find(c => c.id === cuentaId)
    if (cuenta && isOpen) {
      setNombre(cuenta.nombre)
      setSaldo(cuenta.saldo)
      setTae(cuenta.tae || 0)
      setTipo(cuenta.tipo)
      setTicker(cuenta.ticker || '')
      setCapitalInvertido(cuenta.capitalInvertido || '')
      setPrecioPromedio(cuenta.precioPromedio || '')
    }
  }, [cuentaId, cuentas, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const datosActualizados = {
      nombre,
      saldo: parseFloat(saldo) || 0,
      tae: tipo === 'remunerada' ? parseFloat(tae) || 0 : 0,
      ticker: tipo === 'inversion' ? ticker.toUpperCase().trim() : null,
      capitalInvertido: tipo === 'inversion' ? parseFloat(capitalInvertido) || 0 : undefined,
      precioPromedio: tipo === 'inversion' ? parseFloat(precioPromedio) || 1 : undefined
    }

    editarCuenta(cuentaId, datosActualizados)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-solid border-t sm:border border-border-subtle rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden">
        
        <div className="flex justify-between items-center p-6 border-b border-border-subtle shrink-0">
          <div>
            <h3 className="text-xl font-bold text-text-main">Configurar Cuenta</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mt-1">Ajustes de {tipo}</p>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-main transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
          
          {/* Campo Nombre */}
          <div>
            <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 px-1">
              Nombre de la Cuenta
            </label>
            <input 
              className="w-full bg-surface-solid border border-border-subtle rounded-xl px-4 py-3.5 text-text-main font-medium focus:outline-none focus:border-brand-500 transition-all" 
              value={nombre} 
              onChange={e => setNombre(e.target.value)} 
              required
            />
          </div>

          {/* Sección Dinámica según tipo */}
          <div className="grid grid-cols-1 gap-4">
            
            {/* Saldo Actual (Para todos) */}
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 px-1">
                <Wallet size={12} /> Saldo Actual (€)
              </label>
              <input 
                type="number" step="0.01" 
                className="w-full bg-surface-solid border border-border-subtle rounded-xl px-4 py-3.5 text-text-main font-bold focus:outline-none focus:border-brand-500 transition-all" 
                value={saldo} 
                onChange={e => setSaldo(e.target.value)} 
                required
              />
            </div>

            {/* Campos de Inversión */}
            {tipo === 'inversion' && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black text-brand-400 uppercase tracking-widest mb-2 px-1">
                      <Globe size={12} /> Ticker
                    </label>
                    <input 
                      className="w-full bg-surface-solid border border-brand-500/30 rounded-xl px-4 py-3 text-text-main font-bold focus:border-brand-500 outline-none" 
                      value={ticker} 
                      onChange={e => setTicker(e.target.value)} 
                      placeholder="SPY, AAPL..."
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 px-1">
                      Precio Medio
                    </label>
                    <input 
                      type="number" step="0.01"
                      className="w-full bg-surface-solid border border-border-subtle rounded-xl px-4 py-3 text-text-main font-bold outline-none" 
                      value={precioPromedio} 
                      onChange={e => setPrecioPromedio(e.target.value)} 
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 px-1">
                    <TrendingUp size={12} /> Capital Invertido (€)
                  </label>
                  <input 
                    type="number" step="0.01"
                    className="w-full bg-surface-solid border border-border-subtle rounded-xl px-4 py-3 text-text-main font-bold outline-none" 
                    value={capitalInvertido} 
                    onChange={e => setCapitalInvertido(e.target.value)} 
                  />
                </div>
              </div>
            )}

            {/* Campo TAE para Remuneradas */}
            {tipo === 'remunerada' && (
              <div className="animate-in slide-in-from-top-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-brand-500 uppercase tracking-widest mb-2 px-1">
                  <Percent size={12} /> Interés TAE (%)
                </label>
                <input 
                  type="number" step="0.01" 
                  className="w-full bg-surface-solid border border-brand-500/30 rounded-xl px-4 py-3.5 text-text-main focus:border-brand-500 outline-none font-bold" 
                  value={tae} 
                  onChange={e => setTae(e.target.value)} 
                  required
                />
              </div>
            )}
          </div>

          <div className="bg-brand-500/5 border border-brand-500/10 rounded-xl p-4 mt-2">
            <p className="text-[10px] text-brand-400 font-bold leading-relaxed">
              ⚠️ Al guardar cambios, el sistema recalculará la rentabilidad basándose en el ticker y el capital invertido proporcionados.
            </p>
          </div>

          <button type="submit" className="w-full bg-brand-500 hover:bg-brand-600 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl transition-all shadow-lg shadow-brand-500/20 active:scale-95 mb-6 sm:mb-0">
            Guardar Configuración
          </button>
        </form>
      </div>
    </div>
  )
}