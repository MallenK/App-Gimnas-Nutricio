import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { addDays, addMonths, format } from 'date-fns'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GOAL_CATEGORIES, GOAL_PERIODS } from '@/lib/constants'
import { todayISO } from '@/lib/utils'
import type { Goal } from '@/types/tasks'

const schema = z.object({
  title: z.string().min(1, 'Título requerido').max(80),
  description: z.string().max(200).nullable(),
  category: z.enum(['nutrition', 'fitness', 'body', 'habit', 'other']),
  period_type: z.enum(['weekly', 'monthly', 'custom']),
  start_date: z.string(),
  end_date: z.string(),
  target_value: z.string().nullable(),
  target_unit: z.string().nullable(),
  current_value: z.string().nullable(),
})

type FormValues = z.infer<typeof schema>

interface AddGoalSheetProps {
  open: boolean
  editGoal?: Goal | null
  onClose: () => void
  onSave: (data: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => void
  isSaving?: boolean
}

export function AddGoalSheet({ open, editGoal, onClose, onSave, isSaving }: AddGoalSheetProps) {
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: null,
      category: 'habit',
      period_type: 'weekly',
      start_date: todayISO(),
      end_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      target_value: null,
      target_unit: null,
      current_value: '0',
    },
  })

  const periodType = watch('period_type')

  useEffect(() => {
    if (open) {
      if (editGoal) {
        reset({
          title: editGoal.title,
          description: editGoal.description,
          category: editGoal.category,
          period_type: editGoal.period_type,
          start_date: editGoal.start_date,
          end_date: editGoal.end_date,
          target_value: editGoal.target_value ? String(editGoal.target_value) : null,
          target_unit: editGoal.target_unit,
          current_value: editGoal.current_value ? String(editGoal.current_value) : '0',
        })
      } else {
        reset({
          title: '',
          description: null,
          category: 'habit',
          period_type: 'weekly',
          start_date: todayISO(),
          end_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
          target_value: null,
          target_unit: null,
          current_value: '0',
        })
      }
    }
  }, [open, editGoal, reset])

  function onPeriodChange(val: string) {
    setValue('period_type', val as Goal['period_type'])
    if (val === 'weekly') {
      setValue('end_date', format(addDays(new Date(), 7), 'yyyy-MM-dd'))
    } else if (val === 'monthly') {
      setValue('end_date', format(addMonths(new Date(), 1), 'yyyy-MM-dd'))
    }
  }

  function onSubmit(values: FormValues) {
    onSave({
      title: values.title,
      description: values.description || null,
      category: values.category,
      period_type: values.period_type,
      start_date: values.start_date,
      end_date: values.end_date,
      target_value: values.target_value ? parseFloat(values.target_value) : null,
      target_unit: values.target_unit || null,
      current_value: values.current_value ? parseFloat(values.current_value) : 0,
      status: 'active',
    })
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[92dvh] flex flex-col p-0 gap-0 bg-slate-900 border-slate-700">
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-slate-700/50">
          <SheetTitle className="text-base">
            {editGoal ? 'Editar objetivo' : 'Nuevo objetivo'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label>Título</Label>
              <Input
                {...register('title')}
                placeholder="Correr 3 veces esta semana..."
                className="bg-slate-800 border-slate-600"
                autoFocus
              />
              {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label>Descripción (opcional)</Label>
              <Textarea
                {...register('description')}
                placeholder="Detalles del objetivo..."
                className="bg-slate-800 border-slate-600 min-h-[60px]"
              />
            </div>

            {/* Category + Period */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Categoría</Label>
                <Select
                  value={watch('category')}
                  onValueChange={(v) => setValue('category', v as Goal['category'])}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Período</Label>
                <Select value={periodType} onValueChange={onPeriodChange}>
                  <SelectTrigger className="bg-slate-800 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_PERIODS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Inicio</Label>
                <Input
                  {...register('start_date')}
                  type="date"
                  className="bg-slate-800 border-slate-600"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Fin</Label>
                <Input
                  {...register('end_date')}
                  type="date"
                  className="bg-slate-800 border-slate-600"
                />
              </div>
            </div>

            {/* Target */}
            <div className="space-y-1.5">
              <Label>Meta (opcional)</Label>
              <div className="flex gap-2">
                <Input
                  {...register('target_value')}
                  type="number"
                  placeholder="10"
                  className="bg-slate-800 border-slate-600 w-24"
                />
                <Input
                  {...register('target_unit')}
                  placeholder="km, sesiones, kg..."
                  className="bg-slate-800 border-slate-600 flex-1"
                />
              </div>
            </div>

            {/* Starting value */}
            <div className="space-y-1.5">
              <Label>Progreso inicial</Label>
              <Input
                {...register('current_value')}
                type="number"
                placeholder="0"
                className="bg-slate-800 border-slate-600 w-24"
              />
            </div>
          </div>

          <div className="px-4 pb-8">
            <Button
              type="submit"
              variant="tasks"
              className="w-full h-12 text-base font-semibold"
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : editGoal ? 'Guardar cambios' : 'Crear objetivo'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
