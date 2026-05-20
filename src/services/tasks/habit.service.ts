import { supabase } from '@/lib/supabase'
import { parseISO } from 'date-fns'
import type { Habit, HabitLog } from '@/types/tasks'

export interface HabitWithLog extends Habit {
  log: HabitLog | null
}

export function habitAppliesToDate(habit: Habit, date: string): boolean {
  const d = parseISO(date)
  const jsDay = d.getDay() // 0=Sun
  const ourDay = jsDay === 0 ? 6 : jsDay - 1 // 0=Mon, 6=Sun

  switch (habit.recurrence) {
    case 'daily':
      return true
    case 'weekdays':
      return ourDay <= 4
    case 'weekends':
      return ourDay >= 5
    case 'custom':
      return habit.recurrence_days?.includes(ourDay) ?? false
    default:
      return true
  }
}

export async function getHabitsWithLogsForDate(
  userId: string,
  date: string,
): Promise<HabitWithLog[]> {
  const [{ data: habits, error: hErr }, { data: logs, error: lErr }] = await Promise.all([
    supabase.from('habits').select('*').eq('user_id', userId).eq('is_active', true).order('sort_order'),
    supabase.from('habit_logs').select('*').eq('user_id', userId).eq('log_date', date),
  ])

  if (hErr) throw hErr
  if (lErr) throw lErr

  const logMap = new Map((logs ?? []).map((l) => [l.habit_id, l]))

  return (habits ?? [])
    .filter((h) => habitAppliesToDate(h, date))
    .map((h) => ({ ...h, log: logMap.get(h.id) ?? null }))
}

export async function toggleHabitLog(
  habitId: string,
  userId: string,
  date: string,
  completed: boolean,
): Promise<HabitLog> {
  const { data, error } = await supabase
    .from('habit_logs')
    .upsert(
      {
        habit_id: habitId,
        user_id: userId,
        log_date: date,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      },
      { onConflict: 'habit_id,log_date' },
    )
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getHabitStreak(habitId: string, userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('habit_logs')
    .select('log_date, completed')
    .eq('habit_id', habitId)
    .eq('user_id', userId)
    .eq('completed', true)
    .order('log_date', { ascending: false })
    .limit(60)
  if (error) throw error

  if (!data || data.length === 0) return 0

  const dates = new Set(data.map((d) => d.log_date))
  let streak = 0
  const today = new Date()

  for (let i = 0; i < 60; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    if (dates.has(key)) {
      streak++
    } else if (i > 0) {
      break
    }
  }

  return streak
}

export async function createHabit(
  habit: Omit<Habit, 'id' | 'created_at' | 'sort_order'>,
): Promise<Habit> {
  const { count } = await supabase
    .from('habits')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', habit.user_id)

  const { data, error } = await supabase
    .from('habits')
    .insert({ ...habit, sort_order: count ?? 0 })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateHabit(id: string, updates: Partial<Habit>): Promise<Habit> {
  const { data, error } = await supabase
    .from('habits')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteHabit(id: string): Promise<void> {
  const { error } = await supabase.from('habits').delete().eq('id', id)
  if (error) throw error
}
