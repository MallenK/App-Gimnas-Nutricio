import { useState, useEffect } from 'react'
import { Target, Save } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useUserGoals, useUpsertUserGoals } from '@/hooks/nutrition/useUserGoals'
import { cn } from '@/lib/utils'

export function GoalsSettingsPage() {
  const { data: goals, isLoading } = useUserGoals()
  const upsertMutation = useUpsertUserGoals()
  const isUpserting = upsertMutation.isPending

  const [targetWeight, setTargetWeight] = useState('')
  const [currentWeight, setCurrentWeight] = useState('')
  const [dailyCalories, setDailyCalories] = useState('')
  const [proteinPct, setProteinPct] = useState('30')
  const [carbsPct, setCarbsPct] = useState('45')
  const [fatPct, setFatPct] = useState('25')
  const [weeklyWorkouts, setWeeklyWorkouts] = useState('4')
  const [dailySteps, setDailySteps] = useState('8000')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!goals) return
    setTargetWeight(goals.target_weight_kg != null ? String(goals.target_weight_kg) : '')
    setCurrentWeight(goals.current_weight_kg != null ? String(goals.current_weight_kg) : '')
    setDailyCalories(goals.daily_calories != null ? String(goals.daily_calories) : '')
    setProteinPct(goals.protein_pct != null ? String(goals.protein_pct) : '30')
    setCarbsPct(goals.carbs_pct != null ? String(goals.carbs_pct) : '45')
    setFatPct(goals.fat_pct != null ? String(goals.fat_pct) : '25')
    setWeeklyWorkouts(goals.weekly_workouts_target != null ? String(goals.weekly_workouts_target) : '4')
    setDailySteps(goals.daily_steps_target != null ? String(goals.daily_steps_target) : '8000')
  }, [goals])

  const macroSum = (parseInt(proteinPct) || 0) + (parseInt(carbsPct) || 0) + (parseInt(fatPct) || 0)
  const macroOk = macroSum === 100

  async function handleSave() {
    await upsertMutation.mutateAsync({
      target_weight_kg: targetWeight ? parseFloat(targetWeight) : null,
      current_weight_kg: currentWeight ? parseFloat(currentWeight) : null,
      daily_calories: dailyCalories ? parseInt(dailyCalories) : null,
      protein_pct: parseInt(proteinPct) || null,
      carbs_pct: parseInt(carbsPct) || null,
      fat_pct: parseInt(fatPct) || null,
      weekly_workouts_target: parseInt(weeklyWorkouts) || undefined,
      daily_steps_target: parseInt(dailySteps) || undefined,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-slate-800/40 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="pb-24 animate-fade-in">
      <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <h1 className="font-bold text-base">Objetivos personales</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={isUpserting || !macroOk}
          className="flex items-center gap-1.5 text-xs text-primary font-medium px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          {saved ? '¡Guardado!' : 'Guardar'}
        </button>
      </div>

      <div className="px-4 pt-4 space-y-6">
        {/* Body */}
        <Section title="Cuerpo">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Peso actual (kg)" value={currentWeight} onChange={setCurrentWeight} placeholder="70.0" />
            <Field label="Peso objetivo (kg)" value={targetWeight} onChange={setTargetWeight} placeholder="68.0" />
          </div>
        </Section>

        {/* Nutrition */}
        <Section title="Nutrición">
          <Field label="Calorías diarias" value={dailyCalories} onChange={setDailyCalories} placeholder="2200" />

          <div className="space-y-2 mt-3">
            <div className="flex justify-between items-center">
              <p className="text-xs text-slate-400">Distribución de macros (%)</p>
              <span className={cn('text-xs font-medium', macroOk ? 'text-emerald-400' : 'text-amber-400')}>
                {macroSum}/100
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Proteínas', value: proteinPct, set: setProteinPct, color: 'text-blue-400' },
                { label: 'Carbos', value: carbsPct, set: setCarbsPct, color: 'text-orange-400' },
                { label: 'Grasas', value: fatPct, set: setFatPct, color: 'text-yellow-400' },
              ].map(({ label, value, set, color }) => (
                <div key={label} className="space-y-1">
                  <label className={cn('text-xs font-medium', color)}>{label}</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    className="bg-slate-800 border-slate-600 text-center h-9"
                  />
                </div>
              ))}
            </div>

            {/* Macro bars preview */}
            {macroOk && (
              <div className="h-2 rounded-full overflow-hidden flex mt-1">
                <div className="bg-blue-400 transition-all" style={{ width: `${proteinPct}%` }} />
                <div className="bg-orange-400 transition-all" style={{ width: `${carbsPct}%` }} />
                <div className="bg-yellow-400 transition-all" style={{ width: `${fatPct}%` }} />
              </div>
            )}

            {dailyCalories && macroOk && (
              <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-400">
                <span>{Math.round((parseInt(dailyCalories) * parseInt(proteinPct)) / 100 / 4)}g prot.</span>
                <span>{Math.round((parseInt(dailyCalories) * parseInt(carbsPct)) / 100 / 4)}g carbs</span>
                <span>{Math.round((parseInt(dailyCalories) * parseInt(fatPct)) / 100 / 9)}g grasas</span>
              </div>
            )}
          </div>
        </Section>

        {/* Activity */}
        <Section title="Actividad">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Entrenos / semana" value={weeklyWorkouts} onChange={setWeeklyWorkouts} placeholder="4" />
            <Field label="Pasos / día" value={dailySteps} onChange={setDailySteps} placeholder="8000" />
          </div>
        </Section>

        <Button
          onClick={handleSave}
          disabled={isUpserting || !macroOk}
          className="w-full"
        >
          {isUpserting ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar cambios'}
        </Button>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{title}</p>
      <div className="rounded-2xl bg-slate-800/40 border border-slate-700/30 p-4 space-y-3">
        {children}
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-slate-400">{label}</label>
      <Input
        type="number"
        step="any"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-700 border-slate-600 h-9"
      />
    </div>
  )
}
