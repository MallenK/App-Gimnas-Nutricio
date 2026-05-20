import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { searchLocalFoods } from '@/services/nutrition/food.service'
import { searchOFF } from '@/services/nutrition/openFoodFacts.service'
import type { Food } from '@/types/nutrition'
import { useDebounce } from '@/hooks/useDebounce'

export function useFoodSearch() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 350)
  const enabled = debouncedQuery.trim().length >= 2

  const localQuery = useQuery({
    queryKey: ['foods', 'local', debouncedQuery],
    queryFn: () => searchLocalFoods(debouncedQuery),
    enabled,
    staleTime: 60_000,
  })

  const offQuery = useQuery({
    queryKey: ['foods', 'off', debouncedQuery],
    queryFn: () => searchOFF(debouncedQuery),
    enabled,
    staleTime: 5 * 60_000,
  })

  const localIds = new Set((localQuery.data ?? []).map((f) => f.off_id).filter(Boolean))
  const results: Food[] = [
    ...(localQuery.data ?? []),
    ...(offQuery.data ?? []).filter((f) => !f.off_id || !localIds.has(f.off_id)),
  ]

  return {
    query,
    setQuery,
    results,
    isLoading: enabled && (localQuery.isLoading || offQuery.isLoading),
    isOffLoading: enabled && offQuery.isLoading,
  }
}
