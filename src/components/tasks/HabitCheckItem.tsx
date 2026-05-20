import { motion } from 'framer-motion'
import { Flame, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HabitWithLog } from '@/services/tasks/habit.service'

const DEFAULT_COLOR = '#06b6d4'

interface HabitCheckItemProps {
  habit: HabitWithLog
  onToggle: (completed: boolean) => void
  onEdit: () => void
  onDelete: () => void
  streak?: number
  isToggling?: boolean
}

export function HabitCheckItem({
  habit,
  onToggle,
  onEdit,
  onDelete,
  streak = 0,
  isToggling,
}: HabitCheckItemProps) {
  const completed = habit.log?.completed ?? false
  const color = habit.color ?? DEFAULT_COLOR

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200',
        completed
          ? 'bg-slate-800/80 border-slate-600/60'
          : 'bg-slate-800/40 border-slate-700/40',
      )}
    >
      {/* Check button */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => !isToggling && onToggle(!completed)}
        disabled={isToggling}
        className="shrink-0 relative"
        aria-label={completed ? 'Marcar incompleto' : 'Marcar completo'}
      >
        <div
          className={cn(
            'w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-200',
            completed ? 'border-transparent' : 'border-slate-600',
          )}
          style={completed ? { backgroundColor: color } : undefined}
        >
          {completed && (
            <motion.svg
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </motion.svg>
          )}
        </div>
      </motion.button>

      {/* Icon + Name */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        {habit.icon && <span className="text-lg leading-none">{habit.icon}</span>}
        <div className="min-w-0">
          <p
            className={cn(
              'text-sm font-medium truncate transition-all duration-200',
              completed && 'line-through text-slate-500',
            )}
          >
            {habit.name}
          </p>
          {habit.target_value && habit.target_unit && (
            <p className="text-xs text-slate-500">
              Meta: {habit.target_value} {habit.target_unit}
            </p>
          )}
        </div>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div className="flex items-center gap-0.5 text-xs font-medium text-orange-400 shrink-0">
          <Flame className="w-3.5 h-3.5" />
          <span>{streak}</span>
        </div>
      )}

      {/* Options menu */}
      <div className="relative group shrink-0">
        <button className="p-1 rounded text-slate-600 hover:text-slate-300 transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
        <div className="absolute right-0 top-full mt-1 hidden group-focus-within:flex flex-col bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-10 overflow-hidden min-w-[120px]">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-700 transition-colors text-left"
          >
            <Pencil className="w-3.5 h-3.5" /> Editar
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-700 transition-colors text-left text-red-400"
          >
            <Trash2 className="w-3.5 h-3.5" /> Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
