import { AlertCircle, TrendingUp } from "lucide-react";
import MuscleBody from "./MuscleBody";

export default function MuscleStatus({ enrichedRecent, coverage, recentDays = 7, highlighterMode = 'body' }) {
  return (
    <>
      <div className="lg:col-span-2">
         <MuscleBody enrichedRecent={enrichedRecent} recentDays={recentDays} highlighterMode={highlighterMode} />
      </div>

      <div className="lg:col-span-1 card bg-accent/5 border-accent/20 p-8">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp size={20} className="text-accent" />
            <span className="label-caps !mb-0 text-sm">Coverage (7 Tage)</span>
          </div>
          {coverage === null ? (
            <div className="animate-pulse h-16 bg-bg2 rounded-2xl" />
          ) : coverage.length === 0 ? (
            <div className="flex items-center gap-4 text-green">
              <div className="w-12 h-12 rounded-full bg-green/10 flex items-center justify-center text-sm font-black">✓</div>
              <p className="text-sm font-bold">Alles abgedeckt</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {coverage.map(g => (
                <span key={g.name} className="text-[11px] font-black uppercase tracking-widest px-5 py-2.5 rounded-2xl flex items-center gap-2"
                  style={{ background: 'var(--red)' + '15', color: 'var(--red)', border: '1px solid var(--red)30' }}>
                  <AlertCircle size={14} />
                  {g.name}
                </span>
              ))}
            </div>
          )}
      </div>
    </>
  );
}
