import { useEffect, useState } from "react";
import { getSessionHistory, getAllExercises } from "../db.js";
import BodyMap from "../components/BodyMap.jsx";

const DAYS_OPTIONS = [7, 14, 28];

export default function Muscles() {
  const [days, setDays]     = useState(7);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getSessionHistory(days * 2),
      getAllExercises()
    ]).then(([sessions, kbExercises]) => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const cutoffStr = cutoff.toISOString().slice(0, 10);
      
      // Map KB for quick lookup by name
      const kbMap = new Map();
      kbExercises.forEach(ex => {
        kbMap.set((ex.display_name || ex.name).toLowerCase(), ex);
      });
      
      const inRange = sessions
        .filter(s => s.date >= cutoffStr)
        .flatMap(s => s.exercises || [])
        .filter(ex => ex.done)
        .map(ex => {
          // Enrich with KB data if available
          const kbEx = kbMap.get((ex.name || "").toLowerCase());
          return {
            ...ex,
            primaryMuscles: kbEx?.primary_muscles || kbEx?.primaryMuscles || ex.primaryMuscles || [],
            secondaryMuscles: kbEx?.secondary_muscles || kbEx?.secondaryMuscles || ex.secondaryMuscles || []
          };
        });
      
      setExercises(inRange);
    }).catch(() => setExercises([])).finally(() => setLoading(false));
  }, [days]);

  return (
    <div className="pb-20">
      <div className="flex gap-2 mb-6">
        {DAYS_OPTIONS.map(d => (
          <button key={d} onClick={() => setDays(d)} 
            className="flex-1 p-3 rounded-xl text-xs font-bold border transition-all"
            style={{ 
              background: days === d ? 'rgba(94,234,212,0.1)' : 'var(--card)', 
              borderColor: days === d ? 'var(--accent)' : 'var(--line)',
              color: days === d ? 'var(--accent)' : 'var(--muted)'
            }}>{d} Tage Fokus</button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 opacity-30">
          <div className="spinner mb-4" />
          <p className="text-sm font-bold uppercase tracking-widest">Lade Muskel-Daten…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl border flex justify-center gap-12 bg-card border-line shadow-xl">
            <div className="text-center">
              <div className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-4">Anterior</div>
              <BodyMap exercises={exercises} highlightedColors={['#ef4444', '#f59e0b', '#22c55e', '#3b82f6']} style={{ maxWidth: 160 }} />
            </div>
            <div className="text-center">
              <div className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-4">Posterior</div>
              <BodyMap exercises={exercises} type="posterior" highlightedColors={['#ef4444', '#f59e0b', '#22c55e', '#3b82f6']} style={{ maxWidth: 160 }} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6 border-accent/20">
              <div className="label-caps mb-4">Analyse — {days} Tage</div>
              {exercises.length === 0 ? (
                <p className="text-sm opacity-40 py-4">Keine Trainingseinheiten im gewählten Zeitraum gefunden.</p>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm opacity-80 leading-relaxed">
                    Die Heatmap visualisiert die kumulierte Belastung Ihrer Muskulatur. 
                    Dunklere Farben stehen für höheres Volumen und Fokus in den letzten {days} Tagen.
                  </p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-xs">
                      <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                      <span className="opacity-60">Sehr hohe Belastung</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                      <span className="opacity-60">Hohe Belastung</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                      <span className="opacity-60">Moderate Belastung</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
                      <span className="opacity-60">Leichte Belastung</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="card bg-accent/5 border-accent/10">
              <h4 className="text-xs font-bold text-accent uppercase tracking-widest mb-2">💡 Tipp</h4>
              <p className="text-[11px] opacity-70">
                Nutzen Sie diese Ansicht, um Coverage-Gaps zu identifizieren. Blaue oder graue Bereiche 
                sollten im nächsten Training bevorzugt werden.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
