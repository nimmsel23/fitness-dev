import { useEffect, useState } from 'react';
import { getWeeklyReport, getSettings } from '../../db.js';

import ReviewHeader from './ReviewHeader';
import ReviewOverview from './ReviewOverview';
import ReviewInsights from './ReviewInsights';
import ReviewMuscleImpact from './ReviewMuscleImpact';
import ReviewSessionList from './ReviewSessionList';

export default function WeeklyReview({ onNavigate }) {
  const [week, setWeek] = useState('current');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hitMode, setHitMode] = useState(false);

  useEffect(() => {
    getSettings().then(s => setHitMode(!!s.hitMode));
  }, []);

  useEffect(() => {
    setLoading(true);
    getWeeklyReport(week)
      .then(d => setData(d || null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [week]);

  const regionEntries = Object.entries(data?.body_region_scores || {}).sort((a, b) => b[1] - a[1]);
  const missingRegions = data?.missing_regions || [];

  return (
    <div className="space-y-6 pb-20">
      <ReviewHeader week={week} setWeek={setWeek} />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-30">
          <div className="spinner mb-6" />
          <p className="text-xs font-black uppercase tracking-[0.3em]">Generiere Report…</p>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-8">
            <ReviewOverview 
              sessionCount={data.session_count} 
              totalVolume={data.total_volume} 
              hitMode={hitMode} 
            />
            <ReviewInsights 
              recommendations={data.recommendations} 
              missingRegions={missingRegions} 
            />
          </div>

          <div className="lg:col-span-8 space-y-8">
            <ReviewMuscleImpact regionEntries={regionEntries} />
            <ReviewSessionList 
              sessions={data.sessions} 
              onNavigate={onNavigate} 
              hitMode={hitMode} 
            />
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
