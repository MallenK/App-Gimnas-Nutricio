import { useState, useEffect } from 'react'
import { Search, Loader2, AlertCircle, ChevronLeft, Plus, Minus } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useFoodSearch } from '@/hooks/nutrition/useFoodSearch'
import { cn, calcMacros } from '@/lib/utils'
import { MEAL_TYPES } from '@/lib/constants'
import type { Food } from '@/types/nutrition'
import type { MealType } from '@/lib/constants'

interface AddFoodSheetProps {
  open: boolean
  defaultMealType?: MealType
  onClose: () => void
  onAdd: (food: Food, mealType: MealType, quantityG: number) => void
  isAdding?: boolean
}

type Step = 'search' | 'quantity'

export function AddFoodSheet({
  open,
  defaultMealType = 'breakfast',
  onClose,
  onAdd,
  isAdding,
}: AddFoodSheetProps) {
  const [step, setStep] = useState<Step>('search')
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [mealType, setMealType] = useState<MealType>(defaultMealType)
  const [quantity, setQuantity] = useState('')

  const { query, setQuery, results, isLoading } = useFoodSearch()

  useEffect(() => {
    if (open) {
      setStep('search')
      setSelectedFood(null)
      setQuery('')
      setMealType(defaultMealType)
    }
  }, [open, defaultMealType, setQuery])

  function selectFood(food: Food) {
    setSelectedFood(food)
    setQuantity(String(food.serving_size_g))
    setStep('quantity')
  }

  function handleAdd() {
    if (!selectedFood) return
    const qty = parseFloat(quantity)
    if (!qty || qty <= 0) return
    onAdd(selectedFood, mealType, qty)
  }

  const previewMacros =
    selectedFood && quantity
      ? calcMacros(
          {
            calories: selectedFood.calories_per_100g,
            protein: selectedFood.protein_per_100g,
            carbs: selectedFood.carbs_per_100g,
            fat: selectedFood.fat_per_100g,
          },
          parseFloat(quantity) || 0,
        )
      : null

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[92dvh] flex flex-col p-0 gap-0 bg-slate-900 border-slate-700">
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            {step === 'quantity' && (
              <button
                onClick={() => setStep('search')}
                className="p-1 -ml-1 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <SheetTitle className="text-base">
              {step === 'search' ? 'Añadir alimento' : selectedFood?.name}
            </SheetTitle>
          </div>
        </SheetHeader>

        {step === 'search' ? (
          <SearchStep
            query={query}
            setQuery={setQuery}
            results={results}
            isLoading={isLoading}
            onSelect={selectFood}
          />
        ) : (
          <QuantityStep
            food={selectedFood!}
            quantity={quantity}
            setQuantity={setQuantity}
            mealType={mealType}
            setMealType={setMealType}
            previewMacros={previewMacros}
            onAdd={handleAdd}
            isAdding={isAdding}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

function SearchStep({
  query,
  setQuery,
  results,
  isLoading,
  onSelect,
}: {
  query: string
  setQuery: (q: string) => void
  results: Food[]
  isLoading: boolean
  onSelect: (food: Food) => void
}) {
  return (
    <>
      <div className="px-4 py-3 border-b border-slate-700/30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            autoFocus
            placeholder="Buscar alimento..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-slate-800 border-slate-600 h-10"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {results.length === 0 && query.trim().length >= 2 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-sm gap-2">
            <AlertCircle className="w-8 h-8 text-slate-600" />
            No se encontraron resultados
          </div>
        )}
        {results.length === 0 && query.trim().length < 2 && (
          <div className="py-12 text-center text-slate-500 text-sm">
            Escribe al menos 2 caracteres para buscar
          </div>
        )}
        {results.map((food, i) => (
          <FoodSearchItem key={food.id || food.off_id || i} food={food} onSelect={onSelect} />
        ))}
      </div>
    </>
  )
}

function FoodSearchItem({ food, onSelect }: { food: Food; onSelect: (f: Food) => void }) {
  const hasIncompleteData =
    food.calories_per_100g === 0 ||
    (food.protein_per_100g === 0 && food.carbs_per_100g === 0 && food.fat_per_100g === 0)

  return (
    <button
      className="w-full flex items-center gap-3 px-4 py-3 border-b border-slate-700/30 last:border-0 hover:bg-slate-800/60 transition-colors text-left"
      onClick={() => onSelect(food)}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{food.name}</p>
        <p className="text-xs text-slate-400 truncate">
          {food.brand ? `${food.brand} · ` : ''}
          {food.calories_per_100g} kcal/100g
          {!food.id && (
            <span className="ml-1 text-indigo-400">· OpenFoodFacts</span>
          )}
          {food.is_custom && (
            <span className="ml-1 text-emerald-400">· Personalizado</span>
          )}
        </p>
      </div>
      <div className="text-xs text-slate-500 shrink-0 text-right">
        <div className="text-blue-400">{food.protein_per_100g}P</div>
        <div className="text-orange-400">{food.carbs_per_100g}C</div>
        <div className="text-yellow-400">{food.fat_per_100g}G</div>
        {hasIncompleteData && (
          <AlertCircle className="w-3 h-3 text-amber-500 mt-0.5 ml-auto" />
        )}
      </div>
    </button>
  )
}

function QuantityStep({
  food,
  quantity,
  setQuantity,
  mealType,
  setMealType,
  previewMacros,
  onAdd,
  isAdding,
}: {
  food: Food
  quantity: string
  setQuantity: (q: string) => void
  mealType: MealType
  setMealType: (m: MealType) => void
  previewMacros: ReturnType<typeof calcMacros> | null
  onAdd: () => void
  isAdding?: boolean
}) {
  function adjustQty(delta: number) {
    const current = parseFloat(quantity) || 0
    const next = Math.max(1, Math.round(current + delta))
    setQuantity(String(next))
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Food info */}
      <div className="px-4 py-3 border-b border-slate-700/30">
        {food.brand && <p className="text-xs text-slate-400 mb-0.5">{food.brand}</p>}
        <div className="flex gap-4 text-xs mt-2">
          <MacroChip label="Prot" value={food.protein_per_100g} color="text-blue-400" />
          <MacroChip label="HC" value={food.carbs_per_100g} color="text-orange-400" />
          <MacroChip label="Grasas" value={food.fat_per_100g} color="text-yellow-400" />
          <MacroChip label="Kcal" value={food.calories_per_100g} color="text-slate-300" />
          <span className="text-slate-500 self-end">por 100g</span>
        </div>
      </div>

      {/* Quantity */}
      <div className="px-4 py-4 border-b border-slate-700/30">
        <label className="text-xs text-slate-400 block mb-2">Cantidad (gramos)</label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => adjustQty(-10)}
            className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center hover:bg-slate-600 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <Input
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="text-center text-lg font-bold bg-slate-800 border-slate-600 h-10 w-24"
          />
          <button
            onClick={() => adjustQty(10)}
            className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center hover:bg-slate-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <span className="text-slate-400 text-sm">g</span>
        </div>
      </div>

      {/* Meal type */}
      <div className="px-4 py-4 border-b border-slate-700/30">
        <label className="text-xs text-slate-400 block mb-2">Comida</label>
        <div className="grid grid-cols-2 gap-2">
          {MEAL_TYPES.map((m) => (
            <button
              key={m.value}
              onClick={() => setMealType(m.value as MealType)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-colors',
                mealType === m.value
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600',
              )}
            >
              <span>{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview macros */}
      {previewMacros && (
        <div className="px-4 py-3 mx-4 my-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <p className="text-xs text-slate-400 mb-2">Para {quantity || 0}g</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            <MacroPreview label="Kcal" value={previewMacros.calories} color="text-white" />
            <MacroPreview label="Prot" value={previewMacros.protein} color="text-blue-400" />
            <MacroPreview label="HC" value={previewMacros.carbs} color="text-orange-400" />
            <MacroPreview label="Gras" value={previewMacros.fat} color="text-yellow-400" />
          </div>
        </div>
      )}

      {/* Add button */}
      <div className="px-4 pb-6">
        <Button
          variant="nutrition"
          className="w-full h-12 text-base font-semibold"
          onClick={onAdd}
          disabled={isAdding || !quantity || parseFloat(quantity) <= 0}
        >
          {isAdding ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Añadir al registro'
          )}
        </Button>
      </div>
    </div>
  )
}

function MacroChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <span className={cn('font-semibold', color)}>{value}g</span>
      <span className="text-slate-500 ml-0.5">{label}</span>
    </div>
  )
}

function MacroPreview({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <p className={cn('font-bold text-base', color)}>{Math.round(value)}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  )
}
