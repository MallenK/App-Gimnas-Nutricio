import { NavLink } from 'react-router-dom'
import { Plus, Dumbbell, Timer, Calendar } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useWorkoutHistory } from '@/hooks/fitness/useWorkout'
import { useActiveWorkoutStore } from '@/stores/activeWorkout.store'
import { Button } from '@/components/ui/button'
import { formatDuration } from '@/lib/utils'
import type { WorkoutSession } from '@/types/fitness'

export function WorkoutLogPage() {
  const { data: sessions = [], isLoading } = useWorkoutHistory()
  const sessionId = useActiveWorkoutStore((s) => s.sessionId)

  return (
    <div className="pb-24 animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-orange-400" />
          Historial
        </h1>
        <NavLink to={sessionId ? '/fitness/workout/active' : '/fitness/workout/new'}>
          <Button variant="fitness" size="sm" className="h-8 gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" />
            {sessionId ? 'Retomar' : 'Nuevo entreno'}
          </Button>
        </NavLink>
      </div>

      <div className="px-4 pt-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-slate-800/40 animate-pulse" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
            <div className="text-5xl">🏋️</div>
            <div>
              <p className="font-semibold text-lg mb-1">Sin entrenos aún</p>
              <p className="text-slate-400 text-sm">Empieza tu primer entreno para ver tu historial</p>
            </div>
            <NavLink to="/fitness/workout/new">
              <Button variant="fitness" className="gap-2">
                <Plus className="w-4 h-4" /> Nuevo entreno
              </Button>
            </NavLink>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SessionCard({ session }: { session: WorkoutSession }) {
  const dateLabel = format(parseISO(session.session_date), "d 'de' MMMM, yyyy", { locale: es })

  return (
    <div className="rounded-2xl bg-slate-800/60 border border-slate-700/40 p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="font-semibold text-sm">
            {(session as WorkoutSession & { routine_day?: { name: string } }).routine_day?.name ?? 'Entreno libre'}
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {dateLabel}
            </span>
            {session.duration_minutes && (
              <span className="flex items-center gap-1">
                <Timer className="w-3 h-3" />
                {formatDuration(session.duration_minutes)}
              </span>
            )}
          </div>
        </div>
        {session.perceived_effort && (
          <span className="shrink-0 text-xs font-bold px-2 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
            RPE {session.perceived_effort}
          </span>
        )}
      </div>
      {session.notes && (
        <p className="text-xs text-slate-400 mt-1">{session.notes}</p>
      )}
    </div>
  )
}
