import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
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
import { getRolling10Days } from "@src/components/dashboard/utils";

export default function Dashboard({ onOpenSession, onInspectExercise, onOpenReview, recentDays = 7, dashboardHighlighter = 'body' }) {
  function onNavigate(tab, date) {
    if (tab === 'session') onOpenSession?.(date || null);
    else if (tab === 'review') onOpenReview?.();
  }
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
       const gaps = allGroups.filter(g => (scores[g] || 0) < 1).map(g => ({ name: g }));
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
  }, [today, recentDays]);

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
    <div className="pb-32">
      <DashboardHeader onExport={handleExport} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Row 1: Today's focus — Session + Habits */}
        <SessionStatus
          plan={plan}
          todaySession={todaySession}
          recent={recent}
          today={today}
          onNavigate={onNavigate}
        />
        <div className="lg:col-span-1">
          <HabitWidget onNavigate={onNavigate} />
        </div>

        {/* Row 2: 10-day activity strip */}
        <ActivityHeatmap
          rollingDays={rollingDays}
          sessionByDate={sessionByDate}
          today={today}
          onNavigate={onNavigate}
        />

        {/* Row 3: Muscle status + Coverage */}
        <MuscleStatus
          enrichedRecent={enrichedRecent}
          coverage={coverage}
          recentDays={recentDays}
          highlighterMode={dashboardHighlighter}
        />

        {/* Row 4: Weight trend */}
        <div className="lg:col-span-3 overflow-hidden">
          <WeightChart days={30} />
        </div>
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
