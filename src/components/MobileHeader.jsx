import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function MobileHeader() {
  const navigate = useNavigate()

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 md:hidden bg-surface-solid/80 backdrop-blur-md border-b border-border-subtle px-4 py-3 flex justify-between items-center">
      
      <button 
        onClick={() => navigate('/dashboard')} 
        className="flex items-center gap-2 active:scale-95 transition-transform"
      >
        <div className="w-7 h-7 rounded-lg border border-border-subtle/50 overflow-hidden shrink-0 shadow-sm shadow-brand-500/20">
          <img src="/apple-touch-icon.png" alt="EasyPocket" className="w-full h-full object-cover" />
        </div>
        <span className="font-black text-lg tracking-tight text-text-main">
          easypocket<span className="text-brand-700">+</span>
        </span>
      </button>

      <button 
        onClick={cerrarSesion}
        className="p-2 text-text-muted hover:text-danger active:scale-90 transition-all"
      >
        <LogOut size={20} />
      </button>
    </header>
  )
}