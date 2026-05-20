export const MEAL_TYPES = [
  { value: 'breakfast', label: 'Desayuno', icon: '🌅' },
  { value: 'lunch', label: 'Almuerzo', icon: '☀️' },
  { value: 'dinner', label: 'Cena', icon: '🌙' },
  { value: 'snack', label: 'Snack', icon: '🍎' },
] as const

export type MealType = (typeof MEAL_TYPES)[number]['value']

export const MUSCLE_GROUPS = [
  { value: 'chest', label: 'Pecho' },
  { value: 'back', label: 'Espalda' },
  { value: 'shoulders', label: 'Hombros' },
  { value: 'biceps', label: 'Bíceps' },
  { value: 'triceps', label: 'Tríceps' },
  { value: 'forearms', label: 'Antebrazos' },
  { value: 'legs', label: 'Piernas' },
  { value: 'glutes', label: 'Glúteos' },
  { value: 'calves', label: 'Pantorrillas' },
  { value: 'core', label: 'Core / Abdomen' },
  { value: 'full_body', label: 'Cuerpo completo' },
  { value: 'cardio', label: 'Cardio' },
] as const

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number]['value']

export const EXERCISE_CATEGORIES = [
  { value: 'strength', label: 'Fuerza' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'bodyweight', label: 'Peso corporal' },
  { value: 'stretching', label: 'Flexibilidad' },
] as const

export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number]['value']

export const EQUIPMENT_TYPES = [
  { value: 'barbell', label: 'Barra' },
  { value: 'dumbbell', label: 'Mancuernas' },
  { value: 'machine', label: 'Máquina' },
  { value: 'cable', label: 'Cable' },
  { value: 'bodyweight', label: 'Peso corporal' },
  { value: 'bands', label: 'Bandas elásticas' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'other', label: 'Otro' },
] as const

export const CARDIO_TYPES = [
  { value: 'running', label: 'Correr' },
  { value: 'cycling', label: 'Ciclismo' },
  { value: 'walking', label: 'Caminar' },
  { value: 'swimming', label: 'Natación' },
  { value: 'rowing', label: 'Remo' },
  { value: 'elliptical', label: 'Elíptica' },
  { value: 'stair_climber', label: 'Escaladora' },
  { value: 'other', label: 'Otro' },
] as const

export const HABIT_RECURRENCE = [
  { value: 'daily', label: 'Todos los días' },
  { value: 'weekdays', label: 'Días laborales (L-V)' },
  { value: 'weekends', label: 'Fines de semana' },
  { value: 'custom', label: 'Personalizado' },
] as const

export const GOAL_CATEGORIES = [
  { value: 'nutrition', label: 'Nutrición', color: '#10b981' },
  { value: 'fitness', label: 'Fitness', color: '#f97316' },
  { value: 'body', label: 'Cuerpo', color: '#8b5cf6' },
  { value: 'habit', label: 'Hábito', color: '#06b6d4' },
  { value: 'other', label: 'Otro', color: '#6366f1' },
] as const

export const GOAL_PERIODS = [
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'custom', label: 'Personalizado' },
] as const

export const MESOCYCLE_GOALS = [
  { value: 'hypertrophy', label: 'Hipertrofia' },
  { value: 'strength', label: 'Fuerza' },
  { value: 'endurance', label: 'Resistencia' },
  { value: 'cut', label: 'Definición' },
  { value: 'recomp', label: 'Recomposición' },
] as const

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Lunes', short: 'L' },
  { value: 1, label: 'Martes', short: 'M' },
  { value: 2, label: 'Miércoles', short: 'X' },
  { value: 3, label: 'Jueves', short: 'J' },
  { value: 4, label: 'Viernes', short: 'V' },
  { value: 5, label: 'Sábado', short: 'S' },
  { value: 6, label: 'Domingo', short: 'D' },
] as const

// Macros: calories per gram
export const KCAL_PER_G = {
  protein: 4,
  carbs: 4,
  fat: 9,
} as const
