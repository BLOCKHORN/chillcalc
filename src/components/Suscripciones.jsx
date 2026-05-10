import { useState } from 'react'
import { useStore } from '../store/useStore'
import { CalendarClock, Plus, Trash2, Check, AlertCircle, CreditCard, X, Wallet } from 'lucide-react'
import PrivacyValue from './PrivacyValue'

export default function Suscripciones() {
  const { suscripciones, cuentas, categorias, agregarSuscripcion, eliminarSuscripcion, pagarSuscripcion, formatCurrency, getBankLogo } = useStore()
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  
  const [form, setForm] = useState({
    nombre: '',
    monto: '',
    frecuencia: 'mensual',
    proximoCobro: '',
    cuentaId: '',
    categoria: ''
  })

  const [logoErrors, setLogoErrors] = useState({})

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
    if(confirm('¿Confirmas el pago de esta suscripción? Se restará de tu cuenta y se actualizará la fecha.')) {
      await pagarSuscripcion(id)
    }
  }

  return (
    <div className="pb-32 pt-12 px-8 max-w-7xl mx-auto animate-apple">
      <header className="mb-16 flex flex-col md:flex-row justify-between items-end gap-10">
        <div>
          <p className="text-[13px] font-semibold text-text-muted mb-2 tracking-tight uppercase">Pagos Recurrentes</p>
          <h1 className="text-7xl font-bold tracking-tight text-text-main">Suscripciones</h1>
        </div>
        
        <button 
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className={`px-8 py-4 rounded-xl font-bold text-[15px] transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl ${
            mostrarFormulario ? 'bg-surface-hover text-text-main border border-border-subtle' : 'bg-text-main text-bg-app'
          }`}
        >
          {mostrarFormulario ? <X size={20} /> : <Plus size={20} strokeWidth={2.5} />}
          <span>{mostrarFormulario ? 'Cerrar' : 'Nueva Suscripción'}</span>
        </button>
      </header>

      {mostrarFormulario && (
        <form onSubmit={handleSubmit} className="card !p-10 mb-16 grid grid-cols-1 md:grid-cols-12 gap-8 animate-apple">
          <div className="md:col-span-8 space-y-3">
            <label className="text-[11px] font-black uppercase text-text-muted tracking-[0.2em]">Nombre del Servicio</label>
            <input 
              value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})}
              className="w-full bg-white/5 border border-border-subtle rounded-xl p-5 text-[16px] font-bold text-text-main outline-none focus:border-white transition-all" 
              placeholder="Netflix, Spotify, Alquiler..." 
              required
            />
          </div>
          
          <div className="md:col-span-4 space-y-3">
            <label className="text-[11px] font-black uppercase text-text-muted tracking-[0.2em]">Costo Mensual (€)</label>
            <input 
              type="number" step="0.01" 
              value={form.monto} onChange={e => setForm({...form, monto: e.target.value})}
              className="w-full bg-white/5 border border-border-subtle rounded-xl p-5 text-[16px] font-bold text-text-main outline-none focus:border-white transition-all" 
              placeholder="0.00" 
              required
            />
          </div>

          <div className="md:col-span-4 space-y-3">
            <label className="text-[11px] font-black uppercase text-text-muted tracking-[0.2em]">Próximo Vencimiento</label>
            <input 
              type="date" 
              value={form.proximoCobro} onChange={e => setForm({...form, proximoCobro: e.target.value})}
              className="w-full bg-white/5 border border-border-subtle rounded-xl p-5 text-[16px] font-bold text-text-main outline-none focus:border-white transition-all" 
              required
            />
          </div>

          <div className="md:col-span-4 space-y-3">
            <label className="text-[11px] font-black uppercase text-text-muted tracking-[0.2em]">Frecuencia</label>
            <select 
              value={form.frecuencia} onChange={e => setForm({...form, frecuencia: e.target.value})}
              className="w-full bg-white/5 border border-border-subtle rounded-xl p-5 text-[15px] font-bold text-text-main outline-none focus:border-white transition-all appearance-none"
            >
              <option value="mensual">Mensual</option>
              <option value="anual">Anual</option>
            </select>
          </div>

          <div className="md:col-span-4 space-y-3">
            <label className="text-[11px] font-black uppercase text-text-muted tracking-[0.2em]">Categoría</label>
            <select 
              value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}
              className="w-full bg-white/5 border border-border-subtle rounded-xl p-5 text-[15px] font-bold text-text-main outline-none focus:border-white transition-all appearance-none"
              required
            >
              <option value="">Seleccionar...</option>
              {categorias.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
            </select>
          </div>

          <div className="md:col-span-12 space-y-3">
            <label className="text-[11px] font-black uppercase text-text-muted tracking-[0.2em]">Débito de Cuenta</label>
            <select 
              value={form.cuentaId} onChange={e => setForm({...form, cuentaId: e.target.value})}
              className="w-full bg-white/5 border border-border-subtle rounded-xl p-5 text-[15px] font-bold text-text-main outline-none focus:border-white transition-all appearance-none"
              required
            >
              <option value="">Seleccionar entidad...</option>
              {cuentas.filter(c => c.tipo !== 'inversion').map(c => <option key={c.id} value={c.id}>{c.nombre} ({formatCurrency(c.saldo)})</option>)}
            </select>
          </div>

          <div className="md:col-span-12">
            <button 
              type="submit" 
              className="w-full btn-primary py-5 rounded-xl font-bold text-[15px] shadow-2xl transition-all"
            >
              Confirmar Suscripción
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {suscripciones.map(sub => {
          const cuenta = cuentas.find(c => c.id === sub.cuenta_id)
          const pendiente = sub.proximo_cobro <= fechaHoyStr
          const logoUrl = getBankLogo(sub.nombre)
          const hasError = logoErrors[sub.id]
          
          return (
            <div key={sub.id} className={`card !p-0 overflow-hidden group flex flex-col transition-all ${pendiente ? 'border-danger/30' : 'hover:border-border-focus'}`}>
              <div className="p-10 flex-1">
                 <div className="flex justify-between items-start mb-12">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden">
                       {logoUrl && !hasError ? (
                         <img 
                           src={logoUrl} 
                           alt={sub.nombre} 
                           className="w-full h-full object-contain filter drop-shadow-md" 
                           onError={() => setLogoErrors(prev => ({ ...prev, [sub.id]: true }))}
                         />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-text-main opacity-20">
                            <CreditCard size={32} strokeWidth={1.5} />
                         </div>
                       )}
                    </div>
                    <button onClick={() => { if(confirm('¿Borrar esta suscripción?')) eliminarSuscripcion(sub.id) }} className="p-2 text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={18} />
                    </button>
                 </div>

                 <div className="mb-10">
                    <h3 className="text-2xl font-bold text-text-main tracking-tight line-clamp-1">{sub.nombre}</h3>
                    <p className="text-[12px] font-bold text-text-muted uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                       <Wallet size={12} className="text-brand-emerald" /> {cuenta?.nombre || 'Cuenta Desconectada'}
                    </p>
                 </div>

                 <div className="flex justify-between items-end">
                    <div>
                       <p className="text-3xl font-bold text-text-main tracking-tighter">
                          <PrivacyValue value={formatCurrency(sub.monto)} />
                       </p>
                       <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">/ {sub.frecuencia}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                      pendiente ? 'bg-danger/10 border-danger/20 text-danger animate-pulse' : 'bg-white/5 border-border-subtle text-text-muted'
                    }`}>
                       {sub.proximo_cobro.split('-').reverse().join('/')}
                    </div>
                 </div>
              </div>

              {pendiente && (
                <div className="p-1 border-t border-danger/10">
                  <button 
                    onClick={() => procesarPago(sub.id)} 
                    className="w-full py-4 bg-danger text-white font-bold text-[13px] uppercase tracking-[0.2em] hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <Check size={16} strokeWidth={3} /> Sincronizar Pago
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {suscripciones.length === 0 && (
          <div className="col-span-full card border-dashed !bg-transparent border-border-subtle/50 py-32 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-text-muted/20">
              <CalendarClock size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold text-text-main tracking-tight mb-4">No se detectan compromisos</h3>
            <p className="text-sm text-text-muted max-w-sm mx-auto leading-relaxed">Configura tus gastos recurrentes para monitorizar el flujo de caja y evitar cargos inesperados.</p>
          </div>
        )}
      </div>
    </div>
  )
}
