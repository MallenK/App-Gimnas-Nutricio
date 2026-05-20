import { Target } from 'lucide-react'

export function NutritionGoalsPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-8 text-center animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-nutrition">
        <Target className="h-8 w-8 text-white" />
      </div>
      <h2 className="text-xl font-bold">Objetivos Nutricionales</h2>
      <p className="text-muted-foreground text-sm max-w-xs">
        Configura tus objetivos de calorías y macros. Próximamente disponible.
      </p>
    </div>
  )
}
