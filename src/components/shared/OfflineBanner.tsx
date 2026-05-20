import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const setOnline = () => setOffline(false)
    const setOfflineState = () => setOffline(true)
    window.addEventListener('online', setOnline)
    window.addEventListener('offline', setOfflineState)
    return () => {
      window.removeEventListener('online', setOnline)
      window.removeEventListener('offline', setOfflineState)
    }
  }, [])

  if (!offline) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-slate-800 border-b border-slate-700 py-2 px-4 text-sm text-amber-400">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Sin conexión — mostrando datos en caché</span>
    </div>
  )
}
