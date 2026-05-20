import { supabase } from '@/lib/supabase'
import type { WorkoutSession } from '@/types/fitness'
import type { ActiveExercise } from '@/types/fitness'

interface FinishWorkoutParams {
  userId: string
  startTime: string
  date: string
  routineDayId: string | null
  exercises: ActiveExercise[]
  perceivedEffort: number | null
  notes: string | null
}

export async function finishWorkout(params: FinishWorkoutParams): Promise<WorkoutSession> {
  const { userId, startTime, date, routineDayId, exercises, perceivedEffort, notes } = params

  const endTime = new Date().toISOString()
  const durationMinutes = Math.round(
    (new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000,
  )

  // Create session
  const { data: session, error: sessionErr } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: userId,
      routine_day_id: routineDayId,
      session_date: date,
      start_time: startTime,
      end_time: endTime,
      duration_minutes: durationMinutes,
      perceived_effort: perceivedEffort,
      notes,
    })
    .select()
    .single()

  if (sessionErr) throw sessionErr

  // Build sets payload — only completed sets
  const setsToInsert = exercises.flatMap((ex) =>
    ex.sets
      .filter((s) => s.isCompleted)
      .map((s, idx) => ({
        workout_session_id: session.id,
        exercise_id: ex.exerciseId,
        set_number: idx + 1,
        reps: s.reps,
        weight_kg: s.weightKg,
        is_warmup: s.isWarmup,
        rpe: s.rpe,
      })),
  )

  if (setsToInsert.length > 0) {
    const { error: setsErr } = await supabase.from('workout_sets').insert(setsToInsert)
    if (setsErr) throw setsErr
  }

  return session
}

export async function getWorkoutSessions(userId: string, limit = 30): Promise<WorkoutSession[]> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*, routine_day:routine_days(name, routine_id)')
    .eq('user_id', userId)
    .order('session_date', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function getWorkoutSessionDetail(id: string): Promise<WorkoutSession | null> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*, sets:workout_sets(*, exercise:exercises(name, muscle_group))')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}
