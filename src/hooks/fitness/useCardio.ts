import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth.store'
import * as cardioService from '@/services/fitness/cardio.service'
import type { CardioLog } from '@/types/fitness'

export function useCardioLogs() {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery({
    queryKey: ['cardio_logs', userId],
    queryFn: () => cardioService.getCardioLogs(userId!),
    enabled: !!userId,
  })
}

export function useAddCardioLog() {
  const userId = useAuthStore((s) => s.user?.id)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (entry: Omit<CardioLog, 'id' | 'created_at' | 'user_id'>) =>
      cardioService.addCardioLog({ ...entry, user_id: userId! }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cardio_logs'] }),
  })
}

export function useDeleteCardioLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: cardioService.deleteCardioLog,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cardio_logs'] }),
  })
}
