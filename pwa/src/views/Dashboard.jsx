import { useState, useEffect } from "react";
import { Zap, TrendingUp, AlertCircle, Download, Activity, Dumbbell } from "lucide-react";
import { getSession, getRecentSessions, getPlan, getLatestSession, getCoverageGaps, exportCsv, getAllExercises } from "../db.js";
import HabitWidget from "../components/HabitWidget.jsx";
import WeightChart from "../components/WeightChart.jsx";
import BodyMap from "../components/BodyMap.jsx";

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
  const [enrichedRecent, setEnrichedRecent] = useState([]);
  const [plan, setPlan] = useState(null);
  const [coverage, setCoverage] = useState(null);
  const [lastSession, setLastSession] = useState(null);
  const [exportToast, setExportToast] = useState('');

  const today = todayISO();
  const weekDates = getWeekDates();

  useEffect(() => {
    getSession(today).then(setTodaySession).catch(() => setTodaySession({}));
    getPlan().then(setPlan).catch(() => setPlan(null));
    getLatestSession().then(setLastSession).catch(() => setLastSession(null));
    getCoverageGaps(7).then(setCoverage).catch(() => setCoverage([]));
    
    Promise.all([
      getRecentSessions(10),
      getAllExercises()
    ]).then(([sessions, kbExercises]) => {
      setRecent(sessions);
      
      const kbMap = new Map();
      kbExercises.forEach(ex => {
        kbMap.set((ex.display_name || ex.name).toLowerCase(), ex);
      });
      
      const enriched = sessions.map(s => ({
        ...s,
        exercises: (s.exercises || []).map(ex => {
          const kbEx = kbMap.get((ex.name || "").toLowerCase());
          return {
            ...ex,
            primaryMuscles: kbEx?.primary_muscles || kbEx?.primaryMuscles || ex.primaryMuscles || [],
            secondaryMuscles: kbEx?.secondary_muscles || kbEx?.secondaryMuscles || ex.secondaryMuscles || []
          };
        })
      }));
      setEnrichedRecent(enriched);
    });
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
      <div className="mb-4 card">
        <div className="flex items-center justify-between">
          <div className="label-caps">Dashboard</div>
          <div className="flex gap-2">
            <button onClick={() => handleExport(30)} className="btn btn-secondary py-2 text-xs">
              <Download size={14} /> CSV
            </button>
          </div>
        </div>
      </div>

      {/* Week Heatmap */}
      <div className="mb-4 card">
        <h3 className="label-caps mb-3">Diese Woche</h3>
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

      <div className="mb-4 card">
        <h3 className="label-caps mb-3">Muskel-Coverage</h3>
        <div className="flex justify-center gap-4">
          <BodyMap exercises={enrichedRecent.flatMap(s => s.exercises || []).filter(e => e.done)} highlightedColors={['#ef4444', '#f59e0b', '#22c55e', '#3b82f6']} style={{ maxWidth: 100 }} />
          <BodyMap exercises={enrichedRecent.flatMap(s => s.exercises || []).filter(e => e.done)} type="posterior" highlightedColors={['#ef4444', '#f59e0b', '#22c55e', '#3b82f6']} style={{ maxWidth: 100 }} />
        </div>
      </div>

      <WeightChart days={30} />

      {/* Plan-Hint */}
      {plan?.today && (
        <div className="mb-4 card" style={{ background: 'linear-gradient(180deg, var(--card), var(--bg2))' }}>
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <Zap size={15} className="text-accent" />
              <span className="label-caps">Plan heute</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 mb-1">
            <div className="font-extrabold text-lg" style={{ color: blockColor(plan.today.block) || 'var(--accent)' }}>
              {plan.today.block}
            </div>
            <button
              onClick={() => onNavigate?.("session")}
              className="btn btn-primary py-2 text-xs"
              style={{ background: 'rgba(94,234,212,0.12)', border: '1px solid rgba(94,234,212,0.28)', color: 'var(--accent)' }}
            >
              Starten →
            </button>
          </div>
          {plan.today.exercises?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {plan.today.exercises.slice(0, 6).map((e, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-lg bg-bg2 text-muted">
                  {typeof e === "string" ? e : e.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Coverage Gaps */}
      {coverage !== null && (
        <div className="mb-4 card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={15} className="text-accent" />
            <span className="label-caps">Coverage (7 Tage)</span>
          </div>
          {coverage.length === 0 ? (
            <p className="text-sm text-green">✓ Alle Muskelgruppen abgedeckt</p>
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
        <div className="mb-4 card">
          <div className="label-caps mb-3">Heute — {todaySession.block}</div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-4">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-ink">
                  {todaySession.exercises.filter(e => e.done).length}/{todaySession.exercises.length}
                </span>
                <span className="label-caps">Übungen</span>
              </div>
              {todaySession.effort && (
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-ink">{todaySession.effort}</span>
                  <span className="label-caps">Effort</span>
                </div>
              )}
            </div>
            <button onClick={() => onNavigate?.("session")} className="btn btn-primary">
              Weiter →
            </button>
          </div>
        </div>
      )}

      {/* Letzte Sessions */}
      {recent.filter(s => s.date !== today).length > 0 && (
        <div className="mb-4 card">
          <h3 className="label-caps mb-3">Letzte Sessions</h3>
          <div className="flex flex-col gap-2">
            {recent.filter(s => s.date !== today).slice(0, 4).map(s => (
              <button key={s.date} onClick={() => onNavigate?.("session", s.date)}
                className="w-full text-left px-3 py-2 rounded-xl bg-bg2 border border-line cursor-pointer">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-ink">{s.date}</div>
                  <div className="text-xs font-semibold" style={{ color: blockColor(s.block) || 'var(--accent)' }}>{s.block}</div>
                </div>
                <div className="text-[11px] mt-0.5 text-muted">
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
