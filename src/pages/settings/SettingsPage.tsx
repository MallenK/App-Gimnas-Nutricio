import { Settings, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { signOut } from '@/hooks/auth/useAuth'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/auth/useAuth'

export function SettingsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch {
      toast({ variant: 'destructive', title: 'Error al cerrar sesión' })
    }
  }

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Configuración</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
