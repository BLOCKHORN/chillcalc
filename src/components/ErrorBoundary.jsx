import React from 'react'
import { Info, RefreshCcw } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-app flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-8 text-danger/50 border border-white/5">
            <Info size={40} />
          </div>
          <h1 className="text-3xl font-bold text-text-main mb-3 tracking-tight">Ups, algo ha fallado</h1>
          <p className="text-text-muted text-[15px] font-medium max-w-xs leading-relaxed">
            La terminal ha detectado una anomalía inesperada en el sistema.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-10 btn-primary flex items-center gap-3"
          >
            <RefreshCcw size={18} /> Reiniciar Sistema
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
