import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getFinanceConfig,
  upsertFinanceConfig,
  getExpenseCategories,
  getExpensesForMonth,
  getIncomeForMonth,
  createExpense,
  deleteExpense,
  createIncome,
  deleteIncome,
  computeMonthSummary,
} from '@/services/finances/finance.service'
import { useAuth } from '@/hooks/auth/useAuth'
import type { Expense, IncomeEntry, FinanceConfig } from '@/types/finances'

export function useFinanceConfig() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['finance_config', user?.id],
    queryFn: () => getFinanceConfig(user!.id),
    enabled: !!user?.id,
    staleTime: 10 * 60_000,
  })
}

export function useUpsertFinanceConfig() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (updates: Pick<FinanceConfig, 'monthly_budget' | 'currency'>) =>
      upsertFinanceConfig(user!.id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance_config', user?.id] }),
  })
}

export function useExpenseCategories() {
  return useQuery({
    queryKey: ['expense_categories'],
    queryFn: getExpenseCategories,
    staleTime: 10 * 60_000,
  })
}

export function useMonthData(year: number, month: number) {
  const { user } = useAuth()
  const { data: config } = useFinanceConfig()

  const expensesQuery = useQuery({
    queryKey: ['expenses', user?.id, year, month],
    queryFn: () => getExpensesForMonth(user!.id, year, month),
    enabled: !!user?.id,
  })

  const incomeQuery = useQuery({
    queryKey: ['income_entries', user?.id, year, month],
    queryFn: () => getIncomeForMonth(user!.id, year, month),
    enabled: !!user?.id,
  })

  const expenses = expensesQuery.data ?? []
  const income = incomeQuery.data ?? []
  const monthlyBudget = config?.monthly_budget ?? 0
  const summary = computeMonthSummary(expenses, income, monthlyBudget)

  return {
    expenses,
    income,
    summary,
    isLoading: expensesQuery.isLoading || incomeQuery.isLoading,
  }
}

export function useCreateExpense(year: number, month: number) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (expense: Omit<Expense, 'id' | 'created_at' | 'category' | 'user_id'>) =>
      createExpense({ ...expense, user_id: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', user?.id, year, month] })
    },
  })
}

export function useDeleteExpense(year: number, month: number) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', user?.id, year, month] })
    },
  })
}

export function useCreateIncome(year: number, month: number) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (income: Omit<IncomeEntry, 'id' | 'created_at' | 'user_id'>) =>
      createIncome({ ...income, user_id: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income_entries', user?.id, year, month] })
    },
  })
}

export function useDeleteIncome(year: number, month: number) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income_entries', user?.id, year, month] })
    },
  })
}
