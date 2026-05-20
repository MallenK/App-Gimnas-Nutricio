import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Salad, Dumbbell, CheckSquare, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useActiveWorkoutStore } from '@/stores/activeWorkout.store'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Inicio', color: 'text-primary' },
  { to: '/nutrition/log', icon: Salad, label: 'Nutrición', color: 'text-nutrition' },
  { to: '/fitness/log', icon: Dumbbell, label: 'Fitness', color: 'text-fitness' },
  { to: '/tasks/habits', icon: CheckSquare, label: 'Tareas', color: 'text-tasks' },
  { to: '/finances/log', icon: Wallet, label: 'Finanzas', color: 'text-finances' },
]

export function BottomNav() {
  const sessionId = useActiveWorkoutStore((s) => s.sessionId)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card safe-bottom md:hidden">
      {/* Active workout banner */}
      {sessionId && (
        <NavLink
          to="/fitness/workout/active"
          className="flex items-center justify-center gap-2 bg-fitness/10 py-1.5 text-xs font-medium text-fitness"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fitness" />
          Entreno en progreso — Toca para volver
        </NavLink>
      )}

      <div className="flex">
        {navItems.map(({ to, icon: Icon, label, color }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors',
                isActive ? color : 'text-muted-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn('h-5 w-5 transition-transform', isActive && 'scale-110')}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
