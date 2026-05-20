import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Pencil,
  Check,
  X,
  ImagePlus,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ExercisePickerSheet } from '@/components/fitness/ExercisePickerSheet'
import {
  useRoutines,
  useRoutine,
  useCreateRoutine,
  useDeleteRoutine,
  useCreateRoutineDay,
  useUpdateRoutineDay,
  useDeleteRoutineDay,
  useAddExerciseToDay,
  useUpdateRoutineExercise,
  useRemoveExerciseFromDay,
  useReorderRoutineDays,
  useReorderRoutineExercises,
} from '@/hooks/fitness/useRoutines'
import { MUSCLE_GROUPS } from '@/lib/constants'
import { ExerciseImagePicker } from '@/components/fitness/ExerciseImagePicker'
import type { RoutineDay, RoutineExercise, Exercise } from '@/types/fitness'

// ─── List view ────────────────────────────────────────────────────────────────

function RoutineListView() {
  const navigate = useNavigate()
  const { data: routines = [], isLoading } = useRoutines()
  const createRoutine = useCreateRoutine()
  const deleteRoutine = useDeleteRoutine()
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  async function handleCreate() {
    if (!newName.trim()) return
    const r = await createRoutine.mutateAsync(newName.trim())
    setNewName('')
    setCreating(false)
    navigate(`/fitness/routines/${r.id}`)
  }

  return (
    <div className="pb-28 animate-fade-in">
      <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold text-base">Mis rutinas</h1>
        <button
          onClick={() => setCreating(true)}
          className="w-8 h-8 rounded-full bg-fitness/20 text-fitness flex items-center justify-center"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {creating && (
          <div className="rounded-2xl bg-slate-800/60 border border-slate-700/40 p-4 space-y-3">
            <p className="text-sm font-medium text-slate-300">Nueva rutina</p>
            <Input
              autoFocus
              placeholder="Ej. PPL, Full Body, Push/Pull..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false) }}
              className="bg-slate-700 border-slate-600"
            />
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={!newName.trim()} size="sm" className="bg-fitness hover:bg-fitness/90 flex-1">
                Crear
              </Button>
              <Button onClick={() => setCreating(false)} variant="ghost" size="sm">
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-slate-800/40 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && routines.length === 0 && !creating && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="text-5xl">🏋️</div>
            <div>
              <p className="font-semibold text-lg mb-1">Sin rutinas</p>
              <p className="text-slate-400 text-sm">Crea tu primera rutina de entrenamiento</p>
            </div>
            <Button onClick={() => setCreating(true)} className="bg-fitness hover:bg-fitness/90">
              <Plus className="w-4 h-4 mr-2" />
              Nueva rutina
            </Button>
          </div>
        )}

        {routines.map((r) => (
          <div
            key={r.id}
            className="rounded-2xl bg-slate-800/50 border border-slate-700/30 overflow-hidden"
          >
            <button
              onClick={() => navigate(`/fitness/routines/${r.id}`)}
              className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-slate-700/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-fitness/15 flex items-center justify-center shrink-0">
                <span className="text-lg">🏋️</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{r.name}</p>
                {r.description && <p className="text-xs text-slate-400 truncate">{r.description}</p>}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
            </button>
            <div className="border-t border-slate-700/30 px-4 py-2 flex justify-end">
              <button
                onClick={() => deleteRoutine.mutate(r.id)}
                className="p-1.5 rounded text-slate-600 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Sortable exercise row ─────────────────────────────────────────────────────

function SortableExerciseRow({
  ex,
  routineId,
}: {
  ex: RoutineExercise
  routineId: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: ex.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const updateEx = useUpdateRoutineExercise(routineId)
  const removeEx = useRemoveExerciseFromDay(routineId)
  const [editing, setEditing] = useState(false)
  const [imgPickerOpen, setImgPickerOpen] = useState(false)
  const [sets, setSets] = useState(String(ex.sets))
  const [repsMin, setRepsMin] = useState(String(ex.reps_min ?? ''))
  const [repsMax, setRepsMax] = useState(String(ex.reps_max ?? ''))
  const [rest, setRest] = useState(String(ex.rest_seconds ?? ''))

  async function save() {
    await updateEx.mutateAsync({
      id: ex.id,
      patch: {
        sets: parseInt(sets) || ex.sets,
        reps_min: repsMin ? parseInt(repsMin) : null,
        reps_max: repsMax ? parseInt(repsMax) : null,
        rest_seconds: rest ? parseInt(rest) : null,
      },
    })
    setEditing(false)
  }

  const muscleLabel = MUSCLE_GROUPS.find((m) => m.value === ex.exercise?.muscle_group)?.label

  return (
    <div ref={setNodeRef} style={style} className="border-t border-slate-700/30 first:border-0">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button {...attributes} {...listeners} className="touch-none p-1 text-slate-600 cursor-grab active:cursor-grabbing">
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        {ex.exercise?.image_url ? (
          <img
            src={ex.exercise.image_url}
            alt={ex.exercise.name}
            className="w-8 h-8 rounded-lg object-cover shrink-0 bg-slate-700"
          />
        ) : (
          <button
            onClick={() => setImgPickerOpen(true)}
            className="w-8 h-8 rounded-lg bg-slate-700/60 flex items-center justify-center shrink-0 text-slate-500 hover:text-fitness hover:bg-slate-700 transition-colors"
            title="Añadir imagen"
          >
            <ImagePlus className="w-3.5 h-3.5" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{ex.exercise?.name ?? '—'}</p>
          <p className="text-xs text-slate-500">
            {muscleLabel}
            {!editing && (
              <span className="ml-2 text-slate-400">
                {ex.sets}×{ex.reps_min ?? '?'}{ex.reps_max ? `–${ex.reps_max}` : ''} · {ex.rest_seconds ?? 90}s descanso
              </span>
            )}
          </p>
        </div>
        {editing ? (
          <div className="flex items-center gap-1">
            <button onClick={save} className="p-1 text-emerald-400"><Check className="w-3.5 h-3.5" /></button>
            <button onClick={() => setEditing(false)} className="p-1 text-slate-500"><X className="w-3.5 h-3.5" /></button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            {ex.exercise?.image_url && (
              <button onClick={() => setImgPickerOpen(true)} className="p-1.5 text-slate-500 hover:text-fitness">
                <ImagePlus className="w-3 h-3" />
              </button>
            )}
            <button onClick={() => setEditing(true)} className="p-1.5 text-slate-500 hover:text-fitness">
              <Pencil className="w-3 h-3" />
            </button>
            <button
              onClick={() => removeEx.mutate(ex.id)}
              className="p-1.5 text-slate-600 hover:text-red-400"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {ex.exercise && (
        <ExerciseImagePicker
          open={imgPickerOpen}
          exerciseId={ex.exercise.id}
          exerciseName={ex.exercise.name}
          onClose={() => setImgPickerOpen(false)}
        />
      )}

      {editing && (
        <div className="px-8 pb-3 grid grid-cols-4 gap-2">
          {[
            { label: 'Series', value: sets, set: setSets },
            { label: 'Reps mín', value: repsMin, set: setRepsMin },
            { label: 'Reps máx', value: repsMax, set: setRepsMax },
            { label: 'Descanso', value: rest, set: setRest },
          ].map(({ label, value, set }) => (
            <div key={label} className="space-y-0.5">
              <label className="text-xs text-slate-500">{label}</label>
              <Input
                type="number"
                value={value}
                onChange={(e) => set(e.target.value)}
                className="h-7 text-xs bg-slate-700 border-slate-600 text-center px-1"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Sortable day card ─────────────────────────────────────────────────────────

function SortableDayCard({
  day,
  routineId,
}: {
  day: RoutineDay
  routineId: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: day.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const [expanded, setExpanded] = useState(true)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState(day.name)

  const addEx = useAddExerciseToDay(routineId)
  const updateDay = useUpdateRoutineDay(routineId)
  const deleteDay = useDeleteRoutineDay(routineId)
  const reorderEx = useReorderRoutineExercises(routineId)

  const exercises = day.exercises ?? []

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleExDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = exercises.findIndex((e) => e.id === active.id)
    const newIdx = exercises.findIndex((e) => e.id === over.id)
    const reordered = arrayMove(exercises, oldIdx, newIdx)
    reorderEx.mutate(reordered.map((e, i) => ({ id: e.id, sort_order: i })))
  }

  async function handleSelect(exercise: Exercise) {
    await addEx.mutateAsync({
      routineDayId: day.id,
      exerciseId: exercise.id,
      sortOrder: exercises.length,
    })
  }

  async function saveName() {
    if (nameVal.trim() && nameVal !== day.name) {
      await updateDay.mutateAsync({ id: day.id, patch: { name: nameVal.trim() } })
    }
    setEditingName(false)
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div className="rounded-2xl bg-slate-800/50 border border-slate-700/30 overflow-hidden">
        {/* Day header */}
        <div className="flex items-center gap-2 px-3 py-3">
          <button
            {...attributes}
            {...listeners}
            className="touch-none p-1 text-slate-600 cursor-grab active:cursor-grabbing shrink-0"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {editingName ? (
            <Input
              autoFocus
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setNameVal(day.name); setEditingName(false) } }}
              onBlur={saveName}
              className="h-7 text-sm bg-slate-700 border-slate-600 flex-1"
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="flex-1 text-left font-semibold text-sm text-fitness hover:text-fitness/80 transition-colors"
            >
              {day.name}
            </button>
          )}

          <span className="text-xs text-slate-500 shrink-0">{exercises.length} ejerc.</span>

          <button
            onClick={() => deleteDay.mutate(day.id)}
            className="p-1.5 text-slate-600 hover:text-red-400 transition-colors shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-slate-500 shrink-0"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Exercises */}
        {expanded && (
          <>
            {exercises.length > 0 && (
              <div className="border-t border-slate-700/30">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleExDragEnd}
                >
                  <SortableContext items={exercises.map((e) => e.id)} strategy={verticalListSortingStrategy}>
                    {exercises.map((ex) => (
                      <SortableExerciseRow
                        key={ex.id}
                        ex={ex}
                        routineId={routineId}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}

            <div className="border-t border-slate-700/30 px-3 py-2">
              <button
                onClick={() => setPickerOpen(true)}
                className="flex items-center gap-2 text-xs text-slate-400 hover:text-fitness transition-colors py-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir ejercicio
              </button>
            </div>
          </>
        )}
      </div>

      <ExercisePickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelect}
      />
    </div>
  )
}

// ─── Editor view ───────────────────────────────────────────────────────────────

function RoutineEditorView({ routineId }: { routineId: string }) {
  const navigate = useNavigate()
  const { data: routine, isLoading } = useRoutine(routineId)
  const createDay = useCreateRoutineDay(routineId)
  const reorderDays = useReorderRoutineDays(routineId)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const days = routine?.days ?? []

  function handleDayDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = days.findIndex((d) => d.id === active.id)
    const newIdx = days.findIndex((d) => d.id === over.id)
    const reordered = arrayMove(days, oldIdx, newIdx)
    reorderDays.mutate(reordered.map((d, i) => ({ id: d.id, sort_order: i })))
  }

  async function addDay() {
    const names = ['Día A', 'Día B', 'Día C', 'Día D', 'Día E', 'Día F', 'Día G']
    const name = names[days.length] ?? `Día ${days.length + 1}`
    await createDay.mutateAsync({ name, sortOrder: days.length })
  }

  if (isLoading) {
    return (
      <div className="px-4 pt-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-800/40 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!routine) return null

  return (
    <div className="pb-28 animate-fade-in">
      <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/fitness/routines')}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-400"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-base flex-1 truncate">{routine.name}</h1>
        <button
          onClick={addDay}
          className="flex items-center gap-1.5 text-xs text-fitness font-medium px-3 py-1.5 rounded-full bg-fitness/10 hover:bg-fitness/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Añadir día
        </button>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {days.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <div className="text-4xl">📅</div>
            <p className="font-semibold">Sin días aún</p>
            <p className="text-slate-400 text-sm">Añade días para organizar los ejercicios</p>
            <Button onClick={addDay} size="sm" className="bg-fitness hover:bg-fitness/90">
              <Plus className="w-4 h-4 mr-1" />
              Añadir primer día
            </Button>
          </div>
        )}

        {days.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDayDragEnd}
          >
            <SortableContext items={days.map((d) => d.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {days.map((day) => (
                  <SortableDayCard key={day.id} day={day} routineId={routineId} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export function RoutinePlannerPage() {
  const { id } = useParams<{ id: string }>()
  return id ? <RoutineEditorView routineId={id} /> : <RoutineListView />
}
