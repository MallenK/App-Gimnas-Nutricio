import type { MuscleGroup, ExerciseCategory } from '@/lib/constants'

export interface Exercise {
  id: string
  user_id: string | null
  name: string
  muscle_group: MuscleGroup
  category: ExerciseCategory
  equipment: string | null
  instructions: string | null
  is_custom: boolean
  image_url: string | null
  created_at: string
}

export interface WorkoutRoutine {
  id: string
  user_id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  days?: RoutineDay[]
}

export interface RoutineDay {
  id: string
  routine_id: string
  name: string
  day_of_week: number | null
  sort_order: number
  exercises?: RoutineExercise[]
}

export interface RoutineExercise {
  id: string
  routine_day_id: string
  exercise_id: string
  sort_order: number
  sets: number
  reps_min: number | null
  reps_max: number | null
  rest_seconds: number | null
  notes: string | null
  exercise?: Exercise
}

export interface Mesocycle {
  id: string
  user_id: string
  routine_id: string | null
  name: string
  start_date: string
  end_date: string
  duration_weeks: number
  goal: string | null
  notes: string | null
  created_at: string
}

export interface WorkoutSession {
  id: string
  user_id: string
  routine_day_id: string | null
  mesocycle_id: string | null
  session_date: string
  start_time: string | null
  end_time: string | null
  duration_minutes: number | null
  notes: string | null
  perceived_effort: number | null
  created_at: string
  sets?: WorkoutSet[]
  routine_day?: RoutineDay
}

export interface WorkoutSet {
  id: string
  workout_session_id: string
  exercise_id: string
  set_number: number
  reps: number | null
  weight_kg: number | null
  duration_seconds: number | null
  distance_km: number | null
  is_warmup: boolean
  rpe: number | null
  notes: string | null
  created_at: string
  exercise?: Exercise
}

export interface CardioLog {
  id: string
  user_id: string
  log_date: string
  activity_type: string
  duration_minutes: number
  distance_km: number | null
  calories_burned: number | null
  steps: number | null
  avg_heart_rate: number | null
  notes: string | null
  created_at: string
}

export interface BodyMetrics {
  id: string
  user_id: string
  measured_at: string
  weight_kg: number | null
  body_fat_pct: number | null
  waist_cm: number | null
  chest_cm: number | null
  hip_cm: number | null
  arm_cm: number | null
  thigh_cm: number | null
  notes: string | null
  created_at: string
}

// Active workout in-progress state
export interface ActiveSet {
  setId: string
  reps: number | null
  weightKg: number | null
  isCompleted: boolean
  rpe: number | null
  isWarmup: boolean
}

export interface ActiveExercise {
  exerciseId: string
  exerciseName: string
  muscleGroup: MuscleGroup
  imageUrl: string | null
  sets: ActiveSet[]
}
