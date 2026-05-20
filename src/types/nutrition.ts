import type { MealType } from '@/lib/constants'

export interface Food {
  id: string
  user_id: string | null
  off_id: string | null
  name: string
  brand: string | null
  serving_size_g: number
  serving_unit: string
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
  fiber_per_100g: number | null
  sugar_per_100g: number | null
  sodium_per_100g: number | null
  is_custom: boolean
  created_at: string
}

export interface MealLog {
  id: string
  user_id: string
  food_id: string
  log_date: string
  meal_type: MealType
  quantity_g: number
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  notes: string | null
  created_at: string
  food?: Food
}

export interface MealPlanTemplate {
  id: string
  user_id: string
  name: string
  is_active: boolean
  created_at: string
  entries?: MealPlanEntry[]
}

export interface MealPlanEntry {
  id: string
  meal_plan_template_id: string
  food_id: string
  day_of_week: number
  meal_type: MealType
  quantity_g: number
  food?: Food
}

export interface DailyNutrition {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  byMeal: Record<MealType, MealLog[]>
}

// OpenFoodFacts search result
export interface OFFProduct {
  code: string
  product_name: string
  brands: string
  nutriments: {
    'energy-kcal_100g': number
    proteins_100g: number
    carbohydrates_100g: number
    fat_100g: number
    fiber_100g?: number
    sugars_100g?: number
    sodium_100g?: number
  }
  serving_size?: string
}
