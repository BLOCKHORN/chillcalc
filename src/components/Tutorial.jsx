import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Tutorial() {
  const [JoyrideComponent, setJoyrideComponent] = useState(null)
  const [run, setRun] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false)

  useEffect(() => {
    setMounted(true)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)

    // IMPORTANTE: Según tu consola, el componente está en mod.Joyride
    import('react-joyride')
      .then((mod) => {
        const comp = mod.Joyride || mod.default || mod
        if (comp) {
          setJoyrideComponent(() => comp)
        }
      })
      .catch((err) => console.error("Error cargando joyride:", err))

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!mounted || !JoyrideComponent) return
    
    const init = async () => {
      // Si ya lo vio en esta sesión de navegador, no molestamos
      if (localStorage.getItem('tutorial_visto') === 'true') return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const { data } = await supabase
        .from('perfiles')
        .select('tutorial_completado')
        .eq('id', user.id)
        .maybeSingle()

      // Solo arrancamos si la BD dice explícitamente FALSE
      if (data && data.tutorial_completado === false) {
        setRun(true)
      }
    }
    init()
  }, [mounted, JoyrideComponent])

  const saveStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    // 1. Actualizamos Supabase
    const { error } = await supabase
      .from('perfiles')
      .update({ tutorial_completado: true })
      .eq('id', user.id)

    if (!error) {
      // 2. Guardamos en local para evitar parpadeos
      localStorage.setItem('tutorial_visto', 'true')
      setRun(false)
    }
  }

  const handleCallback = (data) => {
    const { status, action } = data
    if (['finished', 'skipped'].includes(status) || action === 'close') {
      saveStatus()
    }
  }

  if (!mounted || !JoyrideComponent) return null

  const steps = [
    { target: 'body', content: '¡Bienvenido! Vamos a configurar tu cuenta en 30 segundos.', placement: 'center' },
    { target: isMobile ? '.tour-mobile-header' : '.tour-desktop-logo', title: 'Dashboard', content: 'Resumen de tu patrimonio total.' },
    { target: isMobile ? '.tour-mobile-cuentas' : '.tour-desktop-cuentas', title: 'Cartera', content: 'Registra tus bancos y efectivo.' },
    { target: isMobile ? '.tour-mobile-transacciones' : '.tour-desktop-transacciones', title: 'Movimientos', content: 'Anota tus ingresos y gastos.' },
    { target: isMobile ? '.tour-mobile-suscripciones' : '.tour-desktop-suscripciones', title: 'Suscripciones', content: 'Controla tus pagos recurrentes.' },
    { target: isMobile ? '.tour-mobile-objetivos' : '.tour-desktop-objetivos', title: 'Objetivos', content: 'Tus metas de ahorro.' },
    { target: isMobile ? '.tour-mobile-compartir' : '.tour-desktop-compartir', title: 'Dividir Gastos', content: 'Cuentas con amigos o pareja.' },
    { target: 'body', title: '🏁 ¡Listo!', content: 'Crea tu primera cuenta para empezar.', placement: 'center' }
  ]

  const Joyride = JoyrideComponent

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleCallback}
      styles={{
        options: {
          primaryColor: '#10b981',
          backgroundColor: '#1c1c1f',
          textColor: '#ffffff',
          zIndex: 10000,
        },
        tooltip: { borderRadius: '16px', padding: '20px' }
      }}
      locale={{ back: 'Atrás', last: 'Finalizar', next: 'Siguiente', skip: 'Saltar' }}
    />
  )
}