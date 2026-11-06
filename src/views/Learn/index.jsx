import { useState, useEffect } from "react";
import { getAllExercises, getAnatomy, getMuscle, getLatestSession, queueForEnrichment } from "@db";

import ExerciseLibrary from "./ExerciseLibrary";
import AnatDetail from "./AnatDetail";
import ExplorerHeader from "./ExplorerHeader";
import AnatomyExplorer from "./AnatomyExplorer";
import QuizMode from "./QuizMode";
import StrengthMatrix from "./StrengthMatrix";
import AnatomyDetailModal from "@fitness/components/AnatomyDetailModal";
import PlanBuilder from "@fitness/components/PlanBuilder.jsx";

export default function Learn({ subTab = null, onInspectExercise, muscleLanguage = 'de', taxonomy = null }) {
  const [exercises, setExercises] = useState([]);
  const [selected, setSelected]   = useState(null);
  const [viewMode, setViewMode]   = useState('library'); // 'library', 'explorer', 'quiz' or 'strength'
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
    if (subTab === 'quiz') {
      setViewMode('quiz');
      return;
    }
    if (subTab === 'anatomy') {
      setViewMode('explorer');
      return;
    }
    if (subTab === 'strength') {
      setViewMode('strength');
      return;
    }
    if (subTab === 'exercises') {
      setViewMode('library');
    }
  }, [subTab]);

  useEffect(() => {
    getAllExercises()
      .then(exs => { setExercises(exs); setLoading(false); })
      .catch(() => setLoading(false));

    getLatestSession().then(s => {
      setRecent(s?.exercises || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    // Anatomie-Lessons gibt es nur für reviewte (expert) Übungen — alle anderen
    // zeigen die Katalogdaten (wger/yuhonas) ohne Lesson-Abruf.
    const reviewed = selected?.source === 'expert' || (selected?.tags || []).includes('expert');
    if (!selected?.exercise_id || !reviewed) { setAnatomy({}); setAnatLoading(false); return; }
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

  if (viewMode === 'quiz') {
     return (
        <div className="pb-20 lg:pb-0 px-2">
           <ExplorerHeader viewMode={viewMode} setViewMode={setViewMode} />
           <QuizMode exercises={recent} onExit={() => setViewMode('library')} />
        </div>
     );
  }


  if (viewMode === 'strength') {
     return (
        <div className="pb-20 lg:pb-0 px-2">
           <ExplorerHeader viewMode={viewMode} setViewMode={setViewMode} onStartQuiz={() => setViewMode('quiz')} hasRecent={recent.length > 0} />
           <StrengthMatrix />
        </div>
     );
  }

  return (
    <div className="pb-20 lg:pb-0 px-2">
      <ExplorerHeader viewMode={viewMode} setViewMode={setViewMode} onStartQuiz={() => setViewMode('quiz')} hasRecent={recent.length > 0} />

      {viewMode === 'library' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-300">
          <div className="space-y-8">
            <ExerciseLibrary
              exercises={exercises}
              selected={selected}
              setSelected={(ex) => {
                 setSelected(ex);
                 if (ex && ex.source !== 'expert') queueForEnrichment(ex) // Katalog-Daten bleiben Basis; Lesson nur für reviewte Übungen
                 if (onInspectExercise) onInspectExercise(ex);
              }}
              q={q}
              setQ={setQ}
              recent={recent}
              loading={loading}
            />

            {/* PlanBuilder integrated at the bottom of the library */}
            <div className="mt-12 pt-8 border-t border-fit-line/50">
               <PlanBuilder onInspectExercise={onInspectExercise || setSelected} />
            </div>
          </div>

          <div className="hidden lg:block sticky top-6 h-fit">
            <div className="card h-full min-h-[700px] border-fit-accent/10 shadow-2xl p-8 bg-gradient-to-b from-fit-card to-fit-bg2 overflow-hidden relative">
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
              selectedExercise={selected}
              onMuscleClick={setSelectedMuscleId}
           />
        </div>
      )}

      {/* Mobile Exercise Detail Overlay */}
      {selected && viewMode === 'library' && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-fit-bg p-6 overflow-y-auto animate-in slide-in-from-bottom duration-300">
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
      {/* Nur der Explorer setzt selectedMuscleId — im Library-Modus nicht mitrendern */}
      {viewMode === 'explorer' && (
        <AnatomyDetailModal
          muscleId={selectedMuscleId}
          muscleData={muscleData}
          loading={muscleLoading}
          onClose={() => setSelectedMuscleId(null)}
          muscleLanguage={muscleLanguage}
          taxonomy={taxonomy}
        />
      )}
    </div>
  );
}
