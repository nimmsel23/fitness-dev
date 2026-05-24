import { useEffect, useState } from "react";
import { getSessionHistory } from "../db.js";
import BodyMap from "../components/BodyMap.jsx";

const DAYS_OPTIONS = [7, 14, 28];

export default function Muscles() {
  const [days, setDays]     = useState(7);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);

      useEffect(() => {
    setLoading(true);
    getSessionHistory(days * 2).then(sessions => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const cutoffStr = cutoff.toISOString().slice(0, 10);
      
      const inRange = sessions
        .filter(s => s.date >= cutoffStr)
        .flatMap(s => s.exercises || [])
        .filter(ex => ex.done);
      
      console.log("Muscles - session count:", sessions.length);
      console.log("Muscles - exercises found:", inRange.length);
      console.log("Muscles - first exercise:", inRange[0]);
      
      setExercises(inRange);
    }).catch(() => setExercises([])).finally(() => setLoading(false));
  }, [days]);

  return (
    <div className="pb-20">
      <div className="flex gap-2 mb-4">
        {DAYS_OPTIONS.map(d => (
          <button key={d} onClick={() => setDays(d)} 
            className="flex-1 p-2 rounded-xl text-xs font-bold border transition-all"
            style={{ 
              background: days === d ? 'rgba(94,234,212,0.1)' : 'var(--card)', 
              borderColor: days === d ? 'var(--accent)' : 'var(--line)',
              color: days === d ? 'var(--accent)' : 'var(--muted)'
            }}>{d}d</button>
        ))}
      </div>

      {loading ? (
        <p className="text-center py-12 text-sm opacity-40">Lade Muskel-Daten…</p>
      ) : (
        <>
          <div className="p-6 rounded-2xl border mb-6 flex justify-center gap-12" style={{ background: 'var(--card)', borderColor: 'var(--line)' }}>
            <div className="text-center">
              <div className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-2">Vorne</div>
              <BodyMap exercises={exercises} highlightedColors={['#ef4444', '#f59e0b', '#22c55e', '#3b82f6']} style={{ maxWidth: 140 }} />
            </div>
            <div className="text-center">
              <div className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-2">Hinten</div>
              <BodyMap exercises={exercises} type="posterior" highlightedColors={['#ef4444', '#f59e0b', '#22c55e', '#3b82f6']} style={{ maxWidth: 140 }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl border" style={{ background: 'var(--card)', borderColor: 'var(--line)' }}>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-4">Übersicht — {days} Tage</div>
            {exercises.length === 0 ? (
              <p className="text-sm opacity-40 text-center py-4">Keine Daten vorhanden.</p>
            ) : (
              <p className="text-xs opacity-60 leading-relaxed">
                Diese Map zeigt die kumulierte Belastung basierend auf primären und sekundären Muskelgruppen der letzten {days} Tage.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
