import { useState } from "react";
import { User, MoveHorizontal, Info, Search } from "lucide-react";
import BodyMusclesMap from "./BodyMusclesMap";

export default function AnatomyExplorer({ onMuscleClick }) {
  const [side, setSide] = useState("front");
  const [gender, setGender] = useState("male");

  return (
    <div className="flex flex-col h-full relative">
       <div className="mb-8 flex items-center justify-between">
          <div className="flex gap-1 bg-card/80 backdrop-blur-md p-1 rounded-xl border border-line shadow-lg">
             <button onClick={() => setSide("front")} 
               className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${side === "front" ? 'bg-accent text-black shadow-sm' : 'text-dim hover:text-ink'}`}>
               Anterior
             </button>
             <button onClick={() => setSide("back")} 
               className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${side === "back" ? 'bg-accent text-black shadow-sm' : 'text-dim hover:text-ink'}`}>
               Posterior
             </button>
          </div>

          <div className="flex gap-1 bg-card/80 backdrop-blur-md p-1 rounded-xl border border-line shadow-lg">
             <button onClick={() => setGender("male")} 
               className={`p-1.5 rounded-lg transition-all ${gender === "male" ? 'bg-accent text-black shadow-sm' : 'text-dim hover:text-ink'}`}>
               <User size={14} />
             </button>
             <button onClick={() => setGender("female")} 
               className={`p-1.5 rounded-lg transition-all ${gender === "female" ? 'bg-accent text-black shadow-sm' : 'text-dim hover:text-ink'}`}>
               <User size={14} className="scale-x-[-1]" />
             </button>
          </div>
       </div>

       <div className="flex-1 flex items-center justify-center min-h-[500px] card border-dashed bg-bg2/20 relative">
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[9px] font-black uppercase tracking-widest animate-pulse">
             <Info size={10} />
             70+ Regionen interaktiv
          </div>
          
          <BodyMusclesMap 
            gender={gender} 
            side={side} 
            onMuscleClick={onMuscleClick}
          />
       </div>

       <div className="mt-8 p-6 bg-accent/5 border border-accent/10 rounded-3xl border-dashed">
          <div className="label-caps !mb-3 flex items-center gap-2 text-accent">
             <Search size={14} />
             Deep Learning
          </div>
          <p className="text-[11px] font-medium opacity-60 leading-relaxed text-ink/80">
             Klicke auf eine spezifische Muskelregion (z.B. Brachialis, Adduktor Longus), um biometrische Details und passende Übungen zu sehen.
          </p>
       </div>
    </div>
  );
}
