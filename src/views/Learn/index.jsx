import { useState, useEffect } from "react";
import { CheckCircle, RotateCcw, ChevronRight } from "lucide-react";
import { getAllExercises, getAnatomy, getMuscle, getLatestSession } from "@db";

import ExerciseLibrary from "./ExerciseLibrary";
import AnatDetail from "./AnatDetail";
import ExplorerHeader from "./ExplorerHeader";
import AnatomyExplorer from "./AnatomyExplorer";
import AnatomyDetailModal from "../../components/AnatomyDetailModal";
import PlanBuilder from "../../components/PlanBuilder.jsx";
import Muscles from "../Muscles/index.jsx";

// QuizMode
function QuizMode({ exercises, onExit }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    async function loadCards() {
      const all = [];
      for (const ex of exercises.slice(0, 8)) {
        const id = ex.exercise_id || ex.id;
        if (!id) continue;
        try {
          const lesson = await getAnatomy(id);
          const prompts = lesson?.quiz_prompts || lesson?.quiz || [];
          for (const q of prompts) {
            if (q?.question) all.push({ exercise: ex.name || id, question: q.question, answer: q.answer || '' });
          }
        } catch {}
      }
      setCards(all);
      setLoading(false);
    }
    loadCards();
  }, [exercises]);

  function answer(correct) {
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    setRevealed(false);
    setIdx(i => i + 1);
  }

  if (loading) return <div className="p-8 text-center text-sm text-dim">Quiz wird geladen…</div>;
  if (!cards.length) return (
    <div className="p-6 text-center space-y-3">
      <p className="text-sm text-dim">Keine Quiz-Fragen verfügbar für diese Übungen.</p>
      <button onClick={onExit} className="btn bg-bg2 border border-line text-ink px-6">Zurück</button>
    </div>
  );
  if (idx >= cards.length) return (
    <div className="card p-6 text-center space-y-4 shadow-xl border-line">
      <CheckCircle size={32} className="text-accent mx-auto" />
      <div className="text-lg font-black text-ink">Quiz beendet</div>
      <div className="text-sm font-bold opacity-50">{score.correct} / {score.total} richtig</div>
      <div className="flex gap-3 justify-center mt-4">
        <button onClick={() => { setIdx(0); setScore({ correct: 0, total: 0 }); setRevealed(false) }}
          className="btn bg-bg2 border border-line flex items-center gap-2 px-6">
          <RotateCcw size={14} /> Nochmal
        </button>
        <button onClick={onExit} className="btn bg-accent/10 border border-accent/20 text-accent px-6">
          Fertig
        </button>
      </div>
    </div>
  );

  const card = cards[idx];
  return (
    <div className="space-y-3 max-w-xl mx-auto">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-dim">
          {idx + 1} / {cards.length} · {card.exercise}
        </span>
        <button onClick={onExit} className="text-[10px] font-black uppercase tracking-widest text-dim hover:text-accent">Abbrechen</button>
      </div>
      <div className="card p-6 min-h-[160px] flex flex-col justify-between border border-line shadow-lg">
        <p className="text-sm font-medium leading-relaxed text-ink">{card.question}</p>
        {revealed ? (
          <div className="mt-6 pt-4 border-t border-line/50 space-y-4 animate-in fade-in">
            <p className="text-[11px] leading-relaxed text-dim">{card.answer}</p>
            <div className="flex gap-3">
              <button onClick={() => answer(false)} className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red/10 text-red border border-red/20 transition-all hover:bg-red/20">
                Nochmal
              </button>
              <button onClick={() => answer(true)} className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-accent/10 text-accent border border-accent/20 transition-all hover:bg-accent/20">
                Gewusst
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setRevealed(true)} className="mt-6 w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 bg-bg2 border border-line text-ink hover:border-accent transition-all">
            Antwort zeigen <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function Learn({ onInspectExercise, gender, muscleLanguage = 'de', taxonomy = null }) {
  const [exercises, setExercises] = useState([]);
  const [selected, setSelected]   = useState(null);
  const [viewMode, setViewMode]   = useState('library'); // 'library', 'explorer', or 'quiz'
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
    
    getLatestSession().then(s => {
      setRecent(s?.exercises || []);
    }).catch(() => {});
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

  if (viewMode === 'quiz') {
     return (
        <div className="pb-20 lg:pb-0 px-2">
           <ExplorerHeader viewMode={viewMode} setViewMode={setViewMode} />
           <QuizMode exercises={recent} onExit={() => setViewMode('library')} />
        </div>
     );
  }

  if (viewMode === 'analysis') {
    return (
      <div className="pb-20 lg:pb-0 px-2">
        <ExplorerHeader viewMode={viewMode} setViewMode={setViewMode} onStartQuiz={() => setViewMode('quiz')} hasRecent={recent.length > 0} />
        <Muscles gender={gender} muscleLanguage={muscleLanguage} taxonomy={taxonomy} />
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
                 if (onInspectExercise) onInspectExercise(ex);
              }}
              q={q}
              setQ={setQ}
              recent={recent}
              loading={loading}
            />
            
            {/* PlanBuilder integrated at the bottom of the library */}
            <div className="mt-12 pt-8 border-t border-line/50">
               <PlanBuilder onInspectExercise={onInspectExercise || setSelected} />
            </div>
          </div>

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
        muscleLanguage={muscleLanguage}
        taxonomy={taxonomy}
      />
    </div>
  );
}
