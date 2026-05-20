import { useEffect, useState } from "react";
import { getSession, saveSession, getPlan } from "../db.js";
import Model from "react-body-highlighter";

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Session() {
  const [session, setSession] = useState(null);
  const [saving, setSaving] = useState(false);
  const today = todayISO();

  useEffect(() => {
    Promise.all([getSession(today), getPlan()]).then(([s, plan]) => {
      if (s.exercises.length === 0 && plan?.today?.exercises) {
        setSession({ ...s, block: plan.today.block, exercises: plan.today.exercises });
      } else {
        setSession(s);
      }
    });
  }, [today]);

  if (!session) return <p className="muted">Laden…</p>;

  const doneExercises = session.exercises.filter((e) => e.done);
  const highlightData = doneExercises.flatMap((e) => [
    ...(e.primaryMuscles || []).map((m) => ({ muscle: m, exercises: [e.name || e.exercise_id] })),
    ...(e.secondaryMuscles || []).map((m) => ({ muscle: m, exercises: [e.name || e.exercise_id] })),
  ]);

  function toggle(idx) {
    const exercises = session.exercises.map((e, i) =>
      i === idx ? { ...e, done: !e.done } : e
    );
    setSession({ ...session, exercises });
  }

  function updateField(idx, field, value) {
    const exercises = session.exercises.map((e, i) =>
      i === idx ? { ...e, [field]: value } : e
    );
    setSession({ ...session, exercises });
  }

  async function save() {
    setSaving(true);
    await saveSession(today, session);
    setSaving(false);
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2>{session.block || "Training"}</h2>
        <button className="btn" onClick={save} disabled={saving}>
          {saving ? "…" : "Speichern"}
        </button>
      </div>

      {session.exercises.map((ex, i) => (
        <div key={i} className="card" style={{ opacity: ex.done ? 1 : 0.6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>{ex.name || ex.exercise_id}</strong>
            <input type="checkbox" checked={!!ex.done} onChange={() => toggle(i)}
              style={{ width: 20, height: 20, cursor: "pointer" }} />
          </div>
          {ex.isHIT ? (
            <p className="muted" style={{ marginTop: 4 }}>HIT — bis Muskelversagen</p>
          ) : (
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              {["sets", "reps", "weight"].map((f) => (
                <input key={f} placeholder={f} value={ex[f] || ""} style={{ flex: 1 }}
                  onChange={(e) => updateField(i, f, e.target.value)} />
              ))}
            </div>
          )}
        </div>
      ))}

      {doneExercises.length > 0 && (
        <div className="card">
          <h3>Aktivierte Muskeln</h3>
          <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
            <Model data={highlightData} style={{ width: 120 }} />
            <Model data={highlightData} type="posterior" style={{ width: 120 }} />
          </div>
        </div>
      )}

      <div className="card">
        <h3>Session</h3>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input placeholder="Effort 1-10" value={session.effort || ""}
            onChange={(e) => setSession({ ...session, effort: e.target.value })} />
          <input placeholder="Stimmung" value={session.mood || ""}
            onChange={(e) => setSession({ ...session, mood: e.target.value })} />
        </div>
        <textarea placeholder="Notizen…" value={session.notes || ""}
          onChange={(e) => setSession({ ...session, notes: e.target.value })} />
      </div>
    </>
  );
}
