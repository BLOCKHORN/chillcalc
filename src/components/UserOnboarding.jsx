import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function UserOnboarding() {
  const [Joyride, setJoyride] = useState(null)
  const [STATUS, setSTATUS] = useState(null)
  const [run, setRun] = useState(false)
  const saved = useRef(false)

  useEffect(() => {
    import('react-joyride').then((mod) => {
      const JoyrideComp = mod.default ?? mod.Joyride ?? mod
      const StatusObj = mod.STATUS
      setJoyride(() => JoyrideComp)
      setSTATUS(StatusObj)
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

  const handleJoyrideCallback = async (data) => {
    const { status, type, action } = data
    console.log('🎯 Joyride:', type, status, action)

    const finished = STATUS
      ? status === STATUS.FINISHED || status === STATUS.SKIPPED
      : status === 'finished' || status === 'skipped'

    if (finished && !saved.current) {
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
    { target: 'body', content: 'Bienvenido a EasyPocket. Te hacemos un tour rápido.', placement: 'center', disableBeacon: true },
    { target: 'body', title: 'Dashboard', content: 'Aquí ves el resumen de tu patrimonio neto.', placement: 'center', disableBeacon: true },
    { target: 'body', title: 'Cartera', content: 'Gestiona tus cuentas bancarias.', placement: 'center', disableBeacon: true },
    { target: 'body', title: 'Movimientos', content: 'Consulta todos tus ingresos y gastos.', placement: 'center', disableBeacon: true },
    { target: 'body', title: '¡Listo!', content: 'Ya puedes empezar a usar EasyPocket.', placement: 'center', disableBeacon: true },
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
      callback={handleJoyrideCallback}
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