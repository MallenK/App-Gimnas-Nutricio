import { supabase } from '@/lib/supabase'
import type { CardioLog } from '@/types/fitness'

export async function getCardioLogs(userId: string, limit = 50): Promise<CardioLog[]> {
  const { data, error } = await supabase
    .from('cardio_logs')
    .select('*')
    .eq('user_id', userId)
    .order('log_date', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function addCardioLog(
  entry: Omit<CardioLog, 'id' | 'created_at'>,
): Promise<CardioLog> {
  const { data, error } = await supabase
    .from('cardio_logs')
    .insert(entry)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCardioLog(id: string): Promise<void> {
  const { error } = await supabase.from('cardio_logs').delete().eq('id', id)
  if (error) throw error
}
