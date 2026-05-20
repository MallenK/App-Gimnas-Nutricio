import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getGoals, createGoal, updateGoal, deleteGoal } from '@/services/tasks/goal.service'
import { useAuth } from '@/hooks/auth/useAuth'
import type { Goal } from '@/types/tasks'

export function useGoals(status?: Goal['status']) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['goals', user?.id, status],
    queryFn: () => getGoals(user!.id, status),
    enabled: !!user?.id,
  })
}

export function useCreateGoal() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'user_id'>) =>
      createGoal({ ...goal, user_id: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', user?.id] })
    },
  })
}

export function useUpdateGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Goal> }) =>
      updateGoal(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useDeleteGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}
