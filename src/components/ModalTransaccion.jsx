import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { X, Loader2, Calendar, Euro, FileText, Tag, CreditCard } from 'lucide-react'

export default function ModalTransaccion({ isOpen, onClose, editarDatos, tipoInicial }) {
  const { cuentas, categorias, agregarTransaccion, editarTransaccion } = useStore()
  
  const [tipo, setTipo] = useState('gasto')
  const [monto, setMonto] = useState('')
  const [desc, setDesc] = useState('')
  const [cuentaId, setCuentaId] = useState('')
  const [categoria, setCategoria] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [precioCompra, setPrecioCompra] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    if (editarDatos && isOpen) {
      setTipo(editarDatos.tipo)
      setMonto(editarDatos.monto)
      setDesc(editarDatos.desc || '')
      setCuentaId(editarDatos.cuentaId)
      setCategoria(editarDatos.categoria)
      setPrecioCompra(editarDatos.precioCompra || '')
      
      if (editarDatos.fecha) {
        const [d, m, a] = editarDatos.fecha.split('/')
        setFecha(`${a}-${m}-${d}`)
      }
    } else if (isOpen) {
      setTipo(tipoInicial || 'gasto')
      setMonto('')
      setDesc('')
      setCuentaId(cuentas[0]?.id || '')
      setCategoria(categorias[0] || '')
      setFecha(new Date().toISOString().split('T')[0])
      setPrecioCompra('')
    }
  }, [editarDatos, isOpen, cuentas, categorias, tipoInicial])

  if (!isOpen) return null

  const cuentaSeleccionada = cuentas.find(c => String(c.id) === String(cuentaId))
  const mostrarPrecioCompra = cuentaSeleccionada?.tipo === 'inversion' && tipo === 'ingreso'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!monto || parseFloat(monto) <= 0 || cargando) return

    setCargando(true)

    try {
      const [año, mes, dia] = fecha.split('-')
      
      const datosTx = {
        desc: desc.trim(),
        monto: parseFloat(monto),
        cuentaId: cuentaId,
        categoria,
        tipo,
        fecha: `${dia}/${mes}/${año}`,
        precioCompra: mostrarPrecioCompra ? parseFloat(precioCompra) : null
      }

      if (editarDatos) {
        await editarTransaccion(editarDatos.id, datosTx)
      } else {
        await agregarTransaccion(datosTx)
      }
      
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-solid border-t sm:border border-border-subtle rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden">
        
        <div className="flex justify-between items-center p-6 border-b border-border-subtle shrink-0">
          <div>
            <h3 className="text-xl font-bold text-text-main">
              {editarDatos ? 'Editar Operación' : 'Nueva Operación'}
            </h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mt-1">
              {editarDatos ? 'Modificar registro' : 'Registrar flujo de caja'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-main transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-2 p-1 bg-surface-solid rounded-xl border border-border-subtle shadow-inner">
            <button
              type="button"
              disabled={cargando}
              onClick={() => setTipo('gasto')}
              className={`py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${tipo === 'gasto' ? 'bg-danger text-white shadow-lg shadow-danger/20' : 'text-text-muted hover:text-text-main'}`}
            >
              Gasto
            </button>
            <button
              type="button"
              disabled={cargando}
              onClick={() => setTipo('ingreso')}
              className={`py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${tipo === 'ingreso' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-text-muted hover:text-text-main'}`}
            >
              Ingreso
            </button>
          </div>

          <div className="space-y-4">
            <div className="relative group">
              <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 px-1">
                <Euro size={12} className="text-brand-400" /> Monto (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={monto}
                disabled={cargando}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full bg-surface-solid border border-border-subtle rounded-xl px-4 py-4 text-text-main text-lg font-bold focus:outline-none focus:border-brand-500 transition-all disabled:opacity-50 placeholder:text-text-muted/30"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 px-1">
                <FileText size={12} /> Descripción
              </label>
              <input
                type="text"
                value={desc}
                disabled={cargando}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full bg-surface-solid border border-border-subtle rounded-xl px-4 py-3.5 text-text-main text-sm font-medium focus:outline-none focus:border-brand-500 transition-all disabled:opacity-50"
                placeholder="Nómina, Compra, Inversión..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 px-1">
                  <CreditCard size={12} /> Cuenta
                </label>
                <select
                  value={cuentaId}
                  disabled={cargando}
                  onChange={(e) => setCuentaId(e.target.value)}
                  className="w-full bg-surface-solid border border-border-subtle rounded-xl px-3 py-3.5 text-text-main text-xs font-bold focus:outline-none focus:border-brand-500 appearance-none disabled:opacity-50"
                >
                  {cuentas.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 px-1">
                  <Tag size={12} /> Categoría
                </label>
                <select
                  value={categoria}
                  disabled={cargando}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full bg-surface-solid border border-border-subtle rounded-xl px-3 py-3.5 text-text-main text-xs font-bold focus:outline-none focus:border-brand-500 appearance-none disabled:opacity-50"
                >
                  {categorias.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {mostrarPrecioCompra && (
              <div className="animate-in slide-in-from-top-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-brand-400 uppercase tracking-widest mb-2 px-1">
                  Precio Compra (€/u)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={precioCompra}
                  disabled={cargando}
                  onChange={(e) => setPrecioCompra(e.target.value)}
                  className="w-full bg-surface-solid border border-brand-500/30 rounded-xl px-4 py-3.5 text-text-main text-sm font-bold focus:outline-none focus:border-brand-500 transition-all"
                  placeholder="Precio por unidad"
                />
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 px-1">
                <Calendar size={12} /> Fecha de Operación
              </label>
              <input
                type="date"
                value={fecha}
                disabled={cargando}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full bg-surface-solid border border-border-subtle rounded-xl px-4 py-3.5 text-text-main text-sm font-bold focus:outline-none focus:border-brand-500 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="mt-4 pb-4">
            <button 
              type="submit" 
              disabled={cargando}
              className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 active:scale-95 ${tipo === 'gasto' ? 'bg-danger hover:bg-red-600 text-white shadow-lg shadow-danger/20' : 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/20'} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {cargando ? <Loader2 size={20} className="animate-spin" /> : editarDatos ? 'Guardar Cambios' : 'Confirmar Operación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}