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
        .maybeSingle()

      // Solo si es estrictamente false arrancamos
      if (data && data.tutorial_completado === false) {
        setTimeout(() => setRun(true), 1500)
      }
    }
    verificarTutorial()
  }, [])

  const handleJoyrideCallback = async (data) => {
    const { status } = data
    
    // Si termina o salta, mandamos la orden de guardar
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      console.log("Intentando guardar progreso para el usuario:", user.id)

      const { error } = await supabase
        .from('perfiles')
        .update({ tutorial_completado: true })
        .eq('id', user.id)

      if (error) {
        console.error("Error al guardar tutorial:", error.message)
      } else {
        console.log("Tutorial marcado como completado en la base de datos.")
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
      content: 'Crea aquí tus bancos, tarjetas o efectivo. Es la base de todo.',
    },
    {
      target: isMobile ? '.tour-mobile-transacciones' : '.tour-desktop-transacciones',
      title: '💸 Movimientos',
      content: 'Anota tus gastos e ingresos. Categorízalos para controlar tu dinero.',
    },
    {
      target: isMobile ? '.tour-mobile-suscripciones' : '.tour-desktop-suscripciones',
      title: '📅 Suscripciones',
      content: 'Controla tus pagos recurrentes como Netflix o el gimnasio.',
    },
    {
      target: isMobile ? '.tour-mobile-objetivos' : '.tour-desktop-objetivos',
      title: '🎯 Objetivos',
      content: 'Crea metas de ahorro y mira cómo te acercas a ellas cada mes.',
    },
    {
      target: isMobile ? '.tour-mobile-compartir' : '.tour-desktop-compartir',
      title: '👥 Dividir Gastos',
      content: 'Ideal para cenas con amigos o gastos compartidos.',
    },
    {
      target: 'body',
      title: '🏁 ¡Todo listo!',
      content: 'Ya puedes empezar. El primer paso es crear tu primera cartera en "Cuentas".',
      placement: 'center',
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
        tooltip: { borderRadius: '16px', padding: '24px' },
        buttonNext: { fontWeight: '800', borderRadius: '10px', textTransform: 'uppercase', fontSize: '11px' }
      }}
      locale={{ back: 'Atrás', close: 'Cerrar', last: 'Finalizar', next: 'Siguiente', skip: 'Saltar' }}
    />
  )
}