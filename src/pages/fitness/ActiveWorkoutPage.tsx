import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Timer, ChevronDown, Flag } from 'lucide-react'
import { useActiveWorkoutStore } from '@/stores/activeWorkout.store'
import { useFinishWorkout } from '@/hooks/fitness/useWorkout'
import { ActiveExerciseBlock } from '@/components/fitness/ActiveExerciseBlock'
import { ExercisePickerSheet } from '@/components/fitness/ExercisePickerSheet'
import { RestTimerOverlay } from '@/components/fitness/RestTimer'
import { Button } from '@/components/ui/button'
import { formatDuration } from '@/lib/utils'
import type { Exercise } from '@/types/fitness'

const REST_SECONDS = 90

export function ActiveWorkoutPage() {
  const navigate = useNavigate()
  const store = useActiveWorkoutStore()
  const finish = useFinishWorkout()

  const [pickerOpen, setPickerOpen] = useState(false)
  const [restVisible, setRestVisible] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [effort, setEffort] = useState<number | null>(null)
  const [showFinishDialog, setShowFinishDialog] = useState(false)

  useEffect(() => {
    if (!store.sessionId) {
      store.startWorkout()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const id = setInterval(() => setElapsed(store.getElapsedMinutes()), 30_000)
    setElapsed(store.getElapsedMinutes())
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.startTime])

  function addExercise(ex: Exercise) {
    store.addExercise(ex.id, ex.name, ex.muscle_group, ex.image_url)
  }

  function handleSetCompleted(exerciseId: string, setId: string) {
    store.updateSet(exerciseId, setId, { isCompleted: true })
    setRestVisible(true)
  }

  async function handleFinish() {
    if (!store.startTime) return
    await finish.mutateAsync({
      exercises: store.exercises,
      startTime: store.startTime,
      date: store.date,
      routineDayId: store.routineDayId,
      perceivedEffort: effort,
      notes: null,
    })
    navigate('/fitness/log')
  }

  const totalCompletedSets = store.exercises.flatMap((e) =>
    e.sets.filter((s) => s.isCompleted),
  ).length

  return (
    <div className="pb-32 animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 text-orange-400">
            <Timer className="w-4 h-4" />
            <span className="font-mono font-bold text-sm">{formatDuration(elapsed)}</span>
          </div>
          <span className="text-xs text-slate-400">{totalCompletedSets} series</span>
          <Button
            size="sm"
            variant="fitness"
            className="h-8 px-3 text-xs font-semibold"
            onClick={() => setShowFinishDialog(true)}
            disabled={finish.isPending}
          >
            <Flag className="w-3.5 h-3.5 mr-1" />
            Finalizar
          </Button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {store.exercises.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
            <div className="text-5xl">🏋️</div>
            <p className="font-semibold text-lg">Entreno vacío</p>
            <p className="text-slate-400 text-sm">Añade ejercicios para empezar</p>
          </div>
        )}

        {store.exercises.map((ex) => (
          <ActiveExerciseBlock
            key={ex.exerciseId}
            exercise={ex}
            onAddSet={() => store.addSet(ex.exerciseId)}
            onUpdateSet={(setId, data) => store.updateSet(ex.exerciseId, setId, data)}
            onRemoveSet={(setId) => store.removeSet(ex.exerciseId, setId)}
            onRemoveExercise={() => store.removeExercise(ex.exerciseId)}
            onSetCompleted={(setId) => handleSetCompleted(ex.exerciseId, setId)}
          />
        ))}

        <button
          onClick={() => setPickerOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-slate-700 text-slate-400 hover:border-orange-500/50 hover:text-orange-400 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Añadir ejercicio
        </button>
      </div>

      <ExercisePickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={addExercise}
      />

      <RestTimerOverlay
        visible={restVisible}
        seconds={REST_SECONDS}
        onDismiss={() => setRestVisible(false)}
        onComplete={() => setRestVisible(false)}
      />

      {showFinishDialog && (
        <FinishDialog
          effort={effort}
          setEffort={setEffort}
          onConfirm={() => { setShowFinishDialog(false); handleFinish() }}
          onDiscard={() => { store.discardWorkout(); navigate('/fitness/log') }}
          onCancel={() => setShowFinishDialog(false)}
          isPending={finish.isPending}
          duration={elapsed}
          totalSets={totalCompletedSets}
          exerciseCount={store.exercises.length}
        />
      )}
    </div>
  )
}

function FinishDialog({
  effort, setEffort, onConfirm, onDiscard, onCancel, isPending, duration, totalSets, exerciseCount,
}: {
  effort: number | null
  setEffort: (n: number | null) => void
  onConfirm: () => void
  onDiscard: () => void
  onCancel: () => void
  isPending: boolean
  duration: number
  totalSets: number
  exerciseCount: number
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 pb-4 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-slate-700/50">
          <h3 className="font-bold text-base mb-1">Finalizar entreno</h3>
          <div className="flex gap-4 text-sm text-slate-400">
            <span>⏱ {formatDuration(duration)}</span>
            <span>💪 {exerciseCount} ejercicios</span>
            <span>✓ {totalSets} series</span>
          </div>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <p className="text-xs text-slate-400 mb-2">Esfuerzo percibido</p>
            <div className="flex gap-1.5 flex-wrap">
              {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                <button
                  key={n}
                  onClick={() => setEffort(n === effort ? null : n)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold border transition-colors ${
                    effort === n
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <Button variant="fitness" className="w-full h-11 font-semibold" onClick={onConfirm} disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar entreno'}
          </Button>
          <button onClick={onDiscard} className="w-full py-2 text-sm text-red-400">
            Descartar entreno
          </button>
          <button onClick={onCancel} className="w-full py-2 text-sm text-slate-400 flex items-center justify-center gap-1">
            <ChevronDown className="w-4 h-4" /> Seguir entrenando
          </button>
        </div>
      </div>
    </div>
  )
}
