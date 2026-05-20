import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn, todayISO } from '@/lib/utils'
import { useExpenseCategories } from '@/hooks/finances/useFinances'
import type { ExpenseCategory } from '@/types/finances'

export type TransactionType = 'expense' | 'income'

const schema = z.object({
  amount: z.string().min(1).refine((v) => parseFloat(v) > 0, 'Importe debe ser > 0'),
  description: z.string().max(100).nullable(),
  category_id: z.string().nullable(),
  date: z.string(),
})

type FormValues = z.infer<typeof schema>

interface AddTransactionSheetProps {
  open: boolean
  defaultType?: TransactionType
  onClose: () => void
  onAddExpense: (data: { amount: number; description: string | null; category_id: string | null; expense_date: string }) => void
  onAddIncome: (data: { amount: number; description: string | null; income_date: string }) => void
  isAdding?: boolean
}

export function AddTransactionSheet({
  open,
  defaultType = 'expense',
  onClose,
  onAddExpense,
  onAddIncome,
  isAdding,
}: AddTransactionSheetProps) {
  const [type, setType] = useState<TransactionType>(defaultType)
  const { data: categories = [] } = useExpenseCategories()

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: '', description: null, category_id: null, date: todayISO() },
  })

  const selectedCategory = watch('category_id')

  useEffect(() => {
    if (open) {
      setType(defaultType)
      reset({ amount: '', description: null, category_id: null, date: todayISO() })
    }
  }, [open, defaultType, reset])

  function onSubmit(values: FormValues) {
    const amount = parseFloat(values.amount)
    const description = values.description || null
    if (type === 'expense') {
      onAddExpense({ amount, description, category_id: values.category_id, expense_date: values.date })
    } else {
      onAddIncome({ amount, description, income_date: values.date })
    }
  }

  // Numpad helper
  function appendDigit(d: string) {
    const current = watch('amount')
    if (d === '.' && current.includes('.')) return
    if (d === '.' && current === '') { setValue('amount', '0.'); return }
    setValue('amount', current + d)
  }
  function deleteDigit() {
    const current = watch('amount')
    setValue('amount', current.slice(0, -1))
  }

  const amountVal = watch('amount')

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[95dvh] flex flex-col p-0 gap-0 bg-slate-900 border-slate-700">
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-slate-700/50">
          <SheetTitle className="text-base">Nueva transacción</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto flex flex-col">
          {/* Type toggle */}
          <div className="flex gap-2 px-4 pt-4">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={cn(
                'flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors',
                type === 'expense'
                  ? 'bg-red-500/20 border-red-500 text-red-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400',
              )}
            >
              💸 Gasto
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={cn(
                'flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors',
                type === 'income'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400',
              )}
            >
              💰 Ingreso
            </button>
          </div>

          {/* Amount display */}
          <div className="flex items-end justify-center py-6">
            <span className="text-5xl font-bold tracking-tight">
              {amountVal || '0'}
            </span>
            <span className="text-2xl text-slate-400 ml-2 mb-1">€</span>
          </div>
          {errors.amount && (
            <p className="text-xs text-red-400 text-center -mt-4 mb-2">{errors.amount.message}</p>
          )}

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-2 px-6 mb-4">
            {['1','2','3','4','5','6','7','8','9','.','0','⌫'].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => d === '⌫' ? deleteDigit() : appendDigit(d)}
                className={cn(
                  'h-12 rounded-2xl text-lg font-semibold transition-colors',
                  d === '⌫'
                    ? 'bg-slate-700/60 text-slate-400 hover:bg-slate-700'
                    : 'bg-slate-800 hover:bg-slate-700 text-white',
                )}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="px-4 space-y-3 pb-2">
            {/* Description */}
            <div>
              <Label className="text-xs text-slate-400">Descripción (opcional)</Label>
              <Input
                {...register('description')}
                placeholder="Supermercado, gasolina..."
                className="bg-slate-800 border-slate-600 mt-1"
              />
            </div>

            {/* Category (expenses only) */}
            {type === 'expense' && (
              <div>
                <Label className="text-xs text-slate-400">Categoría</Label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {categories.map((cat) => (
                    <CategoryChip
                      key={cat.id}
                      category={cat}
                      selected={selectedCategory === cat.id}
                      onSelect={() => setValue('category_id', cat.id === selectedCategory ? null : cat.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Date */}
            <div>
              <Label className="text-xs text-slate-400">Fecha</Label>
              <Input
                {...register('date')}
                type="date"
                className="bg-slate-800 border-slate-600 mt-1"
              />
            </div>
          </div>

          <div className="px-4 pb-8 pt-2 mt-auto">
            <Button
              type="submit"
              variant="finances"
              className="w-full h-12 text-base font-semibold"
              disabled={isAdding || !amountVal}
            >
              {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : type === 'expense' ? 'Añadir gasto' : 'Añadir ingreso'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function CategoryChip({
  category,
  selected,
  onSelect,
}: {
  category: ExpenseCategory
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors',
        selected
          ? 'text-white border-transparent'
          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600',
      )}
      style={selected ? { backgroundColor: category.color, borderColor: category.color } : undefined}
    >
      {category.icon && <span>{category.icon}</span>}
      {category.name}
    </button>
  )
}
