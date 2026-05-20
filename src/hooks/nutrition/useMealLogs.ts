import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getMealLogsForDate,
  addMealLog,
  deleteMealLog,
  aggregateDailyNutrition,
} from '@/services/nutrition/mealLog.service'
import { upsertOFFFood } from '@/services/nutrition/food.service'
import { useAuth } from '@/hooks/auth/useAuth'
import type { Food } from '@/types/nutrition'
import type { MealType } from '@/lib/constants'

export function useDailyMealLogs(date: string) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['meal_logs', user?.id, date],
    queryFn: () => getMealLogsForDate(user!.id, date),
    enabled: !!user?.id,
    select: (logs) => ({ logs, nutrition: aggregateDailyNutrition(logs) }),
  })
}

export function useAddMealLog(date: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: { food: Food; mealType: MealType; quantityG: number }) => {
      let food = params.food
      // Cache OFF food in Supabase before logging
      if (!food.id) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, created_at: _ca, ...foodData } = food
        food = await upsertOFFFood(foodData as typeof foodData & { off_id: string })
      }
      return addMealLog({ userId: user!.id, date, ...params, food })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal_logs', user?.id, date] })
    },
  })
}

export function useDeleteMealLog(date: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteMealLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal_logs', user?.id, date] })
    },
  })
}
