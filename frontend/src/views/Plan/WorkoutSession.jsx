import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Flag } from "lucide-react";
import { api } from "./api.js";
import ExerciseSearch from "./components/ExerciseSearch.jsx";
import ExerciseBlock from "./components/ExerciseBlock.jsx";
import { REST_TIMER_TAG, readStoredRestTimer, writeStoredRestTimer, sendRestTimerNotification } from "./lib/restTimer.js";

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

  // Basis-Funktion des Plan-Tabs: ein frei geloggtes Workout soll direkt als
  // wiederverwendbare Vorlage (Template) gespeichert werden können, nicht
  // nur andersrum (Template -> Workout starten). Ohne das war der einzige
  // Weg zu einer Vorlage der abstrakte RoutineBuilder, ohne je etwas real
  // geloggt zu haben — genau der Bruch, den der Umbau auf Routinen/Workouts
  // (getrennte Objekte) eingeführt hatte.
  async function saveAsTemplate() {
    const name = prompt("Name für die neue Vorlage:", workout.name || "Workout");
    if (!name || !name.trim()) return;
    setSaving(true);
    try {
      const routine = await api.post("/routines", { name: name.trim(), goal: null });
      for (const ex of exercises) {
        await api.post(`/routines/${routine.id}/exercises`, {
          exercise_id: ex.exercise_id, name: ex.name,
          primaryMuscles: ex.primaryMuscles, secondaryMuscles: ex.secondaryMuscles,
          yuhonas_id: ex.yuhonas_id, trackingType: ex.trackingType,
          templateSets: (ex.sets || []).map((s) => ({
            setType: s.setType || "normal",
            targetReps: s.reps ?? s.targetReps ?? null,
            targetWeight: s.weight ?? s.targetWeight ?? null,
            targetDistance: s.distance ?? s.targetDistance ?? null,
            targetDuration: s.duration ?? s.targetDuration ?? null,
          })),
        });
      }
      alert(`"${name.trim()}" als Vorlage gespeichert.`);
    } finally {
      setSaving(false);
    }
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
          disabled={saving || exercises.length === 0}
          onClick={saveAsTemplate}
          title="Dieses Workout als wiederverwendbare Vorlage speichern"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-fit-card hover:bg-fit-accent/10 text-fit-ink text-sm font-medium disabled:opacity-50 transition-colors"
        >
          Als Vorlage
        </button>
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
