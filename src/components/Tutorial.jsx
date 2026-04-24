import { useEffect, useState } from 'react'
// IMPORTANTE: react-joyride normalmente se importa así (Joyride como default, STATUS como nombrado)
import Joyride, { STATUS } from 'react-joyride' 
import { supabase } from '../lib/supabase'

export default function Tutorial() {
  const [run, setRun] = useState(false)
  // Eliminamos el estado userId, ya no lo necesitamos
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const init = async () => {
      if (localStorage.getItem('tutorial_visto')) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('perfiles')
        .select('tutorial_completado')
        .eq('id', user.id)
        .single()

      if (data?.tutorial_completado === false) {
        setRun(true)
      }
    }
    init()
  }, [])

  // Quitamos useCallback. Ahora es una función asíncrona normal.
  const saveStatus = async () => {
    // 1. Pedimos el usuario fresco directamente a Supabase
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 2. Bloqueo local instantáneo
    localStorage.setItem('tutorial_visto', 'true')
    setRun(false)

    console.log("Enviando actualización a Supabase...")
    const { data, error } = await supabase
      .from('perfiles')
      .update({ tutorial_completado: true })
      .eq('id', user.id)
      .select()

    if (error) {
      console.error("ERROR DE SUPABASE:", error.message)
    } else {
      // OJO: Si aquí imprime 'Guardado exitoso: []', tienes que ir a 
      // Supabase -> Authentication -> Policies y permitir UPDATE en 'perfiles'
      console.log("Guardado exitoso:", data)
    }
  }

  const handleCallback = (data) => {
    const { status } = data
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      saveStatus()
    }
  }

  const steps = [
    {
      target: 'body',
      content: '¡Bienvenido! Vamos a configurar tu cuenta en 30 segundos.',
      placement: 'center',
    },
    {
      target: isMobile ? '.tour-mobile-header' : '.tour-desktop-logo',
      title: '🏠 Dashboard',
      content: 'Resumen de tu patrimonio total.',
    },
    {
      target: isMobile ? '.tour-mobile-cuentas' : '.tour-desktop-cuentas',
      title: '💳 Cartera',
      content: 'Registra tus bancos y efectivo.',
    },
    {
      target: isMobile ? '.tour-mobile-transacciones' : '.tour-desktop-transacciones',
      title: '💸 Movimientos',
      content: 'Anota tus ingresos y gastos.',
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
      content: 'Cuentas con amigos o pareja.',
    },
    {
      target: 'body',
      title: '🏁 ¡Listo!',
      content: 'Crea tu primera cuenta para empezar.',
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