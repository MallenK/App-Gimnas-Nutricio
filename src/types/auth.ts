export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface UserGoals {
  id: string
  user_id: string
  target_weight_kg: number | null
  current_weight_kg: number | null
  daily_calories: number | null
  protein_pct: number | null
  carbs_pct: number | null
  fat_pct: number | null
  daily_steps_target: number
  weekly_workouts_target: number
}
