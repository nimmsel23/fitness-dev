import { useMemo, useState } from "react";
import { Info, Search } from "lucide-react";
import BodyMusclesMap from "./BodyMusclesMap";
import BodyParts3DMesh from "./BodyParts3DMesh";

function catalogIdsFromExercise(exercise) {
  if (!exercise) return [];
  const primary = exercise.primaryMuscles || exercise.primary_muscles || [];
  const secondary = exercise.secondaryMuscles || exercise.secondary_muscles || [];
  return [...primary, ...secondary]
    .map((m) => String(m || "").trim())
    .filter((m) => /^\d/.test(m));
}

export default function AnatomyExplorer({ selectedExercise, onMuscleClick }) {
  const [side, setSide] = useState("front");
  const [mode, setMode] = useState("2d");
  const highlightIds = useMemo(
    () => catalogIdsFromExercise(selectedExercise),
    [selectedExercise],
  );

  return (
    <div className="flex flex-col relative w-full">
       <div className="mb-5 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex gap-1 bg-fit-card p-1 rounded-xl border border-fit-line">
             <button onClick={() => setMode("2d")}
               className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
               style={mode === "2d" ? { background: 'var(--accent)', color: '#000' } : { color: 'var(--dim)' }}>
               2D
             </button>
             <button onClick={() => setMode("3d")}
               className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
               style={mode === "3d" ? { background: 'var(--accent)', color: '#000' } : { color: 'var(--dim)' }}>
               3D
             </button>
          </div>
          {mode === "2d" && (
            <div className="flex gap-1 bg-fit-card p-1 rounded-xl border border-fit-line">
               <button onClick={() => setSide("front")}
                 className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                 style={side === "front" ? { background: 'var(--accent)', color: '#000' } : { color: 'var(--dim)' }}>
                 Anterior
               </button>
               <button onClick={() => setSide("back")}
                 className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                 style={side === "back" ? { background: 'var(--accent)', color: '#000' } : { color: 'var(--dim)' }}>
                 Posterior
               </button>
            </div>
          )}
       </div>

       <div className="card border-dashed bg-fit-bg2/20 relative min-h-[500px]">
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-fit-accent/10 border border-fit-accent/20 text-fit-accent text-[10px] font-medium">
             <Info size={11} />
             {mode === "3d" ? "BodyParts3D · CC BY 4.0" : "70+ Regionen interaktiv"}
          </div>

          {mode === "2d" ? (
            <BodyMusclesMap
              side={side}
              selectedExercise={selectedExercise}
              onMuscleClick={onMuscleClick}
            />
          ) : (
              <BodyParts3DMesh
                catalogId={highlightIds[0] || null}
                highlightIds={highlightIds}
              />
          )}
       </div>

       <div className="mt-5 p-4 bg-fit-accent/5 border border-fit-accent/10 rounded-2xl border-dashed">
          <div className="text-[11px] font-semibold mb-1.5 flex items-center gap-1.5 text-fit-accent">
             <Search size={13} />
             Deep learning
          </div>
          <p className="text-[11px] opacity-70 leading-relaxed text-fit-ink/80">
             {mode === "3d"
               ? "Orbitieren mit Maus/Touch. Meshes kommen aus BodyParts3D (FMA-indexed); fehlende OBJs lokal per Fetch-Skript nachziehen."
               : "Klicke auf eine spezifische Muskelregion, um biomechanische Details und passende Übungen zu sehen."}
          </p>
       </div>
    </div>
  );
}
