import { useEffect, useState } from "react";
import { getAllExercises, getAnatomy } from "../db.js";

export default function Learn() {
  const [exercises, setExercises] = useState([]);
  const [selected, setSelected] = useState(null);
  const [anatomy, setAnatomy] = useState(null);

  useEffect(() => { getAllExercises().then(setExercises); }, []);

  async function load(ex) {
    setSelected(ex);
    setAnatomy(null);
    const a = await getAnatomy(ex.id);
    setAnatomy(a);
  }

  if (selected) return (
    <>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
        <button className="btn-ghost" onClick={() => setSelected(null)}>←</button>
        <h2 style={{ margin: 0 }}>{selected.display_name || selected.name}</h2>
      </div>

      {!anatomy ? <p className="muted">Laden…</p> : (
        <>
          {anatomy.origin && (
            <div className="card">
              <h3>Ursprung</h3>
              <p>{anatomy.origin}</p>
            </div>
          )}
          {anatomy.insertion && (
            <div className="card">
              <h3>Ansatz</h3>
              <p>{anatomy.insertion}</p>
            </div>
          )}
          {anatomy.innervation && (
            <div className="card">
              <h3>Innervation</h3>
              <p>{anatomy.innervation}</p>
            </div>
          )}
          {anatomy.trainer_explanation?.simple && (
            <div className="card">
              <h3>Erklärung</h3>
              <p>{anatomy.trainer_explanation.simple}</p>
            </div>
          )}
          {anatomy.coaching_cues?.length > 0 && (
            <div className="card">
              <h3>Coaching Cues</h3>
              <ul style={{ paddingLeft: 16 }}>
                {anatomy.coaching_cues.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}
          {anatomy.common_errors?.length > 0 && (
            <div className="card">
              <h3>Häufige Fehler</h3>
              <ul style={{ paddingLeft: 16 }}>
                {anatomy.common_errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
        </>
      )}
    </>
  );

  return (
    <>
      <h2>Anatomie-Lehre</h2>
      <p className="muted" style={{ marginBottom: 12 }}>{exercises.length} Übungen</p>
      {exercises.map((ex) => (
        <div key={ex.id} className="card" style={{ cursor: "pointer" }} onClick={() => load(ex)}>
          <strong>{ex.display_name || ex.name}</strong>
          <p className="muted">{(ex.primary_muscles || []).join(", ")}</p>
        </div>
      ))}
    </>
  );
}
