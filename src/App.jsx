import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { useStore } from './store/useStore'
import MainLayout from './layouts/MainLayout'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import Cuentas from './components/Cuentas'
import Transacciones from './components/Transacciones'
import Objetivos from './components/Objetivos'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const vistaActual = useStore(state => state.vistaActual)
  const tema = useStore(state => state.tema)

  useEffect(() => {
    document.documentElement.classList.toggle('light-mode', tema === 'light')

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      if (session) useStore.getState().cargarDatosNube()
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) useStore.getState().cargarDatosNube()
    })

    return () => subscription.unsubscribe()
  }, [tema])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-app flex items-center justify-center text-text-muted font-mono text-xs tracking-widest uppercase">
        Estableciendo conexión segura...
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  const renderVista = () => {
    switch (vistaActual) {
      case 'dashboard': return <Dashboard />
      case 'cuentas': return <Cuentas />
      case 'transacciones': return <Transacciones />
      case 'objetivos': return <Objetivos />
      default: return <Dashboard />
    }
  }

  return (
    <MainLayout>
      {renderVista()}
    </MainLayout>
  )
}

export default App