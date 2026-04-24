import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function UserOnboarding() {
  const [JoyrideComponent, setJoyrideComponent] = useState(null)
  const [run, setRun] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )

  useEffect(() => {
    setMounted(true)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)

    import('react-joyride')
      .then((mod) => {
        const comp = mod.Joyride || mod.default || mod
        if (comp) setJoyrideComponent(() => comp)
      })
      .catch((err) => console.error('❌ Error cargando Joyride:', err))

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    console.log('🔄 useEffect fired — mounted:', mounted, '| JoyrideComponent:', !!JoyrideComponent)
    if (!mounted || !JoyrideComponent) return

    const init = async () => {
      console.log('🔍 Init ejecutado')

      if (localStorage.getItem('onboarding_visto') === 'true') {
        console.log('🛑 Bloqueado por localStorage')
        return
      }

      const { data: authData, error: authError } = await supabase.auth.getUser()
      console.log('👤 Usuario:', authData?.user?.id)
      console.log('🔐 Auth error:', authError)

      const user = authData?.user
      if (!user) {
        console.log('🛑 No hay usuario logueado')
        return
      }

      const { data, error } = await supabase
        .from('perfiles')
        .select('tutorial_completado')
        .eq('id', user.id)
        .maybeSingle()

      console.log('📦 Data de perfiles:', data)
      console.log('❌ Error en select:', error)

      if (data && data.tutorial_completado === false) {
        console.log('✅ Poniendo run = true')
        setRun(true)
      } else {
        console.log('⚠️ No se puso run=true. data:', data)
      }
    }

    init()
  }, [mounted, JoyrideComponent])

  const saveStatus = async () => {
    console.log('🛠 Iniciando guardado...')
    const { data: authData } = await supabase.auth.getUser()
    const user = authData?.user

    if (!user) {
      console.error('❌ No se detecta usuario logueado')
      return
    }

    console.log('🆔 Intentando actualizar ID:', user.id)

    const { data, error } = await supabase
      .from('perfiles')
      .update({ tutorial_completado: true })
      .eq('id', user.id)
      .select()

    if (error) {
      console.error('❌ Error de Supabase:', error.message)
      return
    }

    if (data && data.length > 0) {
      console.log('✅ Guardado con éxito en BD:', data)
      localStorage.setItem('onboarding_visto', 'true')
      setRun(false)
    } else {
      console.warn('⚠️ Supabase no actualizó ninguna fila. Posible bloqueo RLS.')
    }
  }

  const handleCallback = (data) => {
    console.log('🎯 Joyride callback:', data.status, '| action:', data.action, '| type:', data.type)
    if (data.status === 'finished' || data.status === 'skipped') {
      saveStatus()
    }
  }

  if (!mounted || !JoyrideComponent) return null

  const steps = [
    { target: 'body', content: 'Bienvenido. Vamos a configurar tu cuenta.', placement: 'center' },
    { target: isMobile ? '.tour-mobile-header' : '.tour-desktop-logo', title: 'Dashboard', content: 'Resumen de tu patrimonio.' },
    { target: isMobile ? '.tour-mobile-cuentas' : '.tour-desktop-cuentas', title: 'Cartera', content: 'Tus cuentas bancarias.' },
    { target: isMobile ? '.tour-mobile-transacciones' : '.tour-desktop-transacciones', title: 'Movimientos', content: 'Tus ingresos y gastos.' },
    { target: 'body', title: 'Listo', content: 'Tutorial finalizado.', placement: 'center' }
  ]

  const Joyride = JoyrideComponent

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      disableScrolling={true}
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