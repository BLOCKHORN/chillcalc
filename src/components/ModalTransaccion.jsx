import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { X, Loader2, Calendar, Euro, FileText, Tag, CreditCard, ArrowRightLeft } from 'lucide-react'

const PALETA_COLORES = {
  slate: { bg: 'bg-slate-500', pill: 'text-slate-400 bg-slate-400/10 border-slate-400/20' },
  orange: { bg: 'bg-orange-500', pill: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  amber: { bg: 'bg-amber-500', pill: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  yellow: { bg: 'bg-yellow-500', pill: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  emerald: { bg: 'bg-emerald-500', pill: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  cyan: { bg: 'bg-cyan-500', pill: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
  sky: { bg: 'bg-sky-500', pill: 'text-sky-400 bg-sky-400/10 border-sky-400/20' },
  blue: { bg: 'bg-blue-500', pill: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  indigo: { bg: 'bg-indigo-500', pill: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' },
  purple: { bg: 'bg-purple-500', pill: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  pink: { bg: 'bg-pink-500', pill: 'text-pink-400 bg-pink-400/10 border-pink-400/20' },
  rose: { bg: 'bg-rose-500', pill: 'text-rose-400 bg-rose-400/10 border-rose-400/20' },
  red: { bg: 'bg-red-500', pill: 'text-red-500 bg-red-500/10 border-red-500/20' },
  brand: { bg: 'bg-brand-500', pill: 'text-brand-400 bg-brand-500/10 border-brand-500/20' }
}

export default function ModalTransaccion({ isOpen, onClose, editarDatos, tipoInicial }) {
  const { cuentas, categorias, agregarTransaccion, editarTransaccion } = useStore()
  
  const [tipo, setTipo] = useState('gasto')
  const [monto, setMonto] = useState('')
  const [desc, setDesc] = useState('')
  const [cuentaId, setCuentaId] = useState('')
  const [cuentaDestinoId, setCuentaDestinoId] = useState('')
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
      setCuentaDestinoId(editarDatos.cuentaDestinoId || (cuentas.length > 1 ? cuentas[1].id : ''))
      setCategoria(typeof editarDatos.categoria === 'object' ? editarDatos.categoria.nombre : editarDatos.categoria)
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
      setCuentaDestinoId(cuentas.length > 1 ? cuentas[1].id : '')
      setCategoria(categorias[0]?.nombre || '')
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
    
    if (tipo === 'transferencia' && cuentaId === cuentaDestinoId) {
      alert("La cuenta de origen y destino no pueden ser la misma.")
      return
    }

    setCargando(true)

    try {
      const [año, mes, dia] = fecha.split('-')
      const datosTx = {
        desc: desc.trim(),
        monto: parseFloat(monto),
        cuentaId: cuentaId,
        cuentaDestinoId: tipo === 'transferencia' ? cuentaDestinoId : null,
        categoria: tipo === 'transferencia' ? 'Traspaso' : categoria,
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

  const getEstiloBotonSubmit = () => {
    if (tipo === 'gasto') return 'bg-danger/10 text-danger border-danger/20 hover:bg-danger/20'
    if (tipo === 'ingreso') return 'bg-brand-500/10 text-brand-400 border-brand-500/20 hover:bg-brand-500/20'
    return 'bg-sky-500/10 text-sky-400 border-sky-500/20 hover:bg-sky-500/20'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-surface-solid border-t sm:border border-border-subtle rounded-t-3xl sm:rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden">
        
        <div className="flex justify-between items-center p-6 border-b border-border-subtle shrink-0 bg-surface-solid/80 backdrop-blur-sm z-10">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-text-main tracking-tight">
              {editarDatos ? 'Editar Operación' : 'Nuevo Registro'}
            </h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mt-1">
              {editarDatos ? 'Modificar registro' : 'Registrar flujo de caja'}
            </p>
          </div>
          <button onClick={onClose} className="p-2.5 text-text-muted hover:text-text-main bg-surface rounded-xl border border-border-subtle transition-all active:scale-90">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar relative">
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-surface rounded-2xl border border-border-subtle/50 shadow-inner">
            <button
              type="button"
              disabled={cargando}
              onClick={() => setTipo('gasto')}
              className={`py-3 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl transition-all ${tipo === 'gasto' ? 'bg-danger text-white shadow-lg shadow-danger/20 scale-[1.02]' : 'text-text-muted hover:text-text-main hover:bg-surface-solid/50'}`}
            >
              Gasto
            </button>
            <button
              type="button"
              disabled={cargando}
              onClick={() => setTipo('ingreso')}
              className={`py-3 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl transition-all ${tipo === 'ingreso' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20 scale-[1.02]' : 'text-text-muted hover:text-text-main hover:bg-surface-solid/50'}`}
            >
              Ingreso
            </button>
            <button
              type="button"
              disabled={cargando}
              onClick={() => setTipo('transferencia')}
              className={`py-3 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl transition-all ${tipo === 'transferencia' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20 scale-[1.02]' : 'text-text-muted hover:text-text-main hover:bg-surface-solid/50'}`}
            >
              Traspaso
            </button>
          </div>

          <div className="space-y-6">
            <div className="relative group">
              <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 px-1">
                <Euro size={12} className={tipo === 'gasto' ? 'text-danger' : tipo === 'ingreso' ? 'text-brand-400' : 'text-sky-400'} /> 
                Cantidad
              </label>
              <input
                type="number"
                step="0.01"
                value={monto}
                disabled={cargando}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full bg-surface border border-border-subtle rounded-2xl px-5 py-4 text-text-main text-3xl font-black focus:outline-none focus:border-brand-500 transition-all disabled:opacity-50 placeholder:text-text-muted/30 shadow-inner"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 px-1">
                <FileText size={12} /> Concepto
              </label>
              <input
                type="text"
                value={desc}
                disabled={cargando}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-3.5 text-text-main text-sm font-bold focus:outline-none focus:border-brand-500 transition-all disabled:opacity-50 shadow-sm"
                placeholder={tipo === 'transferencia' ? 'Ej. Retirada cajero, Ahorro mensual...' : 'Ej. Café, Nómina, Amazon...'}
              />
            </div>

            {tipo !== 'transferencia' && (
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 px-1">
                  <Tag size={12} /> Categoría
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {categorias.map(cat => {
                    const isSelected = categoria === cat.nombre
                    const estiloPill = PALETA_COLORES[cat.color]?.pill || PALETA_COLORES['slate'].pill
                    return (
                      <button
                        key={cat.nombre}
                        type="button"
                        disabled={cargando}
                        onClick={() => setCategoria(cat.nombre)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${isSelected ? `${estiloPill} shadow-md scale-105 border-opacity-100` : 'bg-surface text-text-muted border-border-subtle hover:bg-surface-solid hover:border-border-subtle/80 hover:text-text-main'}`}
                      >
                        <span className="text-sm">{cat.emoji}</span>
                        <span>{cat.nombre}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {tipo === 'transferencia' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface rounded-2xl p-4 border border-border-subtle/50 relative">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-solid p-2 rounded-full border border-border-subtle text-text-muted hidden sm:block z-10">
                  <ArrowRightLeft size={16} />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 px-1">
                    Origen
                  </label>
                  <select
                    value={cuentaId}
                    disabled={cargando}
                    onChange={(e) => setCuentaId(e.target.value)}
                    className="w-full bg-surface-solid border border-border-subtle rounded-xl px-4 py-3.5 text-text-main text-xs font-bold focus:outline-none focus:border-sky-500 appearance-none disabled:opacity-50 shadow-sm uppercase tracking-wider"
                  >
                    {cuentas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 px-1">
                    Destino
                  </label>
                  <select
                    value={cuentaDestinoId}
                    disabled={cargando}
                    onChange={(e) => setCuentaDestinoId(e.target.value)}
                    className="w-full bg-surface-solid border border-border-subtle rounded-xl px-4 py-3.5 text-text-main text-xs font-bold focus:outline-none focus:border-sky-500 appearance-none disabled:opacity-50 shadow-sm uppercase tracking-wider"
                  >
                    {cuentas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 px-1">
                  <CreditCard size={12} /> Bóveda
                </label>
                <select
                  value={cuentaId}
                  disabled={cargando}
                  onChange={(e) => setCuentaId(e.target.value)}
                  className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-3.5 text-text-main text-xs font-bold focus:outline-none focus:border-brand-500 appearance-none disabled:opacity-50 shadow-sm uppercase tracking-wider"
                >
                  {cuentas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 px-1">
                <Calendar size={12} /> Fecha
              </label>
              <input
                type="date"
                value={fecha}
                disabled={cargando}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-3.5 text-text-main text-xs font-bold focus:outline-none focus:border-brand-500 disabled:opacity-50 shadow-sm uppercase tracking-wider"
              />
            </div>
          </div>

          <div className="mt-4 pb-2">
            <button 
              type="submit" 
              disabled={cargando}
              className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 active:scale-95 border ${getEstiloBotonSubmit()} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {cargando ? <Loader2 size={20} className="animate-spin" /> : editarDatos ? 'Guardar Cambios' : 'Confirmar Operación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}