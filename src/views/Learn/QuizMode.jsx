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

  if (loading) return <div className="p-8 text-center text-sm text-fit-dim">Quiz wird geladen…</div>;

  if (!cards.length) return (
    <div className="p-6 text-center space-y-3">
      <p className="text-sm text-fit-dim">Keine Quiz-Fragen verfügbar für diese Übungen.</p>
      <button onClick={onExit} className="btn bg-fit-bg2 border border-fit-line text-fit-ink px-6">Zurück</button>
    </div>
  );

  if (idx >= cards.length) return (
    <div className="card p-6 text-center space-y-3 border-fit-line">
      <CheckCircle size={28} className="text-fit-accent mx-auto" />
      <div className="text-base font-bold text-fit-ink">Quiz beendet</div>
      <div className="text-sm" style={{ color: 'var(--dim)' }}>{score.correct} / {score.total} richtig</div>
      <div className="flex gap-2.5 justify-center mt-3">
        <button onClick={() => { setIdx(0); setScore({ correct: 0, total: 0 }); setRevealed(false); }}
          className="btn bg-fit-bg2 border border-fit-line flex items-center gap-2 px-5 text-sm font-semibold">
          <RotateCcw size={13} /> Nochmal
        </button>
        <button onClick={onExit} className="btn bg-fit-accent/10 border border-fit-accent/20 text-fit-accent px-5 text-sm font-semibold">
          Fertig
        </button>
      </div>
    </div>
  );

  const card = cards[idx];
  return (
    <div className="space-y-3 max-w-xl mx-auto">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-medium" style={{ color: 'var(--dim)' }}>
          {idx + 1} / {cards.length} · {card.exercise}
        </span>
        <button onClick={onExit} className="text-[11px] font-medium" style={{ color: 'var(--dim)' }}>Abbrechen</button>
      </div>
      <div className="card p-5 min-h-[160px] flex flex-col justify-between border border-fit-line">
        <p className="text-sm font-medium leading-relaxed text-fit-ink">{card.question}</p>
        {revealed ? (
          <div className="mt-5 pt-4 border-t border-fit-line/50 space-y-3 animate-in fade-in">
            <p className="text-[12px] leading-relaxed text-fit-dim">{card.answer}</p>
            <div className="flex gap-2.5">
              <button onClick={() => answer(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-fit-red/10 text-fit-red border border-fit-red/20 transition-all hover:bg-fit-red/20">
                Nochmal
              </button>
              <button onClick={() => answer(true)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-fit-accent/10 text-fit-accent border border-fit-accent/20 transition-all hover:bg-fit-accent/20">
                Gewusst
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setRevealed(true)} className="mt-5 w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-fit-bg2 border border-fit-line text-fit-ink hover:border-fit-accent transition-all">
            Antwort zeigen <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
