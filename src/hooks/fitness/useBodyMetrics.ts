import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth.store'
import * as bodyMetricsService from '@/services/fitness/bodyMetrics.service'
import type { BodyMetrics } from '@/types/fitness'

export function useBodyMetrics() {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery({
    queryKey: ['body_metrics', userId],
    queryFn: () => bodyMetricsService.getBodyMetrics(userId!),
    enabled: !!userId,
    select: (data) => [...data].reverse(), // chronological for charts
  })
}

export function useAddBodyMetrics() {
  const userId = useAuthStore((s) => s.user?.id)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (entry: Omit<BodyMetrics, 'id' | 'created_at' | 'user_id'>) =>
      bodyMetricsService.addBodyMetrics({ ...entry, user_id: userId! }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['body_metrics'] }),
  })
}

export function useDeleteBodyMetrics() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: bodyMetricsService.deleteBodyMetrics,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['body_metrics'] }),
  })
}
