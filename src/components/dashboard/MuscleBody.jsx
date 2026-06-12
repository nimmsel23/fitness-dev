import { Dumbbell } from "lucide-react";
import BodyMap from "../BodyMap";

export default function MuscleBody({ enrichedRecent, recentDays = 7, highlighterMode = 'body' }) {
  const safeRecent = Array.isArray(enrichedRecent) ? enrichedRecent.filter(Boolean) : [];
  const recentExercises = safeRecent
    .flatMap(s => Array.isArray(s?.exercises) ? s.exercises : [])
    .filter(Boolean)
    .filter(e => e.done);

  const muscleHits = new Map();
  recentExercises.forEach(ex => {
    (ex.primaryMuscles || []).forEach(m => muscleHits.set(m, (muscleHits.get(m) || 0) + 2));
    (ex.secondaryMuscles || []).forEach(m => muscleHits.set(m, (muscleHits.get(m) || 0) + 1));
  });
  const muscleList = [...muscleHits.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="card p-8 flex flex-col h-full">
      <h3 className="label-caps mb-8">Muskel-Status</h3>
      {highlighterMode === 'muscles' ? (
        <div className="flex-1 flex flex-col">
          {muscleList.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-dim text-sm font-bold opacity-50">
              Keine Sessions in den letzten {recentDays} Tagen
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 content-start">
              {muscleList.map(([name, score]) => (
                <span key={name} className="text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl flex items-center gap-2"
                  style={{ background: 'var(--accent)' + '15', color: 'var(--accent)', border: '1px solid var(--accent)30' }}>
                  <Dumbbell size={12} />
                  {name}
                  <span className="opacity-60">×{score}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-1 justify-center items-center gap-12">
          <BodyMap exercises={recentExercises} highlightedColors={['#ef4444', '#f59e0b', '#22c55e', '#3b82f6']} style={{ maxWidth: 160 }} />
          <BodyMap exercises={recentExercises} type="posterior" highlightedColors={['#ef4444', '#f59e0b', '#22c55e', '#3b82f6']} style={{ maxWidth: 160 }} />
        </div>
      )}
    </div>
  );
}
