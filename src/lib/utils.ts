import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, pattern = 'yyyy-MM-dd'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, pattern, { locale: es })
}

export function formatDateHuman(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (isToday(d)) return 'Hoy'
  if (isYesterday(d)) return 'Ayer'
  return format(d, "d 'de' MMMM", { locale: es })
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function calcMacros(
  per100g: { calories: number; protein: number; carbs: number; fat: number },
  quantityG: number,
) {
  const ratio = quantityG / 100
  return {
    calories: Math.round(per100g.calories * ratio * 10) / 10,
    protein: Math.round(per100g.protein * ratio * 10) / 10,
    carbs: Math.round(per100g.carbs * ratio * 10) / 10,
    fat: Math.round(per100g.fat * ratio * 10) / 10,
  }
}

export function macroPercent(value: number, target: number): number {
  if (target === 0) return 0
  return Math.min(Math.round((value / target) * 100), 100)
}

export function gramFromPercent(
  calories: number,
  pct: number,
  caloriesPerGram: number,
): number {
  return Math.round((calories * (pct / 100)) / caloriesPerGram)
}

export function formatWeight(kg: number): string {
  return `${kg.toFixed(1)} kg`
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}min`
}

export function uid(): string {
  return crypto.randomUUID()
}
