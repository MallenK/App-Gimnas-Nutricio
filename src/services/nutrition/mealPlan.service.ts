import { supabase } from '@/lib/supabase'
import type { MealPlanTemplate, MealPlanEntry } from '@/types/nutrition'
import type { MealType } from '@/lib/constants'
import { calcMacros } from '@/lib/utils'

export async function getMealPlanTemplates(userId: string): Promise<MealPlanTemplate[]> {
  const { data, error } = await supabase
    .from('meal_plan_templates')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getMealPlanTemplateWithEntries(templateId: string): Promise<MealPlanTemplate> {
  const { data, error } = await supabase
    .from('meal_plan_templates')
    .select('*, entries:meal_plan_entries(*, food:foods(*))')
    .eq('id', templateId)
    .single()
  if (error) throw error
  return data
}

export async function createMealPlanTemplate(userId: string, name: string): Promise<MealPlanTemplate> {
  const { data, error } = await supabase
    .from('meal_plan_templates')
    .insert({ user_id: userId, name })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateMealPlanTemplate(id: string, patch: { name?: string; is_active?: boolean }): Promise<void> {
  const { error } = await supabase.from('meal_plan_templates').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteMealPlanTemplate(id: string): Promise<void> {
  const { error } = await supabase.from('meal_plan_templates').delete().eq('id', id)
  if (error) throw error
}

export async function addMealPlanEntry(
  entry: Omit<MealPlanEntry, 'id' | 'food'>,
): Promise<MealPlanEntry> {
  const { data, error } = await supabase
    .from('meal_plan_entries')
    .insert(entry)
    .select('*, food:foods(*)')
    .single()
  if (error) throw error
  return data
}

export async function removeMealPlanEntry(id: string): Promise<void> {
  const { error } = await supabase.from('meal_plan_entries').delete().eq('id', id)
  if (error) throw error
}

export async function applyTemplateDayToLog(
  userId: string,
  templateId: string,
  dayOfWeek: number,
  date: string,
): Promise<void> {
  const template = await getMealPlanTemplateWithEntries(templateId)
  const dayEntries = (template.entries ?? []).filter((e) => e.day_of_week === dayOfWeek)
  if (!dayEntries.length) return

  const rows = dayEntries
    .filter((e) => e.food)
    .map((e) => {
      const macros = calcMacros(
        {
          calories: e.food!.calories_per_100g,
          protein: e.food!.protein_per_100g,
          carbs: e.food!.carbs_per_100g,
          fat: e.food!.fat_per_100g,
        },
        e.quantity_g,
      )
      return {
        user_id: userId,
        food_id: e.food_id,
        log_date: date,
        meal_type: e.meal_type as MealType,
        quantity_g: e.quantity_g,
        calories: macros.calories,
        protein_g: macros.protein,
        carbs_g: macros.carbs,
        fat_g: macros.fat,
      }
    })

  const { error } = await supabase.from('meal_logs').insert(rows)
  if (error) throw error
}
