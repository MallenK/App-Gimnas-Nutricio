import { useMemo } from 'react'
import { format, startOfWeek, isAfter } from 'date-fns'
import { es } from 'date-fns/locale'
import { Salad, Dumbbell, CheckSquare, TrendingUp, Target, Plus } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/auth/useAuth'
import { useDailyMealLogs } from '@/hooks/nutrition/useMealLogs'
import { useDailyHabits } from '@/hooks/tasks/useHabits'
import { useWorkoutHistory } from '@/hooks/fitness/useWorkout'
import { useUserGoals } from '@/hooks/nutrition/useUserGoals'
import { useActiveWorkoutStore } from '@/stores/activeWorkout.store'
import { cn } from '@/lib/utils'

export function DashboardPage() {
  const { user } = useAuth()
  const today = format(new Date(), 'yyyy-MM-dd')
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'Atleta'
  const todayLabel = format(new Date(), "EEEE d 'de' MMMM", { locale: es })

  const { data: mealData } = useDailyMealLogs(today)
  const { data: habits = [] } = useDailyHabits(today)
  const { data: workouts = [] } = useWorkoutHistory()
  const { data: goals } = useUserGoals()
  const sessionId = useActiveWorkoutStore((s) => s.sessionId)

  const caloriesEaten = mealData?.nutrition.calories ?? null
  const caloriesTarget = goals?.daily_calories ?? null

  const habitsCompleted = habits.filter((h) => h.log?.completed).length
  const habitsTotal = habits.length

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const workoutsThisWeek = useMemo(
    () => workouts.filter((w) => isAfter(new Date(w.session_date), weekStart)).length,
    [workouts, weekStart],
  )
  const workoutsTarget = goals?.weekly_workouts_target ?? null

  return (
    <div className="min-h-screen p-4 space-y-5 animate-fade-in pb-28">
      {/* Header */}
      <div className="pt-2">
        <p className="text-sm text-muted-foreground capitalize">{todayLabel}</p>
        <h1 className="text-2xl font-bold mt-0.5">
          Hola, <span className="text-primary">{firstName}</span> 👋
        </h1>
      </div>

      {/* Active workout banner */}
      {sessionId && (
        <NavLink to="/fitness/workout/active">
          <div className="rounded-2xl bg-fitness/10 border border-fitness/30 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-fitness animate-pulse" />
              <p className="text-sm font-semibold text-fitness">Entreno en curso</p>
            </div>
            <p className="text-xs text-fitness/70">Continuar →</p>
          </div>
        </NavLink>
      )}

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          value={caloriesEaten != null ? Math.round(caloriesEaten) : '—'}
          label="kcal hoy"
          sublabel={caloriesTarget ? `/ ${caloriesTarget}` : undefined}
          pct={caloriesEaten && caloriesTarget ? (caloriesEaten / caloriesTarget) * 100 : undefined}
          color="nutrition"
        />
        <StatCard
          value={workoutsThisWeek}
          label="entrenos sem."
          sublabel={workoutsTarget ? `/ ${workoutsTarget}` : undefined}
          pct={workoutsTarget ? (workoutsThisWeek / workoutsTarget) * 100 : undefined}
          color="fitness"
        />
        <StatCard
          value={habitsTotal > 0 ? `${habitsCompleted}/${habitsTotal}` : '—'}
          label="hábitos hoy"
          pct={habitsTotal > 0 ? (habitsCompleted / habitsTotal) * 100 : undefined}
          color="tasks"
        />
      </div>

      {/* Section cards */}
      <div className="space-y-3">
        <SectionCard
          title="Nutrición"
          description={
            caloriesEaten != null
              ? `${Math.round(caloriesEaten)} kcal registradas hoy`
              : 'Registra tus comidas y controla tus macros'
          }
          icon={Salad}
          gradient="gradient-nutrition"
          to="/nutrition/log"
          ctaLabel="Ver diario de hoy"
        />
        <SectionCard
          title="Fitness"
          description={
            workoutsThisWeek > 0
              ? `${workoutsThisWeek} entreno${workoutsThisWeek > 1 ? 's' : ''} esta semana`
              : 'Planifica y registra tus entrenamientos'
          }
          icon={Dumbbell}
          gradient="gradient-fitness"
          to="/fitness/log"
          ctaLabel="Ver historial"
        />
        <SectionCard
          title="Hábitos y objetivos"
          description={
            habitsTotal > 0
              ? `${habitsCompleted} de ${habitsTotal} hábitos completados`
              : 'Checklist diario y metas semanales'
          }
          icon={CheckSquare}
          gradient="gradient-tasks"
          to="/tasks/habits"
          ctaLabel="Ver hábitos de hoy"
        />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <NavLink to="/fitness/workout/new">
            <Button variant="outline" className="w-full gap-2 border-fitness/30 text-fitness hover:bg-fitness/10">
              <Plus className="h-4 w-4" />
              Nuevo entreno
            </Button>
          </NavLink>
          <NavLink to="/nutrition/log">
            <Button variant="outline" className="w-full gap-2 border-nutrition/30 text-nutrition hover:bg-nutrition/10">
              <Salad className="h-4 w-4" />
              Añadir comida
            </Button>
          </NavLink>
          <NavLink to="/fitness/progress">
            <Button variant="outline" className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/10">
              <TrendingUp className="h-4 w-4" />
              Ver progreso
            </Button>
          </NavLink>
          <NavLink to="/settings/goals">
            <Button variant="outline" className="w-full gap-2 border-muted-foreground/30 hover:bg-accent">
              <Target className="h-4 w-4" />
              Mis objetivos
            </Button>
          </NavLink>
        </div>
      </div>

      {/* Onboarding hint — only when no goals set */}
      {!goals?.daily_calories && (
        <Card className="border-dashed border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-primary">Empieza aquí</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>1. Configura tus objetivos en <NavLink to="/settings/goals" className="text-primary underline">Configuración → Objetivos</NavLink></p>
            <p>2. Crea tu rutina en <NavLink to="/fitness/routines" className="text-fitness underline">Fitness → Rutinas</NavLink></p>
            <p>3. Añade hábitos en <NavLink to="/tasks/habits" className="text-tasks underline">Tareas → Hábitos</NavLink></p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatCard({
  value,
  label,
  sublabel,
  pct,
  color,
}: {
  value: string | number
  label: string
  sublabel?: string
  pct?: number
  color: 'nutrition' | 'fitness' | 'tasks'
}) {
  const colorMap = {
    nutrition: { bg: 'bg-nutrition/10 border-nutrition/20', text: 'text-nutrition', bar: 'bg-nutrition' },
    fitness: { bg: 'bg-fitness/10 border-fitness/20', text: 'text-fitness', bar: 'bg-fitness' },
    tasks: { bg: 'bg-tasks/10 border-tasks/20', text: 'text-tasks', bar: 'bg-tasks' },
  }
  const c = colorMap[color]

  return (
    <div className={cn('rounded-xl border p-3 text-center space-y-1', c.bg)}>
      <p className={cn('text-xl font-bold leading-none', c.text)}>{value}</p>
      <p className="text-xs text-muted-foreground leading-none">{label}</p>
      {sublabel && <p className="text-xs text-muted-foreground/60 leading-none">{sublabel}</p>}
      {pct != null && (
        <div className="h-1 rounded-full bg-slate-700/50 overflow-hidden mt-1.5">
          <div
            className={cn('h-full rounded-full transition-all', c.bar)}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}

function SectionCard({
  title,
  description,
  icon: Icon,
  gradient,
  to,
  ctaLabel,
}: {
  title: string
  description: string
  icon: React.ElementType
  gradient: string
  to: string
  ctaLabel: string
}) {
  return (
    <Card className="overflow-hidden border-0">
      <div className={`${gradient} p-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-lg">{title}</h3>
            <p className="text-white/80 text-sm mt-0.5">{description}</p>
          </div>
          <div className="rounded-xl bg-white/20 p-3">
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
      <CardContent className="pt-3">
        <NavLink to={to}>
          <Button variant="secondary" size="sm" className="w-full">
            {ctaLabel}
          </Button>
        </NavLink>
      </CardContent>
    </Card>
  )
}
