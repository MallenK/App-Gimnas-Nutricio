import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2, TrendingUp } from 'lucide-react'
import { format, addMonths, parseISO, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  useMonthData,
  useCreateExpense,
  useDeleteExpense,
  useCreateIncome,
  useDeleteIncome,
  useFinanceConfig,
} from '@/hooks/finances/useFinances'
import { FinanceSummaryCard } from '@/components/finances/FinanceSummaryCard'
import { AddTransactionSheet, type TransactionType } from '@/components/finances/AddTransactionSheet'
import { cn } from '@/lib/utils'
import type { Expense, IncomeEntry } from '@/types/finances'

export function FinancesLogPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1) // 1-based

  const [sheetOpen, setSheetOpen] = useState(false)
  const [defaultType, setDefaultType] = useState<TransactionType>('expense')

  const { data: config } = useFinanceConfig()
  const { expenses, income, summary, isLoading } = useMonthData(year, month)
  const createExpense = useCreateExpense(year, month)
  const deleteExpense = useDeleteExpense(year, month)
  const createIncome = useCreateIncome(year, month)
  const deleteIncome = useDeleteIncome(year, month)

  const currency = config?.currency ?? 'EUR'

  function navigateMonth(delta: number) {
    const next = addMonths(new Date(year, month - 1, 1), delta)
    setYear(next.getFullYear())
    setMonth(next.getMonth() + 1)
  }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1
  const monthLabel = format(new Date(year, month - 1, 1), 'MMMM yyyy', { locale: es })

  async function handleAddExpense(data: { amount: number; description: string | null; category_id: string | null; expense_date: string }) {
    await createExpense.mutateAsync(data)
    setSheetOpen(false)
  }

  async function handleAddIncome(data: { amount: number; description: string | null; income_date: string }) {
    await createIncome.mutateAsync(data)
    setSheetOpen(false)
  }

  // Group expenses + income by date, sorted desc
  type DayEntry =
    | { type: 'expense'; item: Expense }
    | { type: 'income'; item: IncomeEntry }

  const allEntries: { date: string; entries: DayEntry[] }[] = []
  const dateMap = new Map<string, DayEntry[]>()

  for (const e of expenses) {
    const d = e.expense_date
    if (!dateMap.has(d)) dateMap.set(d, [])
    dateMap.get(d)!.push({ type: 'expense', item: e })
  }
  for (const i of income) {
    const d = i.income_date
    if (!dateMap.has(d)) dateMap.set(d, [])
    dateMap.get(d)!.push({ type: 'income', item: i })
  }

  const sortedDates = [...dateMap.keys()].sort((a, b) => b.localeCompare(a))
  for (const date of sortedDates) {
    allEntries.push({ date, entries: dateMap.get(date)! })
  }

  return (
    <div className="pb-28 animate-fade-in">
      {/* Month nav */}
      <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigateMonth(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 transition-colors text-slate-400"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-sm capitalize">{monthLabel}</span>
        <button
          onClick={() => navigateMonth(1)}
          disabled={isCurrentMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 transition-colors text-slate-400 disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Summary */}
        <FinanceSummaryCard summary={summary} currency={currency} />

        {/* Category breakdown mini */}
        {summary.byCategory.length > 0 && (
          <div className="rounded-2xl bg-slate-800/40 border border-slate-700/30 p-3 space-y-2">
            <p className="text-xs text-slate-400 font-medium">Por categoría</p>
            {summary.byCategory.slice(0, 5).map(({ category, total }) => {
              const pct = summary.totalExpenses > 0 ? (total / summary.totalExpenses) * 100 : 0
              return (
                <div key={category?.id ?? 'null'} className="flex items-center gap-2">
                  <span className="text-sm w-5 text-center">{category?.icon ?? '📦'}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-slate-300">{category?.name ?? 'Sin categoría'}</span>
                      <span className="text-slate-400">{total.toFixed(2)} €</span>
                    </div>
                    <div className="h-1 rounded-full bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: category?.color ?? '#64748b',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Transaction list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-slate-800/40 animate-pulse" />
            ))}
          </div>
        ) : allEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="text-5xl">💳</div>
            <div>
              <p className="font-semibold text-lg mb-1">Sin transacciones</p>
              <p className="text-slate-400 text-sm">Registra gastos e ingresos de este mes</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {allEntries.map(({ date, entries }) => {
              const dayLabel = (() => {
                const today = format(new Date(), 'yyyy-MM-dd')
                const d = parseISO(date)
                if (date === today) return 'Hoy'
                if (date === format(subDays(new Date(), 1), 'yyyy-MM-dd')) return 'Ayer'
                return format(d, "d 'de' MMMM", { locale: es })
              })()
              const dayTotal = entries.reduce((sum, e) => {
                if (e.type === 'expense') return sum - e.item.amount
                return sum + e.item.amount
              }, 0)

              return (
                <div key={date}>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <p className="text-xs font-semibold text-slate-400">{dayLabel}</p>
                    <p className={cn('text-xs font-semibold', dayTotal >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                      {dayTotal >= 0 ? '+' : ''}{dayTotal.toFixed(2)} €
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-800/50 border border-slate-700/30 overflow-hidden divide-y divide-slate-700/30">
                    {entries.map((entry) =>
                      entry.type === 'expense' ? (
                        <ExpenseRow
                          key={entry.item.id}
                          expense={entry.item}
                          currency={currency}
                          onDelete={() => deleteExpense.mutate(entry.item.id)}
                        />
                      ) : (
                        <IncomeRow
                          key={entry.item.id}
                          income={entry.item}
                          currency={currency}
                          onDelete={() => deleteIncome.mutate(entry.item.id)}
                        />
                      ),
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      <div className="fixed bottom-20 right-4 flex flex-col gap-2 z-30">
        <button
          onClick={() => { setDefaultType('income'); setSheetOpen(true) }}
          className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg hover:bg-emerald-600 transition-colors"
          title="Añadir ingreso"
        >
          <TrendingUp className="w-5 h-5" />
        </button>
        <button
          onClick={() => { setDefaultType('expense'); setSheetOpen(true) }}
          className="w-14 h-14 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-xl hover:bg-violet-700 transition-colors"
          title="Añadir gasto"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <AddTransactionSheet
        open={sheetOpen}
        defaultType={defaultType}
        onClose={() => setSheetOpen(false)}
        onAddExpense={handleAddExpense}
        onAddIncome={handleAddIncome}
        isAdding={createExpense.isPending || createIncome.isPending}
      />
    </div>
  )
}

function ExpenseRow({
  expense,
  currency,
  onDelete,
}: {
  expense: Expense
  currency: string
  onDelete: () => void
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700/20 transition-colors group">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0"
        style={{ backgroundColor: `${expense.category?.color ?? '#64748b'}25` }}
      >
        {expense.category?.icon ?? '📦'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {expense.description || expense.category?.name || 'Gasto'}
        </p>
        {expense.description && expense.category && (
          <p className="text-xs text-slate-500">{expense.category.name}</p>
        )}
      </div>
      <p className="text-sm font-semibold text-red-400 shrink-0">
        -{expense.amount.toFixed(2)} {currency === 'EUR' ? '€' : currency}
      </p>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-600 hover:text-red-400 transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function IncomeRow({
  income,
  currency,
  onDelete,
}: {
  income: IncomeEntry
  currency: string
  onDelete: () => void
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700/20 transition-colors group">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 bg-emerald-500/15">
        💰
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{income.description || 'Ingreso'}</p>
        <p className="text-xs text-slate-500">Ingreso</p>
      </div>
      <p className="text-sm font-semibold text-emerald-400 shrink-0">
        +{income.amount.toFixed(2)} {currency === 'EUR' ? '€' : currency}
      </p>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-600 hover:text-red-400 transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
