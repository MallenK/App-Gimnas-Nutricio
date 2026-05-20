import { supabase } from '@/lib/supabase'
import type { Mesocycle } from '@/types/fitness'

export async function getMesocycles(userId: string): Promise<Mesocycle[]> {
  const { data, error } = await supabase
    .from('mesocycles')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createMesocycle(
  entry: Omit<Mesocycle, 'id' | 'created_at'>,
): Promise<Mesocycle> {
  const { data, error } = await supabase
    .from('mesocycles')
    .insert(entry)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateMesocycle(
  id: string,
  patch: Partial<Omit<Mesocycle, 'id' | 'user_id' | 'created_at'>>,
): Promise<void> {
  const { error } = await supabase.from('mesocycles').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteMesocycle(id: string): Promise<void> {
  const { error } = await supabase.from('mesocycles').delete().eq('id', id)
  if (error) throw error
}
