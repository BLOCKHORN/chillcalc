import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Tutorial() {
  const [JoyrideComponent, setJoyrideComponent] = useState(null)
  const [run, setRun] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false)

  useEffect(() => {
    console.log("🚀 1. Tutorial montado en el DOM")
    setMounted(true)
    
    import('react-joyride')
      .then((mod) => {
        // Intentamos todas las rutas posibles del export
        const comp = mod.default?.default || mod.default || mod
        console.log("🚀 2. Intento de carga Joyride:", typeof comp)
        
        if (typeof comp === 'function' || (typeof comp === 'object' && comp.$$typeof)) {
          setJoyrideComponent(() => comp)
          console.log("✅ 3. Joyride cargado y validado")
        } else {
          console.error("❌ Error: Lo que devolvió la librería no es un componente", comp)
        }
      })
      .catch((err) => console.error("❌ Error crítico cargando librería:", err))
  }, [])

  useEffect(() => {
    if (!mounted || !JoyrideComponent) return
    
    const init = async () => {
      console.log("🚀 4. Iniciando comprobación de Supabase...")
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.warn("⚠️ No hay usuario autenticado")
        return
      }

      const { data, error } = await supabase
        .from('perfiles')
        .select('tutorial_completado')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        console.error("❌ Error de Supabase:", error)
        return
      }

      console.log("🚀 5. Resultado de DB:", data)

      // Si data es null, es que el usuario no tiene perfil creado aún
      if (data && data.tutorial_completado === false) {
        console.log("🎯 ACTIVANDO TUTORIAL")
        setRun(true)
      } else if (!data) {
        console.warn("⚠️ El usuario no tiene fila en la tabla 'perfiles'")
      } else {
        console.log("ℹ️ El tutorial ya está completado en la BD")
      }
    }
    init()
  }, [mounted, JoyrideComponent])

  const saveStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const { data, error } = await supabase
      .from('perfiles')
      .update({ tutorial_completado: true })
      .eq('id', user.id)
      .select()

    if (!error && data?.length > 0) {
      localStorage.setItem('tutorial_visto', 'true')
      setRun(false)
    }
  }

  const handleCallback = (data) => {
    const { status, action } = data
    if (['finished', 'skipped'].includes(status) || action === 'close') {
      saveStatus()
    }
  }

  if (!mounted || !JoyrideComponent) return null

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

  const Joyride = JoyrideComponent

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