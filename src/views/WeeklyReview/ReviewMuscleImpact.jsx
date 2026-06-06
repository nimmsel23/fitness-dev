import { TrendingUp } from 'lucide-react';

export default function ReviewMuscleImpact({ regionEntries }) {
  return (
    <section className="card mb-0 shadow-lg border-line/50 p-8">
      <div className="label-caps !mb-8 flex items-center gap-2">
        <TrendingUp size={16} className="text-accent" />
        Relative Muskelbelastung
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {regionEntries.length > 0 ? regionEntries.map(([name, score]) => {
          const maxScore = Math.max(...regionEntries.map(e => e[1]), 5);
          const pct = Math.min(100, (score / maxScore) * 100);
          return (
            <div key={name} className="flex flex-col p-5 rounded-2xl border bg-bg2 border-line hover:border-accent/40 transition-all group shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-3 group-hover:text-accent group-hover:opacity-100 transition-colors">{name}</span>
              <div className="flex items-end justify-between mt-auto">
                <span className="text-2xl font-black text-ink">{Number(score).toFixed(1)}</span>
                <div className="w-1.5 h-8 bg-line rounded-full overflow-hidden flex flex-col justify-end">
                  <div className="w-full bg-accent transition-all duration-1000" style={{ height: `${pct}%` }} />
                </div>
              </div>
            </div>
          )
        }) : (
          <div className="col-span-full py-8 text-center text-sm opacity-30 font-bold uppercase tracking-widest border border-dashed rounded-2xl">Keine Daten in diesem Zeitraum</div>
        )}
      </div>
    </section>
  );
}
