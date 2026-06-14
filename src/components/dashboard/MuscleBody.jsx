import BodyMap from "../BodyMap";
import DetailedMuscleMap from "../DetailedMuscleMap";

export default function MuscleBody({ enrichedRecent, recentDays = 7, highlighterMode = 'body', gender = 'male' }) {
  const safeRecent = Array.isArray(enrichedRecent) ? enrichedRecent.filter(Boolean) : [];
  const recentExercises = safeRecent
    .flatMap(s => Array.isArray(s?.exercises) ? s.exercises : [])
    .filter(Boolean)
    .filter(e => e.done);

  const isMuscles = highlighterMode === 'muscles';
  const HighlighterFront = isMuscles ? DetailedMuscleMap : BodyMap;
  const HighlighterBack  = isMuscles ? DetailedMuscleMap : BodyMap;

  const colors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6'];
  const frontProps = isMuscles
    ? { exercises: recentExercises, gender, side: 'front', colors }
    : { exercises: recentExercises, type: 'anterior', highlightedColors: colors, style: { maxWidth: 160 } };
  const backProps = isMuscles
    ? { exercises: recentExercises, gender, side: 'back', colors }
    : { exercises: recentExercises, type: 'posterior', highlightedColors: colors, style: { maxWidth: 160 } };

  return (
    <div className="alpha-card p-10 flex flex-col h-full bg-gradient-to-br from-[var(--card)] to-[var(--bg)]">
      <div className="flex items-center justify-between mb-8">
         <h3 className="label-caps !mb-0">Muskel-Status</h3>
         <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">
            {isMuscles ? 'detailed' : 'body'} · {recentDays} Tage
         </span>
      </div>
      <div className="flex flex-1 justify-center items-center gap-16 scale-110 origin-center">
        <HighlighterFront {...frontProps} />
        <HighlighterBack {...backProps} />
      </div>
    </div>
  );
}
