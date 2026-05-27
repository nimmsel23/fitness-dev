import { useState, useEffect } from "react";
import { Zap, TrendingUp, AlertCircle, Download, Activity, Dumbbell, Bike, Waves, Footprints, Timer } from "lucide-react";
import { getSession, getRecentSessions, getPlan, getLatestSession, getCoverageGaps, exportCsv, getAllExercises } from "../db.js";
import HabitWidget from "../components/HabitWidget.jsx";
import WeightChart from "../components/WeightChart.jsx";
import BodyMap from "../components/BodyMap.jsx";

const BLOCK_COLORS = {
  push: "#f472b6", pull: "#34d399", legs: "#fb923c",
  upper: "#38bdf8", lower: "#a78bfa", full: "#fbbf24",
  hiking: "#48c87a", running: "#e05060", cycling: "#38bdf8", swimming: "#5294e2"
};

const ACTIVITY_LABELS = {
  hiking: "Wandern",
  running: "Laufen",
  cycling: "Radfahren",
  swimming: "Schwimmen"
};

const ACTIVITY_ICONS = {
  hiking: Footprints,
  running: Footprints,
  cycling: Bike,
  swimming: Waves
};

function blockColor(block, activity) {
  if (activity?.type && BLOCK_COLORS[activity.type]) return BLOCK_COLORS[activity.type];
  if (!block) return "var(--accent)";
  for (const [key, color] of Object.entries(BLOCK_COLORS)) {
    if (block.toLowerCase().includes(key)) return color;
  }
  return "var(--accent)";
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getRolling10Days() {
  const dates = [];
  const today = new Date();
  for (let i = 9; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

const DAY_LABELS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

export default function Dashboard({ onNavigate }) {
  const [todaySession, setTodaySession] = useState(null);
  const [recent, setRecent] = useState([]);
  const [enrichedRecent, setEnrichedRecent] = useState([]);
  const [plan, setPlan] = useState(null);
  const [coverage, setCoverage] = useState(null);
  const [lastSession, setLastSession] = useState(null);
  const [exportToast, setExportToast] = useState('');

  const today = todayISO();
  const rollingDays = getRolling10Days();

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Week Heatmap */}
        <div className="card mb-0">
          <h3 className="label-caps mb-3">Aktivität (10 Tage)</h3>
          <div className="grid grid-cols-5 lg:grid-cols-10 gap-1.5">
            {rollingDays.map((date) => {
              const s = sessionByDate[date];
              const done = !!(s?.block || s?.activity);
              const isToday = date === today;
              const color = done ? blockColor(s.block, s.activity) : null;
              const dayName = DAY_LABELS[new Date(date).getDay()];
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
                  <span className="text-[8px] font-bold opacity-40 uppercase">
                    {dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coverage Gaps */}
        <div className="card mb-0 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={15} className="text-accent" />
            <span className="label-caps">Coverage (7 Tage)</span>
          </div>
          {coverage === null ? (
            <div className="animate-pulse h-8 bg-bg2 rounded-lg" />
          ) : coverage.length === 0 ? (
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="card lg:col-span-1 mb-0 flex flex-col items-center justify-center py-6">
          <h3 className="label-caps mb-6 w-full text-left">Muskel-Status</h3>
          <div className="flex justify-center gap-6">
            <BodyMap exercises={enrichedRecent.flatMap(s => s.exercises || []).filter(e => e.done)} highlightedColors={['#ef4444', '#f59e0b', '#22c55e', '#3b82f6']} style={{ maxWidth: 100 }} />
            <BodyMap exercises={enrichedRecent.flatMap(s => s.exercises || []).filter(e => e.done)} type="posterior" highlightedColors={['#ef4444', '#f59e0b', '#22c55e', '#3b82f6']} style={{ maxWidth: 100 }} />
          </div>
        </div>

        <div className="lg:col-span-2 mb-0">
          <WeightChart days={30} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Plan-Hint */}
        {plan?.today && (
          <div className="card mb-0 flex flex-col justify-between" style={{ background: 'linear-gradient(180deg, var(--card), var(--bg2))' }}>
            <div>
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
              </div>
              {plan.today.exercises?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {plan.today.exercises.slice(0, 8).map((e, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-lg bg-bg2 text-muted">
                      {typeof e === "string" ? e : e.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => onNavigate?.("session")}
              className="btn btn-primary py-2 text-xs w-full mt-4"
              style={{ background: 'rgba(94,234,212,0.12)', border: '1px solid rgba(94,234,212,0.28)', color: 'var(--accent)' }}
            >
              Starten →
            </button>
          </div>
        )}

        <div className="mb-0">
          <HabitWidget />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Heutige Session Status */}
        { (todaySession?.exercises?.length > 0 || todaySession?.activity) ? (
          <div className="card mb-0">
            <div className="label-caps mb-3">
              Heute — {todaySession.activity ? ACTIVITY_LABELS[todaySession.activity.type] : todaySession.block}
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-4">
                {todaySession.activity ? (
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-ink flex items-center gap-2">
                      {todaySession.activity.duration || '—'} <span className="text-xs opacity-40">min</span>
                    </span>
                    <span className="label-caps">Dauer</span>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-ink">
                      {todaySession.exercises.filter(e => e.done).length}/{todaySession.exercises.length}
                    </span>
                    <span className="label-caps">Übungen</span>
                  </div>
                )}
                {todaySession.effort && (
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-ink">{todaySession.effort}</span>
                    <span className="label-caps">Effort</span>
                  </div>
                )}
              </div>
              <button onClick={() => onNavigate?.("session")} className="btn btn-primary px-6">
                Weiter →
              </button>
            </div>
          </div>
        ) : (
          <div className="card mb-0 flex flex-col items-center justify-center text-center py-8 opacity-40">
             <Dumbbell size={32} className="mb-2" />
             <p className="text-xs font-bold uppercase tracking-widest">Kein Training heute</p>
          </div>
        )}

        {/* Letzte Sessions */}
        {recent.filter(s => s.date !== today).length > 0 && (
          <div className="card mb-0">
            <h3 className="label-caps mb-3">Letzte Sessions</h3>
            <div className="flex flex-col gap-2">
              {recent.filter(s => s.date !== today).slice(0, 3).map(s => {
                const isActivity = !!s.activity;
                const ActivityIcon = isActivity ? (ACTIVITY_ICONS[s.activity.type] || Activity) : Dumbbell;
                const label = isActivity ? ACTIVITY_LABELS[s.activity.type] : s.block;
                const color = blockColor(s.block, s.activity);

                return (
                  <button key={s.date} onClick={() => onNavigate?.("session", s.date)}
                    className="w-full text-left px-4 py-3 rounded-2xl bg-bg2 border border-line cursor-pointer hover:border-accent/30 transition-all group">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                          style={{ background: color + '15', color: color }}>
                          <ActivityIcon size={20} />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold opacity-30 uppercase tracking-wider mb-0.5">{s.date}</div>
                          <div className="text-sm font-black text-ink">{label}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        {isActivity ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-muted">
                            <Timer size={12} className="opacity-40" />
                            {s.activity.duration}m
                          </div>
                        ) : (
                          <div className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white/5 text-muted">
                            {s.exercises?.filter(e => e.done).length ?? 0} Übungen
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {exportToast && (
        <div className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-medium shadow-xl z-50"
          style={{ background: 'var(--card)', color: 'var(--accent)', border: '1px solid var(--line)' }}>
          {exportToast}
        </div>
      )}
    </div>
  );
}
