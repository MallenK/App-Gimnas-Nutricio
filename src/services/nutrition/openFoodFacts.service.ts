import type { OFFProduct, Food } from '@/types/nutrition'

const BASE = 'https://world.openfoodfacts.org/cgi/search.pl'

export async function searchOFF(query: string): Promise<Food[]> {
  if (!query.trim()) return []

  const url = new URL(BASE)
  url.searchParams.set('search_terms', query)
  url.searchParams.set('json', '1')
  url.searchParams.set('page_size', '20')
  url.searchParams.set('fields', 'code,product_name,brands,nutriments,serving_size')
  url.searchParams.set('search_simple', '1')
  url.searchParams.set('action', 'process')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('OpenFoodFacts search failed')

  const json = await res.json()
  return ((json.products as OFFProduct[]) ?? [])
    .filter((p) => p.product_name && p.nutriments?.['energy-kcal_100g'] != null)
    .map(offProductToFood)
}

export function offProductToFood(p: OFFProduct): Food {
  return {
    id: '',
    created_at: '',
    user_id: null,
    off_id: p.code ?? null,
    name: p.product_name,
    brand: p.brands || null,
    serving_size_g: parseServingSize(p.serving_size) ?? 100,
    serving_unit: 'g',
    calories_per_100g: p.nutriments['energy-kcal_100g'] ?? 0,
    protein_per_100g: p.nutriments.proteins_100g ?? 0,
    carbs_per_100g: p.nutriments.carbohydrates_100g ?? 0,
    fat_per_100g: p.nutriments.fat_100g ?? 0,
    fiber_per_100g: p.nutriments.fiber_100g ?? null,
    sugar_per_100g: p.nutriments.sugars_100g ?? null,
    sodium_per_100g: p.nutriments.sodium_100g ?? null,
    is_custom: false,
  }
}

function parseServingSize(s?: string): number | null {
  if (!s) return null
  const match = s.match(/(\d+(?:\.\d+)?)/)
  return match ? parseFloat(match[1]) : null
}
