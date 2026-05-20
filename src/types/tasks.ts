export interface Habit {
  id: string
  user_id: string
  name: string
  icon: string | null
  color: string | null
  target_value: number | null
  target_unit: string | null
  recurrence: 'daily' | 'weekdays' | 'weekends' | 'custom'
  recurrence_days: number[] | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  log_date: string
  completed: boolean
  value: number | null
  completed_at: string | null
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description: string | null
  period_type: 'weekly' | 'monthly' | 'custom'
  start_date: string
  end_date: string
  category: 'nutrition' | 'fitness' | 'body' | 'habit' | 'other'
  target_value: number | null
  target_unit: string | null
  current_value: number | null
  status: 'active' | 'completed' | 'failed' | 'cancelled'
  created_at: string
  updated_at: string
}
