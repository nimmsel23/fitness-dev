import { useState, useEffect } from "react";
import { api } from "../api.js";
import HabitWidget from "../components/HabitWidget.jsx";
import WeightChart from "../components/WeightChart.jsx";
import HealthWidget from "../components/dashboard/HealthWidget.jsx";

import DashboardHeader from "../components/dashboard/DashboardHeader.jsx";
import ActivityHeatmap from "../components/dashboard/ActivityHeatmap.jsx";
import MuscleStatus from "../components/dashboard/MuscleStatus.jsx";
import SessionStatus from "../components/dashboard/SessionStatus.jsx";
import { getRolling10Days } from "../components/dashboard/utils.js";

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Dashboard({ onOpenSession, onNavigate }) {
  const [todaySession, setTodaySession] = useState(null);
  const [recent, setRecent] = useState([]);
  const [enrichedRecent, setEnrichedRecent] = useState([]);
  const [plan, setPlan] = useState(null);
  const [coverage, setCoverage] = useState(null);
  const [exportToast, setExportToast] = useState('');

  const today = todayISO();
  const rollingDays = getRolling10Days();

  useEffect(() => {
    api.get(`/session?date=${today}`).then(d => setTodaySession(d.data || {})).catch(() => setTodaySession({}));
    api.get("/plan/today").then(d => setPlan({ today: d.suggestion })).catch(() => setPlan(null));
    api.get("/coverage/gaps?days=7").then(d => setCoverage(d.gaps || [])).catch(() => setCoverage([]));
    
    Promise.all([
      api.get("/session/history?limit=10"),
      api.get("/fitness/exercises/all")
    ]).then(([sessData, kbData]) => {
      const sessions = sessData.sessions || [];
      setRecent(sessions);
      
      const kbExercises = kbData.exercises || [];
      const kbMap = new Map();
      kbExercises.forEach(ex => {
        kbMap.set((ex.display_name || ex.name || ex.exercise_id).toLowerCase(), ex);
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
      const res = await api.get(`/export/csv?days=${days}`);
      if (res.ok) {
         setExportToast(`Export: ${res.filename}`);
      } else {
         setExportToast('Export fehlgeschlagen');
      }
      setTimeout(() => setExportToast(''), 1800);
    } catch {
      setExportToast('Export fehlgeschlagen');
      setTimeout(() => setExportToast(''), 1800);
    }
  }

  // Helper to align onNavigate with local onOpenSession
  const navigateHandler = (target) => {
    if (target === 'session' && onOpenSession) onOpenSession();
    else if (onNavigate) onNavigate(target);
  };

  return (
    <div className="pb-20">
      <DashboardHeader onExport={handleExport} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <ActivityHeatmap 
          rollingDays={rollingDays} 
          sessionByDate={sessionByDate} 
          today={today} 
          onNavigate={onOpenSession}
        />

        <MuscleStatus 
          enrichedRecent={enrichedRecent} 
          coverage={coverage} 
        />

        {/* Column 2: Progress, Health & Habits (Local Power Features) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="mb-0">
            <HealthWidget />
          </div>
          <div className="mb-0">
            <HabitWidget onNavigate={navigateHandler} />
          </div>
        </div>

        <SessionStatus 
          plan={plan} 
          todaySession={todaySession} 
          recent={recent} 
          today={today} 
          onNavigate={navigateHandler} 
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
