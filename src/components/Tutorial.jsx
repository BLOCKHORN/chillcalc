import { useEffect, useState } from 'react'
import { Joyride, STATUS, EVENTS } from 'react-joyride'
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
      if (localStorage.getItem('tutorial_visto') === 'true') return
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const { data } = await supabase
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

      console.log("Iniciando guardado definitivo en Supabase...")

      const { error } = await supabase
        .from('perfiles')
        .upsert({ 
          id: user.id,
          email: user.email,
          tutorial_completado: true
        }, { onConflict: 'id' })

      if (error) throw error

      console.log("DB actualizada con exito")
      localStorage.setItem('tutorial_visto', 'true')
      setRun(false)

    } catch (err) {
      console.error("Fallo en Supabase al guardar:", err.message)
      setRun(false)
    }
  }

  const handleCallback = (data) => {
    const { status, type } = data
    
    console.log("Evento Joyride:", type, status)
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status) || type === EVENTS.TOUR_END) {
      saveStatus()
    }
  }

  const steps = [
    { target: 'body', content: 'Bienvenido! Vamos a configurar tu cuenta en 30 segundos.', placement: 'center' },
    { target: isMobile ? '.tour-mobile-header' : '.tour-desktop-logo', title: 'Dashboard', content: 'Resumen de tu patrimonio total.' },
    { target: isMobile ? '.tour-mobile-cuentas' : '.tour-desktop-cuentas', title: 'Cartera', content: 'Registra tus bancos y efectivo.' },
    { target: isMobile ? '.tour-mobile-transacciones' : '.tour-desktop-transacciones', title: 'Movimientos', content: 'Anota tus ingresos y gastos.' },
    { target: isMobile ? '.tour-mobile-suscripciones' : '.tour-desktop-suscripciones', title: 'Suscripciones', content: 'Controla tus pagos recurrentes.' },
    { target: isMobile ? '.tour-mobile-objetivos' : '.tour-desktop-objetivos', title: 'Objetivos', content: 'Tus metas de ahorro.' },
    { target: isMobile ? '.tour-mobile-compartir' : '.tour-desktop-compartir', title: 'Dividir Gastos', content: 'Cuentas con amigos o pareja.' },
    { target: 'body', title: 'Listo!', content: 'Crea tu primera cuenta para empezar.', placement: 'center' }
  ]

  return (
    <>
      <button 
        onClick={saveStatus}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 999999,
          backgroundColor: '#ef4444',
          color: 'white',
          padding: '12px 24px',
          fontWeight: 'bold',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        FORZAR GUARDADO (TEST)
      </button>

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
        locale={{ back: 'Atras', last: 'Finalizar', next: 'Siguiente', skip: 'Saltar' }}
      />
    </>
  )
}