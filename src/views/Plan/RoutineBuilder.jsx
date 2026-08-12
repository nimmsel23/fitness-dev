import { useEffect, useState } from "react";
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
import ExercisePhotoStrip from "../../components/ExercisePhotoStrip.jsx";

function ensureTemplateSets(ex) {
  if (Array.isArray(ex.templateSets) && ex.templateSets.length > 0) return ex.templateSets;
  return Array.from({ length: Math.max(1, Number(ex.target_sets) || 3) }, (_, index) => ({
    setIndex: index + 1,
    setType: ex.drop_set ? "drop" : "normal",
    targetReps: ex.target_reps ?? "8-12",
    targetWeight: ex.target_weight ?? null,
    targetDistance: ex.targetDistance ?? null,
    targetDuration: ex.targetDuration ?? null,
    progressionStage: ex.progressionStage ?? null,
  }));
}

function patchTemplateSets(ex, recipe) {
  const nextTemplateSets = recipe(ensureTemplateSets(ex)).map((set, index) => ({
    ...set,
    setIndex: set.setIndex ?? index + 1,
  }));
  return {
    ...ex,
    templateSets: nextTemplateSets,
    target_sets: nextTemplateSets.length,
    target_reps: nextTemplateSets[0]?.targetReps ?? "8-12",
    target_weight: nextTemplateSets[0]?.targetWeight ?? null,
    drop_set: nextTemplateSets.some((set) => set.setType === "drop"),
    effort: nextTemplateSets.some((set) => set.setType === "failure") ? "to_failure" : "normal",
  };
}

// ── Sortable Exercise Row ─────────────────────────────────

