import { supabase } from '@/lib/supabase'
import type { MealLog, Food, DailyNutrition } from '@/types/nutrition'
import type { MealType } from '@/lib/constants'
import { MEAL_TYPES } from '@/lib/constants'
import { calcMacros } from '@/lib/utils'

export async function getMealLogsForDate(userId: string, date: string): Promise<MealLog[]> {
  const { data, error } = await supabase
    .from('meal_logs')
    .select('*, food:foods(*)')
    .eq('user_id', userId)
    .eq('log_date', date)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function addMealLog(params: {
  userId: string
  food: Food
  date: string
  mealType: MealType
  quantityG: number
}): Promise<MealLog> {
  const { userId, food, date, mealType, quantityG } = params
  const macros = calcMacros(
    {
      calories: food.calories_per_100g,
      protein: food.protein_per_100g,
      carbs: food.carbs_per_100g,
      fat: food.fat_per_100g,
    },
    quantityG,
  )
  const { data, error } = await supabase
    .from('meal_logs')
    .insert({
      user_id: userId,
      food_id: food.id,
      log_date: date,
      meal_type: mealType,
      quantity_g: quantityG,
      calories: macros.calories,
      protein_g: macros.protein,
      carbs_g: macros.carbs,
      fat_g: macros.fat,
    })
    .select('*, food:foods(*)')
    .single()
  if (error) throw error
  return data
}

export async function deleteMealLog(id: string): Promise<void> {
  const { error } = await supabase.from('meal_logs').delete().eq('id', id)
  if (error) throw error
}

export function aggregateDailyNutrition(logs: MealLog[]): DailyNutrition {
  const byMeal = Object.fromEntries(
    MEAL_TYPES.map((m) => [m.value, logs.filter((l) => l.meal_type === m.value)]),
  ) as Record<MealType, MealLog[]>

  return {
    calories: Math.round(logs.reduce((sum, l) => sum + l.calories, 0) * 10) / 10,
    protein_g: Math.round(logs.reduce((sum, l) => sum + l.protein_g, 0) * 10) / 10,
    carbs_g: Math.round(logs.reduce((sum, l) => sum + l.carbs_g, 0) * 10) / 10,
    fat_g: Math.round(logs.reduce((sum, l) => sum + l.fat_g, 0) * 10) / 10,
    byMeal,
  }
}
