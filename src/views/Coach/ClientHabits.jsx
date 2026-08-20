import { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import { getClientRoutinesProgress } from '@db';
import { computeHabitProgress } from '../../lib/habitProgress';

// Read-only Coach-Ansicht auf die Habit-Vorgaben eines Klienten (Routinen
// mit targetCount/targetPeriodDays, siehe views/Plan/WorkoutList.jsx, wo der
// Klient das selbst konfiguriert). Coach beobachtet nur — Zuweisen/Ändern
// von Routinen-Zielen ist (noch) nicht Teil des Coach-Tabs.
export default function ClientHabits({ clientUid }) {
  const [routines, setRoutines] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getClientRoutinesProgress(clientUid).then(({ routines, workouts }) => {
      if (!alive) return;
      setRoutines(routines);
      setWorkouts(workouts);
      setLoading(false);
    });
    return () => { alive = false; };
  }, [clientUid]);

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 border-2 border-fit-accent/30 border-t-fit-accent rounded-full animate-spin" />
    </div>
  );

  const { rows, allMet } = computeHabitProgress(routines, workouts);

  if (rows.length === 0) return (
    <div className="card py-16 flex flex-col items-center justify-center text-center" style={{ opacity: 0.5 }}>
      <Target size={40} className="mb-3 text-fit-dim" />
      <h3 className="text-base font-semibold text-fit-ink">Keine Habit-Ziele</h3>
      <p className="text-xs mt-1 max-w-sm" style={{ color: 'var(--dim)' }}>
        Dieser Klient hat noch keiner Routine eine Ziel-Häufigkeit gegeben (Training → Plan → Routine → "Ziel festlegen").
      </p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl border p-4 ${allMet ? 'bg-green-500/10 border-green-500/30' : 'bg-fit-bg2 border-fit-line'}`}>
        <div className="flex items-center gap-2 mb-3">
          <Target size={16} className={allMet ? 'text-green-500' : 'text-fit-accent'} />
          <h3 className="text-sm font-semibold text-fit-ink">Pensum {allMet ? 'erfüllt ✓' : ''}</h3>
        </div>
        <div className="space-y-2">
          {rows.map(({ routine: r, done }) => {
            const met = done >= r.targetCount;
            return (
              <div key={r.id} className="flex items-center justify-between text-sm">
                <span className="font-medium text-fit-ink">{r.name}</span>
                <span className={met ? 'text-green-500 font-semibold' : 'text-fit-dim'}>
                  {done}/{r.targetCount} in {r.targetPeriodDays} Tagen {met && '✓'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
