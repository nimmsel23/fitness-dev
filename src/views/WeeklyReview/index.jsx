import { useEffect, useState } from 'react';
import { getMonthlyReport, exportFitnessData, getHistoryEntries } from '@db';
import { BarChart3, Activity, History, Zap } from 'lucide-react';
import { readMonthlyReportCache, writeMonthlyReportCache, clearMonthlyReportCache } from '../../lib/reportCache';

import ReviewHeader from './ReviewHeader';
import ReviewOverview from './ReviewOverview';
import ReviewInsights from './ReviewInsights';
import ReviewMuscleImpact from './ReviewMuscleImpact';
import ReviewPPLBalance from './ReviewPPLBalance';
import ReviewDeload from './ReviewDeload';
import ReviewWeeksBreakdown from './ReviewWeeksBreakdown';
import ReviewTopExercises from './ReviewTopExercises';
import ReviewHistory from './ReviewHistory.jsx';
import ReviewReadiness from './ReviewReadiness.jsx';
import Muscles from '../Muscles/index.jsx';

const SUB_TABS = ['muscles', 'verlauf', 'readiness'];
const REVIEW_WINDOW_DAYS = 28;
let monthlyReportCache = null; // schnellster Pfad: gleicher Tab, kein JSON.parse

export default function WeeklyReview({ onOpenSession, onInspectExercise, muscleLanguage = 'de', taxonomy = null, gender = 'male', recentDays = 10, subTab = null, onSubNav }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState('');
  const [historySessions, setHistorySessions] = useState([]);
  const [historyMonths, setHistoryMonths] = useState(6);
  const [historyHasMore, setHistoryHasMore] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(null); // null = gesamte 28 Tage, sonst Index in data.weeks
  const viewMode = SUB_TABS.includes(subTab) ? subTab : 'report';

  // Verlauf liest die letzten 7 Tage live und alles Ältere aus dem Monats-Index
  // (workoutIndex) — nicht mehr 60 volle Session-Docs pro Öffnen.
  useEffect(() => {
    if (viewMode !== 'verlauf') return;
    getHistoryEntries({ months: historyMonths })
      .then(({ entries, hasMore }) => {
        setHistorySessions(Array.isArray(entries) ? entries : []);
        setHistoryHasMore(!!hasMore);
      })
      .catch(err => {
        console.error('getHistoryEntries failed', err);
        setHistorySessions([]);
        setHistoryHasMore(false);
      });
  }, [viewMode, historyMonths]);

  useEffect(() => {
    if (viewMode !== 'report') return;

    if (monthlyReportCache) {
      setData(monthlyReportCache);
      setLoading(false);
      return;
    }

    const cached = readMonthlyReportCache();
    if (cached) {
      monthlyReportCache = cached;
      setData(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    getMonthlyReport(REVIEW_WINDOW_DAYS)
      .then(d => {
        const next = d || null;
        monthlyReportCache = next;
        if (next) writeMonthlyReportCache(next);
        setData(next);
      })
      .catch(err => {
        console.error('getMonthlyReport failed', err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [viewMode]);

  async function exportWeekly() {
    try {
      const result = await exportFitnessData({
        kind: 'weekly',
        week_selector: 'current',
        force: true,
      })
      monthlyReportCache = null
      clearMonthlyReportCache()
      setToast(result?.path ? `Export: ${result.path}` : 'Exportiert')
    } catch {
      setToast('Export fehlgeschlagen')
    }
    setTimeout(() => setToast(''), 2600)
  }

  // Bei ausgewählter Wochen-Karte zeigen PPL-Balance/Muskelbelastung nur
  // deren body_region_scores, sonst die Summe über die vollen 28 Tage.
  const selectedData = selectedWeek != null ? data?.weeks?.[selectedWeek] : data;
  const regionEntries = Object.entries(selectedData?.body_region_scores || {}).sort((a, b) => b[1] - a[1]);
  const missingRegions = selectedData?.missing_regions || [];

  return (
    <div className="space-y-6 pb-32">
      <ReviewHeader
        onExport={exportWeekly}
        toast={toast}
      />

      {/* Mode switcher */}
      <div className="flex gap-1 p-1 bg-fit-card rounded-2xl border border-fit-line overflow-x-auto max-w-full [&::-webkit-scrollbar]:hidden">
        {[
          { id: 'report',    icon: <BarChart3 size={14} />, label: 'Bericht' },
          { id: 'muscles',   icon: <Activity size={14} />,  label: 'Muskeln' },
          { id: 'readiness', icon: <Zap size={14} />,       label: 'Readiness' },
          { id: 'verlauf',   icon: <History size={14} />,   label: 'Verlauf' },
        ].map(({ id, icon, label }) => (
          <button key={id}
            onClick={() => onSubNav?.(id)}
            className={`flex items-center gap-1.5 sm:gap-2 shrink-0 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${viewMode === id ? 'bg-fit-accent text-black' : 'text-fit-dim hover:text-ink'}`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {viewMode === 'muscles' ? (
        <Muscles gender={gender} muscleLanguage={muscleLanguage} taxonomy={taxonomy} recentDays={recentDays} onInspectExercise={onInspectExercise} />
      ) : viewMode === 'readiness' ? (
        <ReviewReadiness />
      ) : viewMode === 'verlauf' ? (
        <ReviewHistory sessions={historySessions} onOpenSession={onOpenSession} hasMore={historyHasMore} onLoadMore={() => setHistoryMonths(m => m + 6)} />
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-30">
          <div className="spinner mb-6" />
          <p className="text-sm font-semibold">Generiere Report…</p>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-8">
            <ReviewOverview
              sessionCount={data.session_count}
              totalExercises={data.total_exercises}
              avgEffort={data.avg_effort}
            />
            <ReviewDeload weeks={data.weeks} />
            <ReviewInsights
              recommendations={data.recommendations}
              missingRegions={missingRegions}
              muscleLanguage={muscleLanguage}
              taxonomy={taxonomy}
            />
          </div>

          <div className="lg:col-span-8 space-y-8">
            <ReviewWeeksBreakdown weeks={data.weeks} selectedIndex={selectedWeek} onSelect={setSelectedWeek} />

            <ReviewPPLBalance bodyRegionScores={selectedData?.body_region_scores} />

            <ReviewMuscleImpact regionEntries={regionEntries} muscleLanguage={muscleLanguage} taxonomy={taxonomy} />

            <ReviewTopExercises
              topExercises={data.top_exercises}
              onInspectExercise={onInspectExercise}
            />
          </div>
        </div>
      ) : (
        <section className="p-8 rounded-3xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
          <p className="text-sm font-semibold text-center" style={{ color: 'var(--dim)' }}>Monatsreport konnte nicht geladen werden.</p>
        </section>
      )}
    </div>
  );
}
