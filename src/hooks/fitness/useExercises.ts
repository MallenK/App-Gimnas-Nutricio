import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { searchExercises } from '@/services/fitness/exercise.service'
import { useDebounce } from '@/hooks/useDebounce'
import type { MuscleGroup } from '@/lib/constants'

export function useExerciseSearch() {
  const [query, setQuery] = useState('')
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | 'all'>('all')
  const debouncedQuery = useDebounce(query, 300)

  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ['exercises', debouncedQuery, muscleGroup],
    queryFn: () => searchExercises(debouncedQuery, muscleGroup),
    staleTime: 5 * 60_000,
  })

  return { query, setQuery, muscleGroup, setMuscleGroup, exercises, isLoading }
}
