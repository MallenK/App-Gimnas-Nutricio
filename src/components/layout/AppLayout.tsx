import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { Toaster } from '@/components/ui/toaster'
import { OfflineBanner } from '@/components/shared/OfflineBanner'

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <OfflineBanner />

      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 md:ml-60 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />

      <Toaster />
    </div>
  )
}
