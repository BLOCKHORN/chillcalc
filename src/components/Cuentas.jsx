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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-0 px-1 md:px-0">
      
      {/* Header optimizado para móvil */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-2">
        <div className="w-full text-center md:text-left">
          <h2 className="text-3xl md:text-2xl font-black md:font-bold text-text-main mb-1 tracking-tighter md:tracking-normal">
            Cuentas Activas
          </h2>
          <p className="text-[10px] md:text-sm text-text-muted uppercase font-bold tracking-widest">
            Gestiona tu liquidez y cartera
          </p>
        </div>

        {/* Botones en grid de 2 columnas para el pulgar */}
        <div className="grid grid-cols-2 md:flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleSincronizar}
            disabled={cargandoMercado}
            className="flex items-center justify-center gap-2 px-4 py-3 md:py-2 rounded-xl font-bold bg-surface-solid border border-border-subtle text-text-main active:scale-95 transition-all text-sm"
          >
            <RefreshCw size={18} className={cargandoMercado ? 'animate-spin' : ''} />
            <span className="truncate">{cargandoMercado ? '...' : 'Sincronizar'}</span>
          </button>
          <button 
            onClick={() => setModalAbierto(true)} 
            className="w-full md:w-auto bg-brand-500 hover:bg-brand-600 text-white py-3 md:py-2 px-6 rounded-xl active:scale-95 transition-all text-sm font-bold shadow-lg shadow-brand-500/20"
          >
            Nueva Cuenta
          </button>
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
            <div key={c.id} className="card flex flex-col justify-between min-h-[160px] group relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-surface-solid rounded-lg border border-border-subtle">
                    {getIcon(c.icono)}
                  </div>
                  <div>
                    <h3 className="font-bold text-text-main leading-tight">{c.nombre}</h3>
                    <span className="text-[9px] uppercase font-black tracking-widest text-text-muted">
                      {esRemunerada ? 'Cuenta Ahorro' : c.tipo}
                    </span>
                  </div>
                </div>
                
                {/* Botones de acción: siempre visibles en móvil, hover en escritorio */}
                <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setCuentaEditando(c.id)} 
                    className="p-2.5 md:p-2 text-text-muted hover:text-text-main bg-surface-solid md:bg-transparent rounded-lg border border-border-subtle md:border-transparent"
                  >
                    <Settings2 size={18} />
                  </button>
                  <button 
                    onClick={() => setCuentaEliminando(c.id)} 
                    className="p-2.5 md:p-2 text-text-muted hover:text-danger bg-surface-solid md:bg-transparent rounded-lg border border-border-subtle md:border-transparent"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div>
                <p className="text-2xl md:text-3xl font-black text-text-main tracking-tight">
                  {formatoEuros(valSaldo)}
                </p>
                
                {esInversion && (
                  <div className="mt-4 space-y-2 pt-3 border-t border-border-subtle">
                    <div className="flex justify-between items-center text-[10px] uppercase font-black">
                      <span className="text-text-muted">Rendimiento</span>
                      <span className={beneficio > 0.01 ? 'text-brand-400' : beneficio < -0.01 ? 'text-danger' : 'text-text-muted'}>
                        {beneficio > 0.01 ? '+' : ''}{formatoEuros(beneficio)} ({pct.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                )}

                {esRemunerada && (
                  <div className="mt-4 pt-3 border-t border-border-subtle flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-brand-400 text-[10px] font-black uppercase">
                        +{valTae.toFixed(2)}% TAE
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-text-muted uppercase font-bold">Mensual</span>
                        <span className="text-text-main text-sm font-bold">+{formatoEuros(gananciaMensual)}</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[9px] text-text-muted uppercase font-bold">Anual</span>
                        <span className="text-text-main text-sm font-bold">+{formatoEuros(gananciaAnual)}</span>
                      </div>
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