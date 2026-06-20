import { LayoutGrid, User } from "lucide-react";

const DAYS_OPTIONS = [7, 14, 28];

export default function MuscleHeader({ days, setDays, showDetailed, setShowDetailed }) {
  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest text-fit-accent mb-2">
          Anatomie & Fokus
        </div>
        <h2 className="text-3xl font-black text-fit-ink tracking-tight">
          Superkompensation
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-1 bg-fit-card p-1 rounded-xl border border-fit-line shadow-inner">
          {DAYS_OPTIONS.map(d => (
            <button key={d} onClick={() => setDays(d)} 
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${days === d ? 'bg-fit-accent text-black shadow-lg shadow-accent/20' : 'text-fit-dim hover:text-ink hover:bg-white/5'}`}>
              {d}d
            </button>
          ))}
        </div>
        
        <button onClick={() => setShowDetailed(!showDetailed)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-fit-card border border-fit-line text-[10px] font-black uppercase tracking-widest hover:border-accent hover:text-accent transition-all shadow-md">
          {showDetailed ? <LayoutGrid size={14}/> : <User size={14}/>}
          {showDetailed ? 'Standard Map' : 'Anatomy Map'}
        </button>
      </div>
    </div>
  );
}
