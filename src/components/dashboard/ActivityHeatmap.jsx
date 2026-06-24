import { Activity, ChevronRight } from "lucide-react";
import { getBlockColor as blockColor, ACTIVITY_LABELS } from "../../constants/ActivityConstants";
import { DAY_LABELS } from "./utils";

export default function ActivityHeatmap({ rollingDays, sessionByDate, today, onNavigate }) {
  const recentList = Object.entries(sessionByDate)
    .filter(([, s]) => s?.block || s?.activity)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 5);

  return (
    <div className="md:col-span-2 xl:col-span-3 alpha-card !p-10 shadow-2xl bg-gradient-to-br from-fit-card to-fit-bg2">
      <div className="flex items-center justify-between mb-10">
        <h3 className="label-caps !mb-0 flex items-center gap-3 text-sm">
          <Activity size={18} className="text-fit-accent" />
          Aktivität & Konsistenz
        </h3>
        <span className="text-[11px] font-black opacity-30 uppercase tracking-[0.2em]">Letzte 10 Tage</span>
      </div>
      <div className="grid grid-cols-5 lg:grid-cols-10 gap-6">
        {rollingDays.map((date) => {
          const s = sessionByDate[date];
          const done = !!(s?.block || s?.activity);
          const isToday = date === today;
          const color = done ? blockColor(s.block, s.activity, s.sessionMode) : null;
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

      {recentList.length > 0 && (
        <div className="mt-10 pt-8 border-t border-fit-line/30">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-fit-dim/40 mb-4">Verlauf</div>
          <div className="space-y-2">
            {recentList.map(([date, s]) => {
              const color = blockColor(s.block, s.activity, s.sessionMode);
              const label = s.block || ACTIVITY_LABELS[s.activity?.type] || '—';
              const exCount = s.exercises?.length || 0;
              return (
                <button
                  key={date}
                  onClick={() => onNavigate?.("session", date)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-fit-bg2/60 hover:bg-fit-bg2 border border-transparent hover:border-fit-line/40 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color || 'var(--accent)' }} />
                    <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: color || 'var(--accent)' }}>{label}</span>
                    <span className="text-[10px] text-fit-dim/50 font-mono">{date}</span>
                  </div>
                  <div className="flex items-center gap-4 text-fit-dim">
                    {exCount > 0 && <span className="text-[10px] font-black opacity-50">{exCount} Übg.</span>}
                    {s.effort && <span className="text-[10px] font-black opacity-50">E{s.effort}</span>}
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
