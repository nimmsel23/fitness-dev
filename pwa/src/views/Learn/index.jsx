import { useState, useEffect } from "react";
import { getAllExercises, getAnatomy, getRecentSessions, getMuscle } from "../../db.js";

import ExerciseLibrary from "./ExerciseLibrary";
import AnatDetail from "./AnatDetail";
import ExplorerHeader from "./ExplorerHeader";
import AnatomyExplorer from "./AnatomyExplorer";
import AnatomyDetailModal from "../../components/AnatomyDetailModal";

export default function Learn() {
  const [exercises, setExercises] = useState([]);
  const [selected, setSelected]   = useState(null);
  const [viewMode, setViewMode]   = useState('library'); // 'library' or 'explorer'
  const [q, setQ]                 = useState("");
  const [recent, setRecent]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [anatomy, setAnatomy]     = useState(null);
  const [anatLoading, setAnatLoading] = useState(false);

  // Muscle Explorer State
  const [selectedMuscleId, setSelectedMuscleId] = useState(null);
  const [muscleData, setMuscleData] = useState(null);
  const [muscleLoading, setMuscleLoading] = useState(false);

  useEffect(() => {
    getAllExercises()
      .then(exs => { setExercises(exs); setLoading(false); })
      .catch(() => setLoading(false));
    getRecentSessions(1)
      .then(ss => setRecent(ss[0]?.exercises || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected?.exercise_id) { setAnatomy({}); return; }
    setAnatLoading(true);
    getAnatomy(selected.exercise_id)
      .then(a => setAnatomy(a || {}))
      .catch(() => { setAnatomy({}); })
      .finally(() => setAnatLoading(false));
  }, [selected?.exercise_id]);

  useEffect(() => {
    if (!selectedMuscleId) { setMuscleData(null); return; }
    setMuscleLoading(true);
    getMuscle(selectedMuscleId)
      .then(d => setMuscleData(d || null))
      .catch(() => setMuscleData(null))
      .finally(() => setMuscleLoading(false));
  }, [selectedMuscleId]);

  return (
    <div className="pb-20 lg:pb-0 px-2">
      <ExplorerHeader viewMode={viewMode} setViewMode={setViewMode} />

      {viewMode === 'library' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-300">
          <ExerciseLibrary 
            exercises={exercises}
            selected={selected}
            setSelected={setSelected}
            q={q}
            setQ={setQ}
            recent={recent}
            loading={loading}
          />

          <div className="hidden lg:block sticky top-6 h-fit">
            <div className="card h-full min-h-[700px] border-accent/10 shadow-2xl p-8 bg-gradient-to-b from-card to-bg2 overflow-hidden relative">
              <AnatDetail 
                  ex={selected} 
                  anatomy={anatomy}
                  loading={anatLoading}
                  isEmbedded={true} 
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in duration-300 max-w-5xl mx-auto">
           <AnatomyExplorer 
              exercises={exercises} 
              onMuscleClick={setSelectedMuscleId} 
           />
        </div>
      )}

      {/* Mobile Exercise Detail Overlay */}
      {selected && viewMode === 'library' && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-[var(--bg)] p-6 overflow-y-auto animate-in slide-in-from-bottom duration-300">
          <AnatDetail 
            ex={selected} 
            anatomy={anatomy}
            loading={anatLoading}
            onBack={() => setSelected(null)} 
            isEmbedded={false} 
          />
        </div>
      )}

      {/* Anatomy Detail Modal (Shared) */}
      <AnatomyDetailModal 
        muscleId={selectedMuscleId}
        muscleData={muscleData}
        loading={muscleLoading}
        onClose={() => setSelectedMuscleId(null)}
      />
    </div>
  );
}
