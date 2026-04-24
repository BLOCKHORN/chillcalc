import { useEffect, useState, useRef } from 'react'
import { Joyride, STATUS } from 'react-joyride'
import { supabase } from '../lib/supabase'

export default function Tutorial() {
  const [run, setRun] = useState(false)
  const [userId, setUserId] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const hasSaved = useRef(false) // Evita que se guarde dos veces

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const inicializarTutorial = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      setUserId(user.id)
      console.log("🛠️ Usuario detectado:", user.id)

      const { data } = await supabase
        .from('perfiles')
        .select('tutorial_completado')
        .eq('id', user.id)
        .single()

      if (data && data.tutorial_completado === false) {
        console.log("🚀 Estado FALSE en DB. Lanzando tutorial...")
        setTimeout(() => setRun(true), 1000)
      } else {
        console.log("✅ El usuario ya tiene tutorial_completado = true")
      }
    }
    inicializarTutorial()
  }, [])

  const marcarComoCompletado = async () => {
    if (!userId || hasSaved.current) return
    hasSaved.current = true
    
    console.log("📡 Enviando UPDATE a Supabase para el usuario:", userId)
    
    const { error } = await supabase
      .from('perfiles')
      .update({ tutorial_completado: true })
      .eq('id', userId)

    if (error) {
      console.error("❌ ERROR AL GUARDAR:", error.message)
      hasSaved.current = false // Reintentar si falla
    } else {
      console.log("🏆 GUARDADO CON ÉXITO. El tutorial no volverá a salir.")
      setRun(false)
    }
  }

  const handleJoyrideCallback = (data) => {
    const { status } = data
    // Si el usuario llega al final o le da a saltar
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      marcarComoCompletado()
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
      content: 'Tu visión general con el resumen de tu patrimonio neto.',
    },
    {
      target: isMobile ? '.tour-mobile-cuentas' : '.tour-desktop-cuentas',
      title: '💳 Cartera',
      content: 'Crea aquí tus bancos, tarjetas o efectivo.',
    },
    {
      target: isMobile ? '.tour-mobile-transacciones' : '.tour-desktop-transacciones',
      title: '💸 Movimientos',
      content: 'Anota tus gastos e ingresos para controlarlo todo.',
    },
    {
      target: isMobile ? '.tour-mobile-suscripciones' : '.tour-desktop-suscripciones',
      title: '📅 Suscripciones',
      content: 'Gestiona tus pagos recurrentes (Netflix, Gym...).',
    },
    {
      target: isMobile ? '.tour-mobile-objetivos' : '.tour-desktop-objetivos',
      title: '🎯 Objetivos',
      content: 'Crea metas de ahorro y mira tu progreso.',
    },
    {
      target: isMobile ? '.tour-mobile-compartir' : '.tour-desktop-compartir',
      title: '👥 Dividir Gastos',
      content: 'Ideal para cuentas con amigos o pareja.',
    },
    {
      target: 'body',
      title: '🏁 ¡Todo listo!',
      content: 'Ya puedes empezar. Haz clic en Finalizar para guardar tu progreso.',
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