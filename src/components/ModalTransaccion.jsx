import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { X, Loader2 } from 'lucide-react'

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
    if (editarDatos) {
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
    } else {
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
        cuentaId: isNaN(cuentaId) ? cuentaId : parseInt(cuentaId),
        categoria,
        tipo,
        fecha: `${dia}/${mes}/${año}`
      }

      if (mostrarPrecioCompra && parseFloat(precioCompra) > 0) {
        datosTx.precioCompra = parseFloat(precioCompra)
      } else {
        datosTx.precioCompra = null
      }

      if (editarDatos) {
        await editarTransaccion(editarDatos.id, datosTx)
      } else {
        await agregarTransaccion({ ...datosTx, id: Date.now() })
      }
      
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-solid border border-border-subtle rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-border-subtle">
          <h3 className="text-xl font-bold text-white">
            {editarDatos ? 'Editar Operación' : 'Registrar Operación'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-surface rounded-lg border border-border-subtle">
            <button
              type="button"
              disabled={cargando}
              onClick={() => setTipo('gasto')}
              className={`py-2 text-sm font-semibold rounded-md transition-all ${tipo === 'gasto' ? 'bg-danger text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Gasto
            </button>
            <button
              type="button"
              disabled={cargando}
              onClick={() => setTipo('ingreso')}
              className={`py-2 text-sm font-semibold rounded-md transition-all ${tipo === 'ingreso' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Ingreso
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Monto (€)</label>
            <input
              type="number"
              step="0.01"
              value={monto}
              disabled={cargando}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full bg-surface border border-border-subtle rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors disabled:opacity-50"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Descripción</label>
            <input
              type="text"
              value={desc}
              disabled={cargando}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full bg-surface border border-border-subtle rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors disabled:opacity-50"
              placeholder="Ej: Nómina, Compra SPY..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Cuenta</label>
              <select
                value={cuentaId}
                disabled={cargando}
                onChange={(e) => setCuentaId(e.target.value)}
                className="w-full bg-surface border border-border-subtle rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500 appearance-none disabled:opacity-50"
              >
                {cuentas.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Categoría</label>
              <select
                value={categoria}
                disabled={cargando}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full bg-surface border border-border-subtle rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500 appearance-none disabled:opacity-50"
              >
                {categorias.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {mostrarPrecioCompra && (
            <div className="animate-in slide-in-from-top-2">
              <label className="block text-xs font-bold text-brand-400 uppercase tracking-widest mb-2">Precio Compra (€/partic.)</label>
              <input
                type="number"
                step="0.01"
                value={precioCompra}
                disabled={cargando}
                onChange={(e) => setPrecioCompra(e.target.value)}
                className="w-full bg-surface border border-brand-500/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors disabled:opacity-50"
                placeholder="Ej: 510.50"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Fecha</label>
            <input
              type="date"
              value={fecha}
              disabled={cargando}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full bg-surface border border-border-subtle rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500 disabled:opacity-50"
            />
          </div>

          <button 
            type="submit" 
            disabled={cargando}
            className={`mt-4 w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${tipo === 'gasto' ? 'bg-danger hover:bg-red-600 text-white' : 'bg-brand-600 hover:bg-brand-500 text-white'} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {cargando && <Loader2 size={18} className="animate-spin" />}
            {cargando ? 'Procesando...' : `${editarDatos ? 'Guardar Cambios' : 'Registrar ' + (tipo === 'gasto' ? 'Gasto' : 'Ingreso')}`}
          </button>
        </form>
      </div>
    </div>
  )
}