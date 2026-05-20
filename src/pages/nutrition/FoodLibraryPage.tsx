import { useState } from 'react'
import { Plus, Search, Trash2, Library, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUserCustomFoods, createCustomFood, deleteCustomFood } from '@/services/nutrition/food.service'
import { searchLocalFoods } from '@/services/nutrition/food.service'
import { useAuth } from '@/hooks/auth/useAuth'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'
import type { Food } from '@/types/nutrition'

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useCustomFoods() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const query = useQuery({
    queryKey: ['custom_foods', user?.id],
    queryFn: () => getUserCustomFoods(user!.id),
    enabled: !!user?.id,
  })
  const create = useMutation({
    mutationFn: (food: Parameters<typeof createCustomFood>[0]) => createCustomFood(food),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom_foods', user?.id] }),
  })
  const remove = useMutation({
    mutationFn: deleteCustomFood,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom_foods', user?.id] }),
  })
  return { ...query, create, remove }
}

function useFoodSearch(query: string) {
  const dq = useDebounce(query, 300)
  return useQuery({
    queryKey: ['food_search_library', dq],
    queryFn: () => searchLocalFoods(dq),
    enabled: dq.length > 1,
    staleTime: 2 * 60_000,
  })
}

// ─── Create food sheet ─────────────────────────────────────────────────────────

interface CreateFoodData {
  name: string
  brand: string
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
  serving_size_g: number
}

