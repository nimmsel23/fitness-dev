import { Activity } from "lucide-react";
import { blockColor, DAY_LABELS } from "./utils";

export default function ActivityHeatmap({ rollingDays, sessionByDate, today, onNavigate }) {
  return (
    <div className="lg:col-span-3 card !p-8 shadow-lg bg-gradient-to-br from-card to-bg2">
      <div className="flex items-center justify-between mb-8">
        <h3 className="label-caps !mb-0 flex items-center gap-3 text-sm">
          <Activity size={16} className="text-accent" />
          Aktivität & Konsistenz
        </h3>
        <span className="text-[11px] font-bold opacity-30 uppercase tracking-widest">Letzte 10 Tage</span>
      </div>
      <div className="grid grid-cols-5 lg:grid-cols-10 gap-4">
        {rollingDays.map((date) => {
          const s = sessionByDate[date];
          const done = !!(s?.block || s?.activity);
          const isToday = date === today;
          const color = done ? blockColor(s.block, s.activity) : null;
          const dayName = DAY_LABELS[new Date(date).getDay()];
          return (
            <div key={date} className="flex flex-col items-center gap-3 group">
              <button
                onClick={() => done && onNavigate?.("session", date)}
                className="w-full aspect-square rounded-2xl flex items-center justify-center text-sm font-black transition-all shadow-inner border-2"
                style={{
                  background: isToday ? 'var(--accent)' : done ? (color + '15') : 'var(--bg2)',
                  borderColor: isToday ? 'var(--accent)' : done ? (color + '30') : 'transparent',
                  color: isToday ? '#000' : done ? color : 'var(--dim)',
                  cursor: done ? 'pointer' : 'default',
                }}
              >
                {done ? "✓" : "·"}
              </button>
              <span className="text-[10px] font-black opacity-40 uppercase tracking-widest group-hover:opacity-100 transition-opacity">
                {dayName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
