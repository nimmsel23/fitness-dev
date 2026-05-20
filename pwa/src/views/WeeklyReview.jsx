import { useEffect, useState } from "react";
import { getRecentSessions } from "../db.js";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function WeeklyReview() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => { getRecentSessions(7).then(setSessions); }, []);

  const chartData = sessions.map((s) => ({
    date: s.date?.slice(5),
    exercises: s.exercises?.filter((e) => e.done).length ?? 0,
    effort: Number(s.effort) || 0,
  })).reverse();

  const totalDone = sessions.reduce((n, s) => n + (s.exercises?.filter((e) => e.done).length ?? 0), 0);
  const avgEffort = sessions.length
    ? (sessions.reduce((n, s) => n + (Number(s.effort) || 0), 0) / sessions.filter((s) => s.effort).length || 0).toFixed(1)
    : "—";

  return (
    <>
      <h2>Wochenrückblick</h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div className="card" style={{ flex: 1, textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: 700 }}>{sessions.length}</p>
          <p className="muted">Sessions</p>
        </div>
        <div className="card" style={{ flex: 1, textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: 700 }}>{totalDone}</p>
          <p className="muted">Übungen</p>
        </div>
        <div className="card" style={{ flex: 1, textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: 700 }}>{avgEffort}</p>
          <p className="muted">Ø Effort</p>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="card">
          <h3>Übungen pro Tag</h3>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#888aaa" }} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #2a2a4a" }} />
              <Bar dataKey="exercises" radius={4}>
                {chartData.map((_, i) => <Cell key={i} fill="#6c63ff" />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {sessions.map((s) => (
        <div key={s.date} className="card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{s.date}</strong>
            <span className="muted">{s.block || "—"}</span>
          </div>
          <p className="muted" style={{ marginTop: 4 }}>
            {s.exercises?.filter((e) => e.done).length ?? 0} Übungen
            {s.effort ? ` · Effort ${s.effort}` : ""}
          </p>
        </div>
      ))}
    </>
  );
}
