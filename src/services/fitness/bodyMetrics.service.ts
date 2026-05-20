import { supabase } from '@/lib/supabase'
import type { BodyMetrics } from '@/types/fitness'

export async function getBodyMetrics(userId: string, limit = 90): Promise<BodyMetrics[]> {
  const { data, error } = await supabase
    .from('body_metrics')
    .select('*')
    .eq('user_id', userId)
    .order('measured_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function addBodyMetrics(
  entry: Omit<BodyMetrics, 'id' | 'created_at'>,
): Promise<BodyMetrics> {
  const { data, error } = await supabase
    .from('body_metrics')
    .insert(entry)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteBodyMetrics(id: string): Promise<void> {
  const { error } = await supabase.from('body_metrics').delete().eq('id', id)
  if (error) throw error
}
