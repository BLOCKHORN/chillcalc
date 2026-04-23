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
import Landing from './components/Landing'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tokenPublico, setTokenPublico] = useState(null)
  const [rutaActiva, setRutaActiva] = useState('landing')
  
  const vistaActual = useStore(state => state.vistaActual)
  const tema = useStore(state => state.tema)

  useEffect(() => {
    document.documentElement.classList.toggle('light-mode', tema === 'light')

    const path = window.location.pathname
    if (path.startsWith('/split/')) {
      const token = path.replace('/split/', '')
      if (token) {
        setTokenPublico(token)
        setLoading(false)
        return
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      if (session) useStore.getState().cargarDatosNube()
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (session) {
        useStore.getState().cargarDatosNube()
        if (event === 'SIGNED_IN') {
          setRutaActiva('app')
        }
      } else {
        setRutaActiva('landing')
      }
    })

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

  if (tokenPublico) {
    return <VistaPublicaSplit token={tokenPublico} />
  }

  if (rutaActiva === 'landing') {
    return <Landing onAcceder={(destino) => setRutaActiva(destino === 'login' ? 'auth' : 'app')} />
  }

  if (rutaActiva === 'auth') {
    if (session) {
      setRutaActiva('app')
      return null
    }
    return <Auth />
  }

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