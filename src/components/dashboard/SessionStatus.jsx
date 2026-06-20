import { Zap, ChevronRight, Dumbbell, Activity, Timer } from "lucide-react";
import { getBlockColor as blockColor, ACTIVITY_LABELS, ACTIVITY_ICONS, ACTIVITY_EMOJI } from "../../constants/ActivityConstants";

export default function SessionStatus({ plan, todaySession, recent, today, onNavigate }) {
  const planExercises = Array.isArray(plan?.today?.exercises) ? plan.today.exercises : [];
  const todayExercises = Array.isArray(todaySession?.exercises) ? todaySession.exercises : [];
  const recentSessions = Array.isArray(recent) ? recent : [];

  return (
    <div className="space-y-8">
      {/* Plan-Hint */}
      {plan?.today && (
        <div className="alpha-card p-8 bg-gradient-to-b from-fit-card to-fit-bg2 border-fit-accent/20">
          <div className="flex items-center justify-between gap-3 mb-8">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-fit-accent" />
              <span className="label-caps !mb-0">Vorschlag</span>
            </div>
            <span className="text-[10px] font-black text-fit-accent bg-fit-accent/10 px-3 py-1 rounded-full uppercase tracking-[0.2em]">Plan</span>
          </div>
          <div className="mb-6">
            <div className="text-3xl font-black text-fit-ink mb-2" style={{ color: blockColor(plan.today.block) || 'var(--accent)' }}>
              {plan.today.block}
            </div>
            <div className="h-1.5 w-16 bg-fit-accent rounded-full shadow-lg shadow-accent/20" />
          </div>
          {planExercises.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {planExercises.slice(0, 6).map((e, i) => (
                <span key={i} className="text-[10px] font-bold px-3 py-1.5 rounded-xl bg-fit-bg2 text-fit-muted border border-fit-line">
                  {typeof e === "string" ? e : e.name}
                </span>
              ))}
            </div>
          )}
          <button
            onClick={() => onNavigate?.("session")}
            className="btn btn-primary py-4 text-xs font-black uppercase tracking-widest w-full mt-10 shadow-2xl shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Session Starten →
          </button>
        </div>
      )}

      {/* Heutige Session Status */}
       { (todayExercises.length > 0 || todaySession?.activity || todaySession?.sessionMode === 'cardio') ? (
        <div className="alpha-card p-8 border-fit-accent/30 shadow-2xl shadow-accent/5">
          <div className="label-caps mb-8 flex items-center justify-between">
            <span>Aktuelle Session</span>
            <span className="text-fit-accent font-black tracking-widest">
              {(todaySession?.activity || todaySession?.sessionMode === 'cardio')
                ? (ACTIVITY_LABELS[todaySession.activity?.type] || 'Ausdauer')
                : todaySession?.block}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-10">
              {todaySession.activity ? (
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-fit-ink flex items-center gap-1">
                    {todaySession.activity.duration || '—'}<span className="text-xs opacity-30 mt-2 font-mono">min</span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">Dauer</span>
                </div>
              ) : (
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-fit-ink">
                    {todayExercises.filter(e => e.done).length}<span className="text-xl opacity-30 font-mono">/{todayExercises.length}</span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">Übungen</span>
                </div>
              )}
              {todaySession?.effort && (
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-fit-ink">{todaySession.effort}</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">Effort</span>
                </div>
              )}
            </div>
            <button onClick={() => onNavigate?.("session")} className="w-16 h-16 rounded-3xl bg-fit-accent flex items-center justify-center text-black shadow-2xl shadow-accent/30 transition-all hover:scale-110 active:scale-90">
              <ChevronRight size={32} />
            </button>
          </div>
        </div>
      ) : !plan?.today && (
        <div className="alpha-card flex flex-col items-center justify-center text-center py-16 opacity-30 border-dashed">
           <Dumbbell size={40} className="mb-4" />
           <p className="text-[11px] font-black uppercase tracking-[0.3em]">Pause oder Plan wählen</p>
        </div>
      )}

      {/* Letzte Sessions */}
      {recentSessions.filter(s => s?.date !== today).length > 0 && (
        <div className="space-y-4">
          <h3 className="label-caps px-2">Verlauf</h3>
          <div className="flex flex-col gap-3">
            {recentSessions.filter(s => s?.date !== today).slice(0, 3).map((s, idx) => {
              if (!s) return null;
              const isActivity = s.sessionMode === 'cardio' || !!s.activity;
              const actType = s.activity?.type;
              const emoji = actType ? ACTIVITY_EMOJI[actType] : null;
              const ActivityIcon = (!emoji && actType) ? (ACTIVITY_ICONS[actType] || Activity) : null;
              const label = isActivity ? (ACTIVITY_LABELS[actType] || 'Ausdauer') : s.block;
              const color = blockColor(s.block, s.activity, s.sessionMode);

              return (
                <button key={s.date || idx} onClick={() => onNavigate?.("session", s.date)}
                  className="w-full text-left px-6 py-4 rounded-3xl bg-fit-card border border-fit-line cursor-pointer hover:border-accent/40 transition-all group hover:bg-accent/5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 text-xl"
                        style={{ background: color + '15', color: color }}>
                        {isActivity && emoji
                          ? emoji
                          : isActivity && ActivityIcon
                          ? <ActivityIcon size={22} />
                          : <Dumbbell size={22} />}
                      </div>
                      <div>
                        <div className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">{s.date}</div>
                        <div className="text-md font-black text-fit-ink group-hover:text-accent transition-colors">{label}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {isActivity ? (
                        <div className="flex items-center gap-1.5 text-[11px] font-black text-fit-muted">
                          <Timer size={12} className="opacity-30" />
                          {s.activity.duration}m
                        </div>
                      ) : (
                        <div className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-fit-bg2 text-fit-muted uppercase tracking-widest border border-fit-line">
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
