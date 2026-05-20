import { useEffect, useState } from "react";
import { getSession, getPlan } from "../db.js";

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Dashboard({ onNavigate }) {
  const [session, setSession] = useState(null);
  const [plan, setPlan] = useState(null);
  const today = todayISO();

  useEffect(() => {
    getSession(today).then(setSession);
    getPlan().then(setPlan);
  }, [today]);

  const done = session?.exercises?.filter((e) => e.done).length ?? 0;
  const total = session?.exercises?.length ?? 0;
  const block = session?.block || plan?.today?.block || "—";

  return (
    <>
      <h2>{today}</h2>

      <div className="card">
        <h3>Heutiger Block</h3>
        <p style={{ fontSize: 22, fontWeight: 700 }}>{block}</p>
        {total > 0 && (
          <p className="muted" style={{ marginTop: 6 }}>{done} / {total} Übungen</p>
        )}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn" style={{ flex: 1 }} onClick={() => onNavigate("session")}>
          Training starten
        </button>
        <button className="btn-ghost" onClick={() => onNavigate("weekly")}>
          Woche
        </button>
      </div>

      {session?.effort && (
        <div className="card" style={{ marginTop: 12 }}>
          <h3>Heutiges Training</h3>
          <p className="muted">Effort: {session.effort}/10</p>
          {session.notes && <p style={{ marginTop: 6 }}>{session.notes}</p>}
        </div>
      )}
    </>
  );
}
