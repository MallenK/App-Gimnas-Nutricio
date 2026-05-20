import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Dumbbell,
  CheckSquare,
  Settings,
  LogOut,
  BookOpen,
  Calendar,
  BarChart2,
  Library,
  Route,
  Target,
  Heart,
  Layers,
  Wallet,
  PiggyBank,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/hooks/auth/useAuth'
import { useToast } from '@/hooks/use-toast'

const sections = [
  {
    title: null,
    items: [{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'text-primary' }],
  },
  {
    title: 'Nutrición',
    color: 'text-nutrition',
    items: [
      { to: '/nutrition/log', icon: BookOpen, label: 'Diario', color: 'text-nutrition' },
      { to: '/nutrition/planner', icon: Calendar, label: 'Planificador', color: 'text-nutrition' },
      { to: '/nutrition/library', icon: Library, label: 'Alimentos', color: 'text-nutrition' },
      { to: '/nutrition/goals', icon: Target, label: 'Objetivos', color: 'text-nutrition' },
    ],
  },
  {
    title: 'Fitness',
    color: 'text-fitness',
    items: [
      { to: '/fitness/log', icon: Dumbbell, label: 'Entrenos', color: 'text-fitness' },
      { to: '/fitness/routines', icon: Route, label: 'Rutinas', color: 'text-fitness' },
      { to: '/fitness/mesocycles', icon: Layers, label: 'Mesociclos', color: 'text-fitness' },
      { to: '/fitness/progress', icon: BarChart2, label: 'Progreso', color: 'text-fitness' },
      { to: '/fitness/cardio', icon: Heart, label: 'Cardio', color: 'text-fitness' },
    ],
  },
  {
    title: 'Tareas',
    color: 'text-tasks',
    items: [
      { to: '/tasks/habits', icon: CheckSquare, label: 'Hábitos', color: 'text-tasks' },
      { to: '/tasks/goals', icon: Target, label: 'Objetivos', color: 'text-tasks' },
    ],
  },
  {
    title: 'Finanzas',
    color: 'text-finances',
    items: [
      { to: '/finances/log', icon: Wallet, label: 'Registro', color: 'text-finances' },
      { to: '/finances/budget', icon: PiggyBank, label: 'Presupuesto', color: 'text-finances' },
      { to: '/finances/config', icon: Settings, label: 'Configuración', color: 'text-finances' },
    ],
  },
]

export function Sidebar() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch {
      toast({ variant: 'destructive', title: 'Error al cerrar sesión' })
    }
  }

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-60 flex-col border-r bg-card md:flex">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
          <Dumbbell className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-bold tracking-tight">GymNutricio</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-hide">
        {sections.map((section, i) => (
          <div key={i} className="mb-4">
            {section.title && (
              <p className={cn('mb-1 px-2 text-xs font-semibold uppercase tracking-wider', section.color)}>
                {section.title}
              </p>
            )}
            {section.items.map(({ to, icon: Icon, label, color }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? cn('bg-accent', color)
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t px-3 py-3 space-y-1">
        <NavLink
          to="/settings/profile"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )
          }
        >
          <Settings className="h-4 w-4" />
          Configuración
        </NavLink>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
