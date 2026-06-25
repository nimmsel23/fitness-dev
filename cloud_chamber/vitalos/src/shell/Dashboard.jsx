import { useState, useEffect, useRef } from "react";
import { Lock, GripVertical, Shield } from "lucide-react";
import {
  getSession, getRecentSessions, getPlan,
  getDashboardAnalytics, exportCsv, getAllExercises, getGlobalInbox, isLocalMode
} from "@db";
import { localToday } from "@utils";
import WeightChart from "../components/WeightChart.jsx";

import DashboardHeader from "@src/components/dashboard/DashboardHeader";
import ActivityHeatmap from "@src/components/dashboard/ActivityHeatmap";
import MuscleBody from "@src/components/dashboard/MuscleBody";
import MuscleCoverage from "@src/components/dashboard/MuscleCoverage";
import SessionStatus from "@src/components/dashboard/SessionStatus";
import DashboardWidget from "@src/components/dashboard/DashboardWidget";
import { getRolling10Days } from "@src/components/dashboard/utils";

const DEFAULT_LAYOUT = ['session', 'heatmap', 'body', 'coverage', 'weight'];
const LAYOUT_KEY = 'vitalos-dashboard-layout';

const WIDGET_META = {
  session:  { title: 'Heute',         span: 'md:col-span-2 xl:col-span-2', targetTab: 'session' },
  heatmap:  { title: 'Aktivität',     span: 'md:col-span-2 xl:col-span-3', targetTab: 'review' },
  body:     { title: 'Muskel-Status', span: 'md:col-span-2 xl:col-span-2', targetTab: 'learn' },
  coverage: { title: 'Coverage',      span: 'md:col-span-1 xl:col-span-1', targetTab: 'learn' },
  weight:   { title: 'Gewicht',       span: 'md:col-span-2 xl:col-span-3', targetTab: null },
};

