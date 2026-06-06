import { BarChart3 } from 'lucide-react';

export default function ReviewTopExercises({ topExercises = [], onInspectExercise }) {
  function openTopExercise(ex) {
    onInspectExercise?.({
      ...ex,
      name: ex.display_name || ex.exercise_id,
      displayName: ex.display_name || ex.exercise_id,
      category: ex.source_file ? ex.source_file.replace(/\.yml$/i, '') : 'Weekly Review',
      primaryMuscles: ex.primary_muscles || ex.primaryMuscles || [],
      secondaryMuscles: ex.secondary_muscles || ex.secondaryMuscles || [],
      stabilizers: ex.stabilizers || [],
      variations: ex.variations || [],
      coachingNotes: ex.coaching_notes || [],
      commonErrors: ex.common_errors || [],
      tags: ex.tags || [],
      movementPattern: ex.movement_pattern || '',
      lesson: ex.lesson || null,
    });
  }

  return (
    <section className="card mb-0 shadow-lg border-line/50 p-6">
      <div className="label-caps !mb-6 flex items-center gap-2">
        <BarChart3 size={16} className="text-accent" />
        Top Exercises
      </div>
      <div className="space-y-3">
        {topExercises.slice(0, 6).map(ex => (
          <button
            key={ex.exercise_id || ex.display_name}
            onClick={() => openTopExercise(ex)}
            className="w-full text-left p-4 rounded-2xl border bg-bg2 border-line hover:border-accent/50 transition-all flex items-center justify-between group"
          >
            <span className="text-xs font-bold text-ink group-hover:text-accent truncate pr-4">{ex.display_name || ex.exercise_id}</span>
            <span className="text-xs font-black text-accent bg-accent/10 px-2.5 py-1 rounded-lg border border-accent/20">{ex.count}x</span>
          </button>
        ))}
        {topExercises.length === 0 && (
          <div className="py-8 text-center text-[10px] font-black opacity-30 uppercase tracking-[0.2em] border border-dashed rounded-3xl">Keine Top Exercises</div>
        )}
      </div>
    </section>
  );
}
