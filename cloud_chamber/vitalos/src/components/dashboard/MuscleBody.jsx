import { useState, useEffect } from "react";
import BodyMap from "../BodyMap";
import DetailedMuscleMap from "../DetailedMuscleMap";
import AnatomyDetailModal from "../AnatomyDetailModal";
import { getMuscle } from "@db";

export default function MuscleBody({ enrichedRecent, recentDays = 7, highlighterMode = 'body', gender = 'male' }) {
  const safeRecent = Array.isArray(enrichedRecent) ? enrichedRecent.filter(Boolean) : [];
  const recentExercises = safeRecent
    .flatMap(s => Array.isArray(s?.exercises) ? s.exercises : [])
    .filter(Boolean);

  const [selectedMuscleId, setSelectedMuscleId] = useState(null);
  const [muscleData, setMuscleData] = useState(null);
  const [muscleLoading, setMuscleLoading] = useState(false);

  useEffect(() => {
    if (!selectedMuscleId) { setMuscleData(null); return; }
    setMuscleLoading(true);
    getMuscle(selectedMuscleId)
      .then(d => setMuscleData(d || null))
      .catch(() => setMuscleData(null))
      .finally(() => setMuscleLoading(false));
  }, [selectedMuscleId]);

  const isMuscles = highlighterMode === 'muscles';
  const colors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6'];
  const frontProps = isMuscles
    ? { exercises: recentExercises, gender, side: 'front', colors, onGroupClick: setSelectedMuscleId }
    : { exercises: recentExercises, type: 'anterior', highlightedColors: colors, style: { maxWidth: 160 }, onGroupClick: setSelectedMuscleId };
  const backProps = isMuscles
    ? { exercises: recentExercises, gender, side: 'back', colors, onGroupClick: setSelectedMuscleId }
    : { exercises: recentExercises, type: 'posterior', highlightedColors: colors, style: { maxWidth: 160 }, onGroupClick: setSelectedMuscleId };

  const HighlighterFront = isMuscles ? DetailedMuscleMap : BodyMap;
  const HighlighterBack  = isMuscles ? DetailedMuscleMap : BodyMap;

  return (
    <div className="alpha-card p-10 flex flex-col h-full bg-gradient-to-br from-fit-card to-fit-bg">
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

      <AnatomyDetailModal
        muscleId={selectedMuscleId}
        muscleData={muscleData}
        loading={muscleLoading}
        onClose={() => setSelectedMuscleId(null)}
      />
    </div>
  );
}
