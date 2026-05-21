import { useEffect, useState } from "react";
import { getRecentSessions } from "../db.js";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const BLOCK_COLORS = {
  push: "#f472b6", pull: "#34d399", legs: "#fb923c",
  upper: "#38bdf8", lower: "#a78bfa", full: "#fbbf24",
};

function blockColor(block) {
  if (!block) return "var(--accent)";
  for (const [key, color] of Object.entries(BLOCK_COLORS)) {
    if (block.toLowerCase().includes(key)) return color;
  }
  return "var(--accent)";
}

const card = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 16, marginBottom: 12 };
const statCard = { flex: 1, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px", textAlign: "center" };

export default function WeeklyReview({ onNavigate }) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    getRecentSessions(14).then(setSessions).catch(() => setSessions([]));
  }, []);

  const thisWeek = (() => {
    const today = new Date();
    const day   = (today.getDay() + 6) % 7;
    const monday = new Date(today); monday.setDate(today.getDate() - day);
    return sessions.filter(s => s.date >= monday.toISOString().slice(0, 10));
  })();

  const totalDone   = thisWeek.reduce((n, s) => n + (s.exercises?.filter(e => e.done).length ?? 0), 0);
  const effortVals  = thisWeek.filter(s => s.effort).map(s => Number(s.effort));
  const avgEffort   = effortVals.length ? (effortVals.reduce((a, b) => a + b, 0) / effortVals.length).toFixed(1) : "—";

  const chartData = [...thisWeek].reverse().map(s => ({
    date: s.date?.slice(5),
    exercises: s.exercises?.filter(e => e.done).length ?? 0,
    block: s.block,
  }));

  const muscleFreq = {};
  for (const s of thisWeek) {
    for (const ex of s.exercises || []) {
      if (!ex.done) continue;
      for (const m of ex.primaryMuscles || []) {
        muscleFreq[m] = (muscleFreq[m] || 0) + 1;
      }
    }
  }
  const muscleEntries = Object.entries(muscleFreq).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div style={statCard}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text)" }}>{thisWeek.length}</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>Sessions</div>
        </div>
        <div style={statCard}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text)" }}>{totalDone}</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>Übungen</div>
        </div>
        <div style={statCard}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--accent)" }}>{avgEffort}</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>Ø Effort</div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div style={card}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--muted)", marginBottom: 10 }}>
            Übungen pro Tag
          </div>
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted)" }} />
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Bar dataKey="exercises" radius={4}>
                {chartData.map((d, i) => <Cell key={i} fill={blockColor(d.block)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Muskel-Frequenz */}
      {muscleEntries.length > 0 && (
        <div style={card}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--muted)", marginBottom: 10 }}>
            Muskeln diese Woche
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {muscleEntries.map(([m, n]) => (
              <span key={m} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "4px 10px", fontSize: 12, color: "var(--text)" }}>
                {m} <span style={{ color: "var(--muted)" }}>{n}×</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sessions */}
      {thisWeek.length > 0 && (
        <div style={card}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--muted)", marginBottom: 10 }}>
            Sessions
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {thisWeek.map(s => (
              <button key={s.date} onClick={() => onNavigate?.("session", s.date)}
                style={{ textAlign: "left", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{s.date}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: blockColor(s.block) }}>{s.block || "—"}</span>
                </div>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>
                  {s.exercises?.filter(e => e.done).length ?? 0} Übungen
                  {s.effort ? ` · Effort ${s.effort}` : ""}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {thisWeek.length === 0 && (
        <p style={{ textAlign: "center", color: "var(--muted)", padding: "32px 0" }}>
          Noch keine Sessions diese Woche
        </p>
      )}
    </div>
  );
}
