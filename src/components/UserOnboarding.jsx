import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function UserOnboarding() {
  const [JoyrideComponent, setJoyrideComponent] = useState(null)
  const [run, setRun] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false)

  useEffect(() => {
    setMounted(true)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)

    import('react-joyride')
      .then((mod) => {
        const comp = mod.Joyride || mod.default || mod
        if (comp) setJoyrideComponent(() => comp)
      })
      .catch((err) => console.error(err))

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!mounted || !JoyrideComponent) return
    
    const init = async () => {
      if (localStorage.getItem('onboarding_visto') === 'true') return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const { data } = await supabase
        .from('perfiles')
        .select('tutorial_completado')
        .eq('id', user.id)
        .maybeSingle()

      if (data && data.tutorial_completado === false) {
        setRun(true)
      }
    }
    init()
  }, [mounted, JoyrideComponent])

  const saveStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const { data, error } = await supabase
      .from('perfiles')
      .update({ tutorial_completado: true })
      .eq('id', user.id)
      .select()

    if (error) {
      console.error(error.message)
      return
    }

    if (data && data.length > 0) {
      localStorage.setItem('onboarding_visto', 'true')
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
    { target: 'body', content: 'Bienvenido. Vamos a configurar tu cuenta.', placement: 'center' },
    { target: isMobile ? '.tour-mobile-header' : '.tour-desktop-logo', title: 'Dashboard', content: 'Resumen de tu patrimonio.' },
    { target: isMobile ? '.tour-mobile-cuentas' : '.tour-desktop-cuentas', title: 'Cartera', content: 'Tus cuentas bancarias.' },
    { target: isMobile ? '.tour-mobile-transacciones' : '.tour-desktop-transacciones', title: 'Movimientos', content: 'Tus ingresos y gastos.' },
    { target: 'body', title: 'Listo', content: 'Tutorial finalizado.', placement: 'center' }
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