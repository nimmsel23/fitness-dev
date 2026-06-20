import SectionHeader from "./SectionHeader";

export default function ActivitySection({ hasActivity, setHasActivity, activity, setActivity }) {
  return (
    <div className="card space-y-4">
       <div className="flex items-center justify-between">
          <SectionHeader>Activity</SectionHeader>
          <button onClick={() => setHasActivity(!hasActivity)} 
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${hasActivity ? 'border-fit-orange bg-fit-orange/10 text-fit-orange' : 'border-fit-line bg-fit-bg2 text-fit-dim hover:border-accent/30 hover:text-accent'}`}>
            {hasActivity ? 'Aktiv' : 'Hinzufügen'}
          </button>
       </div>
       {hasActivity && (
         <div className="space-y-4 animate-in slide-in-from-top-2">
           <select value={activity.type} onChange={e => setActivity({...activity, type: e.target.value})}
             className="w-full p-4 rounded-2xl border bg-fit-bg2 border-fit-line text-fit-ink font-bold text-sm focus:border-accent outline-none">
             <option value="hiking">Wandern</option>
             <option value="running">Laufen</option>
             <option value="cycling">Radfahren</option>
             <option value="swimming">Schwimmen</option>
             <option value="yoga">Yoga</option>
           </select>
           <div className="relative">
             <input type="number" placeholder="Dauer" value={activity.duration} onChange={e => setActivity({...activity, duration: e.target.value})}
               className="w-full p-4 pr-16 rounded-2xl border bg-fit-bg2 border-fit-line text-fit-ink font-bold text-sm focus:border-accent outline-none" />
             <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest opacity-30">Minuten</span>
           </div>
         </div>
       )}
    </div>
  );
}
