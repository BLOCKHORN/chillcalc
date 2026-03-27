import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Command, Loader2 } from 'lucide-react'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [esRegistro, setEsRegistro] = useState(false)

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = esRegistro 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      alert(error.message)
    } else if (esRegistro) {
      alert('¡Registro casi listo! Revisa tu email para confirmar la cuenta.')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-app">
      <div className="card w-full max-w-md p-8 shadow-2xl border-brand-500/20">
        
        {/* Logo y Encabezado */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-brand-500/20">
            <Command size={24} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black text-text-main">
            ChillCalc<span className="text-brand-500">.</span>
          </h2>
          <p className="text-text-muted text-sm mt-2 text-center">
            Accede a tu terminal de gestión de capital
          </p>
        </div>
        
        {/* Formulario */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 ml-1">
              Email
            </label>
            <input
              type="email"
              placeholder="tu@email.com"
              className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-3 text-text-main focus:border-brand-500 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 ml-1">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-3 text-text-main focus:border-brand-500 outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn-primary w-full py-4 text-white font-bold flex items-center justify-center gap-2 mt-2 shadow-lg shadow-brand-500/10"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {esRegistro ? 'Crear mi cuenta' : 'Entrar al terminal'}
          </button>
        </form>
        
        {/* Toggle Registro/Login */}
        <button 
          onClick={() => setEsRegistro(!esRegistro)}
          className="text-text-muted text-xs mt-8 w-full hover:text-brand-400 transition-colors font-medium text-center"
        >
          {esRegistro 
            ? '¿Ya tienes acceso? Inicia sesión' 
            : '¿Nuevo en ChillCalc? Registra tu terminal aquí'}
        </button>
      </div>
    </div>
  )
}