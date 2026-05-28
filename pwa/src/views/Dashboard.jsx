import { useState, useEffect } from "react";
import { Zap, TrendingUp, AlertCircle, Download, Activity, Dumbbell, Bike, Waves, Footprints, Timer, ChevronRight } from "lucide-react";
import { getSession, getRecentSessions, getPlan, getLatestSession, getMuscleCoverage, exportCsv, getAllExercises } from "../db.js";
import HabitWidget from "../components/HabitWidget.jsx";
import WeightChart from "../components/WeightChart.jsx";
import BodyMap from "../components/BodyMap.jsx";

const BLOCK_COLORS = {
  push: "#f472b6", pull: "#34d399", legs: "#fb923c",
  upper: "#38bdf8", lower: "#a78bfa", full: "#fbbf24",
  hiking: "#48c87a", running: "#e05060", cycling: "#38bdf8", swimming: "#5294e2", yoga: "#bd93f9"
};

const ACTIVITY_LABELS = {
  hiking: "Wandern",
  running: "Laufen",
  cycling: "Radfahren",
  swimming: "Schwimmen",
  yoga: "Yoga"
};

const ACTIVITY_ICONS = {
  hiking: Footprints,
  running: Footprints,
  cycling: Bike,
  swimming: Waves,
  yoga: Activity
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
    getMuscleCoverage(7).then(scores => {
       const allGroups = ["chest", "back", "shoulders", "arms", "core", "glutes", "quads", "hamstrings", "calves", "legs"];
       const gaps = allGroups.filter(g => (scores[g] || 0) < 1).map(g => ({ name: g }));
       setCoverage(gaps);
    }).catch(() => setCoverage([]));
    
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
      {/* Header & Quick Actions */}
      <div className="mb-12 flex items-end justify-between px-2">
        <div>
          <h1 className="text-4xl font-black text-ink mb-2">Willkommen zurück</h1>
          <p className="text-xs font-bold opacity-40 uppercase tracking-[0.25em]">Dein Fitness Dashboard</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleExport(30)} className="btn btn-secondary py-3 px-6 text-[11px] font-black uppercase tracking-widest">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Activity Heatmap - Full Width */}
        <div className="lg:col-span-3 card !p-8 shadow-xl bg-gradient-to-br from-card to-bg2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="label-caps !mb-0 flex items-center gap-3 text-sm">
              <Activity size={16} className="text-accent" />
              Aktivität & Konsistenz
            </h3>
            <span className="text-[11px] font-bold opacity-30 uppercase tracking-widest">Letzte 10 Tage</span>
          </div>
          <div className="grid grid-cols-5 lg:grid-cols-10 gap-4">
            {rollingDays.map((date) => {
              const s = sessionByDate[date];
              const done = !!(s?.block || s?.activity);
              const isToday = date === today;
              const color = done ? blockColor(s.block, s.activity) : null;
              const dayName = DAY_LABELS[new Date(date).getDay()];
              return (
                <div key={date} className="flex flex-col items-center gap-3 group">
                  <button
                    onClick={() => done && onNavigate?.("session", date)}
                    className="w-full aspect-square rounded-2xl flex items-center justify-center text-sm font-black transition-all shadow-inner border-2"
                    style={{
                      background: isToday ? 'var(--accent)' : done ? (color + '15') : 'var(--bg2)',
                      borderColor: isToday ? 'var(--accent)' : done ? (color + '30') : 'transparent',
                      color: isToday ? '#000' : done ? color : 'var(--dim)',
                      cursor: done ? 'pointer' : 'default',
                    }}
                  >
                    {done ? "✓" : "·"}
                  </button>
                  <span className="text-[10px] font-black opacity-40 uppercase tracking-widest group-hover:opacity-100 transition-opacity">
                    {dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 1: Physical Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card mb-0 flex flex-col items-center justify-center py-8">
            <h3 className="label-caps mb-8 w-full px-1">Muskel-Status</h3>
            <div className="flex justify-center gap-10">
              <BodyMap exercises={enrichedRecent.flatMap(s => s.exercises || []).filter(e => e.done)} highlightedColors={['#ef4444', '#f59e0b', '#22c55e', '#3b82f6']} style={{ maxWidth: 110 }} />
              <BodyMap exercises={enrichedRecent.flatMap(s => s.exercises || []).filter(e => e.done)} type="posterior" highlightedColors={['#ef4444', '#f59e0b', '#22c55e', '#3b82f6']} style={{ maxWidth: 110 }} />
            </div>
          </div>

          <div className="card mb-0 bg-accent/5 border-accent/20">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={15} className="text-accent" />
              <span className="label-caps !mb-0">Coverage (7 Tage)</span>
            </div>
            {coverage === null ? (
              <div className="animate-pulse h-12 bg-bg2 rounded-xl" />
            ) : coverage.length === 0 ? (
              <div className="flex items-center gap-3 text-green">
                <div className="w-8 h-8 rounded-full bg-green/10 flex items-center justify-center text-xs font-black">✓</div>
                <p className="text-xs font-bold">Alles abgedeckt</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {coverage.map(g => (
                  <span key={g.name} className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                    style={{ background: 'var(--red)' + '15', color: 'var(--red)', border: '1px solid var(--red)20' }}>
                    <AlertCircle size={10} />
                    {g.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Progress & Habits */}
        <div className="lg:col-span-1 space-y-6">
          <div className="mb-0 overflow-hidden">
            <WeightChart days={30} />
          </div>
          <div className="mb-0">
            <HabitWidget onNavigate={onNavigate} />
          </div>
        </div>

        {/* Column 3: Training & Sessions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Plan-Hint */}
          {plan?.today && (
            <div className="card mb-0 flex flex-col justify-between p-6" style={{ background: 'linear-gradient(180deg, var(--card), var(--bg2))', borderColor: 'var(--accent)20' }}>
              <div>
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-accent" />
                    <span className="label-caps !mb-0">Vorschlag</span>
                  </div>
                  <span className="text-[9px] font-black text-accent bg-accent/10 px-2 py-0.5 rounded-full uppercase tracking-widest">Plan</span>
                </div>
                <div className="mb-4">
                  <div className="text-2xl font-black text-ink mb-1" style={{ color: blockColor(plan.today.block) || 'var(--accent)' }}>
                    {plan.today.block}
                  </div>
                  <div className="h-1 w-12 bg-accent rounded-full" />
                </div>
                {plan.today.exercises?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {plan.today.exercises.slice(0, 6).map((e, i) => (
                      <span key={i} className="text-[9px] font-bold px-2 py-1 rounded-lg bg-bg2 text-muted border border-line">
                        {typeof e === "string" ? e : e.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => onNavigate?.("session")}
                className="btn btn-primary py-3 text-xs w-full mt-8 shadow-lg shadow-accent/20"
              >
                Session Starten →
              </button>
            </div>
          )}

          {/* Heutige Session Status */}
          { (todaySession?.exercises?.length > 0 || todaySession?.activity) ? (
            <div className="card mb-0 border-accent/20 shadow-lg shadow-accent/5">
              <div className="label-caps mb-6 flex items-center justify-between">
                <span>Aktuelle Session</span>
                <span className="text-accent font-black">{todaySession.activity ? ACTIVITY_LABELS[todaySession.activity.type] : todaySession.block}</span>
              </div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-6">
                  {todaySession.activity ? (
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-ink flex items-center gap-1">
                        {todaySession.activity.duration || '—'}<span className="text-[10px] opacity-30 mt-1">m</span>
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Dauer</span>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-ink">
                        {todaySession.exercises.filter(e => e.done).length}<span className="text-lg opacity-30">/{todaySession.exercises.length}</span>
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Übungen</span>
                    </div>
                  )}
                  {todaySession.effort && (
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-ink">{todaySession.effort}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Effort</span>
                    </div>
                  )}
                </div>
                <button onClick={() => onNavigate?.("session")} className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-black shadow-lg shadow-accent/20 transition-transform active:scale-90">
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
          ) : !plan?.today && (
            <div className="card mb-0 flex flex-col items-center justify-center text-center py-12 opacity-30 border-dashed">
               <Dumbbell size={32} className="mb-3" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em]">Pause oder Plan wählen</p>
            </div>
          )}

          {/* Letzte Sessions */}
          {recent.filter(s => s.date !== today).length > 0 && (
            <div className="space-y-3">
              <h3 className="label-caps px-1">Verlauf</h3>
              <div className="flex flex-col gap-2">
                {recent.filter(s => s.date !== today).slice(0, 3).map(s => {
                  const isActivity = !!s.activity;
                  const ActivityIcon = isActivity ? (ACTIVITY_ICONS[s.activity.type] || Activity) : Dumbbell;
                  const label = isActivity ? ACTIVITY_LABELS[s.activity.type] : s.block;
                  const color = blockColor(s.block, s.activity);

                  return (
                    <button key={s.date} onClick={() => onNavigate?.("session", s.date)}
                      className="w-full text-left px-4 py-3 rounded-2xl bg-card border border-line cursor-pointer hover:border-accent/30 transition-all group">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                            style={{ background: color + '15', color: color }}>
                            <ActivityIcon size={18} />
                          </div>
                          <div>
                            <div className="text-[9px] font-black opacity-30 uppercase tracking-tighter mb-0.5">{s.date}</div>
                            <div className="text-sm font-black text-ink group-hover:text-accent transition-colors">{label}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          {isActivity ? (
                            <div className="flex items-center gap-1 text-[10px] font-black text-muted">
                              <Timer size={10} className="opacity-30" />
                              {s.activity.duration}m
                            </div>
                          ) : (
                            <div className="text-[9px] font-black px-2 py-1 rounded-lg bg-bg2 text-muted uppercase tracking-widest border border-line">
                              {s.exercises?.filter(e => e.done).length ?? 0} Ex
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
