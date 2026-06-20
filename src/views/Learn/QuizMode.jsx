import { useState, useEffect } from "react";
import { CheckCircle, RotateCcw, ChevronRight } from "lucide-react";
import { getAnatomy } from "@db";

export default function QuizMode({ exercises, onExit }) {
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
        <button onClick={() => { setIdx(0); setScore({ correct: 0, total: 0 }); setRevealed(false); }}
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
