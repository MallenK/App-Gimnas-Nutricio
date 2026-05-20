import { Trash2, Plus, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MUSCLE_GROUPS } from '@/lib/constants'
import type { ActiveExercise, ActiveSet } from '@/types/fitness'

interface ActiveExerciseBlockProps {
  exercise: ActiveExercise
  onAddSet: () => void
  onUpdateSet: (setId: string, data: Partial<ActiveSet>) => void
  onRemoveSet: (setId: string) => void
  onRemoveExercise: () => void
  onSetCompleted: (setId: string) => void
}

export function ActiveExerciseBlock({
  exercise,
  onAddSet,
  onUpdateSet,
  onRemoveExercise,
  onSetCompleted,
}: ActiveExerciseBlockProps) {
  const muscleLabel =
    MUSCLE_GROUPS.find((m) => m.value === exercise.muscleGroup)?.label ?? exercise.muscleGroup

  return (
    <div className="rounded-2xl bg-slate-800/60 border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/40">
        {exercise.imageUrl ? (
          <img
            src={exercise.imageUrl}
            alt={exercise.exerciseName}
            className="w-12 h-12 rounded-xl object-cover shrink-0 bg-slate-700"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-fitness/15 flex items-center justify-center shrink-0 text-xl">
            💪
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{exercise.exerciseName}</p>
          <p className="text-xs text-slate-400">{muscleLabel}</p>
        </div>
        <button
          onClick={onRemoveExercise}
          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-700 transition-colors shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Sets header */}
      <div className="grid grid-cols-[32px_1fr_1fr_40px_36px] gap-1.5 px-4 py-2 text-xs text-slate-500 border-b border-slate-700/40">
        <span>Set</span>
        <span className="text-center">Peso (kg)</span>
        <span className="text-center">Reps</span>
        <span className="text-center">RPE</span>
        <span />
      </div>

      {/* Sets */}
      {exercise.sets.map((set, idx) => (
        <SetRow
          key={set.setId}
          set={set}
          setNumber={idx + 1}
          onUpdate={(data) => onUpdateSet(set.setId, data)}
          onComplete={() => onSetCompleted(set.setId)}
        />
      ))}

      {/* Add set */}
      <button
        onClick={onAddSet}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs text-orange-400 hover:bg-slate-700/30 transition-colors border-t border-slate-700/40"
      >
        <Plus className="w-3.5 h-3.5" />
        Añadir serie
      </button>
    </div>
  )
}

interface SetRowProps {
  set: ActiveSet
  setNumber: number
  onUpdate: (data: Partial<ActiveSet>) => void
  onComplete: () => void
}

function SetRow({ set, setNumber, onUpdate, onComplete }: SetRowProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-[32px_1fr_1fr_40px_36px] gap-1.5 items-center px-4 py-2 border-b border-slate-700/30 last:border-0 transition-colors',
        set.isCompleted && 'bg-orange-500/5',
      )}
    >
      {/* Set number + warmup toggle */}
      <button
        onClick={() => onUpdate({ isWarmup: !set.isWarmup })}
        title="Marcar como calentamiento"
        className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
          set.isWarmup
            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
            : 'bg-slate-700 text-slate-400 hover:bg-slate-600',
        )}
      >
        {set.isWarmup ? <Flame className="w-3.5 h-3.5" /> : setNumber}
      </button>

      {/* Weight */}
      <input
        type="number"
        inputMode="decimal"
        min="0"
        step="0.5"
        value={set.weightKg ?? ''}
        onChange={(e) =>
          onUpdate({ weightKg: e.target.value ? parseFloat(e.target.value) : null })
        }
        placeholder="—"
        className={cn(
          'w-full text-center text-sm bg-slate-700/50 border border-slate-600/50 rounded-lg py-1.5 focus:outline-none focus:border-orange-500/50 transition-colors',
          set.isCompleted && 'text-slate-400',
        )}
      />

      {/* Reps */}
      <input
        type="number"
        inputMode="numeric"
        min="0"
        value={set.reps ?? ''}
        onChange={(e) =>
          onUpdate({ reps: e.target.value ? parseInt(e.target.value) : null })
        }
        placeholder="—"
        className={cn(
          'w-full text-center text-sm bg-slate-700/50 border border-slate-600/50 rounded-lg py-1.5 focus:outline-none focus:border-orange-500/50 transition-colors',
          set.isCompleted && 'text-slate-400',
        )}
      />

      {/* RPE */}
      <input
        type="number"
        inputMode="numeric"
        min="1"
        max="10"
        value={set.rpe ?? ''}
        onChange={(e) =>
          onUpdate({ rpe: e.target.value ? parseFloat(e.target.value) : null })
        }
        placeholder="—"
        className={cn(
          'w-full text-center text-xs bg-slate-700/50 border border-slate-600/50 rounded-lg py-1.5 focus:outline-none focus:border-orange-500/50 transition-colors',
          set.isCompleted && 'text-slate-400',
        )}
      />

      {/* Complete / Delete */}
      <button
        onClick={() => {
          if (set.isCompleted) {
            onUpdate({ isCompleted: false })
          } else {
            onComplete()
          }
        }}
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center transition-all',
          set.isCompleted
            ? 'bg-orange-500 text-white'
            : 'bg-slate-700 text-slate-400 hover:bg-orange-500/30 hover:text-orange-400',
        )}
      >
        {set.isCompleted ? (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>
    </div>
  )
}
