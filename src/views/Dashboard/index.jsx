import { useState, useEffect } from "react";
import { 
  getSession, getRecentSessions, getPlan, getLatestSession, 
  getMuscleCoverage, exportCsv, getAllExercises 
} from "../../db.js";
import { localToday } from "../../lib/utils.js";
import HabitWidget from "../../components/HabitWidget.jsx";
import WeightChart from "../../components/WeightChart.jsx";

import DashboardHeader from "../../../src/components/dashboard/DashboardHeader";
import ActivityHeatmap from "../../../src/components/dashboard/ActivityHeatmap";
import MuscleStatus from "../../../src/components/dashboard/MuscleStatus";
import SessionStatus from "../../../src/components/dashboard/SessionStatus";
import { getRolling10Days } from "../../../src/components/dashboard/utils";

export default function Dashboard({ onNavigate }) {
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
    getMuscleCoverage(7).then(scores => {
       const allGroups = ["chest", "back", "shoulders", "arms", "core", "glutes", "quads", "hamstrings", "calves", "legs"];
       const gaps = allGroups.filter(g => (scores[g] || 0) < 1).map(g => ({ name: g }));
       setCoverage(gaps);
    }).catch(() => setCoverage([]));
    
    Promise.all([
      getRecentSessions(10),
      getAllExercises()
    ]).then(([sessions, kbExercises]) => {
      const safeSessions = Array.isArray(sessions) ? sessions.filter(Boolean).map(s => ({
        ...s,
        exercises: Array.isArray(s.exercises) ? s.exercises : [],
      })) : [];
      setRecent(safeSessions);
      
      const kbMap = new Map();
      kbExercises.forEach(ex => {
        kbMap.set((ex.display_name || ex.name).toLowerCase(), ex);
      });
      
      const enriched = safeSessions.map(s => ({
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
      <DashboardHeader onExport={handleExport} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <ActivityHeatmap 
          rollingDays={rollingDays} 
          sessionByDate={sessionByDate} 
          today={today} 
          onNavigate={onNavigate} 
        />

        <MuscleStatus 
          enrichedRecent={enrichedRecent} 
          coverage={coverage} 
        />

        {/* Column 2: Progress & Habits */}
        <div className="lg:col-span-1 space-y-6">
          <div className="mb-0 overflow-hidden">
            <WeightChart days={30} />
          </div>
          <div className="mb-0">
            <HabitWidget onNavigate={onNavigate} />
          </div>
        </div>

        <SessionStatus 
          plan={plan} 
          todaySession={todaySession} 
          recent={recent} 
          today={today} 
          onNavigate={onNavigate} 
        />
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
