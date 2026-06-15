import BodyMap from "../../components/BodyMap.jsx";

export default function MuscleBodyMap({ hitMode, scores, volExercises, onGroupClick }) {
  const hitColors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];
  const volColors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6'];

  return (
    <>
      <div className="text-center relative z-10">
        <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20 mb-8 font-mono">Anterior</div>
        <BodyMap
          groupScores={hitMode ? scores : null}
          exercises={hitMode ? null : volExercises}
          highlightedColors={hitMode ? hitColors : volColors}
          style={{ maxWidth: 220 }}
          onGroupClick={onGroupClick}
        />
      </div>
      <div className="text-center relative z-10">
        <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20 mb-8 font-mono">Posterior</div>
        <BodyMap
          groupScores={hitMode ? scores : null}
          exercises={hitMode ? null : volExercises}
          type="posterior"
          highlightedColors={hitMode ? hitColors : volColors}
          style={{ maxWidth: 220 }}
          onGroupClick={onGroupClick}
        />
      </div>
    </>
  );
}
