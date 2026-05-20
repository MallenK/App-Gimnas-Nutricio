import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MealLog } from '@/types/nutrition'
import type { MealType } from '@/lib/constants'

interface MealSectionProps {
  mealType: MealType
  label: string
  icon: string
  logs: MealLog[]
  onAddFood: (mealType: MealType) => void
  onDelete: (logId: string) => void
  isDeleting?: boolean
}

export function MealSection({
  mealType,
  label,
  icon,
  logs,
  onAddFood,
  onDelete,
  isDeleting,
}: MealSectionProps) {
  const [expanded, setExpanded] = useState(true)

  const totals = logs.reduce(
    (acc, l) => ({
      calories: acc.calories + l.calories,
      protein: acc.protein + l.protein_g,
      carbs: acc.carbs + l.carbs_g,
      fat: acc.fat + l.fat_g,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )

  return (
    <div className="rounded-2xl bg-slate-800/60 border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="font-semibold text-sm">{label}</span>
          {logs.length > 0 && (
            <span className="text-xs text-slate-400 ml-1">
              {Math.round(totals.calories)} kcal
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onAddFood(mealType)
            }}
          >
            <Plus className="w-4 h-4" />
          </button>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </div>
      </div>

      {/* Food list */}
      {expanded && (
        <div className="border-t border-slate-700/50">
          {logs.length === 0 ? (
            <div
              className="py-4 px-4 text-center text-slate-500 text-xs cursor-pointer hover:text-slate-400 transition-colors"
              onClick={() => onAddFood(mealType)}
            >
              Toca + para añadir alimentos
            </div>
          ) : (
            <>
              {logs.map((log) => (
                <FoodLogItem
                  key={log.id}
                  log={log}
                  onDelete={() => onDelete(log.id)}
                  isDeleting={isDeleting}
                />
              ))}
              {/* Meal totals */}
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900/40 text-xs text-slate-400">
                <span>Total</span>
                <div className="flex gap-3">
                  <span className="text-blue-400">{Math.round(totals.protein)}P</span>
                  <span className="text-orange-400">{Math.round(totals.carbs)}C</span>
                  <span className="text-yellow-400">{Math.round(totals.fat)}G</span>
                  <span className="text-white font-medium">{Math.round(totals.calories)} kcal</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function FoodLogItem({
  log,
  onDelete,
  isDeleting,
}: {
  log: MealLog
  onDelete: () => void
  isDeleting?: boolean
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-700/30 last:border-b-0 hover:bg-slate-700/20 transition-colors group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{log.food?.name ?? 'Alimento'}</p>
        <p className="text-xs text-slate-400">{log.quantity_g}g</p>
      </div>
      <div className="flex items-center gap-3 text-xs shrink-0">
        <span className="text-blue-400">{Math.round(log.protein_g)}P</span>
        <span className="text-orange-400">{Math.round(log.carbs_g)}C</span>
        <span className="text-yellow-400">{Math.round(log.fat_g)}G</span>
        <span className="text-slate-300 w-12 text-right">{Math.round(log.calories)} kcal</span>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className={cn(
            'opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-slate-500 hover:text-red-400',
            isDeleting && 'opacity-50 cursor-not-allowed',
          )}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
