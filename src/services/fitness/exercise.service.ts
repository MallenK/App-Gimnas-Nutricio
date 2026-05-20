import { supabase } from '@/lib/supabase'
import type { Exercise } from '@/types/fitness'
import type { MuscleGroup } from '@/lib/constants'

export async function searchExercises(
  query: string,
  muscleGroup?: MuscleGroup | 'all',
): Promise<Exercise[]> {
  let q = supabase.from('exercises').select('*')

  if (query.trim()) {
    q = q.ilike('name', `%${query}%`)
  }
  if (muscleGroup && muscleGroup !== 'all') {
    q = q.eq('muscle_group', muscleGroup)
  }

  const { data, error } = await q.order('name').limit(50)
  if (error) throw error
  return data ?? []
}

export async function updateExerciseImage(id: string, imageUrl: string): Promise<void> {
  const { error } = await supabase.from('exercises').update({ image_url: imageUrl }).eq('id', id)
  if (error) throw error
}

export async function createCustomExercise(
  exercise: Omit<Exercise, 'id' | 'created_at'>,
): Promise<Exercise> {
  const { data, error } = await supabase
    .from('exercises')
    .insert({ ...exercise, is_custom: true })
    .select()
    .single()
  if (error) throw error
  return data
}
