import { useState } from "react";
import { Info, Search } from "lucide-react";
import BodyMusclesMap from "./BodyMusclesMap";

export default function AnatomyExplorer({ selectedExercise, onMuscleClick }) {
  const [side, setSide] = useState("front");

  return (
    <div className="flex flex-col relative w-full">
       <div className="mb-8 flex items-center justify-between">
          <div className="flex gap-1 bg-fit-card/80 backdrop-blur-md p-1 rounded-xl border border-fit-line shadow-lg">
             <button onClick={() => setSide("front")} 
               className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${side === "front" ? 'bg-fit-accent text-black shadow-sm' : 'text-fit-dim hover:text-ink'}`}>
               Anterior
             </button>
             <button onClick={() => setSide("back")} 
               className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${side === "back" ? 'bg-fit-accent text-black shadow-sm' : 'text-fit-dim hover:text-ink'}`}>
               Posterior
             </button>
          </div>
       </div>

       <div className="card border-dashed bg-fit-bg2/20 relative min-h-[500px]">
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-fit-accent/10 border border-fit-accent/20 text-fit-accent text-[9px] font-black uppercase tracking-widest animate-pulse">
             <Info size={10} />
             70+ Regionen interaktiv
          </div>
          
          <BodyMusclesMap
            side={side}
            selectedExercise={selectedExercise}
            onMuscleClick={onMuscleClick}
          />
       </div>

       <div className="mt-8 p-6 bg-fit-accent/5 border border-fit-accent/10 rounded-3xl border-dashed">
          <div className="label-caps !mb-3 flex items-center gap-2 text-fit-accent">
             <Search size={14} />
             Deep Learning
          </div>
          <p className="text-[11px] font-medium opacity-60 leading-relaxed text-fit-ink/80">
             Klicke auf eine spezifische Muskelregion, um biometrische Details und passende Übungen zu sehen.
          </p>
       </div>
    </div>
  );
}
