import { useState } from 'react'
import { Plus, Trash2, TrendingUp } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { useBodyMetrics, useAddBodyMetrics, useDeleteBodyMetrics } from '@/hooks/fitness/useBodyMetrics'
import { useUserGoals } from '@/hooks/nutrition/useUserGoals'
import { AddBodyMetricsSheet } from '@/components/fitness/AddBodyMetricsSheet'
import { cn } from '@/lib/utils'
import type { BodyMetrics } from '@/types/fitness'

function movingAvg(data: { weight: number }[], window = 7): (number | null)[] {
  return data.map((_, i) => {
    const slice = data.slice(Math.max(0, i - window + 1), i + 1).map((d) => d.weight)
    if (slice.length < 3) return null
    return slice.reduce((a, b) => a + b, 0) / slice.length
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p: { name: string; value: number | null; color: string }) =>
        p.value != null ? (
          <p key={p.name} style={{ color: p.color }}>
            {p.name === 'avg' ? 'Media 7d' : 'Peso'}: {p.value.toFixed(1)} kg
          </p>
        ) : null,
      )}
    </div>
  )
}

export function ProgressPage() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { data: metrics = [], isLoading } = useBodyMetrics()
  const addMetrics = useAddBodyMetrics()
  const deleteMetrics = useDeleteBodyMetrics()
  const { data: goals } = useUserGoals()

  const targetWeight = goals?.target_weight_kg ?? null

  const chartData = metrics
    .filter((m) => m.weight_kg != null)
    .map((m) => ({
      date: format(parseISO(m.measured_at), 'd MMM', { locale: es }),
      weight: m.weight_kg!,
      id: m.id,
    }))

  const avgs = movingAvg(chartData)
  const chartDataWithAvg = chartData.map((d, i) => ({ ...d, avg: avgs[i] }))

  const latest = metrics[metrics.length - 1]
  const weightDelta =
    metrics.length >= 2
      ? (metrics[metrics.length - 1]?.weight_kg ?? 0) - (metrics[0]?.weight_kg ?? 0)
      : null

  async function handleAdd(data: Parameters<typeof addMetrics.mutateAsync>[0]) {
    await addMetrics.mutateAsync(data)
    setSheetOpen(false)
  }

  return (
    <div className="pb-28 animate-fade-in">
      <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-fitness" />
          <h1 className="font-bold text-base">Progreso corporal</h1>
        </div>
        <button
          onClick={() => setSheetOpen(true)}
          className="w-8 h-8 rounded-full bg-fitness/20 text-fitness flex items-center justify-center"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Stats row */}
        {latest && (
          <div className="grid grid-cols-3 gap-3">
            <StatBox
              label="Peso actual"
              value={latest.weight_kg != null ? `${latest.weight_kg.toFixed(1)} kg` : '—'}
              color="text-fitness"
            />
            <StatBox
              label="Objetivo"
              value={targetWeight != null ? `${targetWeight.toFixed(1)} kg` : '—'}
              color="text-primary"
            />
            <StatBox
              label={`Cambio (${metrics.length}d)`}
              value={
                weightDelta != null
                  ? `${weightDelta >= 0 ? '+' : ''}${weightDelta.toFixed(1)} kg`
                  : '—'
              }
              color={weightDelta == null ? '' : weightDelta <= 0 ? 'text-emerald-400' : 'text-red-400'}
            />
          </div>
        )}

        {/* Chart */}
        {isLoading ? (
          <div className="h-52 rounded-2xl bg-slate-800/40 animate-pulse" />
        ) : chartData.length < 2 ? (
          <div className="h-52 rounded-2xl bg-slate-800/40 border border-slate-700/30 flex flex-col items-center justify-center gap-2 text-center p-4">
            <p className="font-semibold">Sin suficientes datos</p>
            <p className="text-slate-400 text-sm">Registra al menos 2 medidas para ver la gráfica</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-800/40 border border-slate-700/30 p-4">
            <p className="text-xs text-slate-400 font-medium mb-3">Peso corporal</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartDataWithAvg} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />
                {targetWeight != null && (
                  <ReferenceLine
                    y={targetWeight}
                    stroke="#6366f1"
                    strokeDasharray="4 4"
                    label={{ value: 'Obj.', position: 'right', fontSize: 10, fill: '#6366f1' }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#f97316' }}
                  activeDot={{ r: 5 }}
                  name="weight"
                />
                <Line
                  type="monotone"
                  dataKey="avg"
                  stroke="#fb923c"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                  dot={false}
                  name="avg"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* History list */}
        {metrics.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400 font-medium px-1">Historial</p>
            <div className="rounded-2xl bg-slate-800/40 border border-slate-700/30 overflow-hidden divide-y divide-slate-700/30">
              {[...metrics].reverse().slice(0, 20).map((m) => (
                <MetricRow key={m.id} metric={m} onDelete={() => deleteMetrics.mutate(m.id)} />
              ))}
            </div>
          </div>
        )}

        {metrics.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="text-5xl">📊</div>
            <div>
              <p className="font-semibold text-lg mb-1">Sin medidas</p>
              <p className="text-slate-400 text-sm">Registra tu peso para ver la evolución</p>
            </div>
          </div>
        )}
      </div>

      <AddBodyMetricsSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onAdd={handleAdd}
        isAdding={addMetrics.isPending}
      />
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl bg-slate-800/60 border border-slate-700/30 p-3 text-center">
      <p className={cn('text-lg font-bold', color)}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}

function MetricRow({ metric, onDelete }: { metric: BodyMetrics; onDelete: () => void }) {
  const dateStr = format(parseISO(metric.measured_at), "d 'de' MMM yyyy", { locale: es })
  return (
    <div className="flex items-center gap-3 px-4 py-3 group hover:bg-slate-700/20 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{dateStr}</p>
        <p className="text-xs text-slate-500">
          {[
            metric.weight_kg != null && `${metric.weight_kg} kg`,
            metric.body_fat_pct != null && `${metric.body_fat_pct}% grasa`,
            metric.waist_cm != null && `${metric.waist_cm} cm cintura`,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-600 hover:text-red-400 transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
