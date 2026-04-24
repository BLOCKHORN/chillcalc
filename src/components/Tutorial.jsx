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
      // Bloqueo temporal para que no moleste en la misma sesión
      if (localStorage.getItem('tutorial_visto') === 'true') return
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const { data } = await supabase
        .from('perfiles')
        .select('tutorial_completado')
        .eq('id', user.id)
        .maybeSingle()

      if (data && data.tutorial_completado === false) {
        setRun(true)
      }
    }
    init()
  }, [])

  const saveStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Ocultamos el tutorial al instante
    setRun(false)
    localStorage.setItem('tutorial_visto', 'true')

    // Atacamos directamente al campo con un UPDATE clásico
    const { data, error } = await supabase
      .from('perfiles')
      .update({ tutorial_completado: true })
      .eq('id', user.id)
      .select() // Crítico para obligar a Supabase a devolver la fila modificada

    if (error) {
      console.error("❌ Error de Supabase:", error.message)
    } else if (!data || data.length === 0) {
      console.error("⚠️ Fallo silencioso: La regla RLS de Supabase está bloqueando el UPDATE.")
    } else {
      console.log("✅ Dato guardado en Supabase correctamente:", data)
    }
  }

  const handleCallback = (data) => {
    const { status, action } = data
    // Detectamos si el usuario termina el tour o le da a la X de cerrar
    if (status === 'finished' || status === 'skipped' || action === 'close') {
      saveStatus()
    }
  }

  const steps = [
    { target: 'body', content: '¡Bienvenido! Vamos a configurar tu cuenta en 30 segundos.', placement: 'center' },
    { target: isMobile ? '.tour-mobile-header' : '.tour-desktop-logo', title: 'Dashboard', content: 'Resumen de tu patrimonio total.' },
    { target: isMobile ? '.tour-mobile-cuentas' : '.tour-desktop-cuentas', title: 'Cartera', content: 'Registra tus bancos y efectivo.' },
    { target: isMobile ? '.tour-mobile-transacciones' : '.tour-desktop-transacciones', title: 'Movimientos', content: 'Anota tus ingresos y gastos.' },
    { target: isMobile ? '.tour-mobile-suscripciones' : '.tour-desktop-suscripciones', title: 'Suscripciones', content: 'Controla tus pagos recurrentes.' },
    { target: isMobile ? '.tour-mobile-objetivos' : '.tour-desktop-objetivos', title: 'Objetivos', content: 'Tus metas de ahorro.' },
    { target: isMobile ? '.tour-mobile-compartir' : '.tour-desktop-compartir', title: 'Dividir Gastos', content: 'Cuentas con amigos o pareja.' },
    { target: 'body', title: '🏁 ¡Listo!', content: 'Crea tu primera cuenta para empezar.', placement: 'center' }
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