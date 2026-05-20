import { Search, Loader2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { useExerciseSearch } from '@/hooks/fitness/useExercises'
import { MUSCLE_GROUPS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Exercise } from '@/types/fitness'
import type { MuscleGroup } from '@/lib/constants'

interface ExercisePickerSheetProps {
  open: boolean
  onClose: () => void
  onSelect: (exercise: Exercise) => void
}

export function ExercisePickerSheet({ open, onClose, onSelect }: ExercisePickerSheetProps) {
  const { query, setQuery, muscleGroup, setMuscleGroup, exercises, isLoading } = useExerciseSearch()

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[92dvh] flex flex-col p-0 gap-0 bg-slate-900 border-slate-700">
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-slate-700/50">
          <SheetTitle className="text-base">Añadir ejercicio</SheetTitle>
        </SheetHeader>

        {/* Search */}
        <div className="px-4 py-3 border-b border-slate-700/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              autoFocus
              placeholder="Buscar ejercicio..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 bg-slate-800 border-slate-600 h-10"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
            )}
          </div>
        </div>

        {/* Muscle group filter */}
        <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide border-b border-slate-700/30 shrink-0">
          <FilterChip
            label="Todos"
            active={muscleGroup === 'all'}
            onClick={() => setMuscleGroup('all')}
          />
          {MUSCLE_GROUPS.map((m) => (
            <FilterChip
              key={m.value}
              label={m.label}
              active={muscleGroup === m.value}
              onClick={() => setMuscleGroup(m.value as MuscleGroup)}
            />
          ))}
        </div>

        {/* Exercise list */}
        <div className="flex-1 overflow-y-auto">
          {exercises.length === 0 && !isLoading && (
            <div className="py-12 text-center text-slate-400 text-sm">
              {query ? 'Sin resultados' : 'Escribe para buscar ejercicios'}
            </div>
          )}
          {exercises.map((ex) => (
            <button
              key={ex.id}
              onClick={() => { onSelect(ex); onClose() }}
              className="w-full flex items-center gap-3 px-4 py-3 border-b border-slate-700/30 last:border-0 hover:bg-slate-800/60 transition-colors text-left"
            >
              {ex.image_url ? (
                <img
                  src={ex.image_url}
                  alt={ex.name}
                  className="w-10 h-10 rounded-lg object-cover shrink-0 bg-slate-700"
                  loading="lazy"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-fitness/15 flex items-center justify-center shrink-0 text-base">
                  💪
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{ex.name}</p>
                <p className="text-xs text-slate-400">
                  {MUSCLE_GROUPS.find((m) => m.value === ex.muscle_group)?.label ?? ex.muscle_group}
                  {ex.equipment && ` · ${ex.equipment}`}
                </p>
              </div>
              {ex.is_custom && (
                <span className="text-xs text-orange-400 shrink-0">Custom</span>
              )}
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors',
        active
          ? 'bg-orange-500/20 border-orange-500 text-orange-400'
          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600',
      )}
    >
      {label}
    </button>
  )
}
