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
    // Retraso de 1 segundo para asegurar que la app cargó bien
    setTimeout(() => setRun(true), 1000)
  }, [])

  const handleJoyrideCallback = async (data) => {
    const { status } = data
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false)
    }
  }

  const steps = [
    {
      target: 'body',
      content: (
        <div className="text-left">
          <p className="font-bold text-lg mb-2 text-brand-400">¡Bienvenido a EasyPocket! 🚀</p>
          <p>Hemos diseñado esta herramienta para que tomes el control total de tu dinero. ¿Te enseñamos cómo funciona en 30 segundos?</p>
        </div>
      ),
      placement: 'center',
      locale: { next: '¡Empezar tutorial!' },
      disableBeacon: true,
    },
    {
      target: isMobile ? '.tour-mobile-header' : '.tour-desktop-logo',
      content: 'Este es tu centro de control. Desde aquí siempre puedes volver al inicio para ver tu patrimonio neto total actualizado.',
      title: '🏠 Inicio',
    },
    {
      target: isMobile ? '.tour-mobile-cuentas' : '.tour-desktop-cuentas',
      content: 'Aquí es donde ocurre la magia. Registra tus bancos, tarjetas o efectivo. Sin cuentas creadas, no hay datos que rastrear.',
      title: '💳 Cartera / Cuentas',
    },
    {
      target: isMobile ? '.tour-mobile-transacciones' : '.tour-desktop-transacciones',
      content: 'Anota cada gasto o ingreso al momento. Clasifícalos con etiquetas para saber exactamente en qué se te va el dinero a fin de mes.',
      title: '💸 Movimientos',
    },
    {
      target: 'body',
      content: '¡Todo listo! Ya puedes empezar a gestionar tus finanzas como un profesional. El primer paso lógico es crear tu primera cuenta.',
      title: '🏁 ¡A por ello!',
      locale: { last: 'Finalizar' }
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
          backgroundColor: '#1c1c1f',
          textColor: '#ffffff',
          arrowColor: '#1c1c1f',
          overlayColor: 'rgba(0, 0, 0, 0.85)',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '16px',
          padding: '24px',
        },
        buttonNext: {
          fontWeight: '800',
          borderRadius: '10px',
          padding: '10px 20px',
          textTransform: 'uppercase',
          fontSize: '12px'
        },
        buttonBack: {
          color: '#9ca3af',
          marginRight: '10px'
        }
      }}
      locale={{
        back: 'Atrás',
        close: 'Cerrar',
        last: 'Empezar',
        next: 'Siguiente',
        skip: 'Saltar'
      }}
    />
  )
}