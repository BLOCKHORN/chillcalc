import { LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function MobileHeader() {
  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 md:hidden bg-surface-solid/80 backdrop-blur-md border-b border-border-subtle px-4 py-3 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg border border-border-subtle/50 overflow-hidden shrink-0 shadow-sm shadow-brand-500/20">
          <img src="/apple-touch-icon.png" alt="EasyPocket" className="w-full h-full object-cover" />
        </div>
        <span className="font-black text-lg tracking-tight text-text-main">
          EasyPocket<span className="text-brand-500">.</span>
        </span>
      </div>

      <button 
        onClick={cerrarSesion}
        className="p-2 text-text-muted hover:text-danger transition-colors"
      >
        <LogOut size={20} />
      </button>
    </header>
  )
}