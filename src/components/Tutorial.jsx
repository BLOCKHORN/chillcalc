import { useEffect, useState } from 'react'
import { Joyride, STATUS } from 'react-joyride'
import { supabase } from '../lib/supabase'

export default function Tutorial() {
  const [run, setRun] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const verificarTutorial = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('perfiles')
        .select('tutorial_completado')
        .eq('id', user.id)
        .single()

      if (data && data.tutorial_completado === false) {
        setTimeout(() => setRun(true), 1000)
      }
    }
    verificarTutorial()
  }, [])

  const handleJoyrideCallback = async (data) => {
    const { status } = data
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('perfiles').update({ tutorial_completado: true }).eq('id', user.id)
      }
    }
  }

  const steps = [
    {
      target: isMobile ? '.tour-mobile-header' : '.tour-desktop-logo',
      content: '¡Bienvenido a EasyPocket! Vamos a configurar tu centro de mando financiero en 3 pasos.',
      disableBeacon: true,
      placement: 'bottom',
    },
    {
      target: isMobile ? '.tour-mobile-cuentas' : '.tour-desktop-cuentas',
      content: 'Tu primer paso: Crea una Cuenta. Aquí registrarás tu banco o tu dinero en efectivo.',
      placement: isMobile ? 'top' : 'right',
    },
    {
      target: isMobile ? '.tour-mobile-transacciones' : '.tour-desktop-transacciones',
      content: 'Una vez creada tu cuenta, usa esta sección para anotar cada ingreso o gasto.',
      placement: isMobile ? 'top' : 'right',
    }
  ]

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      disableScrolling={false}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#10b981',
          backgroundColor: '#18181b',
          textColor: '#ffffff',
          arrowColor: '#18181b',
          overlayColor: 'rgba(0, 0, 0, 0.85)',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '16px',
          padding: '20px',
        },
        buttonNext: {
          fontWeight: 'bold',
          borderRadius: '8px',
        }
      }}
      locale={{
        back: 'Atrás',
        close: 'Cerrar',
        last: 'Empezar a usar',
        next: 'Siguiente',
        skip: 'Saltar'
      }}
    />
  )
}