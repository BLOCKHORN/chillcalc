import Sidebar from '../components/Sidebar'

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-10 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  )
}   