import { Dumbbell } from 'lucide-react';
import { translateMuscle } from '../../lib/kb/muscles.js';
import { getMuscleIcon } from '../../constants/MuscleIcons';

function formatSets(value) {
  return Number(value || 0).toLocaleString('de-AT', { maximumFractionDigits: 1 });
}

export default function ReviewMuscleVolume({ muscleSetVolume = {}, unmappedWorkingSets = 0, unmappedExercises = [], muscleLanguage = 'de', taxonomy = null }) {
  const groups = Object.entries(muscleSetVolume)
    .map(([id, values]) => ({
      id,
      label: translateMuscle(id, taxonomy, muscleLanguage),
      ...values,
    }))
    .sort((a, b) => b.effective_sets - a.effective_sets);
  const maxSets = Math.max(...groups.map((group) => group.effective_sets), 1);

  return (
    <section>
      <div className="flex items-center gap-2 mb-1 text-[11px] font-semibold" style={{ color: 'var(--dim)', opacity: 0.7 }}>
        <Dumbbell size={14} className="text-fit-accent" />
        Arbeitssätze pro Muskel
      </div>
      <p className="text-[10px] mb-3" style={{ color: 'var(--dim)', opacity: 0.55 }}>
        Direkt 1, indirekt 0,5 effektive Sätze. Aufwärmsätze sind ausgeschlossen.
      </p>
      {groups.length ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4">
          {groups.map(({ id, label, primary_sets, secondary_sets, effective_sets }) => {
            const Icon = getMuscleIcon(id);
            return (
              <div key={id} className="flex flex-col p-3.5 sm:p-5 rounded-2xl border bg-fit-card border-fit-line min-w-0">
                <div className="flex items-center gap-1.5 mb-2 min-w-0">
                  <Icon size={13} className="opacity-50 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-medium opacity-70 truncate">{label}</span>
                </div>
                <div className="flex items-end justify-between mt-auto gap-2">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-fit-ink">{formatSets(effective_sets)}</div>
                    <div className="text-[10px] mt-1" style={{ color: 'var(--dim)', opacity: 0.65 }}>
                      {formatSets(primary_sets)} direkt · {formatSets(secondary_sets)} indirekt
                    </div>
                  </div>
                  <div className="w-2 h-10 bg-fit-line rounded-full overflow-hidden flex flex-col justify-end shrink-0">
                    <div className="w-full bg-fit-accent" style={{ height: `${Math.min(100, effective_sets / maxSets * 100)}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-7 text-center text-sm font-semibold border border-dashed rounded-2xl" style={{ color: 'var(--dim)', opacity: 0.6 }}>
          Keine protokollierten Arbeitssätze in diesem Zeitraum
        </div>
      )}
      {unmappedWorkingSets > 0 && (
        <p className="text-[10px] mt-2" style={{ color: 'var(--dim)', opacity: 0.6 }}>
          {formatSets(unmappedWorkingSets)} Arbeitssätze ohne Muskelzuordnung
          {Array.isArray(unmappedExercises) && unmappedExercises.length > 0 && (
            <>: {unmappedExercises.slice(0, 5).map((ex) => `${ex.name} (${formatSets(ex.sets)})`).join(', ')}
              {unmappedExercises.length > 5 ? ` und ${unmappedExercises.length - 5} weitere` : ''}</>
          )}
        </p>
      )}
    </section>
  );
}
