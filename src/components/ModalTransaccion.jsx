import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { X, Loader2, Calendar, Euro, FileText, Tag, CreditCard } from 'lucide-react'

// Helper para asignar emojis y colores a las categorías comunes
const getCategoryStyle = (catName) => {
  const normalized = catName.toLowerCase()
  if (normalized.includes('alimentación') || normalized.includes('comida') || normalized.includes('restaurante')) {
    return { emoji: '🍽️', colorClass: 'text-orange-400 bg-orange-400/10 border-orange-400/20' }
  }
  if (normalized.includes('vivienda') || normalized.includes('alquiler') || normalized.includes('hogar')) {
    return { emoji: '🏠', colorClass: 'text-blue-400 bg-blue-400/10 border-blue-400/20' }
  }
  if (normalized.includes('transporte') || normalized.includes('coche') || normalized.includes('gasolina')) {
    return { emoji: '🚗', colorClass: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' }
  }
  if (normalized.includes('ocio') || normalized.includes('entretenimiento') || normalized.includes('suscripciones')) {
    return { emoji: '🎮', colorClass: 'text-purple-400 bg-purple-400/10 border-purple-400/20' }
  }
  if (normalized.includes('salud') || normalized.includes('farmacia') || normalized.includes('médico')) {
    return { emoji: '❤️', colorClass: 'text-rose-400 bg-rose-400/10 border-rose-400/20' }
  }
  if (normalized.includes('educación') || normalized.includes('cursos') || normalized.includes('libros')) {
    return { emoji: '📚', colorClass: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' }
  }
  if (normalized.includes('compras') || normalized.includes('ropa') || normalized.includes('regalos')) {
    return { emoji: '🛍️', colorClass: 'text-pink-400 bg-pink-400/10 border-pink-400/20' }
  }
  if (normalized.includes('nómina') || normalized.includes('salario') || normalized.includes('sueldo')) {
    return { emoji: '💰', colorClass: 'text-brand-400 bg-brand-500/10 border-brand-500/20' }
  }
  if (normalized.includes('inversión') || normalized.includes('dividendos') || normalized.includes('intereses')) {
    return { emoji: '📈', colorClass: 'text-sky-400 bg-sky-400/10 border-sky-400/20' }
  }
  // Fallback para categorías personalizadas
  return { emoji: '🏷️', colorClass: 'text-text-muted bg-surface border-border-subtle' }
}

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-surface-solid border-t sm:border border-border-subtle rounded-t-3xl sm:rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden">
        
        {/* Cabecera */}
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
          
          {/* Toggle Ingreso/Gasto */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-surface rounded-2xl border border-border-subtle/50 shadow-inner">
            <button
              type="button"
              disabled={cargando}
              onClick={() => setTipo('gasto')}
              className={`py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${tipo === 'gasto' ? 'bg-danger text-white shadow-lg shadow-danger/20 scale-[1.02]' : 'text-text-muted hover:text-text-main hover:bg-surface-solid/50'}`}
            >
              Gasto
            </button>
            <button
              type="button"
              disabled={cargando}
              onClick={() => setTipo('ingreso')}
              className={`py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${tipo === 'ingreso' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20 scale-[1.02]' : 'text-text-muted hover:text-text-main hover:bg-surface-solid/50'}`}
            >
              Ingreso
            </button>
          </div>

          <div className="space-y-6">
            
            {/* Monto */}
            <div className="relative group">
              <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 px-1">
                <Euro size={12} className={tipo === 'ingreso' ? 'text-brand-400' : 'text-danger'} /> 
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

            {/* Descripción */}
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
                placeholder="Ej. Café, Nómina, Amazon..."
              />
            </div>

            {/* Categorías Visuales (Pills) */}
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 px-1">
                <Tag size={12} /> Categoría
              </label>
              <div className="flex flex-wrap gap-2.5">
                {categorias.map(cat => {
                  const style = getCategoryStyle(cat)
                  const isSelected = categoria === cat
                  return (
                    <button
                      key={cat}
                      type="button"
                      disabled={cargando}
                      onClick={() => setCategoria(cat)}
                      className={`
                        flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border
                        ${isSelected 
                          ? `${style.colorClass} shadow-md scale-105 border-opacity-100` 
                          : 'bg-surface text-text-muted border-border-subtle hover:bg-surface-solid hover:border-border-subtle/80 hover:text-text-main'}
                      `}
                    >
                      <span className="text-sm">{style.emoji}</span>
                      <span className={isSelected ? 'text-current' : ''}>{cat}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Cuenta y Fecha */}
            <div className="grid grid-cols-2 gap-4">
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
                  {cuentas.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

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

            {/* Input Dinámico Inversiones */}
            {mostrarPrecioCompra && (
              <div className="animate-in slide-in-from-top-2 fade-in duration-300 bg-brand-500/5 p-4 rounded-2xl border border-brand-500/20">
                <label className="flex items-center gap-2 text-[10px] font-black text-brand-400 uppercase tracking-widest mb-2 px-1">
                  Precio Compra (€/u)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={precioCompra}
                  disabled={cargando}
                  onChange={(e) => setPrecioCompra(e.target.value)}
                  className="w-full bg-surface border border-brand-500/30 rounded-xl px-4 py-3.5 text-text-main text-sm font-bold focus:outline-none focus:border-brand-500 transition-all shadow-inner"
                  placeholder="Precio por acción/cripto"
                />
              </div>
            )}
          </div>

          {/* Botón de Confirmación */}
          <div className="mt-4 pb-2">
            <button 
              type="submit" 
              disabled={cargando}
              className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 active:scale-95 border ${tipo === 'gasto' ? 'bg-danger/10 text-danger border-danger/20 hover:bg-danger/20' : 'bg-brand-500/10 text-brand-400 border-brand-500/20 hover:bg-brand-500/20'} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {cargando ? <Loader2 size={20} className="animate-spin" /> : editarDatos ? 'Guardar Cambios' : 'Confirmar Operación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}