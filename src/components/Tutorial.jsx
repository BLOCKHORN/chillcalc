import { useEffect, useState } from 'react'
import { Joyride } from 'react-joyride'
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
    const init = async () => {
      if (localStorage.getItem('tutorial_visto')) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
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

  const saveStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error("No se encontró sesión de usuario activa.");
      return;
    }

    // Bloqueo local inmediato para evitar que el tutorial parpadee
    localStorage.setItem('tutorial_visto', 'true')
    setRun(false)

    console.log("Intentando actualizar Supabase para el ID:", user.id);

    const { data, error } = await supabase
      .from('perfiles')
      .update({ tutorial_completado: true })
      .eq('id', user.id)
      .select() // Esto es clave para verificar si se hizo el cambio

    if (error) {
      console.error("ERROR DE SUPABASE:", error.message, error.details, error.hint);
      // Si falla, borramos el localstorage para que el usuario pueda reintentar
      localStorage.removeItem('tutorial_visto');
      setRun(true);
    } else {
      if (data && data.length > 0) {
        console.log("✅ Guardado exitoso en DB:", data);
      } else {
        console.warn("⚠️ No se encontró la fila del usuario o el RLS bloqueó el acceso.");
      }
    }
  }

  const handleCallback = (data) => {
    const { status } = data
    if (['finished', 'skipped'].includes(status)) {
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