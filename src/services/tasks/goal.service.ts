import { supabase } from '@/lib/supabase'
import type { Goal } from '@/types/tasks'

export async function getGoals(userId: string, status?: Goal['status']): Promise<Goal[]> {
  let query = supabase.from('goals').select('*').eq('user_id', userId)
  if (status) query = query.eq('status', status)
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createGoal(
  goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>,
): Promise<Goal> {
  const { data, error } = await supabase.from('goals').insert(goal).select().single()
  if (error) throw error
  return data
}

export async function updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteGoal(id: string): Promise<void> {
  const { error } = await supabase.from('goals').delete().eq('id', id)
  if (error) throw error
}
