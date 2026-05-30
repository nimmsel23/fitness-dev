import { useState, useEffect } from "react";
import { getAllExercises, getAnatomy, getRecentSessions } from "../../db.js";

import ExerciseLibrary from "./ExerciseLibrary";
import AnatDetail from "./AnatDetail";

export default function Learn() {
  const [exercises, setExercises] = useState([]);
  const [selected, setSelected]   = useState(null);
  const [q, setQ]                 = useState("");
  const [recent, setRecent]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [anatomy, setAnatomy]     = useState(null);
  const [anatLoading, setAnatLoading] = useState(false);

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

  return (
    <div className="pb-20 lg:pb-0 px-2">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
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

      {/* Mobile Detail Modal Overlay */}
      {selected && (
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
    </div>
  );
}
