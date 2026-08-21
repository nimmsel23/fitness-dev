import { Check, Trash2 } from "lucide-react";

// Eine einzelne Satz-Zeile innerhalb eines ExerciseBlock. Inputs je nach
// trackingType (weight_reps/bodyweight_reps/duration/distance_time).
// toggleCompleted() übernimmt beim ersten Abhaken automatisch den besten
// verfügbaren Wert (echte Eingabe > Ghost/letzte Performance) statt leer
// zu bleiben — Fallback-Kette identisch zu lib/quickComplete.js.
export default function SetRow({ set, index, trackingType, onPatch, onDelete, onCompleted }) {
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
