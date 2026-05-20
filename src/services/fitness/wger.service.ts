const WGER_BASE = 'https://wger.de/api/v2'

export interface WgerSuggestion {
  value: string
  data: {
    id: number
    base_id: number
    name: string
    category: string
    image: string | null
    image_thumbnail: string | null
  }
}

export async function searchWgerExercises(term: string): Promise<WgerSuggestion[]> {
  try {
    const url = `${WGER_BASE}/exercise/search/?term=${encodeURIComponent(term)}&language=english&format=json`
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    return (data.suggestions ?? []) as WgerSuggestion[]
  } catch {
    return []
  }
}
