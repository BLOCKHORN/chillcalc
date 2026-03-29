import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { useStore } from './store/useStore'
import MainLayout from './layouts/MainLayout'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import Cuentas from './components/Cuentas'
import Transacciones from './components/Transacciones'
import Objetivos from './components/Objetivos'
import CompartirGastos from './components/CompartirGastos'
import Suscripciones from './components/Suscripciones'
import BottomNav from './components/BottomNav'
import VistaPublicaSplit from './components/VistaPublicaSplit'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tokenPublico, setTokenPublico] = useState(null)
  
  const vistaActual = useStore(state => state.vistaActual)
  const tema = useStore(state => state.tema)

  useEffect(() => {
    document.documentElement.classList.toggle('light-mode', tema === 'light')

    // 1. INTERCEPTOR DE ENLACES PÚBLICOS
    const path = window.location.pathname
    if (path.startsWith('/split/')) {
      const token = path.replace('/split/', '')
      if (token) {
        setTokenPublico(token)
        setLoading(false)
        return // Cortamos aquí para que no siga pidiendo login
      }
    }

    // 2. FLUJO NORMAL DE AUTENTICACIÓN
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      if (session) useStore.getState().cargarDatosNube()
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) useStore.getState().cargarDatosNube()
    })

    // Motor automático: Actualiza la bolsa cada 1 hora (3600000 ms)
    const intervalId = setInterval(() => {
      const { cuentas, actualizarPreciosMercado } = useStore.getState()
      if (cuentas.some(c => c.tipo === 'inversion')) {
        actualizarPreciosMercado()
      }
    }, 3600000)

    return () => {
      subscription?.unsubscribe()
      clearInterval(intervalId)
    }
  }, [tema])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-app flex items-center justify-center text-text-muted font-mono text-xs tracking-widest uppercase">
        Estableciendo conexión segura...
      </div>
    )
  }

  // 3. MODO INVITADO: Si hay un token en la URL, mostramos la vista pública directamente
  if (tokenPublico) {
    return <VistaPublicaSplit token={tokenPublico} />
  }

  // 4. MODO PRIVADO: Si no hay sesión, pedimos login
  if (!session) {
    return <Auth />
  }

  const renderVista = () => {
    switch (vistaActual) {
      case 'dashboard': return <Dashboard />
      case 'cuentas': return <Cuentas />
      case 'transacciones': return <Transacciones />
      case 'suscripciones': return <Suscripciones />
      case 'objetivos': return <Objetivos />
      case 'compartir': return <CompartirGastos />
      default: return <Dashboard />
    }
  }

  return (
    <>
      <MainLayout>
        {renderVista()}
      </MainLayout>
      <BottomNav />
    </>
  )
}

export default App