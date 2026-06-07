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

      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 hide-scrollbar scroll-smooth snap-x">
        {rollingDays.map((d) => {
          const sess = recentSessions[d];
          const done = !!(sess?.block || sess?.activity);
          const isSelected = d === date;
          const color = done ? blockColor(sess.block, sess.activity) : null;
          const dateObj = new Date(d);
          const dayName = DAY_LABELS[dateObj.getDay()];
          const isToday = d === localToday;

          return (
            <button key={d} onClick={() => setDate(d)}
              className="flex flex-col items-center gap-2 group shrink-0 w-12 snap-center">
              <div className={`w-full aspect-square rounded-[18px] flex items-center justify-center text-xs font-black transition-all border-2 relative ${isSelected ? 'border-accent shadow-xl shadow-accent/20 scale-110 z-10' : 'border-line/20'}`}
                style={{ 
                  background: isSelected ? 'var(--accent)' : done ? (color + '15') : 'var(--bg2)',
                  color: isSelected ? '#000' : done ? color : 'var(--dim)'
                }}>
                {done ? '✓' : d.split('-')[2]}
                {isToday && !isSelected && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent rounded-full border-2 border-[var(--card)]" />
                )}
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className={`text-[8px] font-black uppercase tracking-[0.1em] ${isSelected ? 'text-accent' : 'opacity-40'}`}>{dayName}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  );
}
