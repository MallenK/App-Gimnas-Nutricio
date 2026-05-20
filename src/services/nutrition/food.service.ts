import { supabase } from '@/lib/supabase'
import type { Food } from '@/types/nutrition'

export async function searchLocalFoods(query: string): Promise<Food[]> {
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
    .limit(20)
  if (error) throw error
  return data ?? []
}

export async function getFoodById(id: string): Promise<Food | null> {
  const { data, error } = await supabase.from('foods').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function upsertOFFFood(food: Omit<Food, 'id' | 'created_at'>): Promise<Food> {
  const { data, error } = await supabase
    .from('foods')
    .upsert(food, { onConflict: 'off_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createCustomFood(
  food: Omit<Food, 'id' | 'created_at' | 'off_id'>,
): Promise<Food> {
  const { data, error } = await supabase
    .from('foods')
    .insert({ ...food, is_custom: true })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCustomFood(id: string): Promise<void> {
  const { error } = await supabase.from('foods').delete().eq('id', id)
  if (error) throw error
}

export async function getUserCustomFoods(userId: string): Promise<Food[]> {
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .eq('user_id', userId)
    .eq('is_custom', true)
    .order('name')
  if (error) throw error
  return data ?? []
}
