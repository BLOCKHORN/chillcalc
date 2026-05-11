import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export default function GlobalToast() {
  const toast = useStore(state => state.toast)

  if (!toast) return null

  const config = {
    success: {
      icon: <CheckCircle2 size={18} className="text-emerald-400" />,
      bg: 'border-emerald-500/20 bg-emerald-500/5',
      text: 'text-emerald-50'
    },
    error: {
      icon: <AlertCircle size={18} className="text-danger" />,
      bg: 'border-danger/20 bg-danger/5',
      text: 'text-danger-50'
    },
    info: {
      icon: <Info size={18} className="text-brand-400" />,
      bg: 'border-brand-500/20 bg-brand-500/5',
      text: 'text-brand-50'
    }
  }[toast.type || 'info']

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-2xl ${config.bg}`}>
        {config.icon}
        <p className={`text-sm font-bold tracking-tight ${config.text}`}>
          {toast.mensaje}
        </p>
      </div>
    </div>
  )
}