export default function Dashboard({ user, onOpenSession, onOpenReview, recentDays = 7, coverageThreshold = 1.0, dashboardHighlighter = 'body', gender = 'male', navigate, muscleLanguage = 'de', taxonomy = null }) {
  function onNavigate(target, date) {
    if (target === 'session') onOpenSession?.(date || null);
    else if (target === 'review') onOpenReview?.();
    else navigate?.(target);
  }

  const [isEditMode, setIsEditMode] = useState(false);
  const [layout, setLayout] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LAYOUT_KEY) || 'null');
      if (!Array.isArray(saved)) return DEFAULT_LAYOUT;
      const known = saved.filter(id => WIDGET_META[id]);
      const missing = DEFAULT_LAYOUT.filter(id => !known.includes(id));
      return [...known, ...missing];
    } catch { return DEFAULT_LAYOUT; }
  });
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);
  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  const [todaySession, setTodaySession] = useState(null);
  const [recent, setRecent] = useState([]);
  const [enrichedRecent, setEnrichedRecent] = useState([]);
  const [plan, setPlan] = useState(null);
  const [coverage, setCoverage] = useState(null);
  const [exportToast, setExportToast] = useState('');
  const [globalInboxCount, setGlobalInboxCount] = useState(0);

  const today = localToday();
  const rollingDays = getRolling10Days();

  useEffect(() => {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
  }, [layout]);

  useEffect(() => {
    getSession(today).then(setTodaySession).catch(() => setTodaySession({}));
    getPlan().then(setPlan).catch(() => setPlan(null));

    const isSuperUser = isLocalMode() || user?.email?.includes('alpha') || user?.uid === '59ole36uNpNwml5H6VDYCXyCME92';
    if (isSuperUser) {
      getGlobalInbox().then(res => {
        if (Array.isArray(res)) setGlobalInboxCount(res.length);
      }).catch(() => {});
    }

    getDashboardAnalytics(recentDays).then(analytics => {
       const scores = analytics?.body_region_scores || {};
       const allGroups = ["chest", "back", "shoulders", "arms", "core", "glutes", "quads", "hamstrings", "calves", "legs"];
       const gaps = allGroups.filter(g => (scores[g] || 0) < coverageThreshold).map(g => ({ name: g }));
       setCoverage(gaps);
    }).catch(() => setCoverage([]));

    const cutoffDate = new Date(Date.now() - recentDays * 86400000).toISOString().slice(0, 10);

    Promise.all([
      getRecentSessions(Math.max(recentDays * 2, 30)),
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
  }, [today, recentDays, coverageThreshold, user]);

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

  const handleDragStart = (e, id) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', id); } catch {}
  }
  const handleDragOver = (e, id) => {
    if (!dragId || id === dragId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (overId !== id) setOverId(id);
  }
  const handleDrop = (e, targetId) => {
    e.preventDefault();
    const sourceId = dragId;
    setDragId(null); setOverId(null);
    if (!sourceId || sourceId === targetId) return;
    const next = [...layoutRef.current];
    const from = next.indexOf(sourceId);
    const to = next.indexOf(targetId);
    if (from < 0 || to < 0) return;
    next.splice(from, 1);
    next.splice(to, 0, sourceId);
    setLayout(next);
  }
  const handleDragEnd = () => { setDragId(null); setOverId(null); }
  function resetLayout() { setLayout(DEFAULT_LAYOUT); }

  function renderInner(id) {
    switch (id) {
      case 'session':
        return <SessionStatus plan={plan} todaySession={todaySession} recent={recent} today={today} onNavigate={onNavigate} />;
      case 'heatmap':
        return <ActivityHeatmap rollingDays={rollingDays} sessionByDate={sessionByDate} today={today} onNavigate={onNavigate} />;
      case 'body':
        return <MuscleBody allSessions={recent} enrichedRecent={enrichedRecent} recentDays={recentDays} highlighterMode={dashboardHighlighter} gender={gender} />;
      case 'coverage':
        return <MuscleCoverage coverage={coverage} recentDays={recentDays} muscleLanguage={muscleLanguage} taxonomy={taxonomy} />;
      case 'weight':
        return <WeightChart days={30} />;
      default: return null;
    }
  }

  return (
    <div className="pb-32">
      <DashboardHeader
        onExport={handleExport}
        isEditMode={isEditMode}
        onToggleEdit={() => setIsEditMode(v => !v)}
        onResetLayout={resetLayout}
      />

      {globalInboxCount > 0 && !isEditMode ? (
        <div
          onClick={() => navigate?.('coach')}
          className="mb-8 px-5 py-4 rounded-[24px] bg-fit-red/15 border border-fit-red/25 hover:border-fit-red/40 transition-all cursor-pointer flex items-center justify-between text-fit-red animate-in slide-in-from-top-4 duration-500 hover:scale-[1.01] active:scale-[0.99] group shadow-lg shadow-fit-red/5"
        >
          <div className="flex items-center gap-3">
            <Shield size={16} className="animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider">
              Es gibt {globalInboxCount} ausstehende {globalInboxCount === 1 ? 'Übungsanfrage' : 'Übungsanfragen'} zur Freigabe in der Coach-Verwaltung!
            </span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest bg-fit-red text-black px-3.5 py-1.5 rounded-xl group-hover:scale-105 transition-transform">
            Verwalten
          </span>
        </div>
      ) : null}

      {isEditMode && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-fit-accent/5 border border-fit-accent/20 text-[11px] font-bold tracking-wide text-fit-accent flex items-center gap-2">
          <GripVertical size={14} /> Widgets per Drag&Drop neu anordnen. „Fertig" speichert.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
        {layout.map(id => {
          const meta = WIDGET_META[id];
          if (!meta) return null;
          const isDragging = dragId === id;
          const isOver = overId === id && dragId && dragId !== id;
          return (
            <div
              key={id}
              className={[
                meta.span,
                'relative transition-all',
                isEditMode ? 'ring-1 ring-dashed ring-accent/30 rounded-[32px]' : '',
                isDragging ? 'opacity-40 scale-[0.98]' : '',
                isOver ? 'ring-2 ring-accent rounded-[32px]' : '',
              ].filter(Boolean).join(' ')}
              draggable={isEditMode}
              onDragStart={isEditMode ? (e) => handleDragStart(e, id) : undefined}
              onDragOver={isEditMode ? (e) => handleDragOver(e, id) : undefined}
              onDrop={isEditMode ? (e) => handleDrop(e, id) : undefined}
              onDragEnd={isEditMode ? handleDragEnd : undefined}
              style={isEditMode ? { cursor: 'grab' } : undefined}
            >
              {isEditMode && (
                <div className="absolute top-3 right-3 z-20 flex items-center gap-2 px-2 py-1 rounded-lg bg-fit-accent text-black text-[9px] font-black uppercase tracking-widest shadow-lg pointer-events-none">
                  <GripVertical size={12} /> {meta.title}
                </div>
              )}
              <DashboardWidget
                title={meta.title}
                onNavigate={onNavigate}
                targetTab={meta.targetTab}
                isEditMode={isEditMode}
              >
                {renderInner(id)}
              </DashboardWidget>
            </div>
          );
        })}
      </div>

      <div className="mt-16 pt-8 border-t border-dashed border-fit-line flex justify-center opacity-10 hover:opacity-100 transition-opacity duration-1000">
        <a
          href="https://ideapad.tail7a15d6.ts.net/workout/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-mono tracking-widest text-fit-muted hover:text-fit-accent hover:bg-[var(--panel)] transition-all"
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
