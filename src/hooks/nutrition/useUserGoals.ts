import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/auth/useAuth'
import type { UserGoals } from '@/types/auth'

async function fetchUserGoals(userId: string): Promise<UserGoals | null> {
  const { data, error } = await supabase
    .from('user_goals')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export function useUserGoals() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['user_goals', user?.id],
    queryFn: () => fetchUserGoals(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60_000,
  })
}

export function useUpsertUserGoals() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (
      goals: Partial<Omit<UserGoals, 'id' | 'user_id' | 'created_at' | 'updated_at'>>,
    ) => {
      const { error } = await supabase
        .from('user_goals')
        .upsert({ ...goals, user_id: user!.id }, { onConflict: 'user_id' })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_goals', user?.id] })
    },
  })
}
