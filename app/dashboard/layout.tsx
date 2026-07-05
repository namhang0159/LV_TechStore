import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f8f9fa]">
        <Sidebar />
        <Header />
        <div className="pl-64 pt-16">
          <main className="min-h-[calc(100vh-4rem)] p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
