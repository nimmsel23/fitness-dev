import { useState, useEffect } from "react";
import { getRecoveryAnalytics, getMuscle, getRecentSessions } from "@db";

import MuscleHeader from "./MuscleHeader";
import MuscleAnalysis from "./MuscleAnalysis";
import MuscleDetailedMap from "./MuscleDetailedMap";
import MuscleBodyMap from "./MuscleBodyMap";
import MuscleInsights from "./MuscleInsights";
import AnatomyDetailModal from "../../components/AnatomyDetailModal";
import SessionDetailModal from "./SessionDetailModal";
import ReviewSessionList from "../WeeklyReview/ReviewSessionList";

export default function Muscles({ gender, muscleLanguage = 'de', taxonomy = null, recentDays = 10, onInspectExercise = null }) {
  const [days, setDays] = useState(recentDays);
  const [loading, setLoading] = useState(true);
  const [hitAnalysis, setHitAnalysis] = useState({ heavy: [], recovering: [], super: [], ready: [], scores: {} });
  const [showDetailed, setShowDetailed] = useState(false);
  const [selectedMuscleId, setSelectedMuscleId] = useState(null);
  const [muscleData, setMuscleData] = useState(null);
  const [muscleLoading, setMuscleLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    if (!selectedMuscleId) { setMuscleData(null); return; }
    setMuscleLoading(true);
    getMuscle(selectedMuscleId)
      .then(d => setMuscleData(d || null))
      .catch(() => setMuscleData(null))
      .finally(() => setMuscleLoading(false));
  }, [selectedMuscleId]);

  useEffect(() => {
    setDays(recentDays);
  }, [recentDays]);

  useEffect(() => {
    setLoading(true);
    getRecoveryAnalytics(days)
      .then((data) => setHitAnalysis(data?.hit_analysis || { heavy: [], recovering: [], super: [], ready: [], scores: {} }))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [days]);

  useEffect(() => {
    const cutoff = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    getRecentSessions(60)
      .then(list => {
        const filtered = (Array.isArray(list) ? list : [])
          .filter(s => s.date >= cutoff)
          .map(s => ({ ...s, exercise_count: s.exercises?.length || 0 }))
          .sort((a, b) => b.date.localeCompare(a.date));
        setSessions(filtered);
      })
      .catch(() => setSessions([]));
  }, [days]);

  return (
    <div className="pb-32">
      <MuscleHeader 
        days={days} 
        setDays={setDays} 
        showDetailed={showDetailed} 
        setShowDetailed={setShowDetailed} 
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-30">
          <div className="spinner mb-6" />
          <p className="text-xs font-black uppercase tracking-[0.3em]">Berechne…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 p-10 rounded-[40px] border flex justify-center gap-20 bg-fit-card border-fit-line shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
            {showDetailed ? (
              <MuscleDetailedMap
                gender={gender}
                scores={hitAnalysis.scores}
                onGroupClick={setSelectedMuscleId}
              />
            ) : (
              <MuscleBodyMap
                scores={hitAnalysis.scores}
                onGroupClick={setSelectedMuscleId}
              />
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <MuscleAnalysis hitAnalysis={hitAnalysis} muscleLanguage={muscleLanguage} taxonomy={taxonomy} />
            <MuscleInsights hitAnalysis={hitAnalysis} />
          </div>
        </div>
      )}

      {!loading && (
        <div className="mt-8">
          <ReviewSessionList
            sessions={sessions}
            onNavigate={(_, date) => setSelectedSession(sessions.find(s => s.date === date) || null)}
            muscleLanguage={muscleLanguage}
            taxonomy={taxonomy}
          />
        </div>
      )}

      <SessionDetailModal
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
        muscleLanguage={muscleLanguage}
        taxonomy={taxonomy}
      />

      <AnatomyDetailModal
        muscleId={selectedMuscleId}
        muscleData={muscleData}
        loading={muscleLoading}
        onClose={() => setSelectedMuscleId(null)}
        muscleLanguage={muscleLanguage}
        taxonomy={taxonomy}
        onInspectExercise={onInspectExercise}
      />
    </div>
  );
}
