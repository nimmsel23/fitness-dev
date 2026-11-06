import { useState } from "react";
import { Info, Search } from "lucide-react";
import BodyMusclesMap from "./BodyMusclesMap";

export default function AnatomyExplorer({ selectedExercise, onMuscleClick }) {
  const [side, setSide] = useState("front");

  return (
    <div className="flex flex-col relative w-full">
       <div className="mb-5 flex items-center justify-between">
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
       </div>

       <div className="card border-dashed bg-fit-bg2/20 relative min-h-[500px]">
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-fit-accent/10 border border-fit-accent/20 text-fit-accent text-[10px] font-medium">
             <Info size={11} />
             70+ Regionen interaktiv
          </div>

          <BodyMusclesMap
            side={side}
            selectedExercise={selectedExercise}
            onMuscleClick={onMuscleClick}
          />
       </div>

       <div className="mt-5 p-4 bg-fit-accent/5 border border-fit-accent/10 rounded-2xl border-dashed">
          <div className="text-[11px] font-semibold mb-1.5 flex items-center gap-1.5 text-fit-accent">
             <Search size={13} />
             Deep learning
          </div>
          <p className="text-[11px] opacity-70 leading-relaxed text-fit-ink/80">
             Klicke auf eine spezifische Muskelregion, um biomechanische Details und passende Übungen zu sehen.
          </p>
       </div>
    </div>
  );
}
