import { TrendingUp } from "lucide-react";
import { translateMuscle } from "../../lib/translations";
import { getMuscleIcon } from "../../constants/MuscleIcons";

export default function MuscleCoverage({ coverage, recentDays = 7, muscleLanguage = 'de', taxonomy = null }) {
  return (
    <div className="alpha-card p-10 h-full bg-accent/5 border-accent/20">
      <div className="flex items-center gap-3 mb-10">
        <TrendingUp size={22} className="text-accent" />
        <span className="label-caps !mb-0 text-sm">Coverage ({recentDays} Tage)</span>
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
          {coverage.map(g => {
            const Icon = getMuscleIcon(g.name);
            return (
              <span key={g.name} className="text-[11px] font-black uppercase tracking-widest px-5 py-2.5 rounded-2xl flex items-center gap-2"
                style={{ background: 'var(--red)' + '15', color: 'var(--red)', border: '1px solid var(--red)30' }}>
                <Icon size={14} />
                {translateMuscle(g.name, taxonomy, muscleLanguage)}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
