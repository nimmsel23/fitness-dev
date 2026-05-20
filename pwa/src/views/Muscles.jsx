import { useEffect, useState } from "react";
import { getRecentSessions } from "../db.js";
import Model from "react-body-highlighter";

export default function Muscles() {
  const [data, setData] = useState([]);

  useEffect(() => {
    getRecentSessions(7).then((sessions) => {
      const muscleMap = {};
      for (const s of sessions) {
        for (const ex of s.exercises || []) {
          if (!ex.done) continue;
          for (const m of ex.primaryMuscles || []) {
            if (!muscleMap[m]) muscleMap[m] = { muscle: m, exercises: [], frequency: 0 };
            muscleMap[m].exercises.push(ex.name || ex.exercise_id);
            muscleMap[m].frequency += 1;
          }
        }
      }
      setData(Object.values(muscleMap));
    });
  }, []);

  return (
    <>
      <h2>Muskel-Coverage</h2>
      <p className="muted" style={{ marginBottom: 12 }}>Letzte 7 Tage</p>

      <div className="card" style={{ display: "flex", justifyContent: "center", gap: 24 }}>
        <Model data={data} style={{ width: 130 }} />
        <Model data={data} type="posterior" style={{ width: 130 }} />
      </div>

      {data.length > 0 && (
        <div className="card">
          {data.sort((a, b) => b.frequency - a.frequency).map((m) => (
            <div key={m.muscle} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
              <span>{m.muscle}</span>
              <span className="muted">{m.frequency}×</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
