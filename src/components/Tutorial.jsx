import { useEffect, useState, useRef } from 'react'
import { Joyride, STATUS } from 'react-joyride'
import { supabase } from '../lib/supabase'

export default function Tutorial() {
  const [run, setRun] = useState(false)
  const [userId, setUserId] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const hasSaved = useRef(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const inicializar = async () => {
      // 1. Verificamos si el usuario ya lo saltó en este navegador (Fuerza bruta local)
      if (localStorage.getItem('easypocket_tutorial_done') === 'true') {
        console.log("✅ Tutorial saltado por LocalStorage.")
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // 2. Verificamos en la base de datos
      const { data, error } = await supabase
        .from('perfiles')
        .select('tutorial_completado')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        console.warn("⚠️ No se pudo leer de la DB (posible error de CORS), confiando en LocalStorage.")
        return
      }

      if (data && data.tutorial_completado === false) {
        setTimeout(() => setRun(true), 1500)
      }
    }
    inicializar()
  }, [])

  const finalizarTutorial = async () => {
    if (hasSaved.current) return
    hasSaved.current = true

    // Guardado local inmediato (para que no vuelva a salir aunque falle la red)
    localStorage.setItem('easypocket_tutorial_done', 'true')
    setRun(false)

    if (userId) {
      console.log("📡 Intentando sincronizar con base de datos...")
      const { error } = await supabase
        .from('perfiles')
        .update({ tutorial_completado: true })
        .eq('id', userId)

      if (error) console.error("❌ Error de sincronización DB:", error.message)
      else console.log("🚀 Sincronizado con éxito.")
    }
  }

  const handleJoyrideCallback = (data) => {
    const { status } = data
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      finalizarTutorial()
    }
  }

  const steps = [
    {
      target: 'body',
      content: (
        <div className="text-left">
          <p className="font-bold text-lg mb-2 text-brand-400">¡Bienvenido a EasyPocket! 🚀</p>
          <p>Te enseñamos a usar tu centro financiero en 30 segundos.</p>
        </div>
      ),
      placement: 'center',
      locale: { next: '¡Empezar!' },
      disableBeacon: true,
    },
    {
      target: isMobile ? '.tour-mobile-header' : '.tour-desktop-logo',
      title: '🏠 Dashboard',
      content: 'Resumen de tu patrimonio neto total.',
    },
    {
      target: isMobile ? '.tour-mobile-cuentas' : '.tour-desktop-cuentas',
      title: '💳 Cartera',
      content: 'Registra tus bancos, tarjetas o efectivo.',
    },
    {
      target: isMobile ? '.tour-mobile-transacciones' : '.tour-desktop-transacciones',
      title: '💸 Movimientos',
      content: 'Anota tus gastos e ingresos diarios.',
    },
    {
      target: isMobile ? '.tour-mobile-suscripciones' : '.tour-desktop-suscripciones',
      title: '📅 Suscripciones',
      content: 'Controla tus pagos recurrentes.',
    },
    {
      target: isMobile ? '.tour-mobile-objetivos' : '.tour-desktop-objetivos',
      title: '🎯 Objetivos',
      content: 'Tus metas de ahorro a la vista.',
    },
    {
      target: isMobile ? '.tour-mobile-compartir' : '.tour-desktop-compartir',
      title: '👥 Dividir Gastos',
      content: 'Gastos compartidos con amigos o pareja.',
    },
    {
      target: 'body',
      title: '🏁 ¡Listo!',
      content: 'Crea tu primera cuenta para empezar.',
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