import { useEffect, useState } from "react";
import { ArrowLeft, Trash2, Check, Plus, Flag } from "lucide-react";
import { api } from "./api.js";
import ExerciseSearch from "./components/ExerciseSearch.jsx";
import { muskelDe, muskelColor } from "./muscles.js";

function SetRow({ set, index, trackingType, onPatch, onDelete }) {
  const isWeight = trackingType === "weight_reps";
  const isBodyweight = trackingType === "bodyweight_reps";
  const isDuration = trackingType === "duration";
  const isDistanceTime = trackingType === "distance_time";

  function toggleCompleted() {
    if (set.completed) {
      onPatch("completed", false);
      return;
    }
    if (isWeight || isBodyweight) {
      if ((set.weight === null || set.weight === "") && set.ghostWeight !== null && set.ghostWeight !== undefined && !isBodyweight) {
        onPatch("weight", set.ghostWeight);
      }
      if ((set.reps === null || set.reps === "") && set.ghostReps !== null && set.ghostReps !== undefined) {
        onPatch("reps", set.ghostReps);
      }
    }
    if (isDuration && (set.duration === null || set.duration === "") && set.ghostDuration !== null && set.ghostDuration !== undefined) {
      onPatch("duration", set.ghostDuration);
    }
    if (isDistanceTime) {
      if ((set.distance === null || set.distance === "") && set.ghostDistance !== null && set.ghostDistance !== undefined) {
        onPatch("distance", set.ghostDistance);
      }
      if ((set.duration === null || set.duration === "") && set.ghostDuration !== null && set.ghostDuration !== undefined) {
        onPatch("duration", set.ghostDuration);
      }
    }
    onPatch("completed", true);
  }

  return (
    <div className={`grid items-center gap-2 px-1 py-1.5 ${
      isDuration
        ? "grid-cols-[1.5rem_1fr_2.25rem_2.25rem]"
        : "grid-cols-[1.5rem_1fr_1fr_2.25rem_2.25rem]"
    }`}>
      <span className="text-xs font-mono text-fit-muted text-center">{index + 1}</span>
      {(isWeight || isDistanceTime) && (
        <input
          type="number"
          inputMode="decimal"
          placeholder={isWeight ? String(set.ghostWeight ?? set.targetWeight ?? "kg") : String(set.ghostDistance ?? set.targetDistance ?? "km")}
          value={isWeight ? (set.weight ?? "") : (set.distance ?? "")}
          onChange={(e) => onPatch(isWeight ? "weight" : "distance", e.target.value === "" ? null : Number(e.target.value))}
          className="px-2 py-1.5 rounded-lg bg-fit-bg2 border border-fit-line text-fit-ink text-sm font-mono text-center focus:outline-none focus:border-fit-accent placeholder:text-fit-muted"
        />
      )}
      {(isWeight || isBodyweight || isDistanceTime) && (
        <input
          type="number"
          inputMode="numeric"
          placeholder={isDistanceTime ? String(set.ghostDuration ?? set.targetDuration ?? "min") : String(set.ghostReps ?? set.targetReps ?? "Wdh")}
          value={isDistanceTime ? (set.duration ?? "") : (set.reps ?? "")}
          onChange={(e) => onPatch(isDistanceTime ? "duration" : "reps", e.target.value === "" ? null : Number(e.target.value))}
          className="px-2 py-1.5 rounded-lg bg-fit-bg2 border border-fit-line text-fit-ink text-sm font-mono text-center focus:outline-none focus:border-fit-accent placeholder:text-fit-muted"
        />
      )}
      {isDuration && (
        <input
          type="number"
          inputMode="numeric"
          placeholder={String(set.ghostDuration ?? set.targetDuration ?? "sek")}
          value={set.duration ?? ""}
          onChange={(e) => onPatch("duration", e.target.value === "" ? null : Number(e.target.value))}
          className="px-2 py-1.5 rounded-lg bg-fit-bg2 border border-fit-line text-fit-ink text-sm font-mono text-center focus:outline-none focus:border-fit-accent placeholder:text-fit-muted"
        />
      )}
      <button
        onClick={toggleCompleted}
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
        style={{ background: set.completed ? "#22c55e33" : "var(--bg2)", color: set.completed ? "#22c55e" : "var(--dim)" }}
      >
        <Check size={16} strokeWidth={3} />
      </button>
      <button onClick={onDelete} className="w-9 h-9 rounded-lg flex items-center justify-center text-fit-muted hover:text-fit-red hover:bg-red-500/10 transition-colors">
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function ExerciseBlock({ ex, onAddSet, onPatchSet, onDeleteSet, onDeleteExercise }) {
  return (
    <div className="rounded-xl bg-fit-card border border-fit-line overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-3">
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
          {ex.lastPerformedAt && (
            <div className="mt-1 text-[11px] text-fit-muted">
              Letztes Mal: {new Date(ex.lastPerformedAt).toLocaleDateString("de-AT")}
            </div>
          )}
        </div>
        <button onClick={onDeleteExercise} className="p-1.5 rounded-lg text-fit-muted hover:text-fit-red hover:bg-red-500/10 transition-all">
          <Trash2 size={14} />
        </button>
      </div>

      <div className="px-3 pb-2">
        <div className={`grid gap-2 px-1 pb-1 text-[10px] font-bold uppercase tracking-wide text-fit-muted ${
          ex.trackingType === "duration"
            ? "grid-cols-[1.5rem_1fr_2.25rem_2.25rem]"
            : "grid-cols-[1.5rem_1fr_1fr_2.25rem_2.25rem]"
        }`}>
          <span className="text-center">#</span>
          <span className="text-center">
            {ex.trackingType === "weight_reps" ? "kg" : ex.trackingType === "distance_time" ? "km" : ex.trackingType === "duration" ? "Zeit" : "Wdh"}
          </span>
          {ex.trackingType !== "duration" && (
            <span className="text-center">{ex.trackingType === "distance_time" ? "Zeit" : "Wdh"}</span>
          )}
          <span />
          <span />
        </div>
        {ex.sets.map((set, i) => (
          <SetRow
            key={set.id}
            set={set}
            index={i}
            trackingType={ex.trackingType || "weight_reps"}
            onPatch={(key, val) => onPatchSet(set.id, key, val)}
            onDelete={() => onDeleteSet(set.id)}
          />
        ))}
        <button
          onClick={onAddSet}
          className="w-full mt-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-fit-accent hover:bg-fit-accent/10 text-xs font-semibold transition-colors"
        >
          <Plus size={13} strokeWidth={2.7} /> Satz hinzufügen
        </button>
      </div>
    </div>
  );
}

export default function WorkoutSession({ workoutId, onBack, onFinished }) {
  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);

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
      trackingType: ex.trackingType || "weight_reps",
    });
    load();
  }

  async function removeExercise(rowId) {
    await api.delete(`/workouts/${workoutId}/exercises/${rowId}`);
    load();
  }

  async function addSet(exerciseId) {
    await api.post(`/workouts/${workoutId}/exercises/${exerciseId}/sets`, {});
    load();
  }

  function patchSetLocal(exerciseId, setId, key, val) {
    setExercises((prev) => prev.map((e) => e.id !== exerciseId ? e : {
      ...e,
      sets: e.sets.map((s) => s.id === setId ? { ...s, [key]: val } : s),
    }));
    api.patch(`/workouts/${workoutId}/exercises/${exerciseId}/sets/${setId}`, { [key]: val });
  }

  async function deleteSet(exerciseId, setId) {
    await api.delete(`/workouts/${workoutId}/exercises/${exerciseId}/sets/${setId}`);
    load();
  }

  async function finishWorkout() {
    await api.patch(`/workouts/${workoutId}`, { finished_at: new Date().toISOString() });
    onFinished();
  }

  const excludeIds = exercises.map((e) => e.exercise_id);

  if (!workout) return <div className="flex items-center justify-center h-screen text-fit-muted text-sm">Lädt…</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl text-fit-muted hover:text-fit-ink hover:bg-fit-bg2 transition-all">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold tracking-tight truncate">{workout.name}</h1>
        </div>
        <button
          onClick={finishWorkout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-fit-accent text-white text-sm font-semibold hover:bg-blue-600 transition-colors"
        >
          <Flag size={14} strokeWidth={2.7} /> Fertig
        </button>
      </div>

      <div className="mb-5">
        <ExerciseSearch onAdd={addExercise} exclude={excludeIds} />
      </div>

      {exercises.length === 0 ? (
        <div className="text-center py-14 text-fit-muted text-sm">
          Noch keine Übungen. Suche oben nach einer Übung.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {exercises.map((ex) => (
            <ExerciseBlock
              key={ex.id}
              ex={ex}
              onAddSet={() => addSet(ex.id)}
              onPatchSet={(setId, key, val) => patchSetLocal(ex.id, setId, key, val)}
              onDeleteSet={(setId) => deleteSet(ex.id, setId)}
              onDeleteExercise={() => removeExercise(ex.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
