import { useState, useEffect } from "react";
import { Lock, Pencil, Save, X } from "lucide-react";
import { 
  getSession, getRecentSessions, getPlan, getLatestSession, 
  getMuscleCoverage, exportCsv, getAllExercises 
} from "@db";
import { localToday } from "@utils";
import HabitWidget from "../../components/HabitWidget.jsx";
import WeightChart from "../../components/WeightChart.jsx";

import DashboardHeader from "@src/components/dashboard/DashboardHeader";
import ActivityHeatmap from "@src/components/dashboard/ActivityHeatmap";
import MuscleStatus from "@src/components/dashboard/MuscleStatus";
import SessionStatus from "@src/components/dashboard/SessionStatus";
import DashboardWidget from "../../components/dashboard/DashboardWidget.jsx";
import { getRolling10Days } from "@src/components/dashboard/utils";

const DEFAULT_LAYOUT = ['session', 'habits', 'heatmap', 'muscles', 'weight'];

export default function Dashboard({ onOpenSession, onInspectExercise, onOpenReview, recentDays = 7, coverageThreshold = 1.0, dashboardHighlighter = 'body' }) {
  function onNavigate(target, date) {
    if (target === 'session') onOpenSession?.(date || null);
    else if (target === 'review') onOpenReview?.();
    else if (onOpenSession && typeof onOpenSession === 'function' && ['dash', 'session', 'review', 'learn', 'habits', 'journal', 'settings'].includes(target)) {
      // This is a bit hacky because Dashboard doesn't have the global navigate,
      // but onOpenSession is passed from App.jsx where it can trigger a tab change if needed.
      // Better: we should pass a real 'navigate' prop if we want full control.
      window.location.hash = `#${target}`;
    }
  }

  const [isEditMode, setIsEditMode] = useState(false);
  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem('fitness-dashboard-layout');
    return saved ? JSON.parse(saved) : DEFAULT_LAYOUT;
  });

  const [todaySession, setTodaySession] = useState(null);
  const [recent, setRecent] = useState([]);
  const [enrichedRecent, setEnrichedRecent] = useState([]);
  const [plan, setPlan] = useState(null);
  const [coverage, setCoverage] = useState(null);
  const [exportToast, setExportToast] = useState('');

  const today = localToday();
  const rollingDays = getRolling10Days();

  useEffect(() => {
    getSession(today).then(setTodaySession).catch(() => setTodaySession({}));
    getPlan().then(setPlan).catch(() => setPlan(null));
    getMuscleCoverage(recentDays).then(scores => {
       const allGroups = ["chest", "back", "shoulders", "arms", "core", "glutes", "quads", "hamstrings", "calves", "legs"];
       const gaps = allGroups.filter(g => (scores[g] || 0) < coverageThreshold).map(g => ({ name: g }));
       setCoverage(gaps);
    }).catch(() => setCoverage([]));

    const cutoffDate = new Date(Date.now() - recentDays * 86400000).toISOString().slice(0, 10);

    Promise.all([
      getRecentSessions(Math.max(recentDays * 2, 10)),
      getAllExercises()
    ]).then(([sessions, kbExercises]) => {
      const safeSessions = Array.isArray(sessions) ? sessions.filter(Boolean).map(s => ({
        ...s,
        exercises: Array.isArray(s.exercises) ? s.exercises : [],
      })) : [];
      setRecent(safeSessions);

      const sessionsInWindow = safeSessions.filter(s => s?.date && s.date >= cutoffDate);

      const kbMap = new Map();
      kbExercises.forEach(ex => {
        kbMap.set((ex.display_name || ex.name).toLowerCase(), ex);
      });

      const enriched = sessionsInWindow.map(s => ({
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
  }, [today, recentDays, coverageThreshold]);

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

  const saveLayout = () => {
    localStorage.setItem('fitness-dashboard-layout', JSON.stringify(layout));
    setIsEditMode(false);
  };

  const moveWidget = (index, direction) => {
    const newLayout = [...layout];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newLayout.length) return;
    [newLayout[index], newLayout[targetIndex]] = [newLayout[targetIndex], newLayout[index]];
    setLayout(newLayout);
  };

  const renderWidget = (id, index) => {
    const editControls = isEditMode && (
      <div className="absolute top-2 left-2 z-20 flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); moveWidget(index, -1); }} className="p-1 bg-accent text-black rounded shadow hover:scale-110">↑</button>
        <button onClick={(e) => { e.stopPropagation(); moveWidget(index, 1); }} className="p-1 bg-accent text-black rounded shadow hover:scale-110">↓</button>
      </div>
    );

    switch(id) {
      case 'session':
        return (
          <DashboardWidget key="session" title="Session Status" onNavigate={onNavigate} targetTab="session" isEditMode={isEditMode} className="lg:col-span-1">
            {editControls}
            <SessionStatus plan={plan} todaySession={todaySession} recent={recent} today={today} onNavigate={onNavigate} />
          </DashboardWidget>
        );
      case 'habits':
        return (
          <DashboardWidget key="habits" title="Habits (heute)" onNavigate={onNavigate} targetTab="habits" isEditMode={isEditMode} className="lg:col-span-1">
            {editControls}
            <HabitWidget onNavigate={onNavigate} />
          </DashboardWidget>
        );
      case 'heatmap':
        return (
          <DashboardWidget key="heatmap" title="Aktivität & Konsistenz" onNavigate={onNavigate} targetTab="review" isEditMode={isEditMode} className="lg:col-span-3">
            {editControls}
            <ActivityHeatmap rollingDays={rollingDays} sessionByDate={sessionByDate} today={today} onNavigate={onNavigate} />
          </DashboardWidget>
        );
      case 'muscles':
        return (
          <DashboardWidget key="muscles" title="Muskel-Status" onNavigate={onNavigate} targetTab="learn" isEditMode={isEditMode} className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {editControls}
            <MuscleStatus enrichedRecent={enrichedRecent} coverage={coverage} recentDays={recentDays} highlighterMode={dashboardHighlighter} />
          </DashboardWidget>
        );
      case 'weight':
        return (
          <DashboardWidget key="weight" title="Gewicht-Verlauf" isEditMode={isEditMode} className="lg:col-span-3 overflow-hidden">
            {editControls}
            <WeightChart days={30} />
          </DashboardWidget>
        );
      default: return null;
    }
  };

  return (
    <div className="pb-32 relative">
      <div className="absolute top-0 right-0 z-50">
        {isEditMode ? (
          <div className="flex gap-2">
            <button onClick={() => { setLayout(DEFAULT_LAYOUT); setIsEditMode(false); }} className="p-3 rounded-full bg-red/10 text-red border border-red/20 hover:bg-red/20 transition-all shadow-lg">
              <X size={20} />
            </button>
            <button onClick={saveLayout} className="p-3 rounded-full bg-green/10 text-green border border-green/20 hover:bg-green/20 transition-all shadow-lg">
              <Save size={20} />
            </button>
          </div>
        ) : (
          <button onClick={() => setIsEditMode(true)} className="p-3 rounded-full bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-all shadow-lg">
            <Pencil size={20} />
          </button>
        )}
      </div>

      <DashboardHeader onExport={handleExport} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {layout.map((id, idx) => renderWidget(id, idx))}
      </div>

      {/* Hidden Chambers Access */}
      <div className="mt-16 pt-8 border-t border-dashed border-[var(--line)] flex justify-center opacity-10 hover:opacity-100 transition-opacity duration-1000">
        <a 
          href="https://ideapad.tail7a15d6.ts.net/workout/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-mono tracking-widest text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--panel)] transition-all"
        >
          <Lock size={12} />
          SYSTEM::ACCESS_HIDDEN_CHAMBER::WORKOUT_FORGE
        </a>
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

