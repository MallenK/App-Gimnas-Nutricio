import { supabase } from '@/lib/supabase'
import type { WorkoutRoutine, RoutineDay, RoutineExercise } from '@/types/fitness'

export async function getRoutines(userId: string): Promise<WorkoutRoutine[]> {
  const { data, error } = await supabase
    .from('workout_routines')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getRoutineWithDays(routineId: string): Promise<WorkoutRoutine> {
  const { data, error } = await supabase
    .from('workout_routines')
    .select(`
      *,
      days:routine_days(
        *,
        exercises:routine_exercises(
          *,
          exercise:exercises(*)
        )
      )
    `)
    .eq('id', routineId)
    .single()
  if (error) throw error
  if (data.days) {
    data.days.sort((a: RoutineDay, b: RoutineDay) => a.sort_order - b.sort_order)
    for (const day of data.days) {
      if (day.exercises) {
        day.exercises.sort((a: RoutineExercise, b: RoutineExercise) => a.sort_order - b.sort_order)
      }
    }
  }
  return data
}

export async function createRoutine(userId: string, name: string): Promise<WorkoutRoutine> {
  const { data, error } = await supabase
    .from('workout_routines')
    .insert({ user_id: userId, name, is_active: true })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateRoutine(
  id: string,
  patch: Partial<Pick<WorkoutRoutine, 'name' | 'description' | 'is_active'>>,
): Promise<void> {
  const { error } = await supabase.from('workout_routines').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteRoutine(id: string): Promise<void> {
  const { error } = await supabase.from('workout_routines').delete().eq('id', id)
  if (error) throw error
}

export async function createRoutineDay(
  routineId: string,
  name: string,
  sortOrder: number,
): Promise<RoutineDay> {
  const { data, error } = await supabase
    .from('routine_days')
    .insert({ routine_id: routineId, name, sort_order: sortOrder })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateRoutineDay(
  id: string,
  patch: Partial<Pick<RoutineDay, 'name' | 'day_of_week' | 'sort_order'>>,
): Promise<void> {
  const { error } = await supabase.from('routine_days').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteRoutineDay(id: string): Promise<void> {
  const { error } = await supabase.from('routine_days').delete().eq('id', id)
  if (error) throw error
}

export async function addExerciseToDay(
  routineDayId: string,
  exerciseId: string,
  sortOrder: number,
): Promise<RoutineExercise> {
  const { data, error } = await supabase
    .from('routine_exercises')
    .insert({
      routine_day_id: routineDayId,
      exercise_id: exerciseId,
      sort_order: sortOrder,
      sets: 3,
      reps_min: 8,
      reps_max: 12,
      rest_seconds: 90,
    })
    .select('*, exercise:exercises(*)')
    .single()
  if (error) throw error
  return data
}

export async function updateRoutineExercise(
  id: string,
  patch: Partial<Pick<RoutineExercise, 'sets' | 'reps_min' | 'reps_max' | 'rest_seconds' | 'notes' | 'sort_order'>>,
): Promise<void> {
  const { error } = await supabase.from('routine_exercises').update(patch).eq('id', id)
  if (error) throw error
}

export async function removeExerciseFromDay(id: string): Promise<void> {
  const { error } = await supabase.from('routine_exercises').delete().eq('id', id)
  if (error) throw error
}

export async function reorderRoutineDays(updates: { id: string; sort_order: number }[]): Promise<void> {
  await Promise.all(
    updates.map(({ id, sort_order }) =>
      supabase.from('routine_days').update({ sort_order }).eq('id', id),
    ),
  )
}

export async function reorderRoutineExercises(updates: { id: string; sort_order: number }[]): Promise<void> {
  await Promise.all(
    updates.map(({ id, sort_order }) =>
      supabase.from('routine_exercises').update({ sort_order }).eq('id', id),
    ),
  )
}
