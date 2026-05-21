import { useEffect, useState } from "react";
import { getAllExercises, getAnatomy, getRecentSessions } from "../db.js";

const card = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 16, marginBottom: 12 };

function AnatDetail({ ex, onBack }) {
  const [anatomy, setAnatomy] = useState(null);
  const [error, setError]     = useState(false);

  useEffect(() => {
    if (!ex?.id) { setAnatomy({}); return; }
    getAnatomy(ex.id)
      .then(a => setAnatomy(a || {}))
      .catch(() => { setAnatomy({}); setError(true); });
  }, [ex?.id]);

  const name = ex?.display_name || ex?.name || "Übung";

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <button onClick={onBack} style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontWeight: 700, fontSize: 16 }}>
          ←
        </button>
        <h2 style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>{name}</h2>
      </div>

      {/* Muskeln */}
      <div style={{ ...card, display: "flex", flexWrap: "wrap", gap: 6 }}>
        {(ex?.primary_muscles || ex?.primaryMuscles || []).map(m => (
          <span key={m} style={{ background: "rgba(108,99,255,0.18)", color: "var(--accent)", borderRadius: 8, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{m}</span>
        ))}
        {(ex?.secondary_muscles || ex?.secondaryMuscles || []).map(m => (
          <span key={m} style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--muted)", borderRadius: 8, padding: "3px 10px", fontSize: 12 }}>{m}</span>
        ))}
      </div>

      {anatomy === null ? (
        <p style={{ color: "var(--muted)", textAlign: "center", padding: 24 }}>Laden…</p>
      ) : error ? (
        <p style={{ color: "var(--muted)", textAlign: "center", padding: 24 }}>Anatomie-Daten konnten nicht geladen werden</p>
      ) : (
        <>
          {(() => {
            const explanation = anatomy.trainer_explanation?.client_friendly
              || anatomy.trainer_explanation?.technical
              || anatomy.simple_explanation;
            const learningGoal = anatomy.learning_goal;
            const hasData = explanation || learningGoal
              || Array.isArray(anatomy.coaching_cues) && anatomy.coaching_cues.length > 0
              || Array.isArray(anatomy.common_errors) && anatomy.common_errors.length > 0
              || Array.isArray(anatomy.feel_cues) && anatomy.feel_cues.length > 0;

            return hasData ? (
              <>
                {explanation && (
                  <div style={card}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--muted)", marginBottom: 8 }}>Erklärung</div>
                    <p style={{ color: "var(--text)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{explanation}</p>
                  </div>
                )}

                {learningGoal && (
                  <div style={card}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--muted)", marginBottom: 8 }}>Lernziel</div>
                    <p style={{ color: "var(--text)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{learningGoal}</p>
                  </div>
                )}

                {Array.isArray(anatomy.coaching_cues) && anatomy.coaching_cues.length > 0 && (
                  <div style={card}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--muted)", marginBottom: 8 }}>Coaching Cues</div>
                    <ul style={{ paddingLeft: 18, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                      {anatomy.coaching_cues.map((c, i) => <li key={i} style={{ color: "var(--text)", fontSize: 14 }}>{String(c)}</li>)}
                    </ul>
                  </div>
                )}

                {Array.isArray(anatomy.feel_cues) && anatomy.feel_cues.length > 0 && (
                  <div style={card}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--muted)", marginBottom: 8 }}>Spüren</div>
                    <ul style={{ paddingLeft: 18, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                      {anatomy.feel_cues.map((c, i) => <li key={i} style={{ color: "var(--text)", fontSize: 14 }}>{String(c)}</li>)}
                    </ul>
                  </div>
                )}

                {Array.isArray(anatomy.common_errors) && anatomy.common_errors.length > 0 && (
                  <div style={card}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--muted)", marginBottom: 8 }}>Häufige Fehler</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {anatomy.common_errors.map((e, i) => (
                        <div key={i} style={{ borderLeft: "3px solid var(--accent)", paddingLeft: 12 }}>
                          <div style={{ color: "var(--text)", fontSize: 14, fontWeight: 600 }}>{e.error || String(e)}</div>
                          {e.correction && <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>{e.correction}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p style={{ color: "var(--muted)", textAlign: "center", padding: 24, fontSize: 13 }}>
                Noch keine Anatomie-Daten für diese Übung
              </p>
            );
          })()}
        </>
      )}
    </div>
  );
}

export default function Learn({ onNavigate }) {
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
    <div>
      <div style={card}>
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Übung suchen… z.B. Bankdrücken, Row, Squat"
          style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 10, padding: "8px 12px", fontSize: 14, boxSizing: "border-box" }}
        />
      </div>

      {recent.length > 0 && !q && (
        <div style={card}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--muted)", marginBottom: 10 }}>Letztes Training</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {recent.slice(0, 6).map((ex, i) => {
              const found = exercises.find(e => e.id === ex.exercise_id || (e.display_name || e.name) === (ex.name || ex.exercise_id));
              return (
                <button key={i} onClick={() => found && setSelected(found)}
                  style={{ background: "var(--bg)", border: "1px solid var(--border)", color: found ? "var(--text)" : "var(--muted)", borderRadius: 8, padding: "5px 12px", fontSize: 12, cursor: found ? "pointer" : "default" }}>
                  {ex.name || ex.exercise_id}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: "center", color: "var(--muted)", padding: 32 }}>Laden…</p>
      ) : (
        <>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8, paddingLeft: 2 }}>
            {filtered.length} Übungen
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.slice(0, 50).map(ex => (
              <button key={ex.id || ex.name} onClick={() => setSelected(ex)}
                style={{ textAlign: "left", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px", cursor: "pointer" }}>
                <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{ex.display_name || ex.name || ex.id}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  {(ex.primary_muscles || ex.primaryMuscles || []).join(", ")}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
