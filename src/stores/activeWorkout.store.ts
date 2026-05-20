import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uid, todayISO } from '@/lib/utils'
import type { ActiveExercise, ActiveSet } from '@/types/fitness'
import type { MuscleGroup } from '@/lib/constants'

interface ActiveWorkoutState {
  sessionId: string | null
  routineDayId: string | null
  startTime: string | null
  date: string
  exercises: ActiveExercise[]

  startWorkout: (routineDayId?: string) => void
  addExercise: (exerciseId: string, name: string, muscleGroup: MuscleGroup, imageUrl?: string | null) => void
  addSet: (exerciseId: string) => void
  updateSet: (exerciseId: string, setId: string, data: Partial<ActiveSet>) => void
  removeSet: (exerciseId: string, setId: string) => void
  removeExercise: (exerciseId: string) => void
  reorderExercises: (exercises: ActiveExercise[]) => void
  discardWorkout: () => void
  getElapsedMinutes: () => number
}

const emptyState = {
  sessionId: null,
  routineDayId: null,
  startTime: null,
  date: todayISO(),
  exercises: [],
}

export const useActiveWorkoutStore = create<ActiveWorkoutState>()(
  persist(
    (set, get) => ({
      ...emptyState,

      startWorkout: (routineDayId) =>
        set({
          sessionId: uid(),
          routineDayId: routineDayId ?? null,
          startTime: new Date().toISOString(),
          date: todayISO(),
          exercises: [],
        }),

      addExercise: (exerciseId, name, muscleGroup, imageUrl = null) =>
        set((state) => ({
          exercises: [
            ...state.exercises,
            {
              exerciseId,
              exerciseName: name,
              muscleGroup,
              imageUrl,
              sets: [
                {
                  setId: uid(),
                  reps: null,
                  weightKg: null,
                  isCompleted: false,
                  rpe: null,
                  isWarmup: false,
                },
              ],
            },
          ],
        })),

      addSet: (exerciseId) =>
        set((state) => ({
          exercises: state.exercises.map((ex) => {
            if (ex.exerciseId !== exerciseId) return ex
            const lastSet = ex.sets[ex.sets.length - 1]
            return {
              ...ex,
              sets: [
                ...ex.sets,
                {
                  setId: uid(),
                  reps: lastSet?.reps ?? null,
                  weightKg: lastSet?.weightKg ?? null,
                  isCompleted: false,
                  rpe: null,
                  isWarmup: false,
                },
              ],
            }
          }),
        })),

      updateSet: (exerciseId, setId, data) =>
        set((state) => ({
          exercises: state.exercises.map((ex) => {
            if (ex.exerciseId !== exerciseId) return ex
            return {
              ...ex,
              sets: ex.sets.map((s) => (s.setId === setId ? { ...s, ...data } : s)),
            }
          }),
        })),

      removeSet: (exerciseId, setId) =>
        set((state) => ({
          exercises: state.exercises.map((ex) => {
            if (ex.exerciseId !== exerciseId) return ex
            return { ...ex, sets: ex.sets.filter((s) => s.setId !== setId) }
          }),
        })),

      removeExercise: (exerciseId) =>
        set((state) => ({
          exercises: state.exercises.filter((ex) => ex.exerciseId !== exerciseId),
        })),

      reorderExercises: (exercises) => set({ exercises }),

      discardWorkout: () => set(emptyState),

      getElapsedMinutes: () => {
        const { startTime } = get()
        if (!startTime) return 0
        return Math.floor((Date.now() - new Date(startTime).getTime()) / 60000)
      },
    }),
    {
      name: 'gymnutricio-active-workout',
    },
  ),
)
