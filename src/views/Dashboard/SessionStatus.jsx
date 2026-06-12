import { Zap, ChevronRight, Dumbbell, Activity, Timer } from "lucide-react";
import { blockColor, ACTIVITY_LABELS, ACTIVITY_ICONS } from "./utils";

export default function SessionStatus({ plan, todaySession, recent, today, onNavigate }) {
  const planExercises = Array.isArray(plan?.today?.exercises) ? plan.today.exercises : [];
  const todayExercises = Array.isArray(todaySession?.exercises) ? todaySession.exercises : [];
  const recentSessions = Array.isArray(recent) ? recent : [];

  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Plan-Hint */}
      {plan?.today && (
        <div className="card mb-0 flex flex-col justify-between p-6" style={{ background: 'linear-gradient(180deg, var(--card), var(--bg2))', borderColor: 'var(--accent)20' }}>
          <div>
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-accent" />
                <span className="label-caps !mb-0">Vorschlag</span>
              </div>
              <span className="text-[9px] font-black text-accent bg-accent/10 px-2 py-0.5 rounded-full uppercase tracking-widest">Plan</span>
            </div>
            <div className="mb-4">
              <div className="text-2xl font-black text-ink mb-1" style={{ color: blockColor(plan.today.block) || 'var(--accent)' }}>
                {plan.today.block}
              </div>
            <div className="h-1 w-12 bg-accent rounded-full" />
          </div>
            {planExercises.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {planExercises.slice(0, 6).map((e, i) => (
                  <span key={i} className="text-[9px] font-bold px-2 py-1 rounded-lg bg-bg2 text-muted border border-line">
                    {typeof e === "string" ? e : e.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => onNavigate?.("session")}
            className="btn btn-primary py-3 text-xs w-full mt-8 shadow-lg shadow-accent/20"
          >
            Session Starten →
          </button>
        </div>
      )}

      {/* Heutige Session Status */}
      { (todayExercises.length > 0 || todaySession?.activity) ? (
        <div className="card mb-0 border-accent/20 shadow-lg shadow-accent/5">
          <div className="label-caps mb-6 flex items-center justify-between">
            <span>Aktuelle Session</span>
            <span className="text-accent font-black">{todaySession?.activity ? ACTIVITY_LABELS[todaySession.activity.type] : todaySession?.block}</span>
          </div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-6">
              {todaySession.activity ? (
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-ink flex items-center gap-1">
                    {todaySession.activity.duration || '—'}<span className="text-[10px] opacity-30 mt-1">m</span>
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Dauer</span>
                </div>
              ) : (
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-ink">
                    {todayExercises.filter(e => e.done).length}<span className="text-lg opacity-30">/{todayExercises.length}</span>
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Übungen</span>
                </div>
              )}
              {todaySession?.effort && (
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-ink">{todaySession.effort}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Effort</span>
                </div>
              )}
            </div>
            <button onClick={() => onNavigate?.("session")} className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-black shadow-lg shadow-accent/20 transition-transform active:scale-90">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      ) : !plan?.today && (
        <div className="card mb-0 flex flex-col items-center justify-center text-center py-12 opacity-30 border-dashed">
           <Dumbbell size={32} className="mb-3" />
           <p className="text-[10px] font-black uppercase tracking-[0.2em]">Pause oder Plan wählen</p>
        </div>
      )}

      {/* Letzte Sessions */}
      {recentSessions.filter(s => s?.date !== today).length > 0 && (
        <div className="space-y-3">
          <h3 className="label-caps px-1">Verlauf</h3>
          <div className="flex flex-col gap-2">
            {recentSessions.filter(s => s?.date !== today).slice(0, 3).map((s, idx) => {
              if (!s) return null;
              const isActivity = !!s.activity;
              const ActivityIcon = isActivity ? (ACTIVITY_ICONS[s.activity.type] || Activity) : Dumbbell;
              const label = isActivity ? ACTIVITY_LABELS[s.activity.type] : s.block;
              const color = blockColor(s.block, s.activity);

              return (
                <button key={s.date || idx} onClick={() => onNavigate?.("session", s.date)}
                  className="w-full text-left px-4 py-3 rounded-2xl bg-card border border-line cursor-pointer hover:border-accent/30 transition-all group">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                        style={{ background: color + '15', color: color }}>
                        <ActivityIcon size={18} />
                      </div>
                      <div>
                        <div className="text-[9px] font-black opacity-30 uppercase tracking-tighter mb-0.5">{s.date}</div>
                        <div className="text-sm font-black text-ink group-hover:text-accent transition-colors">{label}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {isActivity ? (
                        <div className="flex items-center gap-1 text-[10px] font-black text-muted">
                          <Timer size={10} className="opacity-30" />
                          {s.activity.duration}m
                        </div>
                      ) : (
                        <div className="text-[9px] font-black px-2 py-1 rounded-lg bg-bg2 text-muted uppercase tracking-widest border border-line">
                          {Array.isArray(s.exercises) ? s.exercises.filter(e => e.done).length : 0} Ex
                        </div>
                      )}
                    </div>
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
