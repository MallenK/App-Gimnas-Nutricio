import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { useWgerSearchInput, useAssignExerciseImage } from '@/hooks/fitness/useExerciseImages'

interface ExerciseImagePickerProps {
  open: boolean
  exerciseId: string
  exerciseName: string
  onClose: () => void
  onAssigned?: () => void
}

export function ExerciseImagePicker({
  open,
  exerciseId,
  exerciseName,
  onClose,
  onAssigned,
}: ExerciseImagePickerProps) {
  const { input, setInput, data: suggestions = [], isFetching } = useWgerSearchInput()
  const assignImage = useAssignExerciseImage()

  // Seed input with exercise name on open
  const handleOpen = () => {
    if (!input) setInput(exerciseName)
  }

  async function handleSelect(imageUrl: string) {
    await assignImage.mutateAsync({ exerciseId, imageUrl })
    onAssigned?.()
    onClose()
  }

  const results = suggestions.filter((s) => s.data.image != null)

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (v) handleOpen()
        else onClose()
      }}
    >
      <SheetContent side="bottom" className="max-h-[85dvh] bg-slate-900 border-slate-700 p-0 gap-0 flex flex-col">
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-slate-700/50">
          <SheetTitle className="text-base">Buscar imagen — {exerciseName}</SheetTitle>
        </SheetHeader>

        <div className="px-4 py-3 border-b border-slate-700/30">
          <div className="relative">
            <Input
              autoFocus
              placeholder="Buscar en wger.de..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="bg-slate-800 border-slate-600 pr-8"
            />
            {isFetching && (
              <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {results.length === 0 && !isFetching && input.length > 2 && (
            <p className="text-center text-slate-500 text-sm py-10">Sin imágenes para "{input}"</p>
          )}
          {results.length === 0 && input.length <= 2 && (
            <p className="text-center text-slate-500 text-sm py-10">Escribe el nombre del ejercicio</p>
          )}
          <div className="grid grid-cols-2 gap-3 p-4">
            {results.map((s) => (
              <button
                key={s.data.id}
                onClick={() => handleSelect(s.data.image!)}
                disabled={assignImage.isPending}
                className="rounded-xl overflow-hidden bg-slate-800 border border-slate-700/40 hover:border-fitness/50 transition-colors group"
              >
                <div className="aspect-square overflow-hidden bg-slate-700">
                  <img
                    src={s.data.image_thumbnail ?? s.data.image!}
                    alt={s.data.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                </div>
                <p className="text-xs text-slate-300 p-2 text-left truncate">{s.data.name}</p>
              </button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
