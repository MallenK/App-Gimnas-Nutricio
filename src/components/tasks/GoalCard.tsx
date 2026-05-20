import { useState } from 'react'
import { Target, Calendar, MoreVertical, Pencil, Trash2, CheckCircle2 } from 'lucide-react'
import { format, parseISO, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Goal } from '@/types/tasks'
import { GOAL_CATEGORIES } from '@/lib/constants'

interface GoalCardProps {
  goal: Goal
  onUpdateProgress: (value: number) => void
  onComplete: () => void
  onEdit: () => void
  onDelete: () => void
  isUpdating?: boolean
}

export function GoalCard({
  goal,
  onUpdateProgress,
  onComplete,
  onEdit,
  onDelete,
  isUpdating,
}: GoalCardProps) {
  const [editingProgress, setEditingProgress] = useState(false)
  const [progressInput, setProgressInput] = useState('')

  const categoryInfo = GOAL_CATEGORIES.find((c) => c.value === goal.category)
  const hasTarget = goal.target_value != null && goal.target_value > 0
  const current = goal.current_value ?? 0
  const pct = hasTarget ? Math.min((current / goal.target_value!) * 100, 100) : 0
  const daysLeft = differenceInDays(parseISO(goal.end_date), new Date())
  const isExpired = daysLeft < 0

  function saveProgress() {
    const val = parseFloat(progressInput)
    if (!isNaN(val)) onUpdateProgress(val)
    setEditingProgress(false)
    setProgressInput('')
  }

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 space-y-3 transition-colors',
        goal.status === 'completed'
          ? 'bg-slate-800/30 border-slate-700/30 opacity-75'
          : 'bg-slate-800/60 border-slate-700/40',
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {categoryInfo && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${categoryInfo.color}20`,
                  color: categoryInfo.color,
                }}
              >
                {categoryInfo.label}
              </span>
            )}
            {goal.status === 'completed' && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
          </div>
          <p className="font-semibold text-sm">{goal.title}</p>
          {goal.description && (
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{goal.description}</p>
          )}
        </div>

        {goal.status === 'active' && (
          <div className="relative group shrink-0">
            <button className="p-1 rounded text-slate-600 hover:text-slate-300 transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-focus-within:flex flex-col bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-10 overflow-hidden min-w-[130px]">
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-700 transition-colors text-left"
              >
                <Pencil className="w-3.5 h-3.5" /> Editar
              </button>
              <button
                onClick={onComplete}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-700 transition-colors text-left text-emerald-400"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Completar
              </button>
              <button
                onClick={onDelete}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-700 transition-colors text-left text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" /> Eliminar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {hasTarget && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Progreso</span>
            <span className={cn('font-medium', pct >= 100 ? 'text-emerald-400' : 'text-slate-300')}>
              {current}{goal.target_unit ? ` ${goal.target_unit}` : ''} / {goal.target_value}{goal.target_unit ? ` ${goal.target_unit}` : ''}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                backgroundColor: categoryInfo?.color ?? '#6366f1',
              }}
            />
          </div>
        </div>
      )}

      {/* Update progress */}
      {goal.status === 'active' && hasTarget && (
        <div>
          {editingProgress ? (
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                value={progressInput}
                onChange={(e) => setProgressInput(e.target.value)}
                placeholder={`${current}`}
                className="h-8 text-sm bg-slate-800 border-slate-600 w-24"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && saveProgress()}
              />
              <Button size="sm" onClick={saveProgress} disabled={isUpdating} className="h-8">
                Guardar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingProgress(false)}
                className="h-8"
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <button
              onClick={() => { setProgressInput(String(current)); setEditingProgress(true) }}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <Target className="w-3 h-3 inline mr-1" />
              Actualizar progreso
            </button>
          )}
        </div>
      )}

      {/* Dates */}
      <div className="flex items-center gap-1 text-xs text-slate-500">
        <Calendar className="w-3 h-3" />
        <span>
          {format(parseISO(goal.start_date), 'd MMM', { locale: es })} →{' '}
          {format(parseISO(goal.end_date), 'd MMM yyyy', { locale: es })}
        </span>
        {goal.status === 'active' && (
          <span className={cn('ml-1 font-medium', isExpired ? 'text-red-400' : daysLeft <= 3 ? 'text-amber-400' : 'text-slate-400')}>
            {isExpired ? '· Expirado' : `· ${daysLeft}d restantes`}
          </span>
        )}
      </div>
    </div>
  )
}