function ExerciseRow({ ex, onPatch, onDelete }) {
  const [open, setOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ex.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const templateSets = ensureTemplateSets(ex);
  const leadSet = templateSets[0] || {};

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl bg-fit-card border border-fit-line overflow-hidden">
      <ExercisePhotoStrip ex={ex} className="h-32 m-2 mb-0" />
      <div className="flex items-center gap-2 px-3 py-3">
        <button {...attributes} {...listeners} className="text-fit-muted hover:text-fit-ink cursor-grab active:cursor-grabbing p-1">
          <GripVertical size={16} />
        </button>
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
          {templateSets.some((set) => set.setType === "failure") && <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 font-medium">Failure</span>}
          {templateSets.some((set) => set.setType === "drop") ? <span className="text-xs px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400 font-medium">Drop</span> : null}
          <span className="font-mono text-xs text-fit-muted">
            {templateSets.length}×{(ex.trackingType || "weight_reps") === "duration" ? (leadSet.targetDuration ?? "10s") : (leadSet.targetReps ?? "8-12")}
          </span>
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
            <span className="text-xs text-fit-muted font-medium">Ziel-Sätze</span>
            <input type="number" min="1" value={templateSets.length}
              onChange={(e) => onPatch("templateSets", Array.from({ length: Math.max(1, Number(e.target.value) || 1) }, (_, index) => ({
                ...(templateSets[index] || leadSet || {}),
                setIndex: index + 1,
                setType: templateSets[index]?.setType || leadSet.setType || "normal",
                targetReps: templateSets[index]?.targetReps ?? leadSet.targetReps ?? "8-12",
                targetWeight: templateSets[index]?.targetWeight ?? leadSet.targetWeight ?? null,
                targetDistance: templateSets[index]?.targetDistance ?? leadSet.targetDistance ?? null,
                targetDuration: templateSets[index]?.targetDuration ?? leadSet.targetDuration ?? null,
                progressionStage: templateSets[index]?.progressionStage ?? leadSet.progressionStage ?? ex.progressionStage ?? null,
              })))}
              className="px-3 py-2 rounded-lg bg-fit-bg2 border border-fit-line text-fit-ink text-sm font-mono focus:outline-none focus:border-fit-accent" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-fit-muted font-medium">{(ex.trackingType || "weight_reps") === "duration" ? "Ziel-Sekunden" : "Ziel-Wdh"}</span>
            <input value={(ex.trackingType || "weight_reps") === "duration" ? (leadSet.targetDuration ?? "") : (leadSet.targetReps ?? "")}
              onChange={(e) => onPatch("templateSets", templateSets.map((set) => (
                (ex.trackingType || "weight_reps") === "duration"
                  ? { ...set, targetDuration: e.target.value === "" ? null : Number(e.target.value) }
                  : { ...set, targetReps: e.target.value }
              )))}
              className="px-3 py-2 rounded-lg bg-fit-bg2 border border-fit-line text-fit-ink text-sm font-mono focus:outline-none focus:border-fit-accent"
              placeholder={(ex.trackingType || "weight_reps") === "duration" ? "10" : "8-12 / AMRAP"} />
          </label>
          {(ex.trackingType || "weight_reps") === "weight_reps" && (
            <label className="flex flex-col gap-1">
              <span className="text-xs text-fit-muted font-medium">Ziel-Gewicht</span>
              <input type="number" min="0" value={leadSet.targetWeight ?? ""}
                onChange={(e) => onPatch("templateSets", templateSets.map((set) => ({ ...set, targetWeight: e.target.value === "" ? null : Number(e.target.value) })))}
                className="px-3 py-2 rounded-lg bg-fit-bg2 border border-fit-line text-fit-ink text-sm font-mono focus:outline-none focus:border-fit-accent"
                placeholder="60" />
            </label>
          )}
          <label className="flex flex-col gap-1">
            <span className="text-xs text-fit-muted font-medium">Pause (s)</span>
            <input type="number" min="0" value={ex.rest_seconds}
              onChange={(e) => onPatch("rest_seconds", Number(e.target.value))}
              className="px-3 py-2 rounded-lg bg-fit-bg2 border border-fit-line text-fit-ink text-sm font-mono focus:outline-none focus:border-fit-accent" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-fit-muted font-medium">Tracking</span>
            <select value={ex.trackingType || "weight_reps"}
              onChange={(e) => onPatch("trackingType", e.target.value)}
              className="px-3 py-2 rounded-lg bg-fit-bg2 border border-fit-line text-fit-ink text-sm focus:outline-none focus:border-fit-accent">
              <option value="weight_reps">Gewicht + Wdh</option>
              <option value="bodyweight_reps">Bodyweight + Wdh</option>
              <option value="duration">Dauer</option>
              <option value="distance_time">Distanz + Zeit</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-fit-muted font-medium">Satz-Typ</span>
            <select value={leadSet.setType || "normal"}
              onChange={(e) => onPatch("templateSets", templateSets.map((set) => ({ ...set, setType: e.target.value })))}
              className="px-3 py-2 rounded-lg bg-fit-bg2 border border-fit-line text-fit-ink text-sm focus:outline-none focus:border-fit-accent">
              <option value="normal">Normal</option>
              <option value="warmup">Warm-up</option>
              <option value="drop">Drop</option>
              <option value="failure">Failure</option>
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
          <label className="flex flex-col gap-1">
            <span className="text-xs text-fit-muted font-medium">Progression Stage</span>
            <input value={leadSet.progressionStage ?? ex.progressionStage ?? ""}
              onChange={(e) => onPatch("templateSets", templateSets.map((set) => ({ ...set, progressionStage: e.target.value || null })))}
              className="px-3 py-2 rounded-lg bg-fit-bg2 border border-fit-line text-fit-ink text-sm focus:outline-none focus:border-fit-accent"
              placeholder="tuck / adv_tuck / full" />
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

// ── Routine Builder ────────────────────────────────────────

export default function RoutineBuilder({ routineId, onBack }) {
  const [routine, setRoutine] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState({});

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  async function load() {
    const d = await api.get(`/routines/${routineId}`);
    setRoutine(d.routine);
    setExercises(d.routine.exercises);
  }

  useEffect(() => { load(); }, [routineId]);

  async function addExercise(ex) {
    await api.post(`/routines/${routineId}/exercises`, {
      exercise_id: ex.id,
      name: ex.name,
      primaryMuscles: ex.primaryMuscles,
      secondaryMuscles: ex.secondaryMuscles,
      yuhonas_id: ex.yuhonas_id,
      trackingType: ex.trackingType || "weight_reps",
    });
    load();
  }

  async function removeExercise(rowId) {
    await api.delete(`/routines/${routineId}/exercises/${rowId}`);
    load();
  }

  function patchLocal(rowId, key, val) {
    setExercises((prev) => prev.map((e) => {
      if (e.id !== rowId) return e;
      const next = key === "templateSets"
        ? patchTemplateSets(e, () => val)
        : { ...e, [key]: val };
      return key === "trackingType" ? { ...next, weight_type: val === "bodyweight_reps" ? "bodyweight" : "kg" } : next;
    }));
    setDirty((d) => {
      const currentExercise = exercises.find((e) => e.id === rowId);
      const nextExercise = currentExercise
        ? (key === "templateSets" ? patchTemplateSets(currentExercise, () => val) : { ...currentExercise, [key]: val })
        : { [key]: val };
      const patch = key === "templateSets"
        ? {
            templateSets: nextExercise.templateSets,
            target_sets: nextExercise.target_sets,
            target_reps: nextExercise.target_reps,
            target_weight: nextExercise.target_weight,
            drop_set: nextExercise.drop_set,
            effort: nextExercise.effort,
          }
        : { [key]: val };
      return { ...d, [rowId]: { ...(d[rowId] ?? {}), ...patch } };
    });
  }

  async function savePatches() {
    setSaving(true);
    try {
      await Promise.all(
        Object.entries(dirty).map(([id, patch]) =>
          api.patch(`/routines/${routineId}/exercises/${id}`, patch)
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
    await api.put(`/routines/${routineId}/exercises/order`, {
      order: reordered.map((e, i) => ({ id: e.id, order: i })),
    });
  }

  const hasDirty = Object.keys(dirty).length > 0;
  const excludeIds = exercises.map((e) => e.exercise_id);

  if (!routine) return <div className="flex items-center justify-center h-screen text-fit-muted text-sm">Lädt…</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl text-fit-muted hover:text-fit-ink hover:bg-fit-bg2 transition-all">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold tracking-tight truncate">{routine.name}</h1>
          {routine.goal && <p className="text-sm text-fit-muted">{routine.goal}</p>}
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
