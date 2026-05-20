import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth.store'
import * as mesocycleService from '@/services/fitness/mesocycle.service'
import type { Mesocycle } from '@/types/fitness'

export function useMesocycles() {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery({
    queryKey: ['mesocycles', userId],
    queryFn: () => mesocycleService.getMesocycles(userId!),
    enabled: !!userId,
  })
}

export function useCreateMesocycle() {
  const userId = useAuthStore((s) => s.user?.id)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (entry: Omit<Mesocycle, 'id' | 'created_at' | 'user_id'>) =>
      mesocycleService.createMesocycle({ ...entry, user_id: userId! }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mesocycles'] }),
  })
}

export function useUpdateMesocycle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Omit<Mesocycle, 'id' | 'user_id' | 'created_at'>> }) =>
      mesocycleService.updateMesocycle(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mesocycles'] }),
  })
}

export function useDeleteMesocycle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: mesocycleService.deleteMesocycle,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mesocycles'] }),
  })
}
