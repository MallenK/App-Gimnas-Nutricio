import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/auth/useAuth'
import * as mealPlanService from '@/services/nutrition/mealPlan.service'
import type { MealPlanEntry } from '@/types/nutrition'

export function useMealPlanTemplates() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['meal_plan_templates', user?.id],
    queryFn: () => mealPlanService.getMealPlanTemplates(user!.id),
    enabled: !!user?.id,
  })
}

export function useMealPlanTemplate(templateId: string | undefined) {
  return useQuery({
    queryKey: ['meal_plan_template', templateId],
    queryFn: () => mealPlanService.getMealPlanTemplateWithEntries(templateId!),
    enabled: !!templateId,
  })
}

export function useCreateMealPlanTemplate() {
  const { user } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => mealPlanService.createMealPlanTemplate(user!.id, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meal_plan_templates'] }),
  })
}

export function useDeleteMealPlanTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: mealPlanService.deleteMealPlanTemplate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meal_plan_templates'] })
      qc.invalidateQueries({ queryKey: ['meal_plan_template'] })
    },
  })
}

export function useAddMealPlanEntry(templateId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (entry: Omit<MealPlanEntry, 'id' | 'food'>) =>
      mealPlanService.addMealPlanEntry(entry),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meal_plan_template', templateId] }),
  })
}

export function useRemoveMealPlanEntry(templateId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: mealPlanService.removeMealPlanEntry,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meal_plan_template', templateId] }),
  })
}

export function useApplyTemplateDay(templateId: string) {
  const { user } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ dayOfWeek, date }: { dayOfWeek: number; date: string }) =>
      mealPlanService.applyTemplateDayToLog(user!.id, templateId, dayOfWeek, date),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['meal_logs', user?.id, vars.date] })
    },
  })
}
