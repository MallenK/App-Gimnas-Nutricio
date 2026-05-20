import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { finishWorkout, getWorkoutSessions } from '@/services/fitness/workout.service'
import { useActiveWorkoutStore } from '@/stores/activeWorkout.store'
import { useAuth } from '@/hooks/auth/useAuth'
import type { ActiveExercise } from '@/types/fitness'

export function useWorkoutHistory() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['workout_sessions', user?.id],
    queryFn: () => getWorkoutSessions(user!.id),
    enabled: !!user?.id,
  })
}

export function useFinishWorkout() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const discard = useActiveWorkoutStore((s) => s.discardWorkout)

  return useMutation({
    mutationFn: (params: {
      exercises: ActiveExercise[]
      startTime: string
      date: string
      routineDayId: string | null
      perceivedEffort: number | null
      notes: string | null
    }) =>
      finishWorkout({ userId: user!.id, ...params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout_sessions', user?.id] })
      discard()
    },
  })
}
