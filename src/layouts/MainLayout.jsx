import Sidebar from '../components/Sidebar'
import MobileHeader from '../components/MobileHeader'

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-bg-app">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col">
        <MobileHeader />
        
        {/* pt-20 para dejar espacio al MobileHeader en móvil, md:pt-10 para escritorio */}
        <main className="flex-1 p-4 md:p-10 pt-20 md:pt-10 pb-28 md:pb-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}