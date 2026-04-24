import { useEffect, useState, useRef } from 'react'
import Joyride, { STATUS } from 'react-joyride'
import { supabase } from '../lib/supabase'

const steps = [
  { target: 'body', content: 'Bienvenido a EasyPocket. Te hacemos un tour rápido.', placement: 'center', disableBeacon: true },
  { target: 'body', title: 'Dashboard', content: 'Aquí ves el resumen de tu patrimonio neto.', placement: 'center', disableBeacon: true },
  { target: 'body', title: 'Cartera', content: 'Gestiona tus cuentas bancarias.', placement: 'center', disableBeacon: true },
  { target: 'body', title: 'Movimientos', content: 'Consulta todos tus ingresos y gastos.', placement: 'center', disableBeacon: true },
  { target: 'body', title: '¡Listo!', content: 'Ya puedes empezar a usar EasyPocket.', placement: 'center', disableBeacon: true },
]

export default function UserOnboarding() {
  const [run, setRun] = useState(false)
  const saved = useRef(false)

  useEffect(() => {
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
  }, [])

  const handleCallback = async (data) => {
    const { status, type, action } = data
    console.log('🎯 Joyride:', type, status, action)

    if ((status === STATUS.FINISHED || status === STATUS.SKIPPED) && !saved.current) {
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
      floaterProps={{
        styles: {
          floater: { filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.4))' }
        }
      }}
      styles={{
        options: {
          primaryColor: '#10b981',
          backgroundColor: '#18181b',
          textColor: '#f4f4f5',
          overlayColor: 'rgba(0, 0, 0, 0.75)',
          spotlightShadow: '0 0 0 9999px rgba(0,0,0,0.75)',
          arrowColor: '#18181b',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '20px',
          padding: '28px',
          maxWidth: '380px',
          background: 'linear-gradient(135deg, #1c1c1f 0%, #18181b 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(16,185,129,0.1)',
        },
        tooltipTitle: {
          fontSize: '17px',
          fontWeight: '800',
          color: '#10b981',
          marginBottom: '8px',
          letterSpacing: '-0.3px',
        },
        tooltipContent: {
          fontSize: '14px',
          lineHeight: '1.7',
          color: '#a1a1aa',
          padding: '0',
        },
        tooltipFooter: {
          marginTop: '20px',
          padding: '0',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '16px',
        },
        tooltipFooterSpacer: {
          flex: 1,
        },
        buttonNext: {
          backgroundColor: '#10b981',
          borderRadius: '10px',
          padding: '9px 20px',
          fontSize: '13px',
          fontWeight: '700',
          color: '#fff',
          border: 'none',
          boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
          cursor: 'pointer',
        },
        buttonBack: {
          color: '#71717a',
          fontSize: '13px',
          fontWeight: '600',
          marginRight: '8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        },
        buttonSkip: {
          color: '#52525b',
          fontSize: '12px',
          fontWeight: '500',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        },
        buttonClose: {
          color: '#52525b',
          width: '16px',
          height: '16px',
          top: '16px',
          right: '16px',
        },
      }}
      locale={{ back: 'Atrás', last: '¡Empezar! 🚀', next: 'Siguiente →', skip: 'Saltar' }}
    />
  )
}