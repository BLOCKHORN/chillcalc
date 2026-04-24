import { useEffect, useState } from 'react'
import { Joyride } from 'react-joyride'

export default function Tutorial() {
  const [run, setRun] = useState(false)

  useEffect(() => {
    // Damos 1.5 segundos de margen y disparamos
    setTimeout(() => setRun(true), 1500)
  }, [])

  return (
    <Joyride
      steps={[
        {
          target: 'body', // Apuntamos a toda la pantalla, imposible fallar
          content: '🚨 PRUEBA DE FUEGO: Si ves este cartel, el sistema base funciona. El problema es que el código no encuentra tus botones.',
          placement: 'center',
        }
      ]}
      run={run}
      continuous={true}
      styles={{
        options: { zIndex: 10000 }
      }}
    />
  )
}