import { useState } from 'react'
import { Plus, Trash2, Heart } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useCardioLogs, useAddCardioLog, useDeleteCardioLog } from '@/hooks/fitness/useCardio'
import { AddCardioSheet } from '@/components/fitness/AddCardioSheet'
import { CARDIO_TYPES } from '@/lib/constants'
import type { CardioLog } from '@/types/fitness'

const ACTIVITY_ICONS: Record<string, string> = {
  running: '🏃',
  cycling: '🚴',
  walking: '🚶',
  swimming: '🏊',
  rowing: '🚣',
  elliptical: '⚙️',
  stair_climber: '🪜',
  other: '❤️',
}

export function CardioPage() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { data: logs = [], isLoading } = useCardioLogs()
  const addLog = useAddCardioLog()
  const deleteLog = useDeleteCardioLog()

  const totalThisMonth = logs
    .filter((l) => l.log_date.startsWith(format(new Date(), 'yyyy-MM')))
    .reduce((sum, l) => sum + l.duration_minutes, 0)

  async function handleAdd(data: Parameters<typeof addLog.mutateAsync>[0]) {
    await addLog.mutateAsync(data)
    setSheetOpen(false)
  }

  return (
    <div className="pb-28 animate-fade-in">
      <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-fitness" />
          <h1 className="font-bold text-base">Cardio y pasos</h1>
        </div>
        <button
          onClick={() => setSheetOpen(true)}
          className="w-8 h-8 rounded-full bg-fitness/20 text-fitness flex items-center justify-center"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Monthly summary */}
        {logs.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-fitness/10 border border-fitness/20 p-3 text-center">
              <p className="text-2xl font-bold text-fitness">{totalThisMonth}</p>
              <p className="text-xs text-slate-400 mt-0.5">min este mes</p>
            </div>
            <div className="rounded-xl bg-slate-800/60 border border-slate-700/30 p-3 text-center">
              <p className="text-2xl font-bold text-slate-300">
                {logs.filter((l) => l.log_date.startsWith(format(new Date(), 'yyyy-MM'))).length}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">sesiones mes</p>
            </div>
          </div>
        )}

        {/* Log list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-slate-800/40 animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="text-5xl">🏃</div>
            <div>
              <p className="font-semibold text-lg mb-1">Sin sesiones</p>
              <p className="text-slate-400 text-sm">Registra tus actividades cardiovasculares</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-800/40 border border-slate-700/30 overflow-hidden divide-y divide-slate-700/30">
            {logs.map((log) => (
              <CardioRow key={log.id} log={log} onDelete={() => deleteLog.mutate(log.id)} />
            ))}
          </div>
        )}
      </div>

      <AddCardioSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onAdd={handleAdd}
        isAdding={addLog.isPending}
      />
    </div>
  )
}

function CardioRow({ log, onDelete }: { log: CardioLog; onDelete: () => void }) {
  const dateStr = format(parseISO(log.log_date), "d 'de' MMM", { locale: es })
  const activityLabel = CARDIO_TYPES.find((t) => t.value === log.activity_type)?.label ?? log.activity_type
  const icon = ACTIVITY_ICONS[log.activity_type] ?? '❤️'

  return (
    <div className="flex items-center gap-3 px-4 py-3 group hover:bg-slate-700/20 transition-colors">
      <div className="w-9 h-9 rounded-xl bg-fitness/15 flex items-center justify-center text-base shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{activityLabel}</p>
        <p className="text-xs text-slate-500">
          {dateStr} · {log.duration_minutes} min
          {log.distance_km != null && ` · ${log.distance_km} km`}
          {log.calories_burned != null && ` · ${log.calories_burned} kcal`}
        </p>
      </div>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-600 hover:text-red-400 transition-all shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
