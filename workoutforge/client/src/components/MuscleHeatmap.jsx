import { muskelDe, muskelColor } from "../muscles.js";

// Parst Reps-String zu Mittelwert: "8-12" → 10, "AMRAP" → 12, "6" → 6
function parseReps(reps) {
  if (!reps) return 10;
  const s = String(reps).trim().toLowerCase();
  if (s === "amrap" || s === "failure") return 12;
  const range = s.match(/^(\d+)\s*[-–]\s*(\d+)$/);
  if (range) return (Number(range[1]) + Number(range[2])) / 2;
  const n = Number(s);
  return isNaN(n) ? 10 : n;
}

function buildHeatmap(exercises) {
  const map = {};
  for (const ex of exercises) {
    const reps = parseReps(ex.reps);
    const sets = ex.sets ?? 3;
    // Volumen = Sätze × Wdh-Mittelwert (normalisiert, kein Gewicht im Builder)
    const vol = sets * reps;

    for (const m of ex.primaryMuscles ?? []) {
      map[m] = (map[m] ?? 0) + vol;
    }
    for (const m of ex.secondaryMuscles ?? []) {
      map[m] = (map[m] ?? 0) + vol * 0.4;
    }
  }
  return map;
}

export default function MuscleHeatmap({ exercises }) {
  if (!exercises?.length) return null;

  const heat = buildHeatmap(exercises);
  const total = Math.max(Object.values(heat).reduce((s, v) => s + v, 0), 1);
  const sorted = Object.entries(heat).sort((a, b) => b[1] - a[1]);

  return (
    <div className="rounded-2xl bg-forge-panel border border-forge-border p-4">
      <div className="text-xs font-bold uppercase tracking-widest text-forge-muted mb-3">
        Muskel-Verteilung
      </div>
      <div className="flex flex-col gap-2">
        {sorted.map(([muscle, val]) => {
          const pct = Math.round((val / total) * 100);
          const color = muskelColor(muscle);
          return (
            <div key={muscle} className="flex items-center gap-2">
              <div className="w-28 text-xs text-right text-forge-muted flex-shrink-0">{muskelDe(muscle)}</div>
              <div className="flex-1 h-2 rounded-full bg-forge-bg overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
              <div className="w-8 text-xs font-mono text-forge-muted text-right">{pct}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
