import Sidebar from '../components/Sidebar'
import MobileHeader from '../components/MobileHeader'
import Tutorial from '../components/Tutorial'

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-bg-app w-full overflow-x-hidden">
      
      {/* El cerebro del tutorial, invisible hasta que se active */}
      <Tutorial />

      {/* Sidebar: 
        Ya es 'fixed' por dentro. 
        El 'hidden md:block' asegura que no renderice nada en móvil.
      */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Contenedor Principal:
        'md:pl-64' es la clave. 
        Solo añade el margen cuando el sidebar (de ancho 64) está visible.
      */}
      <div className="flex-1 flex flex-col w-full min-w-0 md:pl-64">
        
        {/* El Header móvil solo se ve en pantallas pequeñas */}
        <MobileHeader />
        
        <main className="flex-1 w-full pb-32 md:pb-10 pt-20 md:pt-10 px-4 md:px-10 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}