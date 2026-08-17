import { ArrowLeftRight } from 'lucide-react';

// Grobe Push/Pull/Legs-Zuordnung der granularen KB-Regionen (chest.yml,
// upper_back.yml etc., siehe shared/muscle.js::getMuscleGroups()) — bewusst
// simpel gehalten (keine Gewichtung), nur zur groben Split-Balance-Kontrolle.
const PPL_GROUPS = {
  push: { label: 'Push', regions: ['chest', 'shoulders', 'triceps'] },
  pull: { label: 'Pull', regions: ['upper_back', 'middle_back', 'lower_back', 'rhomboids', 'biceps'] },
  legs: { label: 'Legs', regions: ['quadriceps', 'hamstrings', 'glutes', 'calves', 'adductors', 'abductors', 'iliopsoas'] },
};

function sumRegions(bodyRegionScores, regions) {
  return regions.reduce((sum, id) => sum + (Number(bodyRegionScores?.[id]) || 0), 0);
}

export default function ReviewPPLBalance({ bodyRegionScores }) {
  const bars = Object.values(PPL_GROUPS).map(({ label, regions }) => ({
    label,
    score: sumRegions(bodyRegionScores, regions),
  }));
  const maxScore = Math.max(...bars.map(b => b.score), 1);
  const hasData = bars.some(b => b.score > 0);

  return (
    <section>
      <div className="label-caps !mb-4 flex items-center gap-2">
        <ArrowLeftRight size={16} className="text-fit-accent" />
        Push / Pull / Legs Balance
      </div>
      {hasData ? (
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {bars.map(({ label, score }) => {
            const pct = Math.min(100, (score / maxScore) * 100);
            return (
              <div key={label} className="flex flex-col p-4 sm:p-6 rounded-2xl border bg-fit-card border-fit-line shadow-sm min-w-0">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.08em] sm:tracking-[0.2em] opacity-40 mb-3 sm:mb-4">
                  {label}
                </span>
                <span className="text-3xl font-black text-fit-ink mb-3">{score.toFixed(1)}</span>
                <div className="w-full h-2 bg-fit-line rounded-full overflow-hidden">
                  <div className="h-full bg-fit-accent transition-all duration-1000" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center text-sm opacity-30 font-bold uppercase tracking-widest border border-dashed rounded-2xl">Keine Daten in diesem Zeitraum</div>
      )}
    </section>
  );
}
