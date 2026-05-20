import { supabase } from '@/lib/supabase'
import type { FinanceConfig, ExpenseCategory, Expense, IncomeEntry, MonthSummary } from '@/types/finances'

// ── Config ────────────────────────────────────────────────────────────────────

export async function getFinanceConfig(userId: string): Promise<FinanceConfig | null> {
  const { data, error } = await supabase
    .from('finance_config')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function upsertFinanceConfig(
  userId: string,
  updates: Pick<FinanceConfig, 'monthly_budget' | 'currency'>,
): Promise<FinanceConfig> {
  const { data, error } = await supabase
    .from('finance_config')
    .upsert({ ...updates, user_id: userId, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Categories ────────────────────────────────────────────────────────────────

export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  const { data, error } = await supabase
    .from('expense_categories')
    .select('*')
    .order('sort_order')
  if (error) throw error
  return data ?? []
}

export async function createExpenseCategory(
  category: Omit<ExpenseCategory, 'id'>,
): Promise<ExpenseCategory> {
  const { data, error } = await supabase
    .from('expense_categories')
    .insert({ ...category, is_custom: true })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateExpenseCategory(
  id: string,
  updates: Partial<ExpenseCategory>,
): Promise<ExpenseCategory> {
  const { data, error } = await supabase
    .from('expense_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Expenses ──────────────────────────────────────────────────────────────────

export async function getExpensesForMonth(userId: string, year: number, month: number): Promise<Expense[]> {
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2, '0')}-${lastDay}`

  const { data, error } = await supabase
    .from('expenses')
    .select('*, category:expense_categories(*)')
    .eq('user_id', userId)
    .gte('expense_date', from)
    .lte('expense_date', to)
    .order('expense_date', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createExpense(
  expense: Omit<Expense, 'id' | 'created_at' | 'category'>,
): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .insert(expense)
    .select('*, category:expense_categories(*)')
    .single()
  if (error) throw error
  return data
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw error
}

// ── Income ────────────────────────────────────────────────────────────────────

export async function getIncomeForMonth(userId: string, year: number, month: number): Promise<IncomeEntry[]> {
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2, '0')}-${lastDay}`

  const { data, error } = await supabase
    .from('income_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('income_date', from)
    .lte('income_date', to)
    .order('income_date', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createIncome(
  income: Omit<IncomeEntry, 'id' | 'created_at'>,
): Promise<IncomeEntry> {
  const { data, error } = await supabase
    .from('income_entries')
    .insert(income)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteIncome(id: string): Promise<void> {
  const { error } = await supabase.from('income_entries').delete().eq('id', id)
  if (error) throw error
}

// ── Aggregation ───────────────────────────────────────────────────────────────

export function computeMonthSummary(
  expenses: Expense[],
  income: IncomeEntry[],
  monthlyBudget: number,
): MonthSummary {
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const totalIncome = income.reduce((s, i) => s + i.amount, 0)
  const balance = monthlyBudget + totalIncome - totalExpenses

  // Group by category
  const catMap = new Map<string | null, { category: ExpenseCategory | null; total: number }>()
  for (const e of expenses) {
    const key = e.category_id ?? 'null'
    const existing = catMap.get(key)
    if (existing) {
      existing.total += e.amount
    } else {
      catMap.set(key, { category: e.category ?? null, total: e.amount })
    }
  }

  const byCategory = [...catMap.values()].sort((a, b) => b.total - a.total)

  return { totalExpenses, totalIncome, monthlyBudget, balance, byCategory }
}
