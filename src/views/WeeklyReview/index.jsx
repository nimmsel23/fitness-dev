import { useEffect, useState } from 'react';
import { getWeeklyReport, exportFitnessData, getRecentSessions } from '@db';
import { BarChart3, Activity, History, Zap } from 'lucide-react';

import ReviewHeader from './ReviewHeader';
import ReviewOverview from './ReviewOverview';
import ReviewInsights from './ReviewInsights';
import ReviewMuscleImpact from './ReviewMuscleImpact';
import ReviewSessionList from './ReviewSessionList';
import ReviewTopExercises from './ReviewTopExercises';
import ReviewHistory from './ReviewHistory.jsx';
import ReviewReadinessMatrix from './ReviewReadinessMatrix.jsx';
import Muscles from '../Muscles/index.jsx';

export default function WeeklyReview({ onOpenSession, onInspectExercise, muscleLanguage = 'de', taxonomy = null, gender = 'male', recentDays = 7, subTab = null, onSubNav }) {
  const [week, setWeek]       = useState('current');
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState('');
  const [historySessions, setHistorySessions] = useState([]);
  const viewMode = subTab === 'muscles' ? 'muscles' : subTab === 'verlauf' ? 'verlauf' : subTab === 'readiness' ? 'readiness' : 'report';

  useEffect(() => {
    if (viewMode !== 'verlauf') return;
    getRecentSessions(60)
      .then(s => setHistorySessions(Array.isArray(s) ? s.filter(x => x?.exercises?.length > 0 || x?.activity) : []))
      .catch(() => setHistorySessions([]));
  }, [viewMode]);

  function onNavigate(tab, date) {
    if (tab === 'session') onOpenSession?.(date || null);
  }

  useEffect(() => {
    setLoading(true);
    getWeeklyReport(week)
      .then(d => setData(d || null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [week]);

  async function exportWeekly() {
    try {
      const result = await exportFitnessData({
        kind: 'weekly',
        week_selector: week,
        force: true,
      })
      setToast(result?.path ? `Export: ${result.path}` : 'Exportiert')
    } catch {
      setToast('Export fehlgeschlagen')
    }
    setTimeout(() => setToast(''), 2600)
  }

  const regionEntries = Object.entries(data?.body_region_scores || {}).sort((a, b) => b[1] - a[1]);
  const missingRegions = data?.missing_regions || [];

  return (
    <div className="space-y-6 pb-32">
      <ReviewHeader
        week={week}
        setWeek={setWeek}
        onExport={exportWeekly}
        toast={toast}
      />

      {/* Mode switcher */}
      <div className="flex gap-1 p-1 bg-fit-card rounded-2xl border border-fit-line shadow-sm w-fit">
        {[
          { id: 'report',    icon: <BarChart3 size={14} />, label: 'Bericht' },
          { id: 'muscles',   icon: <Activity size={14} />,  label: 'Muskeln' },
          { id: 'readiness', icon: <Zap size={14} />,       label: 'Readiness' },
          { id: 'verlauf',   icon: <History size={14} />,   label: 'Verlauf' },
        ].map(({ id, icon, label }) => (
          <button key={id}
            onClick={() => onSubNav?.(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === id ? 'bg-fit-accent text-black shadow-lg shadow-accent/20' : 'text-fit-dim hover:text-ink'}`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {viewMode === 'muscles' ? (
        <Muscles gender={gender} muscleLanguage={muscleLanguage} taxonomy={taxonomy} recentDays={recentDays} />
      ) : viewMode === 'readiness' ? (
        <ReviewReadinessMatrix taxonomy={taxonomy} muscleLanguage={muscleLanguage} />
      ) : viewMode === 'verlauf' ? (
        <ReviewHistory sessions={historySessions} onOpenSession={onOpenSession} />
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-30">
          <div className="spinner mb-6" />
          <p className="text-xs font-black uppercase tracking-[0.3em]">Generiere Report…</p>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-8">
            <ReviewOverview
              sessionCount={data.session_count}
              totalExercises={data.total_exercises}
              avgEffort={data.avg_effort}
            />
            <ReviewInsights
              recommendations={data.recommendations}
              missingRegions={missingRegions}
              muscleLanguage={muscleLanguage}
              taxonomy={taxonomy}
            />
          </div>

          <div className="lg:col-span-8 space-y-8">
            <ReviewMuscleImpact regionEntries={regionEntries} muscleLanguage={muscleLanguage} taxonomy={taxonomy} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ReviewSessionList
                sessions={data.sessions}
                onNavigate={onNavigate}
              />
              <ReviewTopExercises
                topExercises={data.top_exercises}
                onInspectExercise={onInspectExercise}
              />
            </div>
          </div>
        </div>
      ) : (
        <section className="p-8 rounded-3xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
          <p className="text-sm font-bold opacity-40 text-center uppercase tracking-widest">Wochenreport konnte nicht geladen werden.</p>
        </section>
      )}
    </div>
  );
}
