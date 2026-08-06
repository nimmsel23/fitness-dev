import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, GripVertical, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { api } from "./api.js";
import ExerciseSearch from "./components/ExerciseSearch.jsx";
import MuscleHeatmap from "./components/MuscleHeatmap.jsx";
import { muskelDe, muskelColor } from "./muscles.js";
import { yuhonasImageUrl } from "../../lib/yuhonasImage.js";

// ── Sortable Exercise Row ─────────────────────────────────

function ExerciseRow({ ex, onPatch, onDelete }) {
  const [open, setOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ex.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl bg-fit-card border border-fit-line overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-3">
        <button {...attributes} {...listeners} className="text-fit-muted hover:text-fit-ink cursor-grab active:cursor-grabbing p-1">
          <GripVertical size={16} />
        </button>
        {yuhonasImageUrl(ex) && (
          <img
            src={yuhonasImageUrl(ex)}
            alt=""
            loading="lazy"
            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-fit-card"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-fit-ink truncate">{ex.name}</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {ex.primaryMuscles?.slice(0, 3).map((m) => (
              <span key={m} className="text-xs px-1.5 py-0.5 rounded font-medium"
                style={{ background: muskelColor(m) + "22", color: muskelColor(m) }}>
                {muskelDe(m)}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {ex.effort === "to_failure" && <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 font-medium">Failure</span>}
          {ex.drop_set ? <span className="text-xs px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400 font-medium">Drop</span> : null}
          <span className="font-mono text-xs text-fit-muted">{ex.sets}×{ex.reps}</span>
          <button onClick={() => setOpen((v) => !v)} className="p-1.5 rounded-lg text-fit-muted hover:text-fit-ink transition-colors">
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg text-fit-muted hover:text-fit-red hover:bg-red-500/10 transition-all">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-fit-line/50 grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-fit-muted font-medium">Sätze</span>
            <input type="number" min="1" value={ex.sets}
              onChange={(e) => onPatch("sets", Number(e.target.value))}
              className="px-3 py-2 rounded-lg bg-fit-bg2 border border-fit-line text-fit-ink text-sm font-mono focus:outline-none focus:border-fit-accent" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-fit-muted font-medium">Wdh</span>
            <input value={ex.reps}
              onChange={(e) => onPatch("reps", e.target.value)}
              className="px-3 py-2 rounded-lg bg-fit-bg2 border border-fit-line text-fit-ink text-sm font-mono focus:outline-none focus:border-fit-accent"
              placeholder="8-12 / AMRAP" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-fit-muted font-medium">Pause (s)</span>
            <input type="number" min="0" value={ex.rest_seconds}
              onChange={(e) => onPatch("rest_seconds", Number(e.target.value))}
              className="px-3 py-2 rounded-lg bg-fit-bg2 border border-fit-line text-fit-ink text-sm font-mono focus:outline-none focus:border-fit-accent" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-fit-muted font-medium">Gewicht</span>
            <select value={ex.weight_type}
              onChange={(e) => onPatch("weight_type", e.target.value)}
              className="px-3 py-2 rounded-lg bg-fit-bg2 border border-fit-line text-fit-ink text-sm focus:outline-none focus:border-fit-accent">
              <option>kg</option>
              <option>%1RM</option>
              <option>bodyweight</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-fit-muted font-medium">Effort</span>
            <select value={ex.effort ?? "normal"}
              onChange={(e) => onPatch("effort", e.target.value)}
              className="px-3 py-2 rounded-lg bg-fit-bg2 border border-fit-line text-fit-ink text-sm focus:outline-none focus:border-fit-accent">
              <option value="normal">Normal</option>
              <option value="to_failure">To Failure</option>
              <option value="absolute_failure">Absolute Failure</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-fit-muted font-medium">RIR</span>
            <input type="number" min="0" max="5" value={ex.rir ?? ""}
              onChange={(e) => onPatch("rir", e.target.value === "" ? null : Number(e.target.value))}
              className="px-3 py-2 rounded-lg bg-fit-bg2 border border-fit-line text-fit-ink text-sm font-mono focus:outline-none focus:border-fit-accent"
              placeholder="0–5" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-fit-muted font-medium">Tempo</span>
            <input value={ex.tempo ?? ""}
              onChange={(e) => onPatch("tempo", e.target.value)}
              className="px-3 py-2 rounded-lg bg-fit-bg2 border border-fit-line text-fit-ink text-sm font-mono focus:outline-none focus:border-fit-accent"
              placeholder="30X0" />
          </label>
          <label className="flex items-center gap-2 col-span-1 pt-4">
            <input type="checkbox" checked={!!ex.drop_set}
              onChange={(e) => onPatch("drop_set", e.target.checked)}
              className="rounded" />
            <span className="text-sm text-fit-muted">Drop Set</span>
          </label>
          <label className="flex flex-col gap-1 col-span-2">
            <span className="text-xs text-fit-muted font-medium">Notiz</span>
            <input value={ex.notes ?? ""}
              onChange={(e) => onPatch("notes", e.target.value)}
              className="px-3 py-2 rounded-lg bg-fit-bg2 border border-fit-line text-fit-ink text-sm focus:outline-none focus:border-fit-accent"
              placeholder="Technik-Hinweis, Tempo, …" />
          </label>
        </div>
      )}
    </div>
  );
}

// ── Workout Builder ───────────────────────────────────────

export default function WorkoutBuilder({ workoutId, onBack }) {
  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState({});

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  async function load() {
    const d = await api.get(`/workouts/${workoutId}`);
    setWorkout(d.workout);
    setExercises(d.workout.exercises);
  }

  useEffect(() => { load(); }, [workoutId]);

  async function addExercise(ex) {
    await api.post(`/workouts/${workoutId}/exercises`, {
      exercise_id: ex.id,
      name: ex.name,
      primaryMuscles: ex.primaryMuscles,
      secondaryMuscles: ex.secondaryMuscles,
      yuhonas_id: ex.yuhonas_id,
    });
    load();
  }

  async function removeExercise(rowId) {
    await api.delete(`/workouts/${workoutId}/exercises/${rowId}`);
    load();
  }

  function patchLocal(rowId, key, val) {
    setExercises((prev) => prev.map((e) => e.id === rowId ? { ...e, [key]: val } : e));
    setDirty((d) => ({ ...d, [rowId]: { ...(d[rowId] ?? {}), [key]: val } }));
  }

  async function savePatches() {
    setSaving(true);
    try {
      await Promise.all(
        Object.entries(dirty).map(([id, patch]) =>
          api.patch(`/workouts/${workoutId}/exercises/${id}`, patch)
        )
      );
      setDirty({});
    } finally {
      setSaving(false);
    }
  }

  async function onDragEnd({ active, over }) {
    if (!over || active.id === over.id) return;
    const oldIndex = exercises.findIndex((e) => e.id === active.id);
    const newIndex = exercises.findIndex((e) => e.id === over.id);
    const reordered = arrayMove(exercises, oldIndex, newIndex);
    setExercises(reordered);
    await api.put(`/workouts/${workoutId}/exercises/order`, {
      order: reordered.map((e, i) => ({ id: e.id, order: i })),
    });
  }

  const hasDirty = Object.keys(dirty).length > 0;
  const excludeIds = exercises.map((e) => e.exercise_id);

  if (!workout) return <div className="flex items-center justify-center h-screen text-fit-muted text-sm">Lädt…</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl text-fit-muted hover:text-fit-ink hover:bg-fit-bg2 transition-all">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold tracking-tight truncate">{workout.name}</h1>
          {workout.goal && <p className="text-sm text-fit-muted">{workout.goal}</p>}
        </div>
        {hasDirty && (
          <button onClick={savePatches} disabled={saving}
            className="px-4 py-2 rounded-xl bg-fit-accent text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors">
            {saving ? "…" : "Speichern"}
          </button>
        )}
      </div>

      {/* Exercise Search */}
      <div className="mb-5">
        <ExerciseSearch onAdd={addExercise} exclude={excludeIds} />
      </div>

      {/* Exercise List */}
      {exercises.length === 0 ? (
        <div className="text-center py-14 text-fit-muted text-sm">
          Noch keine Übungen. Suche oben nach einer Übung.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={exercises.map((e) => e.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2 mb-6">
              {exercises.map((ex) => (
                <ExerciseRow
                  key={ex.id}
                  ex={ex}
                  onPatch={(key, val) => patchLocal(ex.id, key, val)}
                  onDelete={() => removeExercise(ex.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Muscle Heatmap */}
      {exercises.length > 0 && <MuscleHeatmap exercises={exercises} />}
    </div>
  );
}
