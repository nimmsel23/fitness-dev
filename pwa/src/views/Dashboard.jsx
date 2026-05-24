import { useState, useEffect } from "react";
import { Zap, TrendingUp, AlertCircle, Download, Activity, Dumbbell } from "lucide-react";
import { getSession, getRecentSessions, getPlan, getLatestSession, getCoverageGaps, exportCsv } from "../db.js";
import HabitWidget from "../components/HabitWidget.jsx";
import WeightChart from "../components/WeightChart.jsx";

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
  const day = (today.getDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - day + i);
    return d.toISOString().slice(0, 10);
  });
}

export default function Dashboard({ onNavigate }) {
  const [todaySession, setTodaySession] = useState(null);
  const [recent, setRecent] = useState([]);
  const [plan, setPlan] = useState(null);
  const [coverage, setCoverage] = useState(null);
  const [lastSession, setLastSession] = useState(null);
  const [exportToast, setExportToast] = useState('');

  const today = todayISO();
  const weekDates = getWeekDates();

  useEffect(() => {
    getSession(today).then(setTodaySession).catch(() => setTodaySession({}));
    getPlan().then(setPlan).catch(() => setPlan(null));
    getRecentSessions(10).then(setRecent).catch(() => setRecent([]));
    getLatestSession().then(setLastSession).catch(() => setLastSession(null));
    getCoverageGaps(7).then(setCoverage).catch(() => setCoverage([]));
  }, [today]);

  const sessionByDate = Object.fromEntries(recent.map(s => [s.date, s]));

  async function handleExport(days) {
    try {
      await exportCsv(days);
      setExportToast(`Export: ${days} Tage`);
      setTimeout(() => setExportToast(''), 1800);
    } catch {
      setExportToast('Export fehlgeschlagen');
      setTimeout(() => setExportToast(''), 1800);
    }
  }

  return (
    <div className="pb-20">
      {/* Exports & Quick actions */}
      <div className="mb-4 p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Dashboard</div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport(30)}
              className="text-xs px-3 py-2 rounded-xl border font-semibold flex items-center gap-2"
              style={{ background: 'var(--bg2)', border: '1px solid var(--line)', color: 'var(--ink)' }}
            >
              <Download size={14} /> CSV
            </button>
          </div>
        </div>
      </div>

      {/* Week Heatmap */}
      <div className="mb-4 p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
        <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>Diese Woche</h3>
        <div className="grid grid-cols-7 gap-1.5">
          {weekDates.map((date, i) => {
            const s = sessionByDate[date];
            const done = !!s?.block;
            const isToday = date === today;
            const color = done ? blockColor(s.block) : null;
            return (
              <div key={date} className="flex flex-col items-center gap-1">
                <button
                  onClick={() => done && onNavigate?.("session", date)}
                  className="w-full aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-all"
                  style={{
                    background: done ? (color + '33') : 'var(--bg2)',
                    border: isToday ? `1.5px solid ${color || 'var(--accent)'}` : '1.5px solid transparent',
                    color: done ? color : 'var(--dim)',
                    cursor: done ? 'pointer' : 'default',
                  }}
                >
                  {done ? "✓" : "·"}
                </button>
                <span className="text-[9px] font-semibold" style={{ color: isToday ? 'var(--accent)' : 'var(--dim)' }}>
                  {DAY_LABELS[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <WeightChart days={30} />

      {/* Plan-Hint */}
      {plan?.today && (
        <div className="mb-4 p-4 rounded-2xl" style={{ background: 'linear-gradient(180deg, var(--card), var(--bg2))', border: '1px solid var(--line)' }}>
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <Zap size={15} style={{ color: 'var(--accent)' }} />
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Plan heute</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 mb-1">
            <div className="font-extrabold text-lg" style={{ color: 'var(--ink)', color: blockColor(plan.today.block) || 'var(--accent)' }}>
              {plan.today.block}
            </div>
            <button
              onClick={() => onNavigate?.("session")}
              className="text-xs px-3 py-2 rounded-xl font-semibold"
              style={{ background: 'rgba(94,234,212,0.12)', border: '1px solid rgba(94,234,212,0.28)', color: 'var(--accent)' }}
            >
              Starten →
            </button>
          </div>
          {plan.today.exercises?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {plan.today.exercises.slice(0, 6).map((e, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-lg" style={{ background: 'var(--bg2)', color: 'var(--muted)' }}>
                  {typeof e === "string" ? e : e.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Coverage Gaps */}
      {coverage !== null && (
        <div className="mb-4 p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={15} style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Coverage (7 Tage)</span>
          </div>
          {coverage.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--green)' }}>✓ Alle Muskelgruppen abgedeckt</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {coverage.map(g => (
                <span key={g.name} className="text-xs px-2 py-0.5 rounded-lg flex items-center gap-1"
                  style={{ background: 'var(--red)' + '22', color: 'var(--red)' }}>
                  <AlertCircle size={10} />
                  {g.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <HabitWidget />

      {/* Heutige Session Status */}
      {todaySession?.exercises?.length > 0 && (
        <div className="mb-4 p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
          <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>Heute — {todaySession.block}</div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-4">
              <div className="flex flex-col">
                <span className="text-lg font-bold" style={{ color: 'var(--ink)' }}>
                  {todaySession.exercises.filter(e => e.done).length}/{todaySession.exercises.length}
                </span>
                <span className="text-[10px] uppercase font-bold text-dim">Übungen</span>
              </div>
              {todaySession.effort && (
                <div className="flex flex-col">
                  <span className="text-lg font-bold" style={{ color: 'var(--ink)' }}>{todaySession.effort}</span>
                  <span className="text-[10px] uppercase font-bold text-dim">Effort</span>
                </div>
              )}
            </div>
            <button onClick={() => onNavigate?.("session")} className="px-4 py-2 bg-accent text-white rounded-xl font-bold text-sm">
              Weiter →
            </button>
          </div>
        </div>
      )}

      {/* Letzte Sessions */}
      {recent.filter(s => s.date !== today).length > 0 && (
        <div className="mb-4 p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>Letzte Sessions</h3>
          <div className="flex flex-col gap-2">
            {recent.filter(s => s.date !== today).slice(0, 4).map(s => (
              <button key={s.date} onClick={() => onNavigate?.("session", s.date)}
                className="w-full text-left px-3 py-2 rounded-xl"
                style={{ background: 'var(--bg2)', border: '1px solid var(--line)', cursor: 'pointer' }}>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{s.date}</div>
                  <div className="text-xs font-semibold" style={{ color: blockColor(s.block) || 'var(--accent)' }}>{s.block}</div>
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                  {s.exercises?.filter(e => e.done).length ?? 0} Übungen
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {exportToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-medium shadow-xl z-50"
          style={{ background: 'var(--card)', color: 'var(--accent)', border: '1px solid var(--line)' }}>
          {exportToast}
        </div>
      )}
    </div>
  );
}
