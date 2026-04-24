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

      // Cerramos la interfaz visual de inmediato para que el usuario no espere
      setRun(false)
      localStorage.setItem('tutorial_visto', 'true')

      // Ejecutamos la petición de red en segundo plano
      await supabase
        .from('perfiles')
        .upsert({ 
          id: user.id,
          email: user.email,
          tutorial_completado: true
        }, { onConflict: 'id' })

      console.log("✅ Tutorial marcado como completado en DB.")

    } catch (err) {
      console.error("❌ Fallo en Supabase:", err.message)
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
    { 
      target: 'body', 
      title: '🏁 ¡Listo!', 
      placement: 'center',
      hideFooter: true, // Magia: Ocultamos el botón "Finalizar" defectuoso de Joyride
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <p>Crea tu primera cuenta para empezar.</p>
          {/* Inyectamos nuestro propio botón con control absoluto sobre el evento */}
          <button 
            onClick={saveStatus}
            style={{
              backgroundColor: '#10b981',
              color: '#ffffff',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '100%',
              fontSize: '16px'
            }}
          >
            Comenzar y Guardar
          </button>
        </div>
      )
    }
  ]

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
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