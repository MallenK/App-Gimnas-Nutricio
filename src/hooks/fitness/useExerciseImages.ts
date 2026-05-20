import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { searchWgerExercises } from '@/services/fitness/wger.service'
import { updateExerciseImage } from '@/services/fitness/exercise.service'
import { useDebounce } from '@/hooks/useDebounce'
import { useState } from 'react'

export function useWgerSearch(term: string) {
  return useQuery({
    queryKey: ['wger_search', term],
    queryFn: () => searchWgerExercises(term),
    enabled: term.trim().length > 2,
    staleTime: 60 * 60_000, // 1h — wger images are stable
    gcTime: 24 * 60 * 60_000,
  })
}

export function useWgerSearchInput() {
  const [input, setInput] = useState('')
  const term = useDebounce(input, 400)
  const query = useWgerSearch(term)
  return { input, setInput, ...query }
}

export function useAssignExerciseImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ exerciseId, imageUrl }: { exerciseId: string; imageUrl: string }) =>
      updateExerciseImage(exerciseId, imageUrl),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exercises'] })
      qc.invalidateQueries({ queryKey: ['routine'] })
    },
  })
}
