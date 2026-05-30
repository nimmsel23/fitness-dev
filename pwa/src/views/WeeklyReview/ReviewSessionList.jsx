import { Dumbbell } from 'lucide-react';
import { formatVolume } from './utils';

export default function ReviewSessionList({ sessions, onNavigate, hitMode }) {
  return (
    <section className="card mb-0 shadow-lg border-line/50 p-8">
      <div className="label-caps !mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <Dumbbell size={16} className="text-accent" />
           Sessions im Detail
        </div>
        {hitMode && <span className="text-[10px] text-accent font-black tracking-[0.2em] bg-accent/10 px-3 py-1 rounded-full">RECOVERY FOCUS</span>}
      </div>
      <div className="space-y-4">
        {(sessions || []).slice().reverse().map(session => {
          const isActivity = !!session.activity;
          return (
            <button
              key={`${session.date}`}
              onClick={() => onNavigate?.("session", session.date)}
              className="w-full text-left p-5 rounded-2xl border bg-bg2 border-line hover:border-accent/50 hover:shadow-lg transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-[18px] bg-card border border-line flex flex-col items-center justify-center shadow-inner group-hover:border-accent/40 transition-colors">
                  <span className="text-[9px] font-black opacity-40 leading-none uppercase tracking-widest">{session.date.split('-')[1]}</span>
                  <span className="text-lg font-black text-ink leading-none mt-1">{session.date.split('-')[2]}</span>
                </div>
                <div>
                  <div className="text-base font-black text-ink group-hover:text-accent transition-colors">{session.block}</div>
                  <div className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mt-1">
                    {isActivity ? 'Activity Log' : `${session.exercise_count} Übungen`}
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                {!isActivity && !hitMode && (
                   <div className="text-sm font-black text-accent mb-2 bg-accent/10 px-3 py-1 rounded-lg border border-accent/20">
                      {formatVolume(session.total_volume)}
                   </div>
                )}
                {session.muscle_recovery && Object.keys(session.muscle_recovery).length > 0 ? (
                  <div className="flex justify-end gap-1.5 flex-wrap max-w-[150px]">
                     {Object.entries(session.muscle_recovery).slice(0, 4).map(([m, hrs]) => {
                       const status = hrs < 24 ? 'active' : hrs < 48 ? 'recovering' : 'fresh';
                       const colorMap = { active: 'bg-red/10 text-red border-red/20', recovering: 'bg-orange/10 text-orange border-orange/20', fresh: 'bg-green/10 text-green border-green/20' };
                       return (
                         <span key={m} className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${colorMap[status]}`}>
                           {m.slice(0,4)} {hrs}h
                         </span>
                       )
                     })}
                  </div>
                ) : (
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-20 bg-bg2 px-3 py-1 rounded-lg border border-line">
                    Base / No Prev
                  </div>
                )}
              </div>
            </button>
          )
        })}
        {(sessions || []).length === 0 && (
           <div className="py-12 text-center text-xs font-black opacity-30 uppercase tracking-[0.2em] border border-dashed rounded-3xl">Keine Sessions in dieser Woche</div>
        )}
      </div>
    </section>
  );
}
