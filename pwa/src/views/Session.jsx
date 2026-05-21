import { useEffect, useState, useRef } from "react";
import { getSession, saveSession, getAllExercises } from "../db.js";
import Model from "react-body-highlighter";

const BLOCKS = ["Push", "Pull", "Legs", "Upper", "Lower", "Full Body"];

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function ExercisePicker({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [q, setQ]       = useState("");
  const [all, setAll]   = useState([]);
  const ref             = useRef();

  useEffect(() => {
    if (open && all.length === 0) getAllExercises().then(setAll).catch(() => {});
  }, [open]);

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = q.length < 2 ? [] : all.filter(ex =>
    (ex.display_name || ex.name || "").toLowerCase().includes(q.toLowerCase())
  ).slice(0, 10);

  function pick(ex) {
    onAdd({
      exercise_id: ex.id,
      name: ex.display_name || ex.name,
      sets: "", reps: "", weight: "", note: "",
      primaryMuscles: ex.primary_muscles || ex.primaryMuscles || [],
      secondaryMuscles: ex.secondary_muscles || ex.secondaryMuscles || [],
      done: true,
    });
    setQ(""); setOpen(false);
  }

  return (
    <div ref={ref} style={{ position: "relative", marginBottom: 10 }}>
      <input
        placeholder="Übung hinzufügen…"
        value={q}
        onFocus={() => setOpen(true)}
        onChange={e => { setQ(e.target.value); setOpen(true); }}
        style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 14 }}
      />
      {open && filtered.length > 0 && (
        <div style={{
          position: "absolute", zIndex: 100, width: "100%",
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, marginTop: 4, maxHeight: 280, overflowY: "auto",
        }}>
          {filtered.map(ex => (
            <div key={ex.id} onClick={() => pick(ex)} style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontWeight: 600, color: "var(--text)" }}>{ex.display_name || ex.name}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{(ex.primary_muscles || []).join(", ")}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Session() {
  const [date, setDate]       = useState(todayISO());
  const [session, setSession] = useState(null);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState("");

  useEffect(() => {
    const empty = { date, block: "", exercises: [], effort: "", mood: "", notes: "" };
    getSession(date)
      .then(s => setSession({ ...empty, ...s }))
      .catch(() => setSession(empty));
  }, [date]);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 2000); }

  if (!session) return <p style={{ color: "var(--muted)", padding: 24 }}>Laden…</p>;

  const highlightData = (session.exercises || []).flatMap(e => [
    ...(e.primaryMuscles || []).map(m => ({ muscle: m, exercises: [e.name || e.exercise_id] })),
    ...(e.secondaryMuscles || []).map(m => ({ muscle: m, exercises: [e.name || e.exercise_id] })),
  ]);

  function addExercise(ex) {
    setSession(s => ({ ...s, exercises: [...(s.exercises || []), ex] }));
  }

  function removeExercise(idx) {
    setSession(s => ({ ...s, exercises: s.exercises.filter((_, i) => i !== idx) }));
  }

  function updateField(idx, field, value) {
    setSession(s => ({ ...s, exercises: s.exercises.map((e, i) => i === idx ? { ...e, [field]: value } : e) }));
  }

  async function save() {
    setSaving(true);
    try {
      await saveSession(date, { ...session, exercises: session.exercises.map(e => ({ ...e, done: true })) });
      showToast("Gespeichert ✓");
    } catch { showToast("Fehler beim Speichern"); }
    finally { setSaving(false); }
  }

  const totalVol = (session.exercises || []).reduce((sum, ex) => {
    const s = parseFloat(ex.sets), r = parseFloat(ex.reps), w = parseFloat(ex.weight);
    return (isFinite(s) && isFinite(r) && isFinite(w)) ? sum + s * r * w : sum;
  }, 0);

  return (
    <div>
      {/* Datum + Speichern */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input type="date" value={date} max={todayISO()} onChange={e => setDate(e.target.value)}
          style={{ flex: 1, padding: "10px 14px", borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 15, fontWeight: 600 }} />
        <button onClick={save} disabled={saving}
          style={{ padding: "10px 20px", background: "linear-gradient(135deg,#22d3ee,#14b8a6)", color: "#062026", borderRadius: 12, border: "none", fontWeight: 800, fontSize: 13, cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1, whiteSpace: "nowrap" }}>
          {saving ? "…" : "Speichern"}
        </button>
      </div>

      {/* Block */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        {BLOCKS.map(b => (
          <button key={b} onClick={() => setSession(s => ({ ...s, block: b }))}
            style={{ padding: "8px 14px", borderRadius: 10, fontWeight: 700, fontSize: 13, textTransform: "uppercase", cursor: "pointer", border: `2px solid ${session.block === b ? "var(--accent)" : "var(--border)"}`, background: session.block === b ? "rgba(108,99,255,0.1)" : "var(--surface)", color: session.block === b ? "var(--accent)" : "var(--muted)" }}>
            {b}
          </button>
        ))}
      </div>

      {/* BodyMap */}
      {highlightData.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 20, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 14, marginBottom: 12 }}>
          <Model data={highlightData} style={{ width: 110 }} />
          <Model data={highlightData} type="posterior" style={{ width: 110 }} />
        </div>
      )}

      {/* Exercises */}
      <ExercisePicker onAdd={addExercise} />

      {(session.exercises || []).length === 0 && (
        <p style={{ textAlign: "center", color: "var(--muted)", padding: "24px 0", fontSize: 14 }}>
          Übung suchen und hinzufügen
        </p>
      )}

      {(session.exercises || []).map((ex, i) => (
        <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderLeft: "3px solid var(--accent)", borderRadius: 14, padding: 14, marginBottom: 10, position: "relative" }}>
          <button onClick={() => removeExercise(i)}
            style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "2px 6px" }}>×</button>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, paddingRight: 24 }}>{ex.name || ex.exercise_id}</div>
          {(ex.primaryMuscles || []).length > 0 && (
            <div style={{ fontSize: 11, color: "var(--accent)", opacity: 0.7, marginBottom: 10 }}>{ex.primaryMuscles.slice(0, 2).join(" · ")}</div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 16px 1fr 16px 1fr", alignItems: "center", gap: 6, marginBottom: 8 }}>
            {["sets", "reps", "weight"].map((f, fi) => (
              <>
                {fi > 0 && <div style={{ textAlign: "center", color: "var(--muted)", fontSize: 14 }}>{fi === 1 ? "×" : "@"}</div>}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }} key={f}>
                  <input type="text" inputMode={f === "weight" ? "decimal" : "numeric"} placeholder="—" value={ex[f] || ""}
                    onChange={e => updateField(i, f, e.target.value)}
                    style={{ width: "100%", textAlign: "center", fontFamily: "monospace", fontSize: 26, fontWeight: 800, padding: "6px 4px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", outline: "none" }} />
                  <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>{{ sets: "Sätze", reps: "Wdhl", weight: "kg" }[f]}</span>
                </div>
              </>
            ))}
          </div>
          {totalVol > 0 && ex.sets && ex.reps && ex.weight && (
            <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace", textAlign: "right" }}>
              {Math.round(parseFloat(ex.sets) * parseFloat(ex.reps) * parseFloat(ex.weight)).toLocaleString("de-AT")} kg
            </div>
          )}
          <input type="text" placeholder="Notiz, RPE…" value={ex.note || ""} onChange={e => updateField(i, "note", e.target.value)}
            style={{ width: "100%", padding: "6px 10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--muted)", fontSize: 12, boxSizing: "border-box", marginTop: 6 }} />
        </div>
      ))}

      {totalVol > 0 && (
        <div style={{ textAlign: "right", fontSize: 12, fontFamily: "monospace", color: "var(--muted)", fontWeight: 700, marginBottom: 8 }}>
          Total: {Math.round(totalVol).toLocaleString("de-AT")} kg
        </div>
      )}

      {/* Qualität */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 14, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", flexShrink: 0 }}>Effort</span>
          <input type="range" min={1} max={10} value={session.effort || 5} onChange={e => setSession(s => ({ ...s, effort: e.target.value }))}
            style={{ flex: 1, accentColor: "var(--accent)" }} />
          <span style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 800, color: "var(--accent)", minWidth: 24 }}>{session.effort || 5}</span>
        </div>
        <textarea rows={3} placeholder="Gefühl, Technik, Schmerzen…" value={session.notes || ""}
          onChange={e => setSession(s => ({ ...s, notes: e.target.value }))}
          style={{ width: "100%", padding: "8px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: "var(--surface)", color: "var(--accent)", border: "1px solid var(--border)", borderRadius: 12, padding: "8px 18px", fontSize: 13, fontWeight: 600, zIndex: 50, whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
