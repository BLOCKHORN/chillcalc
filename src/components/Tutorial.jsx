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

      const { data, error } = await supabase
        .from('perfiles')
        .select('tutorial_completado')
        .eq('id', user.id)
        .maybeSingle()

      if (error) console.error("❌ Error leyendo perfil:", error.message)

      if (data && data.tutorial_completado === false) {
        console.log("🎯 Usuario nuevo detectado. Arrancando tutorial...")
        setTimeout(() => setRun(true), 1500)
      } else {
        console.log("✅ El usuario ya completó el tutorial anteriormente.")
      }
    }
    verificarTutorial()
  }, [])

  const handleJoyrideCallback = async (data) => {
    const { status } = data
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      console.log("🏁 Tutorial finalizado o saltado. Guardando en DB...")
      setRun(false)
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { error } = await supabase
          .from('perfiles')
          .update({ tutorial_completado: true })
          .eq('id', user.id)

        if (error) {
          console.error("❌ ERROR AL GUARDAR:", error.message)
          console.error("Detalles:", error)
        } else {
          console.log("🚀 GUARDADO EXITOSO. Ya no volverá a salir.")
        }
      }
    }
  }

  const steps = [
    {
      target: 'body',
      content: (
        <div className="text-left">
          <p className="font-bold text-lg mb-2 text-brand-400">¡Bienvenido a EasyPocket! 🚀</p>
          <p>Te enseñamos a usar tu nuevo centro de mando financiero en 1 minuto.</p>
        </div>
      ),
      placement: 'center',
      locale: { next: '¡Empezar!' },
      disableBeacon: true,
    },
    {
      target: isMobile ? '.tour-mobile-header' : '.tour-desktop-logo',
      title: '🏠 Dashboard',
      content: 'Tu visión general. Aquí verás el resumen de tu patrimonio y gráficos de salud financiera.',
    },
    {
      target: isMobile ? '.tour-mobile-cuentas' : '.tour-desktop-cuentas',
      title: '💳 Cartera',
      content: 'Crea aquí tus bancos, tarjetas o efectivo. Es la base de todo: sin cuentas no hay rastreo.',
    },
    {
      target: isMobile ? '.tour-mobile-transacciones' : '.tour-desktop-transacciones',
      title: '💸 Movimientos',
      content: 'Anota tus gastos e ingresos. Categorízalos para saber exactamente dónde se va tu dinero.',
    },
    {
      target: isMobile ? '.tour-mobile-suscripciones' : '.tour-desktop-suscripciones',
      title: '📅 Suscripciones',
      content: 'Controla Netflix, Spotify o el gimnasio. Te avisaremos antes de que te cobren el siguiente mes.',
    },
    {
      target: isMobile ? '.tour-mobile-objetivos' : '.tour-desktop-objetivos',
      title: '🎯 Objetivos',
      content: '¿Ahorrando para un viaje o un coche? Crea una meta y mira cómo te acercas a ella cada mes.',
    },
    {
      target: isMobile ? '.tour-mobile-compartir' : '.tour-desktop-compartir',
      title: '👥 Dividir Gastos',
      content: 'Ideal para cenas con amigos o gastos de piso compartido. Cuentas claras, amistades largas.',
    },
    {
      target: 'body',
      title: '🏁 ¡Todo listo!',
      content: 'Ya conoces las herramientas. El primer paso ahora es ir a "Cuentas" y crear tu primera cartera.',
      placement: 'center',
      locale: { last: '¡Finalizar!' }
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
        tooltip: { borderRadius: '16px', padding: '24px' },
        buttonNext: { fontWeight: '800', borderRadius: '10px', textTransform: 'uppercase', fontSize: '11px' }
      }}
      locale={{ back: 'Atrás', close: 'Cerrar', last: 'Finalizar', next: 'Siguiente', skip: 'Saltar' }}
    />
  )
}