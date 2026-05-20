import { useState } from 'react'
import { Plus, Target } from 'lucide-react'
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from '@/hooks/tasks/useGoals'
import { GoalCard } from '@/components/tasks/GoalCard'
import { AddGoalSheet } from '@/components/tasks/AddGoalSheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Goal } from '@/types/tasks'

export function GoalsPage() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editGoal, setEditGoal] = useState<Goal | null>(null)

  const { data: activeGoals = [], isLoading: loadingActive } = useGoals('active')
  const { data: completedGoals = [] } = useGoals('completed')
  const create = useCreateGoal()
  const update = useUpdateGoal()
  const remove = useDeleteGoal()

  async function handleSave(data: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'user_id'>) {
    if (editGoal) {
      await update.mutateAsync({ id: editGoal.id, updates: data })
    } else {
      await create.mutateAsync(data)
    }
    setSheetOpen(false)
    setEditGoal(null)
  }

  function openEdit(goal: Goal) {
    setEditGoal(goal)
    setSheetOpen(true)
  }

  return (
    <div className="pb-24 animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold text-base flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-400" />
          Objetivos
        </h1>
        <button
          onClick={() => { setEditGoal(null); setSheetOpen(true) }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 text-sm font-medium hover:bg-cyan-500/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo
        </button>
      </div>

      <div className="px-4 pt-4">
        <Tabs defaultValue="active">
          <TabsList className="w-full bg-slate-800 border border-slate-700 mb-4">
            <TabsTrigger value="active" className="flex-1 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              Activos ({activeGoals.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 data-[state=active]:bg-slate-700">
              Completados ({completedGoals.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3 mt-0">
            {loadingActive ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-32 rounded-2xl bg-slate-800/40 animate-pulse" />
                ))}
              </div>
            ) : activeGoals.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
                <div className="text-5xl">🎯</div>
                <div>
                  <p className="font-semibold text-lg mb-1">Sin objetivos activos</p>
                  <p className="text-slate-400 text-sm">Define metas semanales o mensuales para mantenerte enfocado</p>
                </div>
                <button
                  onClick={() => { setEditGoal(null); setSheetOpen(true) }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 font-medium hover:bg-cyan-500/30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Crear objetivo
                </button>
              </div>
            ) : (
              activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onUpdateProgress={(val) => update.mutate({ id: goal.id, updates: { current_value: val } })}
                  onComplete={() => update.mutate({ id: goal.id, updates: { status: 'completed' } })}
                  onEdit={() => openEdit(goal)}
                  onDelete={() => remove.mutate(goal.id)}
                  isUpdating={update.isPending}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3 mt-0">
            {completedGoals.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Aún no has completado ningún objetivo
              </div>
            ) : (
              completedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onUpdateProgress={() => {}}
                  onComplete={() => {}}
                  onEdit={() => openEdit(goal)}
                  onDelete={() => remove.mutate(goal.id)}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AddGoalSheet
        open={sheetOpen}
        editGoal={editGoal}
        onClose={() => { setSheetOpen(false); setEditGoal(null) }}
        onSave={handleSave}
        isSaving={create.isPending || update.isPending}
      />
    </div>
  )
}
