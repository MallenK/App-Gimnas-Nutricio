import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { HABIT_RECURRENCE, DAYS_OF_WEEK } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Habit } from '@/types/tasks'

const HABIT_ICONS = ['💧', '🏃', '📚', '🧘', '💊', '🥗', '😴', '🏋️', '🚶', '🧹', '✍️', '🎯']
const HABIT_COLORS = [
  '#06b6d4', '#10b981', '#f97316', '#6366f1',
  '#ec4899', '#eab308', '#3b82f6', '#8b5cf6',
]

const schema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(60),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  recurrence: z.enum(['daily', 'weekdays', 'weekends', 'custom']),
  recurrence_days: z.array(z.number()).nullable(),
  target_value: z.string().nullable(),
  target_unit: z.string().nullable(),
  is_active: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface AddHabitSheetProps {
  open: boolean
  editHabit?: Habit | null
  onClose: () => void
  onSave: (data: Omit<Habit, 'id' | 'created_at' | 'sort_order' | 'user_id'>) => void
  isSaving?: boolean
}

export function AddHabitSheet({ open, editHabit, onClose, onSave, isSaving }: AddHabitSheetProps) {
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      icon: '💧',
      color: '#06b6d4',
      recurrence: 'daily',
      recurrence_days: null,
      target_value: null,
      target_unit: null,
      is_active: true,
    },
  })

  const recurrence = watch('recurrence')
  const selectedDays = watch('recurrence_days') ?? []
  const selectedIcon = watch('icon')
  const selectedColor = watch('color')

  useEffect(() => {
    if (open) {
      reset(
        editHabit
          ? {
              name: editHabit.name,
              icon: editHabit.icon,
              color: editHabit.color,
              recurrence: editHabit.recurrence,
              recurrence_days: editHabit.recurrence_days,
              target_value: editHabit.target_value ? String(editHabit.target_value) : null,
              target_unit: editHabit.target_unit,
              is_active: editHabit.is_active,
            }
          : {
              name: '',
              icon: '💧',
              color: '#06b6d4',
              recurrence: 'daily',
              recurrence_days: null,
              target_value: null,
              target_unit: null,
              is_active: true,
            },
      )
    }
  }, [open, editHabit, reset])

  function toggleDay(day: number) {
    const current = selectedDays ?? []
    const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day]
    setValue('recurrence_days', next)
  }

  function onSubmit(values: FormValues) {
    onSave({
      name: values.name,
      icon: values.icon,
      color: values.color,
      recurrence: values.recurrence,
      recurrence_days: values.recurrence === 'custom' ? (values.recurrence_days ?? []) : null,
      target_value: values.target_value ? parseFloat(values.target_value) : null,
      target_unit: values.target_unit || null,
      is_active: values.is_active,
    })
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[90dvh] flex flex-col p-0 gap-0 bg-slate-900 border-slate-700">
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-slate-700/50">
          <SheetTitle className="text-base">
            {editHabit ? 'Editar hábito' : 'Nuevo hábito'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input
                {...register('name')}
                placeholder="Beber agua, Meditación..."
                className="bg-slate-800 border-slate-600"
                autoFocus
              />
              {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
            </div>

            {/* Icons */}
            <div className="space-y-1.5">
              <Label>Icono</Label>
              <div className="flex flex-wrap gap-2">
                {HABIT_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setValue('icon', icon)}
                    className={cn(
                      'w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-colors',
                      selectedIcon === icon
                        ? 'border-cyan-500 bg-slate-700'
                        : 'border-transparent bg-slate-800 hover:border-slate-600',
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {HABIT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setValue('color', color)}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 transition-all',
                      selectedColor === color ? 'border-white scale-110' : 'border-transparent',
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Recurrence */}
            <div className="space-y-1.5">
              <Label>Frecuencia</Label>
              <Select
                value={recurrence}
                onValueChange={(v) => setValue('recurrence', v as Habit['recurrence'])}
              >
                <SelectTrigger className="bg-slate-800 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HABIT_RECURRENCE.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {recurrence === 'custom' && (
                <div className="flex gap-1.5 mt-2">
                  {DAYS_OF_WEEK.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleDay(d.value)}
                      className={cn(
                        'w-9 h-9 rounded-full text-xs font-semibold border transition-colors',
                        selectedDays.includes(d.value)
                          ? 'bg-cyan-500 border-cyan-500 text-white'
                          : 'bg-slate-800 border-slate-600 text-slate-400',
                      )}
                    >
                      {d.short}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Optional target */}
            <div className="space-y-1.5">
              <Label>Meta (opcional)</Label>
              <div className="flex gap-2">
                <Input
                  {...register('target_value')}
                  type="number"
                  placeholder="8"
                  className="bg-slate-800 border-slate-600 w-24"
                />
                <Input
                  {...register('target_unit')}
                  placeholder="vasos, min, km..."
                  className="bg-slate-800 border-slate-600 flex-1"
                />
              </div>
            </div>
          </div>

          <div className="px-4 pb-8">
            <Button
              type="submit"
              variant="tasks"
              className="w-full h-12 text-base font-semibold"
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : editHabit ? 'Guardar cambios' : 'Crear hábito'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
