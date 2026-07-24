import { useState, useEffect } from 'react';
import { getMuscle } from '@db';
import AnatomyDetailModal from '../../components/AnatomyDetailModal.jsx';
import DetailedMuscleMap from '../../components/DetailedMuscleMap.jsx';

export default function AnatomyInline({ exercises }) {
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

  if (!exercises.length) return null;

  return (
    <>
      <section id="anatomy-check" className="mt-4 bg-fit-card border border-fit-line rounded-[32px] shadow-xl overflow-hidden scroll-mt-24">
        <div className="p-6 border-b border-fit-line/50">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-fit-accent mb-1">Anatomie-Check</h3>
          <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Muskel anklicken für Details</p>
        </div>

        <div className="p-8 flex justify-center gap-12 bg-gradient-to-b from-card to-bg2">
          <div className="flex flex-col items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-20">Anterior</span>
            <DetailedMuscleMap exercises={exercises} side="front" style={{ width: '160px' }} onGroupClick={setSelectedMuscleId} />
          </div>
          <div className="flex flex-col items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-20">Posterior</span>
            <DetailedMuscleMap exercises={exercises} side="back" style={{ width: '160px' }} onGroupClick={setSelectedMuscleId} />
          </div>
        </div>
      </section>

      <AnatomyDetailModal
        muscleId={selectedMuscleId}
        muscleData={muscleData}
        loading={muscleLoading}
        onClose={() => setSelectedMuscleId(null)}
      />
    </>
  );
}
