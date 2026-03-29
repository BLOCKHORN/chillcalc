import { useState } from 'react'
import { useStore } from '../store/useStore'
import { CalendarClock, Plus, Trash2, Check, AlertCircle, CreditCard, X } from 'lucide-react'

const formatoEuros = (num) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(num || 0)

export default function Suscripciones() {
  const { suscripciones, cuentas, categorias, agregarSuscripcion, eliminarSuscripcion, pagarSuscripcion } = useStore()
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  
  const [form, setForm] = useState({
    nombre: '',
    monto: '',
    frecuencia: 'mensual',
    proximoCobro: '',
    cuentaId: '',
    categoria: ''
  })

  const hoy = new Date()
  const fechaHoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre || !form.monto || !form.proximoCobro || !form.cuentaId || !form.categoria) return
    
    await agregarSuscripcion(form)
    setForm({ nombre: '', monto: '', frecuencia: 'mensual', proximoCobro: '', cuentaId: '', categoria: '' })
    setMostrarFormulario(false)
  }

  const procesarPago = async (id) => {
    if(confirm('Confirmas el pago de esta suscripcion? Se restara de tu cuenta y se actualizara la fecha.')) {
      await pagarSuscripcion(id)
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 px-1 md:px-0 relative w-full">
      <header className="mb-10 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 pt-2">
        <div>
          <p className="text-[10px] md:text-xs font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
            <CalendarClock size={14} className="text-brand-400" />
            Pagos Recurrentes
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none text-text-main">
            Suscripciones
          </h1>
        </div>
        
        <button 
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold bg-brand-500 text-white shadow-lg shadow-brand-500/20 active:scale-95 transition-all text-xs uppercase tracking-widest w-full sm:w-auto"
        >
          {mostrarFormulario ? <X size={18} strokeWidth={3} /> : <Plus size={18} strokeWidth={3} />}
          <span>{mostrarFormulario ? 'Cancelar' : 'Nueva Suscripcion'}</span>
        </button>
      </header>

      {mostrarFormulario && (
        <form onSubmit={handleSubmit} className="bg-surface-solid/40 backdrop-blur-md border border-border-subtle/50 rounded-3xl p-6 shadow-xl mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <label className="text-[10px] font-black uppercase text-text-muted mb-2 block tracking-widest">Servicio</label>
            <input 
              value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})}
              className="w-full bg-surface border border-border-subtle rounded-2xl px-5 py-4 text-sm font-bold text-text-main focus:border-brand-500 outline-none" 
              placeholder="Netflix, Gimnasio, Alquiler..." 
            />
          </div>
          
          <div>
            <label className="text-[10px] font-black uppercase text-text-muted mb-2 block tracking-widest">Monto</label>
            <input 
              type="number" step="0.01" 
              value={form.monto} onChange={e => setForm({...form, monto: e.target.value})}
              className="w-full bg-surface border border-border-subtle rounded-2xl px-5 py-4 text-sm font-bold text-text-main focus:border-brand-500 outline-none" 
              placeholder="0.00" 
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-text-muted mb-2 block tracking-widest">Proximo Cobro</label>
            <input 
              type="date" 
              value={form.proximoCobro} onChange={e => setForm({...form, proximoCobro: e.target.value})}
              className="w-full bg-surface border border-border-subtle rounded-2xl px-5 py-4 text-sm font-bold text-text-main focus:border-brand-500 outline-none" 
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-text-muted mb-2 block tracking-widest">Frecuencia</label>
            <select 
              value={form.frecuencia} onChange={e => setForm({...form, frecuencia: e.target.value})}
              className="w-full bg-surface border border-border-subtle rounded-2xl px-5 py-4 text-[11px] font-black text-text-main outline-none uppercase tracking-widest focus:border-brand-500"
            >
              <option value="mensual">Mensual</option>
              <option value="anual">Anual</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-text-muted mb-2 block tracking-widest">Categoria</label>
            <select 
              value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}
              className="w-full bg-surface border border-border-subtle rounded-2xl px-5 py-4 text-[11px] font-black text-text-main outline-none uppercase tracking-widest focus:border-brand-500"
            >
              <option value="">Seleccionar...</option>
              {categorias.map(c => <option key={c.nombre} value={c.nombre}>{c.nombre}</option>)}
            </select>
          </div>

          <div className="col-span-1 md:col-span-2 mb-2">
            <label className="text-[10px] font-black uppercase text-text-muted mb-2 block tracking-widest">Cuenta de cobro</label>
            <select 
              value={form.cuentaId} onChange={e => setForm({...form, cuentaId: e.target.value})}
              className="w-full bg-surface border border-border-subtle rounded-2xl px-5 py-4 text-[11px] font-black text-text-main outline-none uppercase tracking-widest focus:border-brand-500"
            >
              <option value="">Cuenta de donde se restara...</option>
              {cuentas.filter(c => c.tipo !== 'inversion').map(c => <option key={c.id} value={c.id}>{c.nombre} ({formatoEuros(c.saldo)})</option>)}
            </select>
          </div>

          <button 
            type="submit" 
            className="col-span-1 md:col-span-2 w-full bg-brand-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-brand-500/20 active:scale-95 transition-all"
          >
            Guardar Suscripcion
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {suscripciones.map(sub => {
          const cuenta = cuentas.find(c => c.id === sub.cuenta_id)
          const pendiente = sub.proximo_cobro <= fechaHoyStr
          
          return (
            <div key={sub.id} className={`bg-surface-solid/40 backdrop-blur-md border rounded-3xl p-6 shadow-xl shadow-black/5 flex flex-col transition-all text-left relative overflow-hidden ${pendiente ? 'border-danger/50 bg-danger/5' : 'border-border-subtle/50 hover:border-brand-500/30 hover:-translate-y-1'}`}>
              
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl border shadow-sm ${pendiente ? 'bg-danger/10 text-danger border-danger/20' : 'bg-surface text-brand-400 border-border-subtle'}`}>
                  <CreditCard size={24} strokeWidth={2.5} />
                </div>
                <button onClick={() => { if(confirm('Borrar esta suscripcion?')) eliminarSuscripcion(sub.id) }} className="text-text-muted hover:text-danger p-2 active:scale-90 transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h3 className="text-xl font-black text-text-main tracking-tight line-clamp-1">{sub.nombre}</h3>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">{cuenta?.nombre || 'Cuenta eliminada'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-text-main">{formatoEuros(sub.monto)}</p>
                  <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-1">/{sub.frecuencia}</p>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-border-subtle/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {pendiente ? <AlertCircle size={14} className="text-danger" /> : <CalendarClock size={14} className="text-brand-400" />}
                  <span className={`text-[10px] font-black uppercase tracking-widest ${pendiente ? 'text-danger' : 'text-text-muted'}`}>
                    {sub.proximo_cobro.split('-').reverse().join('/')}
                  </span>
                </div>
                
                {pendiente && (
                  <button onClick={() => procesarPago(sub.id)} className="bg-danger text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 active:scale-95 transition-all shadow-lg shadow-danger/20">
                    <Check size={14} strokeWidth={3} /> Pagar
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {suscripciones.length === 0 && (
          <div className="col-span-full bg-surface-solid/40 backdrop-blur-md border-2 border-dashed border-border-subtle/50 rounded-3xl p-12 text-center flex flex-col items-center justify-center mt-4">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-4 text-text-muted/30">
              <CalendarClock size={40} strokeWidth={2} />
            </div>
            <p className="text-text-main text-lg font-black uppercase tracking-tight mb-2">Sin suscripciones</p>
            <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest max-w-sm">Registra tus gastos recurrentes para no perder el control de los cobros automaticos.</p>
          </div>
        )}
      </div>
    </div>
  )
}