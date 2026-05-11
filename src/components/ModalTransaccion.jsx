import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { X, Loader2, Calendar, Euro, FileText, Tag, CreditCard, ArrowLeftRight, ShieldCheck, Zap } from 'lucide-react'

const PALETA_COLORES = {
  slate: { bg: 'bg-slate-500', pill: 'text-slate-400 bg-white/5 border-white/10' },
  orange: { bg: 'bg-orange-500', pill: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  amber: { bg: 'bg-amber-500', pill: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  yellow: { bg: 'bg-yellow-500', pill: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  emerald: { bg: 'bg-brand-emerald', pill: 'text-brand-emerald bg-brand-emerald/10 border-brand-emerald/20' },
  cyan: { bg: 'bg-cyan-500', pill: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
  sky: { bg: 'bg-sky-500', pill: 'text-sky-400 bg-sky-400/10 border-sky-400/20' },
  blue: { bg: 'bg-blue-500', pill: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  indigo: { bg: 'bg-indigo-500', pill: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' },
  purple: { bg: 'bg-purple-500', pill: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  pink: { bg: 'bg-pink-500', pill: 'text-pink-400 bg-pink-400/10 border-pink-400/20' },
  rose: { bg: 'bg-rose-500', pill: 'text-rose-400 bg-rose-400/10 border-rose-400/20' },
  red: { bg: 'bg-red-500', pill: 'text-red-500 bg-red-500/10 border-red-500/20' },
  brand: { bg: 'bg-brand-emerald', pill: 'text-brand-emerald bg-brand-emerald/10 border-brand-emerald/20' }
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
    if (isOpen) {
      document.body.classList.add('modal-open-hide-nav');
    } else {
      document.body.classList.remove('modal-open-hide-nav');
    }
    return () => document.body.classList.remove('modal-open-hide-nav');
  }, [isOpen]);

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
      const cuentaFav = cuentas.find(c => c.favorita === true)
      const idInicial = cuentaFav ? cuentaFav.id : (cuentas[0]?.id || '')
      setCuentaId(idInicial)
      setCuentaDestinoId(cuentas.length > 1 ? (cuentas.find(c => String(c.id) !== String(idInicial))?.id || cuentas[1].id) : '')
      setCategoria(categorias[0]?.nombre || '')
      setFecha(new Date().toISOString().split('T')[0])
      setPrecioCompra('')
    }
  }, [editarDatos, isOpen, cuentas, categorias, tipoInicial])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!monto || parseFloat(monto) <= 0 || cargando) return
    if (tipo === 'transferencia' && cuentaId === cuentaDestinoId) {
      alert("La entidad de origen y destino deben ser distintas.")
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
        precioCompra: precioCompra ? parseFloat(precioCompra) : null
      }

      if (editarDatos) await editarTransaccion(editarDatos.id, datosTx)
      else await agregarTransaccion(datosTx)
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-surface-solid border-t sm:border border-border-subtle rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-apple">
        
        <div className="flex justify-between items-center p-8 border-b border-border-subtle bg-text-main/[0.01]">
          <div>
            <h3 className="text-2xl font-bold text-text-main tracking-tight">
              {editarDatos ? 'Modificar Registro' : 'Nueva Operación'}
            </h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mt-1">
              {editarDatos ? 'Protocolo de Edición' : 'Sincronización de Capital'}
            </p>
          </div>
          <button onClick={onClose} className="p-3 text-text-muted hover:text-text-main bg-text-main/5 rounded-full transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-10 overflow-y-auto no-scrollbar">
          
          {/* Selector de Tipo (Compacto Apple) */}
          <div className="flex p-1 bg-text-main/5 border border-border-subtle rounded-2xl">
            {['gasto', 'ingreso', 'transferencia'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${tipo === t ? 'bg-text-main text-bg-app shadow-lg' : 'text-text-muted hover:text-text-main'}`}
              >
                {t === 'transferencia' ? 'Traspaso' : t}
              </button>
            ))}
          </div>

          <div className="space-y-10">
            {/* Monto Imponente */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                <Zap size={14} className="text-brand-emerald" /> Cuantía Atómica
              </label>
              <div className="relative group">
                <input
                  type="number" step="0.01" value={monto} autoFocus
                  onChange={(e) => setMonto(e.target.value)}
                  className="w-full bg-text-main/[0.02] border border-border-subtle rounded-2xl px-6 py-5 text-text-main text-4xl font-black focus:outline-none focus:border-brand-emerald transition-all shadow-inner"
                  placeholder="0.00" required
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-text-muted font-bold text-xl">€</span>
              </div>
            </div>

            {/* Concepto */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em] px-2">Identificador / Concepto</label>
              <input
                type="text" value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full bg-text-main/[0.02] border border-border-subtle rounded-xl px-6 py-4 text-text-main text-lg font-bold focus:outline-none focus:border-text-main transition-all shadow-sm"
                placeholder={tipo === 'transferencia' ? 'Origen -> Destino' : 'Descripción del flujo...'}
              />
            </div>

            {/* Categorías (Pills) */}
            {tipo !== 'transferencia' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">Etiqueta de Clasificación</label>
                  {categorias.length > 8 && (
                    <span className="text-[9px] font-black text-brand-emerald uppercase tracking-widest bg-brand-emerald/10 px-2 py-1 rounded-md">
                      Desliza para ver más
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2.5 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar py-1">
                  {categorias.map(cat => {
                    const isSelected = categoria === cat.nombre
                    return (
                      <button
                        key={cat.id} type="button"
                        onClick={() => setCategoria(cat.nombre)}
                        className={`px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all border ${isSelected ? 'bg-text-main text-bg-app border-text-main shadow-xl' : 'bg-text-main/5 border-border-subtle text-text-muted hover:text-text-main'}`}
                      >
                        <span className="mr-2">{cat.emoji}</span>
                        {cat.nombre}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Cuentas (Nodos) */}
            <div className="space-y-4">
               <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em] px-2">Punto de Sincronización</label>
               {tipo === 'transferencia' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface-solid border border-border-subtle flex items-center justify-center text-text-muted z-10 hidden sm:flex">
                       <ArrowLeftRight size={14} />
                    </div>
                    <select value={cuentaId} onChange={(e) => setCuentaId(e.target.value)} className="w-full bg-text-main/[0.02] border border-border-subtle rounded-xl p-4 text-[14px] font-bold text-text-main outline-none appearance-none">
                       {cuentas.map(c => <option key={c.id} value={c.id}>DE: {c.nombre}</option>)}
                    </select>
                    <select value={cuentaDestinoId} onChange={(e) => setCuentaDestinoId(e.target.value)} className="w-full bg-text-main/[0.02] border border-border-subtle rounded-xl p-4 text-[14px] font-bold text-text-main outline-none appearance-none">
                       {cuentas.map(c => <option key={c.id} value={c.id}>PARA: {c.nombre}</option>)}
                    </select>
                  </div>
               ) : (
                  <select value={cuentaId} onChange={(e) => setCuentaId(e.target.value)} className="w-full bg-text-main/[0.02] border border-border-subtle rounded-xl p-4 text-[15px] font-bold text-text-main outline-none appearance-none">
                    {cuentas.map(c => <option key={c.id} value={c.id}>{c.nombre} (Saldo actual)</option>)}
                  </select>
               )}
            </div>

            {/* Fecha */}
            <div className="space-y-4">
              <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em] px-2">Marca Temporal</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-full bg-text-main/[0.02] border border-border-subtle rounded-xl p-4 text-[15px] font-bold text-text-main outline-none" />
            </div>
          </div>

          <div className="mt-6 pb-4">
            <button 
              type="submit" disabled={cargando}
              className="w-full btn-primary py-5 rounded-2xl text-[15px] font-bold shadow-2xl flex items-center justify-center gap-4 transition-all"
            >
              {cargando ? <Loader2 size={20} className="animate-spin" /> : <><ShieldCheck size={20} strokeWidth={2.5} /> {editarDatos ? 'Actualizar Protocolo' : 'Confirmar Operación'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
