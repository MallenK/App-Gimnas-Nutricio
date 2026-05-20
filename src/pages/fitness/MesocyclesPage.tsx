import { useState } from 'react'
import { Plus, Trash2, Layers, Calendar } from 'lucide-react'
import { format, parseISO, differenceInDays, isAfter, isBefore } from 'date-fns'
import { es } from 'date-fns/locale'
import { useMesocycles, useCreateMesocycle, useDeleteMesocycle } from '@/hooks/fitness/useMesocycles'
import { useRoutines } from '@/hooks/fitness/useRoutines'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MESOCYCLE_GOALS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Mesocycle } from '@/types/fitness'

const GOAL_COLORS: Record<string, string> = {
  hypertrophy: '#f97316',
  strength: '#ef4444',
  endurance: '#06b6d4',
  cut: '#8b5cf6',
  recomp: '#10b981',
}

function mesoStatus(m: Mesocycle): 'active' | 'upcoming' | 'completed' {
  const now = new Date()
  const start = parseISO(m.start_date)
  const end = parseISO(m.end_date)
  if (isBefore(now, start)) return 'upcoming'
  if (isAfter(now, end)) return 'completed'
  return 'active'
}

function MesoSection({
  label,
  items,
  routines,
  onDelete,
}: {
  label: string
  items: Mesocycle[]
  routines: { id: string; name: string }[]
  onDelete: (id: string) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-400 font-medium px-1">{label}</p>
      {items.map((m) => {
        const status = mesoStatus(m)
        const goalLabel = MESOCYCLE_GOALS.find((g) => g.value === m.goal)?.label ?? m.goal
        const goalColor = GOAL_COLORS[m.goal ?? ''] ?? '#6366f1'
        const routineName = routines.find((r) => r.id === m.routine_id)?.name
        const start = format(parseISO(m.start_date), 'd MMM', { locale: es })
        const end = format(parseISO(m.end_date), "d MMM yyyy", { locale: es })
        const daysLeft = status === 'active' ? differenceInDays(parseISO(m.end_date), new Date()) : null

        return (
          <div key={m.id} className="rounded-2xl bg-slate-800/50 border border-slate-700/30 overflow-hidden">
            <div className="h-1" style={{ backgroundColor: status === 'completed' ? '#334155' : goalColor }} />
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{m.name}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {goalLabel && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: `${goalColor}25`, color: goalColor }}
                      >
                        {goalLabel}
                      </span>
                    )}
                    {routineName && <span className="text-xs text-slate-400">{routineName}</span>}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    <span>{start} – {end}</span>
                    {daysLeft != null && (
                      <span className={cn('font-medium', daysLeft <= 7 ? 'text-amber-400' : 'text-slate-400')}>
                        · {daysLeft}d restantes
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onDelete(m.id)}
                  className="p-1.5 text-slate-600 hover:text-red-400 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AddMesocycleSheet({
  open,
  routines,
  onClose,
  onCreate,
  isCreating,
}: {
  open: boolean
  routines: { id: string; name: string }[]
  onClose: () => void
  onCreate: (data: Omit<Mesocycle, 'id' | 'created_at' | 'user_id'>) => Promise<void>
  isCreating: boolean
}) {
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('hypertrophy')
  const [routineId, setRoutineId] = useState<string | null>(null)
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [weeks, setWeeks] = useState('8')

  function getEndDate() {
    const start = new Date(startDate)
    start.setDate(start.getDate() + (parseInt(weeks) || 8) * 7)
    return format(start, 'yyyy-MM-dd')
  }

  async function handleCreate() {
    if (!name.trim()) return
    await onCreate({
      name: name.trim(),
      goal,
      routine_id: routineId,
      start_date: startDate,
      end_date: getEndDate(),
      duration_weeks: parseInt(weeks) || 8,
      notes: null,
    })
    setName('')
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[90dvh] bg-slate-900 border-slate-700 p-0 gap-0">
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-slate-700/50">
          <SheetTitle className="text-base">Nuevo mesociclo</SheetTitle>
        </SheetHeader>

        <div className="p-4 space-y-4 overflow-y-auto">
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Nombre</label>
            <Input
              autoFocus
              placeholder="Ej. Bloque fuerza Q1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-800 border-slate-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-400">Objetivo</label>
            <div className="flex flex-wrap gap-2">
              {MESOCYCLE_GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGoal(g.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                    goal === g.value
                      ? 'bg-fitness/20 border-fitness text-fitness'
                      : 'bg-slate-800 border-slate-700 text-slate-400',
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {routines.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Rutina (opcional)</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setRoutineId(null)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                    routineId === null
                      ? 'bg-slate-600 border-slate-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400',
                  )}
                >
                  Sin rutina
                </button>
                {routines.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRoutineId(r.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                      routineId === r.id
                        ? 'bg-slate-600 border-slate-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400',
                    )}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Inicio</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-800 border-slate-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Semanas</label>
              <Input
                type="number"
                min="1"
                max="52"
                value={weeks}
                onChange={(e) => setWeeks(e.target.value)}
                className="bg-slate-800 border-slate-600"
              />
            </div>
          </div>

          <p className="text-xs text-slate-500 text-center">
            Fin: {format(parseISO(getEndDate()), "d 'de' MMMM yyyy", { locale: es })}
          </p>

          <Button
            onClick={handleCreate}
            disabled={isCreating || !name.trim()}
            className="w-full bg-fitness hover:bg-fitness/90"
          >
            {isCreating ? 'Creando...' : 'Crear mesociclo'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function MesocyclesPage() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { data: mesocycles = [], isLoading } = useMesocycles()
  const { data: routines = [] } = useRoutines()
  const createMeso = useCreateMesocycle()
  const deleteMeso = useDeleteMesocycle()

  const active = mesocycles.filter((m) => mesoStatus(m) === 'active')
  const upcoming = mesocycles.filter((m) => mesoStatus(m) === 'upcoming')
  const completed = mesocycles.filter((m) => mesoStatus(m) === 'completed')

  return (
    <div className="pb-28 animate-fade-in">
      <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-fitness" />
          <h1 className="font-bold text-base">Mesociclos</h1>
        </div>
        <button
          onClick={() => setSheetOpen(true)}
          className="w-8 h-8 rounded-full bg-fitness/20 text-fitness flex items-center justify-center"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {isLoading && (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-24 rounded-2xl bg-slate-800/40 animate-pulse" />)}
          </div>
        )}

        {!isLoading && mesocycles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="text-5xl">📅</div>
            <div>
              <p className="font-semibold text-lg mb-1">Sin mesociclos</p>
              <p className="text-slate-400 text-sm">Planifica bloques de entrenamiento con fechas y objetivos</p>
            </div>
          </div>
        )}

        {active.length > 0 && (
          <MesoSection label="Activo" items={active} routines={routines} onDelete={(id) => deleteMeso.mutate(id)} />
        )}
        {upcoming.length > 0 && (
          <MesoSection label="Próximos" items={upcoming} routines={routines} onDelete={(id) => deleteMeso.mutate(id)} />
        )}
        {completed.length > 0 && (
          <MesoSection label="Completados" items={completed} routines={routines} onDelete={(id) => deleteMeso.mutate(id)} />
        )}
      </div>

      <AddMesocycleSheet
        open={sheetOpen}
        routines={routines}
        onClose={() => setSheetOpen(false)}
        onCreate={async (data) => {
          await createMeso.mutateAsync(data)
          setSheetOpen(false)
        }}
        isCreating={createMeso.isPending}
      />
    </div>
  )
}
