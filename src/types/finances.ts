export interface FinanceConfig {
  id: string
  user_id: string
  monthly_budget: number
  currency: string
  created_at: string
  updated_at: string
}

export interface ExpenseCategory {
  id: string
  user_id: string | null
  name: string
  icon: string | null
  color: string
  monthly_budget: number | null
  sort_order: number
  is_custom: boolean
}

export interface Expense {
  id: string
  user_id: string
  category_id: string | null
  amount: number
  description: string | null
  expense_date: string
  created_at: string
  category?: ExpenseCategory
}

export interface IncomeEntry {
  id: string
  user_id: string
  amount: number
  description: string | null
  income_date: string
  created_at: string
}

export interface MonthSummary {
  totalExpenses: number
  totalIncome: number
  monthlyBudget: number
  balance: number
  byCategory: { category: ExpenseCategory | null; total: number }[]
}
