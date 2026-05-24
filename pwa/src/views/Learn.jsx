import { useEffect, useState } from "react";
import { getAllExercises, getAnatomy, getRecentSessions } from "../db.js";

function AnatDetail({ ex, onBack }) {
  const [anatomy, setAnatomy] = useState(null);
  const [error, setError]     = useState(false);

  useEffect(() => {
    if (!ex?.exercise_id) { setAnatomy({}); return; }
    getAnatomy(ex.exercise_id)
      .then(a => setAnatomy(a || {}))
      .catch(() => { setAnatomy({}); setError(true); });
  }, [ex?.exercise_id]);

  const name = ex?.display_name || ex?.name || "Übung";

  return (
    <div className="pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl border font-bold" style={{ background: 'var(--card)', borderColor: 'var(--line)', color: 'var(--ink)' }}>
          ←
        </button>
        <h2 className="text-xl font-black">{name}</h2>
      </div>

      <div className="p-4 rounded-2xl border mb-4 flex flex-wrap gap-2" style={{ background: 'var(--card)', borderColor: 'var(--line)' }}>
        {(ex?.primary_muscles || ex?.primaryMuscles || []).map(m => (
          <span key={m} className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg" style={{ background: 'rgba(94,234,212,0.1)', color: 'var(--accent)' }}>{m}</span>
        ))}
        {(ex?.secondary_muscles || ex?.secondaryMuscles || []).map(m => (
          <span key={m} className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg" style={{ background: 'var(--bg2)', color: 'var(--muted)' }}>{m}</span>
        ))}
      </div>

      {anatomy === null ? (
        <p className="text-center py-12 text-sm opacity-40">Lade Anatomie…</p>
      ) : (
        <div className="space-y-4">
           {anatomy.trainer_explanation?.client_friendly && (
             <div className="p-4 rounded-2xl border" style={{ background: 'var(--card)', borderColor: 'var(--line)' }}>
               <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">Erklärung</div>
               <p className="text-sm leading-relaxed">{anatomy.trainer_explanation.client_friendly}</p>
             </div>
           )}
           {Array.isArray(anatomy.coaching_notes) && anatomy.coaching_notes.length > 0 && (
             <div className="p-4 rounded-2xl border" style={{ background: 'var(--card)', borderColor: 'var(--line)' }}>
               <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-3">Coaching Notes</div>
               <ul className="space-y-2">
                 {anatomy.coaching_notes.map((c, i) => (
                   <li key={i} className="text-sm flex gap-3">
                     <span className="text-accent font-bold">•</span>
                     <span>{c}</span>
                   </li>
                 ))}
               </ul>
             </div>
           )}
        </div>
      )}
    </div>
  );
}

export default function Learn() {
  const [exercises, setExercises] = useState([]);
  const [selected, setSelected]   = useState(null);
  const [q, setQ]                 = useState("");
  const [recent, setRecent]       = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    getAllExercises()
      .then(exs => { setExercises(exs); setLoading(false); })
      .catch(() => setLoading(false));
    getRecentSessions(1)
      .then(ss => setRecent(ss[0]?.exercises || []))
      .catch(() => {});
  }, []);

  if (selected) {
    return <AnatDetail ex={selected} onBack={() => setSelected(null)} />;
  }

  const filtered = q.length >= 2
    ? exercises.filter(ex => (ex.display_name || ex.name || "").toLowerCase().includes(q.toLowerCase()))
    : exercises;

  return (
    <div className="pb-20">
      <div className="p-4 rounded-2xl border mb-6" style={{ background: 'var(--card)', borderColor: 'var(--line)' }}>
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Übung suchen…"
          className="w-full bg-transparent border-none outline-none text-sm"
          style={{ color: 'var(--ink)' }}
        />
      </div>

      {recent.length > 0 && !q && (
        <div className="mb-6">
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1 mb-3">Letztes Training</div>
          <div className="flex flex-wrap gap-2">
            {recent.slice(0, 6).map((ex, i) => {
              const found = exercises.find(e => e.exercise_id === ex.exercise_id || (e.display_name || e.name) === (ex.name || ex.exercise_id));
              return (
                <button key={i} onClick={() => found && setSelected(found)}
                  className="px-3 py-2 rounded-xl border text-[11px] font-bold transition-all"
                  style={{ background: 'var(--card)', borderColor: 'var(--line)', color: found ? 'var(--ink)' : 'var(--muted)' }}>
                  {ex.name || ex.exercise_id}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-center py-12 text-sm opacity-40">Lade Übungen…</p>
      ) : (
        <div className="space-y-2">
          <div className="text-[10px] font-bold opacity-30 ml-1 mb-2">{filtered.length} Übungen</div>
          {filtered.slice(0, 50).map(ex => (
            <button key={ex.exercise_id} onClick={() => setSelected(ex)}
              className="w-full text-left p-4 rounded-2xl border transition-all"
              style={{ background: 'var(--card)', borderColor: 'var(--line)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}>
              <div className="font-bold text-sm" style={{ color: 'var(--ink)' }}>{ex.display_name || ex.name}</div>
              <div className="text-[10px] font-bold opacity-40 uppercase tracking-wider mt-1">
                {(ex.primary_muscles || ex.primaryMuscles || []).slice(0, 3).join(", ")}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
