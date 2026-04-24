import { useEffect, useState } from 'react'
import { Joyride, STATUS } from 'react-joyride'
import { supabase } from '../lib/supabase'

export default function Tutorial() {
  const [run, setRun] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const inicializar = async () => {
      // 1. Bloqueo inmediato si ya se marcó como hecho en este navegador
      if (localStorage.getItem('tutorial_visto')) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 2. Comprobación rápida en base de datos
      const { data } = await supabase
        .from('perfiles')
        .select('tutorial_completado')
        .eq('id', user.id)
        .single()

      if (data?.tutorial_completado === false) {
        setRun(true)
      }
    }
    inicializar()
  }, [])

  const terminarTutorial = async () => {
    // Marcamos en local al instante para que no vuelva a salir aunque la red falle
    localStorage.setItem('tutorial_visto', 'true')
    setRun(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('perfiles')
        .update({ tutorial_completado: true })
        .eq('id', user.id)
    }
  }

  const handleCallback = (data) => {
    const { status } = data
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      terminarTutorial()
    }
  }

  const steps = [
    {
      target: 'body',
      content: '¡Bienvenido a EasyPocket! 🚀 Vamos a configurar tu centro financiero en 30 segundos.',
      placement: 'center',
    },
    {
      target: isMobile ? '.tour-mobile-header' : '.tour-desktop-logo',
      title: '🏠 Dashboard',
      content: 'Tu resumen total de patrimonio.',
    },
    {
      target: isMobile ? '.tour-mobile-cuentas' : '.tour-desktop-cuentas',
      title: '💳 Cartera',
      content: 'Registra tus cuentas bancarias y efectivo.',
    },
    {
      target: isMobile ? '.tour-mobile-transacciones' : '.tour-desktop-transacciones',
      title: '💸 Movimientos',
      content: 'Anota tus ingresos y gastos diarios.',
    },
    {
      target: isMobile ? '.tour-mobile-suscripciones' : '.tour-desktop-suscripciones',
      title: '📅 Suscripciones',
      content: 'Controla tus pagos recurrentes.',
    },
    {
      target: isMobile ? '.tour-mobile-objetivos' : '.tour-desktop-objetivos',
      title: '🎯 Objetivos',
      content: 'Tus metas de ahorro.',
    },
    {
      target: isMobile ? '.tour-mobile-compartir' : '.tour-desktop-compartir',
      title: '👥 Dividir Gastos',
      content: 'Cuentas compartidas con amigos.',
    },
    {
      target: 'body',
      title: '🏁 ¡Listo!',
      content: 'Ya puedes empezar. Crea tu primera cuenta.',
      placement: 'center',
    }
  ]

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