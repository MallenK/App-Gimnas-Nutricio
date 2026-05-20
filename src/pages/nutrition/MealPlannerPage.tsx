import { useState } from 'react'
import { Plus, Trash2, Calendar, ChevronDown, ChevronUp, CalendarCheck } from 'lucide-react'
import { format } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  useMealPlanTemplates,
  useMealPlanTemplate,
  useCreateMealPlanTemplate,
  useDeleteMealPlanTemplate,
  useAddMealPlanEntry,
  useRemoveMealPlanEntry,
  useApplyTemplateDay,
} from '@/hooks/nutrition/useMealPlan'
import { useFoodSearch } from '@/hooks/nutrition/useFoodSearch'
import { useToast } from '@/hooks/use-toast'
import { MEAL_TYPES, DAYS_OF_WEEK } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { MealPlanEntry } from '@/types/nutrition'
import type { Food } from '@/types/nutrition'
import type { MealType } from '@/lib/constants'

// ─── Add food to plan entry sheet ─────────────────────────────────────────────

function AddPlanEntrySheet({
  open,
  templateId,
  dayOfWeek,
  onClose,
}: {
  open: boolean
  templateId: string
  dayOfWeek: number
  onClose: () => void
}) {
  const [mealType, setMealType] = useState<MealType>('lunch')
  const [qty, setQty] = useState('100')
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const { query, setQuery, results, isLoading } = useFoodSearch()
  const addEntry = useAddMealPlanEntry(templateId)

  async function handleAdd() {
    if (!selectedFood) return
    await addEntry.mutateAsync({
      meal_plan_template_id: templateId,
      food_id: selectedFood.id,
      day_of_week: dayOfWeek,
      meal_type: mealType,
      quantity_g: parseFloat(qty) || 100,
    } as Omit<MealPlanEntry, 'id' | 'food'>)
    setSelectedFood(null)
    setQuery('')
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[90dvh] bg-slate-900 border-slate-700 p-0 gap-0 flex flex-col">
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-slate-700/50">
          <SheetTitle className="text-base">
            Añadir — {DAYS_OF_WEEK.find((d) => d.value === dayOfWeek)?.label}
          </SheetTitle>
        </SheetHeader>

        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {/* Meal type */}
          <div className="flex gap-2 flex-wrap">
            {MEAL_TYPES.map((m) => (
              <button
                key={m.value}
                onClick={() => setMealType(m.value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  mealType === m.value
                    ? 'bg-nutrition/20 border-nutrition text-nutrition'
                    : 'bg-slate-800 border-slate-700 text-slate-400',
                )}
              >
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          {/* Food search */}
          {!selectedFood ? (
            <>
              <Input
                autoFocus
                placeholder="Buscar alimento..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-slate-800 border-slate-600"
              />
              <div className="rounded-xl bg-slate-800/50 overflow-hidden divide-y divide-slate-700/30 max-h-48 overflow-y-auto">
                {isLoading && <p className="text-xs text-slate-500 text-center py-4">Buscando...</p>}
                {!isLoading && results.length === 0 && query.length > 1 && (
                  <p className="text-xs text-slate-500 text-center py-4">Sin resultados</p>
                )}
                {results.map((food) => (
                  <button
                    key={food.id || food.name}
                    onClick={() => setSelectedFood(food)}
                    className="w-full text-left px-3 py-2.5 hover:bg-slate-700/40 transition-colors"
                  >
                    <p className="text-sm font-medium truncate">{food.name}</p>
                    <p className="text-xs text-slate-500">{food.calories_per_100g} kcal/100g</p>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-xl bg-nutrition/10 border border-nutrition/30 p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{selectedFood.name}</p>
                <p className="text-xs text-slate-400">{selectedFood.calories_per_100g} kcal/100g</p>
              </div>
              <button onClick={() => setSelectedFood(null)} className="text-slate-500 hover:text-red-400 p-1">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {selectedFood && (
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Cantidad (g)</label>
              <Input
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="bg-slate-800 border-slate-600 w-28"
              />
            </div>
          )}

          <Button
            onClick={handleAdd}
            disabled={!selectedFood || addEntry.isPending}
            className="w-full bg-nutrition hover:bg-nutrition/90"
          >
            Añadir al plan
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ─── Template editor ───────────────────────────────────────────────────────────

function TemplateEditor({ templateId }: { templateId: string }) {
  const { data: template, isLoading } = useMealPlanTemplate(templateId)
  const removeEntry = useRemoveMealPlanEntry(templateId)
  const applyDay = useApplyTemplateDay(templateId)
  const { toast } = useToast()

  const [selectedDay, setSelectedDay] = useState(0)
  const [addSheetOpen, setAddSheetOpen] = useState(false)
  const [expandedMeal, setExpandedMeal] = useState<MealType | null>(null)

  if (isLoading) return <div className="h-32 rounded-2xl bg-slate-800/40 animate-pulse mx-4" />
  if (!template) return null

  const dayEntries = (template.entries ?? []).filter((e) => e.day_of_week === selectedDay)

  async function handleApplyToday() {
    const today = format(new Date(), 'yyyy-MM-dd')
    const dayOfWeek = (new Date().getDay() + 6) % 7 // 0=Mon
    await applyDay.mutateAsync({ dayOfWeek, date: today })
    toast({ title: '¡Aplicado!', description: `Plan del ${DAYS_OF_WEEK.find(d => d.value === dayOfWeek)?.label} copiado al diario de hoy` })
  }

  return (
    <div className="px-4 pt-3 space-y-4">
      {/* Day tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
        {DAYS_OF_WEEK.map((d) => {
          const count = (template.entries ?? []).filter((e) => e.day_of_week === d.value).length
          return (
            <button
              key={d.value}
              onClick={() => setSelectedDay(d.value)}
              className={cn(
                'shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-xs font-medium border transition-colors',
                selectedDay === d.value
                  ? 'bg-nutrition/20 border-nutrition text-nutrition'
                  : 'bg-slate-800 border-slate-700 text-slate-400',
              )}
            >
              <span>{d.short}</span>
              {count > 0 && <span className="text-[10px] mt-0.5 text-slate-500">{count}</span>}
            </button>
          )
        })}
      </div>

      {/* Apply today button */}
      <button
        onClick={handleApplyToday}
        disabled={applyDay.isPending}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-nutrition/10 border border-nutrition/30 text-nutrition text-sm font-medium hover:bg-nutrition/20 transition-colors"
      >
        <CalendarCheck className="w-4 h-4" />
        {applyDay.isPending ? 'Aplicando...' : 'Aplicar hoy al diario'}
      </button>

      {/* Meal sections */}
      {MEAL_TYPES.map((meal) => {
        const mealEntries = dayEntries.filter((e) => e.meal_type === meal.value)
        const mealCals = mealEntries.reduce(
          (sum, e) => sum + ((e.food?.calories_per_100g ?? 0) * e.quantity_g) / 100,
          0,
        )

        return (
          <div key={meal.value} className="rounded-2xl bg-slate-800/40 border border-slate-700/30 overflow-hidden">
            <button
              onClick={() => setExpandedMeal(expandedMeal === meal.value ? null : meal.value)}
              className="w-full flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <span>{meal.icon}</span>
                <span className="text-sm font-medium">{meal.label}</span>
                {mealEntries.length > 0 && (
                  <span className="text-xs text-slate-500">{Math.round(mealCals)} kcal</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setAddSheetOpen(true); setExpandedMeal(meal.value) }}
                  className="p-1 rounded-full bg-nutrition/15 text-nutrition hover:bg-nutrition/30 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                {expandedMeal === meal.value ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </div>
            </button>

            {expandedMeal === meal.value && (
              <div className="border-t border-slate-700/30">
                {mealEntries.length === 0 ? (
                  <p className="text-xs text-slate-600 italic px-4 py-2">Sin alimentos — pulsa + para añadir</p>
                ) : (
                  mealEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center gap-3 px-4 py-2 border-b border-slate-700/20 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{entry.food?.name ?? '—'}</p>
                        <p className="text-xs text-slate-500">
                          {entry.quantity_g}g · {Math.round(((entry.food?.calories_per_100g ?? 0) * entry.quantity_g) / 100)} kcal
                        </p>
                      </div>
                      <button
                        onClick={() => removeEntry.mutate(entry.id)}
                        className="p-1 text-slate-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )
      })}

      <AddPlanEntrySheet
        open={addSheetOpen}
        templateId={templateId}
        dayOfWeek={selectedDay}
        onClose={() => setAddSheetOpen(false)}
      />
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export function MealPlannerPage() {
  const { data: templates = [], isLoading } = useMealPlanTemplates()
  const createTemplate = useCreateMealPlanTemplate()
  const deleteTemplate = useDeleteMealPlanTemplate()

  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null)

  async function handleCreate() {
    if (!newName.trim()) return
    const t = await createTemplate.mutateAsync(newName.trim())
    setNewName('')
    setCreating(false)
    setActiveTemplateId(t.id)
  }

  return (
    <div className="pb-28 animate-fade-in">
      <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-nutrition" />
          <h1 className="font-bold text-base">Planificador semanal</h1>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="w-8 h-8 rounded-full bg-nutrition/20 text-nutrition flex items-center justify-center"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Template list */}
      <div className="px-4 pt-4 space-y-2">
        {creating && (
          <div className="rounded-2xl bg-slate-800/60 border border-slate-700/40 p-4 space-y-3">
            <p className="text-sm font-medium text-slate-300">Nueva plantilla</p>
            <Input
              autoFocus
              placeholder="Ej. Definición verano, Volumen..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false) }}
              className="bg-slate-700 border-slate-600"
            />
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={!newName.trim()} size="sm" className="bg-nutrition hover:bg-nutrition/90 flex-1">
                Crear
              </Button>
              <Button onClick={() => setCreating(false)} variant="ghost" size="sm">Cancelar</Button>
            </div>
          </div>
        )}

        {isLoading && [1, 2].map((i) => <div key={i} className="h-14 rounded-2xl bg-slate-800/40 animate-pulse" />)}

        {!isLoading && templates.length === 0 && !creating && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="text-5xl">📅</div>
            <div>
              <p className="font-semibold text-lg mb-1">Sin plantillas</p>
              <p className="text-slate-400 text-sm">Crea una plantilla semanal de comidas reutilizable</p>
            </div>
            <Button onClick={() => setCreating(true)} className="bg-nutrition hover:bg-nutrition/90">
              <Plus className="w-4 h-4 mr-2" />
              Nueva plantilla
            </Button>
          </div>
        )}

        {templates.map((t) => (
          <div key={t.id} className="rounded-2xl bg-slate-800/50 border border-slate-700/30 overflow-hidden">
            <button
              onClick={() => setActiveTemplateId(activeTemplateId === t.id ? null : t.id)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-nutrition/15 flex items-center justify-center text-base">📋</div>
                <p className="font-medium text-sm">{t.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); deleteTemplate.mutate(t.id); if (activeTemplateId === t.id) setActiveTemplateId(null) }}
                  className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {activeTemplateId === t.id ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </div>
            </button>

            {activeTemplateId === t.id && <TemplateEditor templateId={t.id} />}
          </div>
        ))}
      </div>
    </div>
  )
}
