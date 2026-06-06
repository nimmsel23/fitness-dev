import { LayoutGrid, User } from "lucide-react";

const DAYS_OPTIONS = [7, 14, 28];

export default function MuscleHeader({ hitMode, days, setDays, showDetailed, setShowDetailed }) {
  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest text-accent mb-2">
          {hitMode ? 'HIT Modus' : 'Volume Modus'}
        </div>
        <h2 className="text-3xl font-black text-ink tracking-tight">
          {hitMode ? 'Superkompensation' : 'Muskel-Coverage'}
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {!hitMode && (
          <div className="flex gap-1 bg-card p-1 rounded-xl border border-line shadow-inner">
            {DAYS_OPTIONS.map(d => (
              <button key={d} onClick={() => setDays(d)} 
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${days === d ? 'bg-accent text-black shadow-lg shadow-accent/20' : 'text-dim hover:text-ink hover:bg-white/5'}`}>
                {d}d
              </button>
            ))}
          </div>
        )}
        
        <button onClick={() => setShowDetailed(!showDetailed)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-line text-[10px] font-black uppercase tracking-widest hover:border-accent hover:text-accent transition-all shadow-md">
          {showDetailed ? <LayoutGrid size={14}/> : <User size={14}/>}
          {showDetailed ? 'Standard Map' : 'Anatomy Map'}
        </button>
      </div>
    </div>
  );
}
