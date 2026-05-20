import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react'
import { addDays, parseISO, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useDailyMealLogs, useAddMealLog, useDeleteMealLog } from '@/hooks/nutrition/useMealLogs'
import { useUserGoals } from '@/hooks/nutrition/useUserGoals'
import { MacroRing } from '@/components/nutrition/MacroRing'
import { MealSection } from '@/components/nutrition/MealSection'
import { AddFoodSheet } from '@/components/nutrition/AddFoodSheet'
import { todayISO, gramFromPercent } from '@/lib/utils'
import { MEAL_TYPES } from '@/lib/constants'
import { KCAL_PER_G } from '@/lib/constants'
import type { MealType } from '@/lib/constants'
import type { Food } from '@/types/nutrition'

export function FoodLogPage() {
  const { date: dateParam } = useParams<{ date?: string }>()
  const navigate = useNavigate()
  const date = dateParam ?? todayISO()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [activeMealType, setActiveMealType] = useState<MealType>('breakfast')

  const { data, isLoading } = useDailyMealLogs(date)
  const { data: goals } = useUserGoals()
  const addLog = useAddMealLog(date)
  const deleteLog = useDeleteMealLog(date)

  const nutrition = data?.nutrition
  const targetCalories = goals?.daily_calories ?? 0
  const targetProteinG = goals
    ? gramFromPercent(targetCalories, goals.protein_pct ?? 30, KCAL_PER_G.protein)
    : 0
  const targetCarbsG = goals
    ? gramFromPercent(targetCalories, goals.carbs_pct ?? 40, KCAL_PER_G.carbs)
    : 0
  const targetFatG = goals
    ? gramFromPercent(targetCalories, goals.fat_pct ?? 30, KCAL_PER_G.fat)
    : 0

  function openSheet(mealType: MealType) {
    setActiveMealType(mealType)
    setSheetOpen(true)
  }

  async function handleAddFood(food: Food, mealType: MealType, quantityG: number) {
    await addLog.mutateAsync({ food, mealType, quantityG })
    setSheetOpen(false)
  }

  function navigateDate(delta: number) {
    const next = format(addDays(parseISO(date), delta), 'yyyy-MM-dd')
    navigate(next === todayISO() ? '/nutrition/log' : `/nutrition/log/${next}`)
  }

  const dateLabel = (() => {
    const d = parseISO(date)
    const today = todayISO()
    const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd')
    if (date === today) return 'Hoy'
    if (date === yesterday) return 'Ayer'
    return format(d, "d 'de' MMMM", { locale: es })
  })()

  return (
    <div className="pb-24 animate-fade-in">
      {/* Date nav */}
      <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigateDate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 transition-colors text-slate-400"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-sm">{dateLabel}</span>
        <button
          onClick={() => navigateDate(1)}
          disabled={date === todayISO()}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 transition-colors text-slate-400 disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Macro summary card */}
        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/40 p-4">
          <div className="flex items-center gap-4">
            {/* Ring */}
            <MacroRing
              calories={nutrition?.calories ?? 0}
              targetCalories={targetCalories}
              proteinG={nutrition?.protein_g ?? 0}
              carbsG={nutrition?.carbs_g ?? 0}
              fatG={nutrition?.fat_g ?? 0}
            />

            {/* Macro bars */}
            <div className="flex-1 space-y-2.5">
              <MacroBar
                label="Proteínas"
                value={nutrition?.protein_g ?? 0}
                target={targetProteinG}
                color="bg-blue-500"
                unit="g"
              />
              <MacroBar
                label="Carboh."
                value={nutrition?.carbs_g ?? 0}
                target={targetCarbsG}
                color="bg-orange-500"
                unit="g"
              />
              <MacroBar
                label="Grasas"
                value={nutrition?.fat_g ?? 0}
                target={targetFatG}
                color="bg-yellow-500"
                unit="g"
              />
            </div>
          </div>

          {targetCalories === 0 && (
            <button
              onClick={() => navigate('/settings/goals')}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs hover:bg-indigo-500/20 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              Configura tus objetivos calóricos
            </button>
          )}
        </div>

        {/* Meal sections */}
        {isLoading ? (
          <div className="space-y-3">
            {MEAL_TYPES.map((m) => (
              <div key={m.value} className="h-16 rounded-2xl bg-slate-800/40 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {MEAL_TYPES.map((m) => (
              <MealSection
                key={m.value}
                mealType={m.value as MealType}
                label={m.label}
                icon={m.icon}
                logs={data?.nutrition.byMeal[m.value as MealType] ?? []}
                onAddFood={openSheet}
                onDelete={(id) => deleteLog.mutate(id)}
                isDeleting={deleteLog.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add food sheet */}
      <AddFoodSheet
        open={sheetOpen}
        defaultMealType={activeMealType}
        onClose={() => setSheetOpen(false)}
        onAdd={handleAddFood}
        isAdding={addLog.isPending}
      />
    </div>
  )
}

function MacroBar({
  label,
  value,
  target,
  color,
  unit,
}: {
  label: string
  value: number
  target: number
  color: string
  unit: string
}) {
  const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0
  const over = target > 0 && value > target

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className={over ? 'text-red-400' : 'text-slate-300'}>
          {Math.round(value)}{unit}
          {target > 0 && <span className="text-slate-500"> / {target}{unit}</span>}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${over ? 'bg-red-500' : color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
