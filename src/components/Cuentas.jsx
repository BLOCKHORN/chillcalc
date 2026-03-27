import { useState, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { Building2, CreditCard, Banknote, LineChart, Wallet, Settings2, Trash2, Globe, RefreshCw } from 'lucide-react'
import ModalCuenta from './ModalCuenta'
import ModalEditarCuenta from './ModalEditarCuenta'
import ModalEliminarCuenta from './ModalEliminarCuenta'

const formatoEuros = (num) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(num || 0)

export default function Cuentas() {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [cuentaEditando, setCuentaEditando] = useState(null)
  const [cuentaEliminando, setCuentaEliminando] = useState(null)
  const [cargandoMercado, setCargandoMercado] = useState(false)
  
  const cuentas = useStore(state => state.cuentas)
  const actualizarPreciosMercado = useStore(state => state.actualizarPreciosMercado)

  const handleSincronizar = async () => {
    if (cargandoMercado) return
    setCargandoMercado(true)
    try {
      await actualizarPreciosMercado()
    } catch (error) {
      console.error("Fallo en sincronización:", error)
    } finally {
      setCargandoMercado(false)
    }
  }

  const getIcon = useCallback((icono) => {
    const props = { size: 24, className: "text-text-muted" }
    switch(icono) {
      case 'bank': return <Building2 {...props} />
      case 'card': return <CreditCard {...props} />
      case 'cash': return <Banknote {...props} />
      case 'chart': return <LineChart size={24} className="text-brand-400" />
      default: return <Wallet {...props} />
    }
  }, [])

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main mb-1">Cuentas Activas</h2>
          <p className="text-sm text-text-muted">Gestiona tu liquidez y cartera</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={handleSincronizar}
            disabled={cargandoMercado}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold bg-surface-solid border border-border-subtle text-text-main hover:bg-surface transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={cargandoMercado ? 'animate-spin' : ''} />
            {cargandoMercado ? '...' : 'Sincronizar Mercado'}
          </button>
          <button onClick={() => setModalAbierto(true)} className="btn-primary text-white flex-1 sm:flex-none">Nueva Cuenta</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cuentas.map(c => {
          const esInversion = c.tipo === 'inversion'
          const esRemunerada = c.tipo === 'remunerada'
          
          const valSaldo = Number(c.saldo || 0)
          const valInvertido = Number(c.capitalInvertido || 0)
          const valTae = Number(c.tae || 0)
          
          const beneficio = esInversion ? (valSaldo - valInvertido) : 0
          const pct = esInversion && valInvertido > 0 ? (beneficio / valInvertido) * 100 : 0
          
          const gananciaAnual = esRemunerada ? (valSaldo * (valTae / 100)) : 0
          const gananciaMensual = gananciaAnual / 12

          return (
            <div key={c.id} className="card flex flex-col justify-between min-h-40 group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-surface-solid rounded-lg">
                    {getIcon(c.icono)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-main">{c.nombre}</h3>
                    <span className="text-[10px] uppercase tracking-wider text-text-muted">
                      {esRemunerada ? 'Cuenta Ahorro' : c.tipo}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setCuentaEditando(c.id)} 
                    className="p-2 text-text-muted hover:text-text-main hover:bg-surface-solid rounded-lg transition-colors"
                  >
                    <Settings2 size={16} />
                  </button>
                  <button 
                    onClick={() => setCuentaEliminando(c.id)} 
                    className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div>
                <p className="text-2xl font-bold text-text-main">{formatoEuros(valSaldo)}</p>
                
                {esInversion && (
                  <div className="mt-3 space-y-2 pt-3 border-t border-border-subtle">
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
                      <span className="text-text-muted">Rentabilidad Total</span>
                      <span className={beneficio > 0.01 ? 'text-brand-400' : beneficio < -0.01 ? 'text-danger' : 'text-text-muted'}>
                        {beneficio > 0.01 ? '+' : ''}{formatoEuros(beneficio)} ({pct.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold p-2 bg-brand-500/5 rounded-md border border-brand-500/10">
                      <span className="text-text-muted flex items-center gap-1 font-black">
                        <Globe size={10} className="text-brand-500" /> Precio Mercado
                      </span>
                      <span className="text-text-main font-black">{formatoEuros(c.precioActual || c.precioPromedio)}</span>
                    </div>
                  </div>
                )}

                {esRemunerada && (
                  <div className="mt-3 pt-3 border-t border-border-subtle flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-brand-400 text-[10px] font-bold uppercase">+{valTae.toFixed(2)}% TAE</span>
                      <div className="flex gap-2 text-[10px] font-bold">
                        <span className="text-text-muted uppercase">Bruto Estimado</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-text-main text-xs font-semibold">+{formatoEuros(gananciaMensual)} <span className="text-[10px] text-text-muted font-normal">/ mes</span></span>
                      <span className="text-text-main text-xs font-semibold">+{formatoEuros(gananciaAnual)} <span className="text-[10px] text-text-muted font-normal">/ año</span></span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <ModalCuenta isOpen={modalAbierto} onClose={() => setModalAbierto(false)} />
      {cuentaEditando && (
        <ModalEditarCuenta isOpen={true} cuentaId={cuentaEditando} onClose={() => setCuentaEditando(null)} />
      )}
      {cuentaEliminando && (
        <ModalEliminarCuenta isOpen={true} cuentaId={cuentaEliminando} onClose={() => setCuentaEliminando(null)} />
      )}
    </div>
  )
}