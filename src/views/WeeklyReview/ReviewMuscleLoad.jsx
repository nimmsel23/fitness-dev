import { Zap, AlertTriangle } from 'lucide-react';
import { translateMuscle } from '../../lib/kb/muscles.js';
import { getMuscleIcon } from '../../constants/MuscleIcons';
import { SETS_RECOVERY_WARN } from '../../lib/db/shared/muscleSetVolume.js';

const WARN = '#f59e0b';

function formatHits(value) {
  return Number(value || 0).toLocaleString('de-AT', { maximumFractionDigits: 1 });
}

// Belastung je Muskelregion: eine Übung = eine Belastung, unabhängig von der
// Satzzahl (One Set to Failure). Die App bewertet die Erholung zwischen den
// Sessions, nicht das Volumen einer Session — mehr Sätze erhöhen die Belastung
// nicht, sie lösen nur die Erholungs-Warnung aus.
export default function ReviewMuscleLoad({ muscleLoad = {}, unmappedHits = 0, unmappedExercises = [], muscleLanguage = 'de', taxonomy = null }) {
  const groups = Object.entries(muscleLoad)
    .map(([id, values]) => ({ id, label: translateMuscle(id, taxonomy, muscleLanguage), ...values }))
    .sort((a, b) => b.effective_hits - a.effective_hits);
  const maxHits = Math.max(...groups.map((group) => group.effective_hits), 1);
  const warned = groups.filter((group) => group.high_volume_exercises > 0);

  return (
    <section>
      <div className="flex items-center gap-2 mb-1 text-[11px] font-semibold" style={{ color: 'var(--dim)', opacity: 0.7 }}>
        <Zap size={14} className="text-fit-accent" />
        Belastung pro Muskel
      </div>
      <p className="text-[10px] mb-3" style={{ color: 'var(--dim)', opacity: 0.55 }}>
        Eine Übung = eine Belastung (direkt 1, indirekt 0,5) — egal ob ein Satz oder mehrere, Dropsätze zählen zum Satz.
        Ein Satz bis zum Versagen reicht; mehr Sätze erhöhen die Belastung nicht, sie verlängern nur die Erholung.
      </p>
      {warned.length > 0 && (
        <div className="flex gap-2 p-3 mb-3 rounded-2xl border text-[11px] leading-snug" style={{ borderColor: WARN, color: WARN }} role="alert">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <span>
            Viele Sätze bei {warned.map((group) => group.label).join(', ')} (mehr als {SETS_RECOVERY_WARN} pro Übung).
            Möglicherweise zu viel Volumen für eine angemessene Erholung bis zum nächsten Training — das wird eher Kraftausdauer als reines Krafttraining.
          </span>
        </div>
      )}
      {groups.length ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4">
          {groups.map(({ id, label, primary_hits, secondary_hits, effective_hits, max_sets, high_volume_exercises }) => {
            const Icon = getMuscleIcon(id);
            const warn = high_volume_exercises > 0;
            return (
              <div key={id} className="flex flex-col p-3.5 sm:p-5 rounded-2xl border bg-fit-card border-fit-line min-w-0" style={warn ? { borderColor: WARN } : undefined}>
                <div className="flex items-center gap-1.5 mb-2 min-w-0">
                  <Icon size={13} className="opacity-50 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-medium opacity-70 truncate">{label}</span>
                  {warn && <AlertTriangle size={12} className="shrink-0 ml-auto" style={{ color: WARN }} aria-label="Viel Volumen" />}
                </div>
                <div className="flex items-end justify-between mt-auto gap-2">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-fit-ink">{formatHits(effective_hits)}</div>
                    <div className="text-[10px] mt-1" style={{ color: 'var(--dim)', opacity: 0.65 }}>
                      {formatHits(primary_hits)} direkt · {formatHits(secondary_hits)} indirekt
                    </div>
                    {warn && (
                      <div className="text-[10px] mt-1" style={{ color: WARN }}>bis {max_sets} Sätze · Erholung prüfen</div>
                    )}
                  </div>
                  <div className="w-2 h-10 bg-fit-line rounded-full overflow-hidden flex flex-col justify-end shrink-0">
                    <div className="w-full bg-fit-accent" style={{ height: `${Math.min(100, effective_hits / maxHits * 100)}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-7 text-center text-sm font-semibold border border-dashed rounded-2xl" style={{ color: 'var(--dim)', opacity: 0.6 }}>
          Keine protokollierten Belastungen in diesem Zeitraum
        </div>
      )}
      {unmappedHits > 0 && (
        <p className="text-[10px] mt-2" style={{ color: 'var(--dim)', opacity: 0.6 }}>
          {formatHits(unmappedHits)} Übungen ohne Muskelzuordnung
          {Array.isArray(unmappedExercises) && unmappedExercises.length > 0 && (
            <>: {unmappedExercises.slice(0, 5).map((ex) => ex.name).join(', ')}
              {unmappedExercises.length > 5 ? ` und ${unmappedExercises.length - 5} weitere` : ''}</>
          )}
        </p>
      )}
    </section>
  );
}
