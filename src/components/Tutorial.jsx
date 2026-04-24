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
      // Prioridad 1: LocalStorage (para que no moleste mientras arreglamos la DB)
      if (localStorage.getItem('tutorial_visto') === 'true') return
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const { data, error } = await supabase
        .from('perfiles')
        .select('tutorial_completado')
        .eq('id', user.id)
        .maybeSingle()

      if (!data || data.tutorial_completado === false) {
        setRun(true)
      }
    }
    init()
  }, [])

  const saveStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      console.log("💾 Guardando estado en base de datos...")

      // 1. Intentamos el guardado en Supabase primero
      const { data, error } = await supabase
        .from('perfiles')
        .update({ tutorial_completado: true })
        .eq('id', user.id)
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        console.log("✅ DB actualizada correctamente")
        // 2. Solo si la DB responde bien, guardamos en LocalStorage y cerramos
        localStorage.setItem('tutorial_visto', 'true')
        setRun(false)
      } else {
        console.warn("⚠️ La DB no devolvió datos. ¿Existe la fila para este ID?")
        // Forzamos el cierre local de todos modos para no bloquear al usuario
        localStorage.setItem('tutorial_visto', 'true')
        setRun(false)
      }
    } catch (err) {
      console.error("❌ Fallo crítico al guardar tutorial:", err.message)
      // Si falla la red, al menos lo cerramos en local para esta sesión
      setRun(false)
    }
  }

  const handleCallback = (data) => {
    const { status } = data
    // Capturamos 'finished' (fin) o 'skipped' (clic en la X o fuera)
    if (status === 'finished' || status === 'skipped') {
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
    { target: 'body', title: '¡Listo!', content: 'Crea tu primera cuenta para empezar.', placement: 'center' }
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