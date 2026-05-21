import { useEffect, useState } from "react";
import { getRecentSessions } from "../db.js";
import Model from "react-body-highlighter";

const DAYS_OPTIONS = [7, 14, 28];
const card = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 16, marginBottom: 12 };

export default function Muscles() {
  const [days, setDays]     = useState(7);
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getRecentSessions(days * 2).then(sessions => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const inRange = sessions.filter(s => s.date >= cutoff.toISOString().slice(0, 10));

      const muscleMap = {};
      for (const s of inRange) {
        for (const ex of s.exercises || []) {
          if (!ex.done) continue;
          for (const m of ex.primaryMuscles || []) {
            if (!muscleMap[m]) muscleMap[m] = { muscle: m, exercises: [], frequency: 0 };
            if (!muscleMap[m].exercises.includes(ex.name || ex.exercise_id))
              muscleMap[m].exercises.push(ex.name || ex.exercise_id);
            muscleMap[m].frequency += 1;
          }
          for (const m of ex.secondaryMuscles || []) {
            if (!muscleMap[m]) muscleMap[m] = { muscle: m, exercises: [], frequency: 0 };
            muscleMap[m].frequency += 0.5;
          }
        }
      }
      setData(Object.values(muscleMap));
    }).catch(() => setData([])).finally(() => setLoading(false));
  }, [days]);

  const sorted = [...data].sort((a, b) => b.frequency - a.frequency);
  const maxFreq = sorted[0]?.frequency || 1;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {DAYS_OPTIONS.map(d => (
          <button key={d} onClick={() => setDays(d)} style={{
            flex: 1, padding: "8px", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer",
            background: days === d ? "rgba(108,99,255,0.18)" : "var(--surface)",
            color: days === d ? "var(--accent)" : "var(--muted)",
            border: `1px solid ${days === d ? "rgba(108,99,255,0.5)" : "var(--border)"}`,
          }}>{d}d</button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "var(--muted)", padding: 24 }}>Laden…</p>
      ) : (
        <>
          <div style={{ ...card, display: "flex", justifyContent: "center", gap: 24 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "var(--muted)", marginBottom: 4 }}>VORNE</div>
              <Model data={data} style={{ width: 120 }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "var(--muted)", marginBottom: 4 }}>HINTEN</div>
              <Model data={data} type="posterior" style={{ width: 120 }} />
            </div>
          </div>

          {sorted.length > 0 ? (
            <div style={card}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--muted)", marginBottom: 10 }}>
                Coverage — {days} Tage
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {sorted.map(m => (
                  <div key={m.muscle}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 13, color: "var(--text)" }}>{m.muscle}</span>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>{m.frequency.toFixed(1)}×</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 4, background: "var(--border)" }}>
                      <div style={{ height: "100%", borderRadius: 4, background: "var(--accent)", width: `${(m.frequency / maxFreq) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ textAlign: "center", color: "var(--muted)", padding: 24 }}>
              Keine erledigten Übungen in den letzten {days} Tagen
            </p>
          )}
        </>
      )}
    </div>
  );
}
