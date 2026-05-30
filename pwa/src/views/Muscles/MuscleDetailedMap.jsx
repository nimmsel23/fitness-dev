import { useState } from "react";
import { User, MoveHorizontal, Search, Info } from "lucide-react";
import DetailedMuscleMap from "../../components/DetailedMuscleMap.jsx";

export default function MuscleDetailedMap({ exercises, gender, onGroupClick }) {
  const [side, setSide] = useState("front");
  const [currentGender, setCurrentGender] = useState(gender || "male");
  const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];
  
  function handlePress(slug) {
    if (onGroupClick) onGroupClick(slug);
  }

  return (
    <div className="flex-1 flex flex-col min-h-[500px] relative">
       {/* Map Controls Overlay */}
       <div className="absolute top-0 left-0 z-20 flex flex-col gap-3">
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
             <button onClick={() => setCurrentGender("male")} 
               className={`p-1.5 rounded-lg transition-all ${currentGender === "male" ? 'bg-accent text-black shadow-sm' : 'text-dim hover:text-ink'}`}>
               <User size={14} />
             </button>
             <button onClick={() => setCurrentGender("female")} 
               className={`p-1.5 rounded-lg transition-all ${currentGender === "female" ? 'bg-accent text-black shadow-sm' : 'text-dim hover:text-ink'}`}>
               <User size={14} className="scale-x-[-1]" />
             </button>
          </div>
       </div>

       {/* Intensity Legend */}
       <div className="absolute bottom-0 left-0 z-20 bg-card/80 backdrop-blur-md p-4 rounded-2xl border border-line shadow-lg space-y-3">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Intensität (Hits)</div>
          <div className="flex flex-col gap-2">
             <LegendRow color={colors[3]} label="6+" />
             <LegendRow color={colors[2]} label="4-5" />
             <LegendRow color={colors[1]} label="2-3" />
             <LegendRow color={colors[0]} label="1" />
          </div>
       </div>

       {/* Instruction Hint */}
       <div className="absolute top-0 right-0 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[9px] font-black uppercase tracking-widest animate-pulse">
          <Info size={10} />
          Muskel anklicken für Details
       </div>

       {/* The Actual Map */}
       <div className="flex-1 flex items-center justify-center p-4">
          <DetailedMuscleMap 
             exercises={exercises} 
             gender={currentGender} 
             side={side}
             colors={colors}
             onGroupClick={handlePress}
           />
       </div>
    </div>
  );
}

function LegendRow({ color, label }) {
  return (
    <div className="flex items-center gap-2 group">
       <div className="w-3 h-3 rounded shadow-sm transition-transform group-hover:scale-125" style={{ background: color }} />
       <span className="text-[10px] font-bold text-ink opacity-60 group-hover:opacity-100 transition-opacity">{label}</span>
    </div>
  );
}
