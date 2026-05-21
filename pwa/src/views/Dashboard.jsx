import { useState, useEffect } from "react";
import { getSession, getRecentSessions, getPlan } from "../db.js";

const DAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const BLOCK_COLORS = {
  push: "#f472b6", pull: "#34d399", legs: "#fb923c",
  upper: "#38bdf8", lower: "#a78bfa", full: "#fbbf24",
};

function blockColor(block) {
  if (!block) return null;
  for (const [key, color] of Object.entries(BLOCK_COLORS)) {
    if (block.toLowerCase().includes(key)) return color;
  }
  return "var(--accent)";
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getWeekDates() {
  const today = new Date();
  const day   = (today.getDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - day + i);
    return d.toISOString().slice(0, 10);
  });
}

const card = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 16, marginBottom: 12 };
const label = { fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--muted)", marginBottom: 10 };

export default function Dashboard({ onNavigate }) {
  const [todaySession, setTodaySession] = useState(null);
  const [recent, setRecent]             = useState([]);
  const [plan, setPlan]                 = useState(null);
  const today = todayISO();
  const weekDates = getWeekDates();

  useEffect(() => {
    getSession(today).then(setTodaySession).catch(() => setTodaySession({}));
    getPlan().then(setPlan).catch(() => setPlan(null));
    getRecentSessions(10).then(setRecent).catch(() => setRecent([]));
  }, [today]);

  const sessionByDate = Object.fromEntries(recent.map(s => [s.date, s]));

  return (
    <div>
      {/* Woche */}
      <div style={card}>
        <div style={label}>Diese Woche</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
          {weekDates.map((date, i) => {
            const s       = sessionByDate[date];
            const done    = !!s?.block;
            const isToday = date === today;
            const color   = done ? blockColor(s.block) : null;
            return (
              <div key={date} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <button
                  onClick={() => done && onNavigate?.("session", date)}
                  style={{
                    width: "100%", aspectRatio: "1", borderRadius: 8, border: isToday ? `1.5px solid ${color || "var(--accent)"}` : "1.5px solid transparent",
                    background: done ? (color + "33") : "var(--bg)", color: done ? color : "var(--muted)",
                    cursor: done ? "pointer" : "default", fontSize: 11, fontWeight: 700,
                  }}
                >
                  {done ? "✓" : "·"}
                </button>
                <span style={{ fontSize: 9, fontWeight: 700, color: isToday ? "var(--accent)" : "var(--muted)" }}>
                  {DAY_LABELS[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan-Hint */}
      {plan?.today && (
        <div style={card}>
          <div style={label}>Plan heute</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: blockColor(plan.today.block) || "var(--accent)" }}>
              {plan.today.block}
            </span>
            <button
              onClick={() => onNavigate?.("session")}
              style={{ background: "rgba(108,99,255,0.15)", border: "1px solid rgba(108,99,255,0.4)", color: "var(--accent)", borderRadius: 10, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              Starten →
            </button>
          </div>
          {plan.today.exercises?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {plan.today.exercises.slice(0, 6).map((e, i) => (
                <span key={i} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "3px 10px", fontSize: 12, color: "var(--muted)" }}>
                  {typeof e === "string" ? e : e.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Heutige Session */}
      {todaySession?.exercises?.length > 0 && (
        <div style={card}>
          <div style={label}>Heute — {todaySession.block}</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>
              {todaySession.exercises.filter(e => e.done).length}/{todaySession.exercises.length} erledigt
            </span>
            {todaySession.effort && <span style={{ fontSize: 13, color: "var(--muted)" }}>· Effort {todaySession.effort}/10</span>}
          </div>
          <button onClick={() => onNavigate?.("session")} style={{ width: "100%", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 10, padding: "10px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            Weiter trainieren
          </button>
        </div>
      )}

      {!todaySession?.exercises?.length && (
        <button onClick={() => onNavigate?.("session")} style={{ width: "100%", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontWeight: 700, fontSize: 15, cursor: "pointer", marginBottom: 12 }}>
          Training starten
        </button>
      )}

      {/* Letzte Sessions */}
      {recent.filter(s => s.date !== today).length > 0 && (
        <div style={card}>
          <div style={label}>Letzte Sessions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {recent.filter(s => s.date !== today).slice(0, 4).map(s => (
              <button key={s.date} onClick={() => onNavigate?.("session", s.date)}
                style={{ textAlign: "left", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{s.date}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: blockColor(s.block) || "var(--accent)" }}>{s.block}</span>
                </div>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>
                  {s.exercises?.filter(e => e.done).length ?? 0} Übungen
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