function CreateFoodSheet({
  open,
  onClose,
  onCreate,
  isCreating,
}: {
  open: boolean
  onClose: () => void
  onCreate: (data: CreateFoodData) => Promise<void>
  isCreating: boolean
}) {
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [serving, setServing] = useState('100')

  async function handleCreate() {
    if (!name.trim() || !calories) return
    await onCreate({
      name: name.trim(),
      brand,
      calories_per_100g: parseFloat(calories),
      protein_per_100g: parseFloat(protein) || 0,
      carbs_per_100g: parseFloat(carbs) || 0,
      fat_per_100g: parseFloat(fat) || 0,
      serving_size_g: parseFloat(serving) || 100,
    })
    setName(''); setBrand(''); setCalories(''); setProtein(''); setCarbs(''); setFat(''); setServing('100')
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[90dvh] bg-slate-900 border-slate-700 p-0 gap-0">
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-slate-700/50">
          <SheetTitle className="text-base">Nuevo alimento</SheetTitle>
        </SheetHeader>
        <div className="p-4 space-y-3 overflow-y-auto">
          <Input autoFocus placeholder="Nombre *" value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-800 border-slate-600" />
          <Input placeholder="Marca (opcional)" value={brand} onChange={(e) => setBrand(e.target.value)} className="bg-slate-800 border-slate-600" />

          <p className="text-xs text-slate-400 font-medium pt-1">Por 100g</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Calorías *', value: calories, set: setCalories },
              { label: 'Proteínas (g)', value: protein, set: setProtein },
              { label: 'Carbos (g)', value: carbs, set: setCarbs },
              { label: 'Grasas (g)', value: fat, set: setFat },
            ].map(({ label, value, set }) => (
              <div key={label} className="space-y-0.5">
                <label className="text-xs text-slate-500">{label}</label>
                <Input type="number" step="0.1" value={value} onChange={(e) => set(e.target.value)} className="bg-slate-800 border-slate-600 h-9" />
              </div>
            ))}
          </div>

          <div className="space-y-0.5">
            <label className="text-xs text-slate-500">Porción estándar (g)</label>
            <Input type="number" value={serving} onChange={(e) => setServing(e.target.value)} className="bg-slate-800 border-slate-600 h-9 w-32" />
          </div>

          <Button
            onClick={handleCreate}
            disabled={isCreating || !name.trim() || !calories}
            className="w-full bg-nutrition hover:bg-nutrition/90"
          >
            {isCreating ? 'Creando...' : 'Crear alimento'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ─── Food card ─────────────────────────────────────────────────────────────────

function FoodCard({ food, onDelete }: { food: Food; onDelete: () => void }) {
  return (
    <div className="rounded-2xl bg-slate-800/50 border border-slate-700/30 p-3 group">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-nutrition/15 flex items-center justify-center text-base shrink-0">
          🥗
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{food.name}</p>
          {food.brand && <p className="text-xs text-slate-500 truncate">{food.brand}</p>}
          <div className="flex gap-3 mt-1.5 text-xs text-slate-400">
            <span className="text-slate-300 font-medium">{food.calories_per_100g} kcal</span>
            <span className="text-blue-400">{food.protein_per_100g}g P</span>
            <span className="text-orange-400">{food.carbs_per_100g}g C</span>
            <span className="text-yellow-400">{food.fat_per_100g}g G</span>
            <span className="text-slate-500">/ 100g</span>
          </div>
        </div>
        {food.is_custom && (
          <button
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-600 hover:text-red-400 transition-all shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function FoodLibraryPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'custom' | 'search'>('custom')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const { data: customFoods = [], isLoading: loadingCustom, create, remove } = useCustomFoods()
  const { data: searchResults = [], isFetching: searching } = useFoodSearch(searchQuery)

  if (!user) return null

  return (
    <div className="pb-28 animate-fade-in">
      <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Library className="w-4 h-4 text-nutrition" />
          <h1 className="font-bold text-base">Biblioteca de alimentos</h1>
        </div>
        <button
          onClick={() => setSheetOpen(true)}
          className="w-8 h-8 rounded-full bg-nutrition/20 text-nutrition flex items-center justify-center"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 px-4">
        {([['custom', 'Mis alimentos'], ['search', 'Buscar todos']] as const).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors',
              tab === t
                ? 'border-nutrition text-nutrition'
                : 'border-transparent text-slate-400 hover:text-slate-300',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="px-4 pt-4 space-y-3">
        {tab === 'search' && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              autoFocus
              placeholder="Buscar alimentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-800 border-slate-600"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {tab === 'custom' && (
          <>
            {loadingCustom && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-2xl bg-slate-800/40 animate-pulse" />)}
              </div>
            )}
            {!loadingCustom && customFoods.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                <div className="text-4xl">🥗</div>
                <p className="font-semibold">Sin alimentos custom</p>
                <p className="text-slate-400 text-sm">Crea tus propios alimentos con macros exactas</p>
                <Button onClick={() => setSheetOpen(true)} size="sm" className="bg-nutrition hover:bg-nutrition/90">
                  <Plus className="w-4 h-4 mr-1" />
                  Crear alimento
                </Button>
              </div>
            )}
            <div className="space-y-2">
              {customFoods.map((food) => (
                <FoodCard key={food.id} food={food} onDelete={() => remove.mutate(food.id)} />
              ))}
            </div>
          </>
        )}

        {tab === 'search' && (
          <>
            {searching && <div className="h-16 rounded-2xl bg-slate-800/40 animate-pulse" />}
            {!searching && searchQuery.length > 1 && searchResults.length === 0 && (
              <p className="text-center text-slate-500 text-sm py-8">Sin resultados para "{searchQuery}"</p>
            )}
            {searchQuery.length <= 1 && (
              <p className="text-center text-slate-500 text-sm py-8">Escribe para buscar alimentos</p>
            )}
            <div className="space-y-2">
              {searchResults.map((food) => (
                <FoodCard key={food.id} food={food} onDelete={() => remove.mutate(food.id)} />
              ))}
            </div>
          </>
        )}
      </div>

      <CreateFoodSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onCreate={async (data) => {
          await create.mutateAsync({
            name: data.name,
            brand: data.brand || null,
            user_id: user.id,
            serving_size_g: data.serving_size_g,
            serving_unit: 'g',
            calories_per_100g: data.calories_per_100g,
            protein_per_100g: data.protein_per_100g,
            carbs_per_100g: data.carbs_per_100g,
            fat_per_100g: data.fat_per_100g,
            fiber_per_100g: null,
            sugar_per_100g: null,
            sodium_per_100g: null,
            is_custom: true,
          })
          setSheetOpen(false)
        }}
        isCreating={create.isPending}
      />
    </div>
  )
}
