import { useEffect, useState, useRef } from 'react'
import Joyride, { STATUS } from 'react-joyride'
import { supabase } from '../lib/supabase'

const stepsMobile = [
  {
    target: 'body',
    content: '¡Bienvenido a EasyPocket! En 30 segundos te enseñamos todo lo que necesitas saber.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '.tour-mobile-cuentas',
    title: '💳 Cuentas',
    content: 'Añade tus cuentas bancarias, efectivo o inversiones para tenerlo todo centralizado.',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '.tour-mobile-transacciones',
    title: '↔️ Transacciones',
    content: 'Registra y consulta todos tus ingresos y gastos con filtros avanzados.',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '.tour-mobile-suscripciones',
    title: '📅 Suscripciones',
    content: 'Controla tus pagos recurrentes y evita sorpresas a fin de mes.',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '.tour-mobile-objetivos',
    title: '🎯 Objetivos',
    content: 'Define metas de ahorro y haz seguimiento de tu progreso mes a mes.',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '.tour-mobile-compartir',
    title: '👥 Dividir Gastos',
    content: 'Divide gastos con amigos o pareja de forma sencilla y sin líos.',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: 'body',
    title: '🚀 ¡Todo listo!',
    content: 'Ya conoces EasyPocket. Empieza añadiendo tu primera cuenta.',
    placement: 'center',
    disableBeacon: true,
  },
]

const stepsDesktop = [
  {
    target: 'body',
    content: '¡Bienvenido a EasyPocket! En 30 segundos te enseñamos todo lo que necesitas saber.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '.tour-desktop-logo',
    title: '🏠 Tu panel financiero',
    content: 'Este es EasyPocket. Desde aquí controlas toda tu vida financiera en un solo lugar.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '.tour-desktop-dashboard',
    title: '📊 Dashboard',
    content: 'Consulta tu patrimonio neto, tendencias y resumen financiero en tiempo real.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '.tour-desktop-cuentas',
    title: '💳 Cuentas',
    content: 'Añade tus cuentas bancarias, efectivo o inversiones para tenerlo todo centralizado.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '.tour-desktop-transacciones',
    title: '↔️ Transacciones',
    content: 'Registra y consulta todos tus ingresos y gastos con filtros avanzados.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '.tour-desktop-suscripciones',
    title: '📅 Suscripciones',
    content: 'Controla tus pagos recurrentes y evita sorpresas a fin de mes.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '.tour-desktop-objetivos',
    title: '🎯 Objetivos',
    content: 'Define metas de ahorro y haz seguimiento de tu progreso mes a mes.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '.tour-desktop-compartir',
    title: '👥 Dividir Gastos',
    content: 'Divide gastos con amigos o pareja de forma sencilla y sin líos.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: 'body',
    title: '🚀 ¡Todo listo!',
    content: 'Ya conoces EasyPocket. Empieza añadiendo tu primera cuenta.',
    placement: 'center',
    disableBeacon: true,
  },
]

export default function UserOnboarding() {
  const [run, setRun] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const saved = useRef(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
    const { status } = data
    if ((status === STATUS.FINISHED || status === STATUS.SKIPPED) && !saved.current) {
      saved.current = true

      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user
      if (!user) return

      const { data: updateData, error } = await supabase
        .from('perfiles')
        .update({ tutorial_completado: true })
        .eq('id', user.id)
        .select()

      if (error) { saved.current = false; return }

      if (updateData && updateData.length > 0) {
        localStorage.setItem('onboarding_visto', 'true')
        setRun(false)
      } else {
        saved.current = false
      }
    }
  }

  return (
    <Joyride
      steps={isMobile ? stepsMobile : stepsDesktop}
      run={run}
      continuous
      showProgress
      showSkipButton
      disableScrolling
      spotlightClicks
      spotlightPadding={8}
      callback={handleCallback}
      floaterProps={{
        styles: {
          floater: { filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.5))' }
        }
      }}
      styles={{
        options: {
          primaryColor: '#10b981',
          backgroundColor: '#18181b',
          textColor: '#f4f4f5',
          overlayColor: 'rgba(0,0,0,0.72)',
          arrowColor: '#18181b',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '18px',
          padding: '24px',
          maxWidth: '320px',
          background: '#18181b',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
        },
        tooltipTitle: {
          fontSize: '15px',
          fontWeight: '800',
          color: '#10b981',
          marginBottom: '6px',
          letterSpacing: '-0.2px',
        },
        tooltipContent: {
          fontSize: '13.5px',
          lineHeight: '1.65',
          color: '#a1a1aa',
          padding: '0',
        },
        tooltipFooter: {
          marginTop: '18px',
          paddingTop: '14px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        },
        tooltipFooterSpacer: { flex: 1 },
        buttonNext: {
          backgroundColor: '#10b981',
          borderRadius: '9px',
          padding: '8px 18px',
          fontSize: '13px',
          fontWeight: '700',
          color: '#fff',
          border: 'none',
          boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
          cursor: 'pointer',
        },
        buttonBack: {
          color: '#71717a',
          fontSize: '13px',
          fontWeight: '600',
          marginRight: '6px',
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
          top: '14px',
          right: '14px',
          width: '14px',
          height: '14px',
        },
      }}
      locale={{
        back: '← Atrás',
        last: '¡Empezar! 🚀',
        next: 'Siguiente →',
        skip: 'Saltar tour',
        close: 'Cerrar',
      }}
    />
  )
}