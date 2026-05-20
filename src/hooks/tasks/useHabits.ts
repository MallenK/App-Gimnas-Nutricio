import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getHabitsWithLogsForDate,
  toggleHabitLog,
  createHabit,
  updateHabit,
  deleteHabit,
} from '@/services/tasks/habit.service'
import { useAuth } from '@/hooks/auth/useAuth'
import type { Habit } from '@/types/tasks'

export function useDailyHabits(date: string) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['habits', 'daily', user?.id, date],
    queryFn: () => getHabitsWithLogsForDate(user!.id, date),
    enabled: !!user?.id,
  })
}

export function useToggleHabit(date: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ habitId, completed }: { habitId: string; completed: boolean }) =>
      toggleHabitLog(habitId, user!.id, date, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', 'daily', user?.id, date] })
    },
  })
}

export function useCreateHabit() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (habit: Omit<Habit, 'id' | 'created_at' | 'sort_order' | 'user_id'>) =>
      createHabit({ ...habit, user_id: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
    },
  })
}

export function useUpdateHabit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Habit> }) =>
      updateHabit(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
    },
  })
}

export function useDeleteHabit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
    },
  })
}
