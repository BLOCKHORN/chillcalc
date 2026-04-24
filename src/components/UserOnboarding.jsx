import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function UserOnboarding() {
  const [Joyride, setJoyride] = useState(null)
  const [STATUS, setSTATUS] = useState(null)
  const [run, setRun] = useState(false)
  const saved = useRef(false)

  useEffect(() => {
    import('react-joyride').then((mod) => {
      setJoyride(() => mod.default ?? mod.Joyride ?? mod)
      setSTATUS(mod.STATUS)
    })
  }, [])

  useEffect(() => {
    if (!Joyride) return

    const checkTutorial = async () => {
      if (localStorage.getItem('onboarding_visto') === 'true') return

      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user
      if (!user) return

      const { data } = await supabase
        .from('perfiles')
        .select('tutorial_completado')
        .eq('id', user.id)
        .maybeSingle()

      if (data?.tutorial_completado === false) {
        setRun(true)
      }
    }

    checkTutorial()
  }, [Joyride])

  const handleCallback = async (data) => {
    const { status, type, action } = data
    console.log('🎯 Joyride:', type, status, action)

    const isFinished = STATUS
      ? status === STATUS.FINISHED || status === STATUS.SKIPPED
      : status === 'finished' || status === 'skipped'

    if (isFinished && !saved.current) {
      saved.current = true
      console.log('💾 Guardando...')

      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user
      if (!user) return

      const { data: updateData, error } = await supabase
        .from('perfiles')
        .update({ tutorial_completado: true })
        .eq('id', user.id)
        .select()

      if (error) {
        console.error('❌ Error:', error.message)
        saved.current = false
        return
      }

      if (updateData && updateData.length > 0) {
        console.log('✅ Guardado:', updateData)
        localStorage.setItem('onboarding_visto', 'true')
        setRun(false)
      } else {
        console.warn('⚠️ RLS bloqueó el update')
        saved.current = false
      }
    }
  }

  if (!Joyride) return null

  const steps = [
    { target: 'body', content: '¡Bienvenido a EasyPocket! Te enseñamos todo en 30 segundos.', placement: 'center', disableBeacon: true },
    { target: '.tour-desktop-logo', title: '🏠 EasyPocket+', content: 'Este es tu panel de control. Desde aquí gestionas toda tu vida financiera.', placement: 'right', disableBeacon: true },
    { target: '.tour-desktop-dashboard', title: '📊 Dashboard', content: 'Consulta tu patrimonio neto y tus estadísticas financieras en tiempo real.', placement: 'right', disableBeacon: true },
    { target: '.tour-desktop-cuentas', title: '💳 Cuentas', content: 'Añade y gestiona tus cuentas bancarias, efectivo o inversiones.', placement: 'right', disableBeacon: true },
    { target: '.tour-desktop-transacciones', title: '↔️ Transacciones', content: 'Registra tus ingresos y gastos. Filtra y analiza todos tus movimientos.', placement: 'right', disableBeacon: true },
    { target: '.tour-desktop-suscripciones', title: '📅 Suscripciones', content: 'Controla todos tus pagos recurrentes y evita sorpresas a fin de mes.', placement: 'right', disableBeacon: true },
    { target: '.tour-desktop-objetivos', title: '🎯 Objetivos', content: 'Crea metas de ahorro y haz seguimiento de tu progreso.', placement: 'right', disableBeacon: true },
    { target: '.tour-desktop-compartir', title: '👥 Dividir Gastos', content: 'Divide gastos con amigos o pareja de forma fácil y sin líos.', placement: 'right', disableBeacon: true },
    { target: 'body', title: '🚀 ¡Todo listo!', content: 'Ya conoces EasyPocket. Empieza añadiendo tu primera cuenta.', placement: 'center', disableBeacon: true },
  ]

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      disableScrolling
      spotlightClicks
      callback={handleCallback}
      styles={{
        options: {
          primaryColor: '#10b981',
          backgroundColor: '#1c1c1f',
          textColor: '#ffffff',
          zIndex: 10000,
        },
        tooltip: { borderRadius: '16px', padding: '20px' },
      }}
      locale={{ back: 'Atrás', last: 'Finalizar', next: 'Siguiente', skip: 'Saltar' }}
    />
  )
}