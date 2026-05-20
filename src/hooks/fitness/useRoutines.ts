import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth.store'
import * as routineService from '@/services/fitness/routine.service'
import type { WorkoutRoutine, RoutineDay, RoutineExercise } from '@/types/fitness'

export function useRoutines() {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery({
    queryKey: ['routines', userId],
    queryFn: () => routineService.getRoutines(userId!),
    enabled: !!userId,
  })
}

export function useRoutine(routineId: string | undefined) {
  return useQuery({
    queryKey: ['routine', routineId],
    queryFn: () => routineService.getRoutineWithDays(routineId!),
    enabled: !!routineId,
  })
}

export function useCreateRoutine() {
  const userId = useAuthStore((s) => s.user?.id)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => routineService.createRoutine(userId!, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routines'] }),
  })
}

export function useUpdateRoutine(routineId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (patch: Partial<Pick<WorkoutRoutine, 'name' | 'description' | 'is_active'>>) =>
      routineService.updateRoutine(routineId, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['routines'] })
      qc.invalidateQueries({ queryKey: ['routine', routineId] })
    },
  })
}

export function useDeleteRoutine() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: routineService.deleteRoutine,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routines'] }),
  })
}

export function useCreateRoutineDay(routineId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ name, sortOrder }: { name: string; sortOrder: number }) =>
      routineService.createRoutineDay(routineId, name, sortOrder),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routine', routineId] }),
  })
}

export function useUpdateRoutineDay(routineId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Pick<RoutineDay, 'name' | 'day_of_week' | 'sort_order'>> }) =>
      routineService.updateRoutineDay(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routine', routineId] }),
  })
}

export function useDeleteRoutineDay(routineId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: routineService.deleteRoutineDay,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routine', routineId] }),
  })
}

export function useAddExerciseToDay(routineId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      routineDayId,
      exerciseId,
      sortOrder,
    }: {
      routineDayId: string
      exerciseId: string
      sortOrder: number
    }) => routineService.addExerciseToDay(routineDayId, exerciseId, sortOrder),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routine', routineId] }),
  })
}

export function useUpdateRoutineExercise(routineId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string
      patch: Partial<Pick<RoutineExercise, 'sets' | 'reps_min' | 'reps_max' | 'rest_seconds' | 'notes' | 'sort_order'>>
    }) => routineService.updateRoutineExercise(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routine', routineId] }),
  })
}

export function useRemoveExerciseFromDay(routineId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: routineService.removeExerciseFromDay,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routine', routineId] }),
  })
}

export function useReorderRoutineDays(routineId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (updates: { id: string; sort_order: number }[]) =>
      routineService.reorderRoutineDays(updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routine', routineId] }),
  })
}

export function useReorderRoutineExercises(routineId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (updates: { id: string; sort_order: number }[]) =>
      routineService.reorderRoutineExercises(updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routine', routineId] }),
  })
}
