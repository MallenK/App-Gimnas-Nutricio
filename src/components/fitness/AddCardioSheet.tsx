import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { CARDIO_TYPES } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface AddCardioSheetProps {
  open: boolean
  onClose: () => void
  onAdd: (data: {
    log_date: string
    activity_type: string
    duration_minutes: number
    distance_km: number | null
    calories_burned: number | null
    steps: number | null
    avg_heart_rate: number | null
    notes: string | null
  }) => Promise<void>
  isAdding: boolean
}

export function AddCardioSheet({ open, onClose, onAdd, isAdding }: AddCardioSheetProps) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [activity, setActivity] = useState('running')
  const [duration, setDuration] = useState('')
  const [distance, setDistance] = useState('')
  const [calories, setCalories] = useState('')
  const [steps, setSteps] = useState('')
  const [heartRate, setHeartRate] = useState('')
  const [notes, setNotes] = useState('')

  async function handleSubmit() {
    if (!duration) return
    await onAdd({
      log_date: date,
      activity_type: activity,
      duration_minutes: parseInt(duration),
      distance_km: distance ? parseFloat(distance) : null,
      calories_burned: calories ? parseInt(calories) : null,
      steps: steps ? parseInt(steps) : null,
      avg_heart_rate: heartRate ? parseInt(heartRate) : null,
      notes: notes || null,
    })
    setDuration('')
    setDistance('')
    setCalories('')
    setSteps('')
    setHeartRate('')
    setNotes('')
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[90dvh] bg-slate-900 border-slate-700 p-0 gap-0">
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-slate-700/50">
          <SheetTitle className="text-base">Registrar cardio</SheetTitle>
        </SheetHeader>

        <div className="p-4 space-y-4 overflow-y-auto">
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Fecha</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-slate-800 border-slate-600"
            />
          </div>

          {/* Activity type */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Actividad</label>
            <div className="flex flex-wrap gap-2">
              {CARDIO_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setActivity(t.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                    activity === t.value
                      ? 'bg-fitness/20 border-fitness text-fitness'
                      : 'bg-slate-800 border-slate-700 text-slate-400',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Duración (min) *</label>
              <Input
                type="number"
                placeholder="30"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="bg-slate-800 border-slate-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Distancia (km)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="5.0"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="bg-slate-800 border-slate-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Calorías</label>
              <Input
                type="number"
                placeholder="300"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="bg-slate-800 border-slate-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Pasos</label>
              <Input
                type="number"
                placeholder="8000"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                className="bg-slate-800 border-slate-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">FC media (bpm)</label>
              <Input
                type="number"
                placeholder="140"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                className="bg-slate-800 border-slate-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400">Notas</label>
            <Input
              placeholder="Opcional..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-slate-800 border-slate-600"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isAdding || !duration}
            className="w-full bg-fitness hover:bg-fitness/90"
          >
            {isAdding ? 'Guardando...' : 'Guardar sesión'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
