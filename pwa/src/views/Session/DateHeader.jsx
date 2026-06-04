import { CalendarDays, Save } from "lucide-react";
import { blockColor, DAY_LABELS } from "./utils";

export default function DateHeader({ 
  date, setDate, rollingDays, recentSessions, localToday, onSave, saving 
}) {
  return (
    <div className="card mb-6 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="label-caps !mb-0 font-black text-[var(--dim)] hidden sm:block">Datum auswählen</div>
        <div className="flex items-center gap-2 flex-1 sm:flex-none justify-between sm:justify-start">
          <input type="date" value={date} max={localToday} onChange={e => setDate(e.target.value)}
            className="px-3 py-2 rounded-xl border text-xs font-bold bg-bg2 border-line text-ink w-full sm:w-32 outline-none focus:border-accent" />
          <button onClick={onSave} disabled={saving} className="btn btn-primary py-2 px-4 text-xs shadow-lg shadow-accent/20 flex items-center gap-2">
            {saving ? '…' : <><Save size={14} /> <span className="hidden sm:inline">Save</span></>}
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 -mx-2 px-2 hide-scrollbar">
        {rollingDays.map((d) => {
          const sess = recentSessions[d];
          const done = !!(sess?.block || sess?.activity);
          const isSelected = d === date;
          const color = done ? blockColor(sess.block, sess.activity) : null;
          const dayName = DAY_LABELS[new Date(d).getDay()];

          return (
            <button key={d} onClick={() => setDate(d)}
              className="flex flex-col items-center gap-1.5 group shrink-0 w-10">
              <div className={`w-full aspect-square rounded-xl flex items-center justify-center text-[10px] font-bold transition-all border-2 ${isSelected ? 'border-accent shadow-lg shadow-accent/20 scale-105' : 'border-transparent'}`}
                style={{ 
                  background: isSelected ? 'var(--accent)' : done ? (color + '22') : 'var(--bg2)',
                  color: isSelected ? '#000' : done ? color : 'var(--dim)'
                }}>
                {done ? '✓' : '·'}
              </div>
              <div className="flex flex-col items-center">
                <span className={`text-[8px] font-bold uppercase tracking-tighter ${isSelected ? 'text-accent' : 'opacity-40'}`}>{dayName}</span>
                <span className={`text-[9px] font-black ${isSelected ? 'text-accent' : 'opacity-20'}`}>{d.split('-')[2]}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  );
}
