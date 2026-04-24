import Sidebar from '../components/Sidebar'
import MobileHeader from '../components/MobileHeader'
import UserOnboarding from '../components/UserOnboarding'

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-bg-app w-full overflow-x-hidden">
      
      <UserOnboarding />

      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col w-full min-w-0 md:pl-64">
        
        <MobileHeader />
        
        <main className="flex-1 w-full pb-32 md:pb-10 pt-20 md:pt-10 px-4 md:px-10 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}