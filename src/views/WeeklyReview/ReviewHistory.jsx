import { History, Timer, ChevronRight, Dumbbell, Activity } from 'lucide-react';
import { getBlockColor as blockColor, ACTIVITY_ICONS, ACTIVITY_EMOJI, classifySession } from '../../constants/ActivityConstants';

export default function ReviewHistory({ sessions, onOpenSession }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 opacity-30">
        <History size={40} className="mb-4" />
        <p className="text-[11px] font-black uppercase tracking-[0.3em]">Noch keine Sessions</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 pb-32">
      {sessions.map((s, idx) => {
        const { isActivity, hasFinisher, actType, label } = classifySession(s);
        const emoji = actType ? ACTIVITY_EMOJI[actType] : null;
        const ActivityIcon = (!emoji && actType) ? (ACTIVITY_ICONS[actType] || Activity) : null;
        const color = blockColor(s.block, isActivity ? s.activity : null, s.sessionMode);
        return (
          <button key={s.date || idx} onClick={() => onOpenSession?.(s.date)}
            className="w-full text-left px-6 py-4 rounded-3xl bg-fit-card border border-fit-line hover:border-accent/40 transition-all group hover:bg-accent/5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 text-xl"
                  style={{ background: color + '15', color }}>
                  {isActivity && emoji ? emoji : isActivity && ActivityIcon ? <ActivityIcon size={22} /> : <Dumbbell size={22} />}
                </div>
                <div>
                  <div className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">{s.date}</div>
                  <div className="text-md font-black text-fit-ink group-hover:text-accent transition-colors flex items-center gap-1.5">
                    <span>{label}</span>
                    {hasFinisher && (
                      <span
                        className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded shrink-0 flex items-center gap-0.5 bg-accent/20 text-accent"
                        title="Activity Finisher"
                      >
                        {emoji ? <span>{emoji}</span> : ActivityIcon ? <ActivityIcon size={9} /> : null}
                        Finisher
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isActivity ? (
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-fit-muted">
                    <Timer size={12} className="opacity-30" />{s.activity?.duration}m
                  </div>
                ) : (
                  <div className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-fit-bg2 text-fit-muted uppercase tracking-widest border border-fit-line">
                    {Array.isArray(s.exercises) ? s.exercises.length : 0} Ex
                    {hasFinisher && s.activity?.duration && ` · ${s.activity.duration}m`}
                  </div>
                )}
                <ChevronRight size={16} className="text-fit-dim/30 group-hover:text-fit-accent transition-colors" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
