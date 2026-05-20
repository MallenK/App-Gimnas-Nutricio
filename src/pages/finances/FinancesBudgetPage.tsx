import { useState } from 'react'
import { PiggyBank, Pencil, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  useMonthData,
  useExpenseCategories,
  useFinanceConfig,
} from '@/hooks/finances/useFinances'
import { updateExpenseCategory } from '@/services/finances/finance.service'
import { useQueryClient } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function FinancesBudgetPage() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const { data: config } = useFinanceConfig()
  const { data: categories = [] } = useExpenseCategories()
  const { expenses } = useMonthData(year, month)
  const queryClient = useQueryClient()

  const currency = config?.currency ?? 'EUR'
  const monthLabel = format(new Date(year, month - 1, 1), 'MMMM yyyy', { locale: es })

  // Spending per category this month
  const spendMap = new Map<string, number>()
  for (const e of expenses) {
    const key = e.category_id ?? 'null'
    spendMap.set(key, (spendMap.get(key) ?? 0) + e.amount)
  }

  const totalBudgeted = categories
    .filter((c) => c.monthly_budget != null)
    .reduce((s, c) => s + (c.monthly_budget ?? 0), 0)
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="pb-24 animate-fade-in">
      <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PiggyBank className="w-4 h-4 text-violet-400" />
          <h1 className="font-bold text-base">Presupuesto</h1>
        </div>
        <span className="text-xs text-slate-400 capitalize">{monthLabel}</span>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Global summary */}
        {totalBudgeted > 0 && (
          <div className="rounded-2xl bg-slate-800/50 border border-slate-700/40 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Presupuestado total</span>
              <span className="font-semibold">{totalBudgeted.toFixed(2)} {currency === 'EUR' ? '€' : currency}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Gastado total</span>
              <span className={cn('font-semibold', totalSpent > totalBudgeted ? 'text-red-400' : 'text-slate-300')}>
                {totalSpent.toFixed(2)} {currency === 'EUR' ? '€' : currency}
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-700 overflow-hidden mt-1">
              <div
                className={cn('h-full rounded-full', totalSpent > totalBudgeted ? 'bg-red-500' : 'bg-violet-500')}
                style={{ width: `${Math.min((totalSpent / totalBudgeted) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Per-category budget rows */}
        <div className="space-y-2">
          <p className="text-xs text-slate-400 font-medium px-1">Por categoría</p>
          {categories.map((cat) => {
            const spent = spendMap.get(cat.id) ?? 0
            const budget = cat.monthly_budget ?? 0
            const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
            const isOver = budget > 0 && spent > budget

            return (
              <CategoryBudgetRow
                key={cat.id}
                name={cat.name}
                icon={cat.icon}
                color={cat.color}
                spent={spent}
                budget={budget}
                pct={pct}
                isOver={isOver}
                currency={currency}
                onSaveBudget={async (val) => {
                  await updateExpenseCategory(cat.id, { monthly_budget: val })
                  queryClient.invalidateQueries({ queryKey: ['expense_categories'] })
                }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

function CategoryBudgetRow({
  name, icon, color, spent, budget, pct, isOver, currency, onSaveBudget,
}: {
  name: string
  icon: string | null
  color: string
  spent: number
  budget: number
  pct: number
  isOver: boolean
  currency: string
  onSaveBudget: (val: number | null) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState('')
  const sym = currency === 'EUR' ? '€' : currency

  async function save() {
    const val = input === '' ? null : parseFloat(input)
    await onSaveBudget(val)
    setEditing(false)
  }

  return (
    <div className="rounded-2xl bg-slate-800/50 border border-slate-700/30 p-3">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0"
          style={{ backgroundColor: `${color}25` }}
        >
          {icon ?? '📦'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{name}</p>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span className={isOver ? 'text-red-400' : 'text-slate-300'}>{spent.toFixed(2)}{sym}</span>
            {budget > 0 && <span>/ {budget.toFixed(2)}{sym}</span>}
          </div>
        </div>

        {editing ? (
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="0"
              className="h-7 w-20 text-xs bg-slate-700 border-slate-600 text-right"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
            />
            <button onClick={save} className="p-1 text-emerald-400 hover:text-emerald-300">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setEditing(false)} className="p-1 text-slate-400">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setInput(budget > 0 ? String(budget) : ''); setEditing(true) }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-slate-700 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {budget > 0 ? (
        <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', isOver ? 'bg-red-500' : 'bg-violet-500/70')}
            style={{ width: `${pct}%`, backgroundColor: isOver ? undefined : color }}
          />
        </div>
      ) : (
        <p className="text-xs text-slate-600 italic">Sin presupuesto — toca ✏️ para asignar</p>
      )}
    </div>
  )
}
