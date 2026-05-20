import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

interface AddBodyMetricsSheetProps {
  open: boolean
  onClose: () => void
  onAdd: (data: {
    measured_at: string
    weight_kg: number | null
    body_fat_pct: number | null
    waist_cm: number | null
    chest_cm: null
    hip_cm: null
    arm_cm: null
    thigh_cm: null
    notes: string | null
  }) => Promise<void>
  isAdding: boolean
}

export function AddBodyMetricsSheet({ open, onClose, onAdd, isAdding }: AddBodyMetricsSheetProps) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [waist, setWaist] = useState('')
  const [notes, setNotes] = useState('')

  async function handleSubmit() {
    if (!weight && !bodyFat && !waist) return
    await onAdd({
      measured_at: date,
      weight_kg: weight ? parseFloat(weight) : null,
      body_fat_pct: bodyFat ? parseFloat(bodyFat) : null,
      waist_cm: waist ? parseFloat(waist) : null,
      chest_cm: null,
      hip_cm: null,
      arm_cm: null,
      thigh_cm: null,
      notes: notes || null,
    })
    setWeight('')
    setBodyFat('')
    setWaist('')
    setNotes('')
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[85dvh] bg-slate-900 border-slate-700 p-0 gap-0">
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-slate-700/50">
          <SheetTitle className="text-base">Registrar medidas</SheetTitle>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Peso (kg)</label>
              <Input
                type="number"
                step="0.1"
                placeholder="70.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="bg-slate-800 border-slate-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Grasa corporal (%)</label>
              <Input
                type="number"
                step="0.1"
                placeholder="15.0"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                className="bg-slate-800 border-slate-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400">Cintura (cm)</label>
            <Input
              type="number"
              step="0.5"
              placeholder="80"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
              className="bg-slate-800 border-slate-600"
            />
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
            disabled={isAdding || (!weight && !bodyFat && !waist)}
            className="w-full bg-fitness hover:bg-fitness/90"
          >
            {isAdding ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
