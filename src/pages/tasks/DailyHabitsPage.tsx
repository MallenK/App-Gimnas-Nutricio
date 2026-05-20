import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { addDays, format, parseISO } from 'date-fns'
import { useDailyHabits, useToggleHabit, useCreateHabit, useUpdateHabit, useDeleteHabit } from '@/hooks/tasks/useHabits'
import { HabitCheckItem } from '@/components/tasks/HabitCheckItem'
import { AddHabitSheet } from '@/components/tasks/AddHabitSheet'
import { todayISO } from '@/lib/utils'
import type { Habit } from '@/types/tasks'

export function DailyHabitsPage() {
  const { date: dateParam } = useParams<{ date?: string }>()
  const navigate = useNavigate()
  const date = dateParam ?? todayISO()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editHabit, setEditHabit] = useState<Habit | null>(null)

  const { data: habits = [], isLoading } = useDailyHabits(date)
  const toggle = useToggleHabit(date)
  const create = useCreateHabit()
  const update = useUpdateHabit()
  const remove = useDeleteHabit()

  const completed = habits.filter((h) => h.log?.completed).length
  const total = habits.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  function navigateDate(delta: number) {
    const next = format(addDays(parseISO(date), delta), 'yyyy-MM-dd')
    navigate(next === todayISO() ? '/tasks/habits' : `/tasks/habits/${next}`)
  }

  const dateLabel = (() => {
    const today = todayISO()
    const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd')
    if (date === today) return 'Hoy'
    if (date === yesterday) return 'Ayer'
    return format(parseISO(date), "d 'de' MMMM")
  })()

  async function handleSaveHabit(data: Omit<Habit, 'id' | 'created_at' | 'sort_order' | 'user_id'>) {
    if (editHabit) {
      await update.mutateAsync({ id: editHabit.id, updates: data })
    } else {
      await create.mutateAsync(data)
    }
    setSheetOpen(false)
    setEditHabit(null)
  }

  function openEdit(habit: Habit) {
    setEditHabit(habit)
    setSheetOpen(true)
  }

  return (
    <div className="pb-24 animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDate(-1)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 transition-colors text-slate-400"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-sm">{dateLabel}</span>
            <button
              onClick={() => navigateDate(1)}
              disabled={date === todayISO()}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 transition-colors text-slate-400 disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => { setEditHabit(null); setSheetOpen(true) }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 text-sm font-medium hover:bg-cyan-500/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo
          </button>
        </div>

        {/* Progress */}
        {total > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>{completed}/{total} completados</span>
              <span>{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pt-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-slate-800/40 animate-pulse" />
            ))}
          </div>
        ) : habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
            <div className="text-5xl">✅</div>
            <div>
              <p className="font-semibold text-lg mb-1">Sin hábitos aún</p>
              <p className="text-slate-400 text-sm">Crea tu primer hábito para empezar a hacer seguimiento</p>
            </div>
            <button
              onClick={() => { setEditHabit(null); setSheetOpen(true) }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 font-medium hover:bg-cyan-500/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear primer hábito
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Active first, then completed */}
            {[...habits]
              .sort((a, b) => {
                const aComp = a.log?.completed ? 1 : 0
                const bComp = b.log?.completed ? 1 : 0
                if (aComp !== bComp) return aComp - bComp
                return a.sort_order - b.sort_order
              })
              .map((habit) => (
                <HabitCheckItem
                  key={habit.id}
                  habit={habit}
                  onToggle={(completed) => toggle.mutate({ habitId: habit.id, completed })}
                  onEdit={() => openEdit(habit)}
                  onDelete={() => remove.mutate(habit.id)}
                  isToggling={toggle.isPending}
                />
              ))}
          </div>
        )}
      </div>

      <AddHabitSheet
        open={sheetOpen}
        editHabit={editHabit}
        onClose={() => { setSheetOpen(false); setEditHabit(null) }}
        onSave={handleSaveHabit}
        isSaving={create.isPending || update.isPending}
      />
    </div>
  )
}
