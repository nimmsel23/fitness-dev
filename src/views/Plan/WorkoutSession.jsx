import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Trash2, Check, Plus, Flag } from "lucide-react";
import { api } from "./api.js";
import ExerciseSearch from "./components/ExerciseSearch.jsx";
import { muskelDe, muskelColor, dedupeMuskeln } from "../../lib/muscleLabels.js";

const REST_TIMER_TAG = "fitness-plan-rest-timer";

function restTimerStorageKey(workoutId) {
  return `fitness-plan-rest-timer:${workoutId}`;
}

function readStoredRestTimer(workoutId) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(restTimerStorageKey(workoutId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredRestTimer(workoutId, timer) {
  if (typeof window === "undefined") return;
  try {
    if (!timer) window.localStorage.removeItem(restTimerStorageKey(workoutId));
    else window.localStorage.setItem(restTimerStorageKey(workoutId), JSON.stringify(timer));
  } catch {}
}

async function sendRestTimerNotification(timer) {
  if (typeof window === "undefined" || typeof navigator === "undefined") return;
  if (!("serviceWorker" in navigator) || typeof Notification === "undefined") return;

  const registration = window.__swRegistration || await navigator.serviceWorker.getRegistration();
  if (!registration?.active) return;

  if (!timer) {
    registration.active.postMessage({ type: "CLEAR_WORKOUT_TIMER_NOTIFICATION", tag: REST_TIMER_TAG });
    return;
  }

  if (Notification.permission !== "granted") return;

  const remainingSeconds = Math.max(0, Math.ceil((timer.targetTime - Date.now()) / 1000));
  registration.active.postMessage({
    type: "SHOW_WORKOUT_TIMER_NOTIFICATION",
    tag: REST_TIMER_TAG,
    title: "Satzpause läuft",
    body: `${timer.exerciseName || "Übung"} · noch ${remainingSeconds}s`,
    active: true,
  });
}

function SetRow({ set, index, trackingType, onPatch, onDelete, onCompleted }) {
  const isWeight = trackingType === "weight_reps";
  const isBodyweight = trackingType === "bodyweight_reps";
  const isDuration = trackingType === "duration";
  const isDistanceTime = trackingType === "distance_time";

  function toggleCompleted() {
    if (set.completed) {
      onPatch({ completed: false });
      return;
    }
    if (isWeight || isBodyweight) {
      if (isWeight && (set.weight === null || set.weight === "") && set.ghostWeight !== null && set.ghostWeight !== undefined) {
        onPatch({ weight: set.ghostWeight, reps: set.reps ?? set.ghostReps ?? null, completed: true });
        onCompleted?.();
        return;
      }
      if ((set.reps === null || set.reps === "") && set.ghostReps !== null && set.ghostReps !== undefined) {
        onPatch({ reps: set.ghostReps, completed: true });
        onCompleted?.();
        return;
      }
    }
    if (isDistanceTime) {
      if ((set.distance === null || set.distance === "") && set.ghostDistance !== null && set.ghostDistance !== undefined) {
        onPatch({ distance: set.ghostDistance, duration: set.duration ?? set.ghostDuration ?? null, completed: true });
        onCompleted?.();
        return;
      }
      if ((set.duration === null || set.duration === "") && set.ghostDuration !== null && set.ghostDuration !== undefined) {
        onPatch({ duration: set.ghostDuration, completed: true });
        onCompleted?.();
        return;
      }
    }
    if (isDuration && (set.duration === null || set.duration === "") && set.ghostDuration !== null && set.ghostDuration !== undefined) {
      onPatch({ duration: set.ghostDuration, completed: true });
      onCompleted?.();
      return;
    }
    onPatch({ completed: true });
    onCompleted?.();
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
          onChange={(e) => onPatch({ [isWeight ? "weight" : "distance"]: e.target.value === "" ? null : Number(e.target.value) })}
          className="px-2 py-1.5 rounded-lg bg-fit-bg2 border border-fit-line text-fit-ink text-sm font-mono text-center focus:outline-none focus:border-fit-accent placeholder:text-fit-muted"
        />
      )}
      {isBodyweight && (
        <input
          type="number"
          inputMode="numeric"
          placeholder={String(set.ghostReps ?? set.targetReps ?? "Wdh")}
          value={set.reps ?? ""}
          onChange={(e) => onPatch({ reps: e.target.value === "" ? null : Number(e.target.value) })}
          className="px-2 py-1.5 rounded-lg bg-fit-bg2 border border-fit-line text-fit-ink text-sm font-mono text-center focus:outline-none focus:border-fit-accent placeholder:text-fit-muted"
        />
      )}
      {isBodyweight && (
        <div className="px-2 py-1.5 rounded-lg bg-fit-bg2/50 border border-fit-line text-fit-muted text-[11px] text-center">
          {set.progressionStage || "stage offen"}
        </div>
      )}
      {isWeight && (
        <input
          type="number"
          inputMode="numeric"
          placeholder={String(set.ghostReps ?? set.targetReps ?? "Wdh")}
          value={set.reps ?? ""}
          onChange={(e) => onPatch({ reps: e.target.value === "" ? null : Number(e.target.value) })}
          className="px-2 py-1.5 rounded-lg bg-fit-bg2 border border-fit-line text-fit-ink text-sm font-mono text-center focus:outline-none focus:border-fit-accent placeholder:text-fit-muted"
        />
      )}
      {isDistanceTime && (
        <input
          type="number"
          inputMode="numeric"
          placeholder={String(set.ghostDuration ?? set.targetDuration ?? "min")}
          value={set.duration ?? ""}
          onChange={(e) => onPatch({ duration: e.target.value === "" ? null : Number(e.target.value) })}
          className="px-2 py-1.5 rounded-lg bg-fit-bg2 border border-fit-line text-fit-ink text-sm font-mono text-center focus:outline-none focus:border-fit-accent placeholder:text-fit-muted"
        />
      )}
      {isDuration && (
        <input
          type="number"
          inputMode="numeric"
          placeholder={String(set.ghostDuration ?? set.targetDuration ?? "sek")}
          value={set.duration ?? ""}
          onChange={(e) => onPatch({ duration: e.target.value === "" ? null : Number(e.target.value) })}
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

function ExerciseBlock({ ex, onAddSet, onPatchSet, onDeleteSet, onDeleteExercise, onCompletedSet }) {
  return (
    <div className="rounded-xl bg-fit-card border border-fit-line overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-3">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-fit-ink truncate">{ex.name}</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {dedupeMuskeln(ex.primaryMuscles).slice(0, 3).map((m) => (
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
            <span className="text-center">{ex.trackingType === "bodyweight_reps" ? "Stage" : ex.trackingType === "distance_time" ? "Zeit" : "Wdh"}</span>
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
            onPatch={(patch) => onPatchSet(set.id, patch)}
            onDelete={() => onDeleteSet(set.id)}
            onCompleted={() => onCompletedSet?.(set)}
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
  const [saving, setSaving] = useState(false);
  const [restTimer, setRestTimer] = useState(null);
  const [nowMs, setNowMs] = useState(Date.now());

  async function load() {
    const d = await api.get(`/workouts/${workoutId}`);
    setWorkout(d.workout);
    setExercises(d.workout.exercises);
  }

  useEffect(() => { load(); }, [workoutId]);

  useEffect(() => {
    setRestTimer(readStoredRestTimer(workoutId));
  }, [workoutId]);

  useEffect(() => {
    if (!restTimer?.targetTime) return undefined;
    const tick = window.setInterval(() => setNowMs(Date.now()), 250);
    return () => window.clearInterval(tick);
  }, [restTimer?.targetTime]);

  useEffect(() => {
    if (!restTimer?.targetTime) {
      writeStoredRestTimer(workoutId, null);
      sendRestTimerNotification(null).catch(() => {});
      return;
    }
    writeStoredRestTimer(workoutId, restTimer);
    sendRestTimerNotification(restTimer).catch(() => {});
  }, [workoutId, restTimer]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState !== "visible") return;
      setNowMs(Date.now());
      setRestTimer(readStoredRestTimer(workoutId));
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [workoutId]);

  useEffect(() => {
    if (!restTimer?.targetTime) return;
    if (restTimer.targetTime > nowMs) return;
    setRestTimer(null);
    sendRestTimerNotification({
      ...restTimer,
      targetTime: Date.now(),
    }).catch(() => {});
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification("Satzpause beendet", {
        body: `${restTimer.exerciseName || "Übung"} · weiter`,
        tag: REST_TIMER_TAG,
        silent: false,
      });
    }
  }, [nowMs, restTimer]);

  const restRemainingMs = restTimer?.targetTime ? Math.max(0, restTimer.targetTime - nowMs) : 0;
  const restRemainingLabel = useMemo(() => {
    const totalSeconds = Math.ceil(restRemainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [restRemainingMs]);

  async function primeNotificationPermission() {
    if (typeof Notification === "undefined" || Notification.permission !== "default") return;
    try { await Notification.requestPermission(); } catch {}
  }

  function startRestTimer(exercise, set) {
    const restSeconds = Number(exercise?.rest_seconds) || 0;
    if (restSeconds <= 0) return;
    const nextTimer = {
      workoutId,
      exerciseId: exercise.id,
      setId: set.id,
      exerciseName: exercise.name,
      targetTime: Date.now() + restSeconds * 1000,
      restSeconds,
    };
    setNowMs(Date.now());
    setRestTimer(nextTimer);
  }

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

  function patchSetLocal(exerciseId, setId, patch) {
    setExercises((prev) => prev.map((e) => e.id !== exerciseId ? e : {
      ...e,
      sets: e.sets.map((s) => s.id === setId ? { ...s, ...patch } : s),
    }));
  }

  async function deleteSet(exerciseId, setId) {
    await api.delete(`/workouts/${workoutId}/exercises/${exerciseId}/sets/${setId}`);
    load();
  }

  async function finishWorkout() {
    setSaving(true);
    try {
      setRestTimer(null);
      const finishedAt = new Date().toISOString();
      await api.patch(`/workouts/${workoutId}`, {
        exercises,
        finished_at: finishedAt,
        sessionState: "completed",
        eventLog: exercises.flatMap((exercise) =>
          (exercise.sets || [])
            .filter((set) => set.completed)
            .map((set) => ({
              exercise_id: exercise.exercise_id,
              setId: set.id,
              metricType:
                exercise.trackingType === "weight_reps" ? "weight_reps"
                  : exercise.trackingType === "distance_time" ? "distance_time"
                    : exercise.trackingType === "duration" ? "seconds"
                      : "reps",
              reps: set.reps ?? null,
              weight: set.weight ?? null,
              distance: set.distance ?? null,
              seconds: set.duration ?? null,
              progressionStage: set.progressionStage ?? null,
              completedAt: finishedAt,
            }))
        ),
      });
    } finally {
      setSaving(false);
    }
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
          disabled={saving}
          onClick={async () => {
            await primeNotificationPermission();
            await finishWorkout();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-fit-accent text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          <Flag size={14} strokeWidth={2.7} /> Fertig
        </button>
      </div>

      {restTimer && (
        <div className="mb-4 rounded-2xl border border-fit-line bg-fit-card px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-fit-muted">Rest Timer</div>
            <div className="text-sm font-semibold text-fit-ink">{restTimer.exerciseName}</div>
          </div>
          <div className="text-lg font-mono text-fit-ink">{restRemainingLabel}</div>
          <button
            onClick={() => setRestTimer(null)}
            className="px-3 py-1.5 rounded-lg bg-fit-bg2 text-fit-muted text-xs font-semibold hover:text-fit-ink transition-colors"
          >
            Stop
          </button>
        </div>
      )}

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
              onPatchSet={(setId, patch) => patchSetLocal(ex.id, setId, patch)}
              onDeleteSet={(setId) => deleteSet(ex.id, setId)}
              onDeleteExercise={() => removeExercise(ex.id)}
              onCompletedSet={(set) => {
                primeNotificationPermission().catch(() => {});
                startRestTimer(ex, set);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
