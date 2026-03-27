import Sidebar from '../components/Sidebar'
import MobileHeader from '../components/MobileHeader'

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-bg-app w-full overflow-x-hidden">
      <div className="hidden md:block shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col w-full min-w-0">
        <MobileHeader />
        
        <main className="flex-1 w-full pb-32 md:pb-10 pt-20 md:pt-10 px-3 md:px-10 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}