import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom'
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
import PoliticaPrivacidad from './components/PoliticaPrivacidad'

function RutasPrivadas({ session, children }) {
  if (!session) return <Navigate to="/login" replace />
  return (
    <>
      <MainLayout>{children}</MainLayout>
      <BottomNav />
    </>
  )
}

function SplitEnrutador() {
  const { token } = useParams()
  return <VistaPublicaSplit token={token} />
}

function LandingEnrutador() {
  const navigate = useNavigate()
  return <Landing onAcceder={(dest) => navigate(dest === 'login' ? '/login' : '/dashboard')} />
}

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const tema = useStore(state => state.tema)

  useEffect(() => {
    document.documentElement.classList.toggle('light-mode', tema === 'light')

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) useStore.getState().cargarDatosNube()
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (session) useStore.getState().cargarDatosNube()
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

  return (
    <BrowserRouter>
      <Routes>
        {/* 1. RUTAS PÚBLICAS (Accesibles siempre) */}
        <Route path="/" element={session ? <Navigate to="/dashboard" replace /> : <LandingEnrutador />} />
        <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <Auth />} />
        <Route path="/split/:token" element={<SplitEnrutador />} />
        <Route path="/privacidad" element={<PoliticaPrivacidad />} />
        
        {/* 2. RUTAS PRIVADAS (Solo con sesión) */}
        <Route path="/dashboard" element={<RutasPrivadas session={session}><Dashboard /></RutasPrivadas>} />
        <Route path="/cuentas" element={<RutasPrivadas session={session}><Cuentas /></RutasPrivadas>} />
        <Route path="/transacciones" element={<RutasPrivadas session={session}><Transacciones /></RutasPrivadas>} />
        <Route path="/suscripciones" element={<RutasPrivadas session={session}><Suscripciones /></RutasPrivadas>} />
        <Route path="/objetivos" element={<RutasPrivadas session={session}><Objetivos /></RutasPrivadas>} />
        <Route path="/compartir" element={<RutasPrivadas session={session}><CompartirGastos /></RutasPrivadas>} />
        
        {/* 3. COMODÍN (Debe ir AL FINAL) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}