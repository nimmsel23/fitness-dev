import { useState, useEffect } from "react";
import { getSessionHistory, getAllExercises, getMuscle } from "@db";
import { ACTIVITY_MUSCLE_GROUPS } from "../../constants/ActivityConstants";
import { muscleToGroups } from "../../lib/muscleMapping";

import MuscleHeader from "./MuscleHeader";
import MuscleAnalysis from "./MuscleAnalysis";
import MuscleDetailedMap from "./MuscleDetailedMap";
import MuscleBodyMap from "./MuscleBodyMap";
import MuscleInsights from "./MuscleInsights";
import AnatomyDetailModal from "../../components/AnatomyDetailModal";

const CAT_HEAVY     = 72;   // < 3 Tage: stark belastet
const CAT_RECOVERING = 168;  // 3–7 Tage: Erholung
const CAT_SUPER      = 336;  // 7–14 Tage: Superkompensation

// Cardio: kürzeres Zeitfenster als Kraft (siehe CLAUDE.md) — kein "Fenster schließt sich"-Tier
const CARDIO_HEAVY      = 24;   // ≤ 1 Tag
const CARDIO_RECOVERING = 96;   // ≤ 4 Tage
const CARDIO_SUPER      = 240;  // ≤ 10 Tage

// score → Farbe, identisch zu hitColors in MuscleBodyMap.jsx (index = score-1)
const SCORE_COLORS = { 1: '#3b82f6', 2: '#22c55e', 3: '#f59e0b', 4: '#ef4444' };

const MUSCLE_GROUPS = [
  "chest", "back", "shoulders", "arms", "core", "glutes", "quads", "hamstrings", "calves"
];

// Delegiert an die zentrale Muskel→Gruppe-Zuordnung (src/lib/muscleMapping.js) —
// vormals eine eigene, dritte Kopie dieser Tabelle.
function getMuscleGroup(name) {
  return muscleToGroups(name)[0] || String(name || "").toLowerCase().trim();
}

export default function Muscles({ gender, muscleLanguage = 'de', taxonomy = null, recentDays = 7 }) {
  const [days, setDays] = useState(recentDays);
  const [loading, setLoading] = useState(true);
  const [recentExercises, setRecentExercises] = useState([]);
  const [hitAnalysis, setHitAnalysis] = useState({ heavy: [], recovering: [], super: [], ready: [], scores: {} });
  const [showDetailed, setShowDetailed] = useState(false);
  const [selectedMuscleId, setSelectedMuscleId] = useState(null);
  const [muscleData, setMuscleData] = useState(null);
  const [muscleLoading, setMuscleLoading] = useState(false);

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
    Promise.all([
      getSessionHistory(60),
      getAllExercises()
    ]).then(([sessions, kbExercises]) => {
      const safeSessions = Array.isArray(sessions) ? sessions.filter(Boolean).map(s => ({
        ...s,
        exercises: Array.isArray(s.exercises) ? s.exercises : [],
      })) : [];
      const kbMap = new Map();
      kbExercises.forEach(ex => {
        kbMap.set((ex.display_name || ex.name || "").toLowerCase(), ex);
      });

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const cutoffStr = cutoff.toISOString().slice(0, 10);
      
      const inRange = safeSessions
        .filter(s => s.date >= cutoffStr)
        .flatMap(s => s.exercises || [])
        .map(ex => {
          const kbEx = kbMap.get((ex.name || "").toLowerCase());
          return {
            ...ex,
            primaryMuscles: kbEx?.primary_muscles || kbEx?.primaryMuscles || ex.primaryMuscles || [],
            secondaryMuscles: kbEx?.secondary_muscles || kbEx?.secondaryMuscles || ex.secondaryMuscles || []
          };
        });
      setRecentExercises(inRange);

      const now = new Date();
      const lastSeen = {};
      const sortedSessions = [...safeSessions].sort((a, b) => b.date.localeCompare(a.date));

      for (const s of sortedSessions) {
        const sessionDate = new Date(s.date + "T12:00:00");
        const hoursAgo = (now - sessionDate) / (1000 * 60 * 60);

        if (s.activity) {
           if (hoursAgo <= 168) {
             const activeMuscles = ACTIVITY_MUSCLE_GROUPS[s.activity.type] || ['quads', 'calves'];
             for (const m of activeMuscles) {
               if (!lastSeen[m] || lastSeen[m].hours > hoursAgo) {
                 if (!lastSeen[m] || lastSeen[m].type !== 'strength' || lastSeen[m].hours > 72) {
                    lastSeen[m] = { hours: hoursAgo, type: 'cardio' };
                 }
               }
             }
           }
        } else {
           for (const ex of (s.exercises || [])) {
             // Snapshot-First: inline-Werte gewinnen, KB nur Fallback (s. analysis.js).
             const kbEx = kbMap.get((ex.name || "").toLowerCase());
             const primary = (ex.primaryMuscles?.length ? ex.primaryMuscles : null) || kbEx?.primary_muscles || kbEx?.primaryMuscles || [];
             const secondary = kbEx?.secondary_muscles || kbEx?.secondaryMuscles || ex.secondaryMuscles || [];
             
             for (const m of [...primary, ...secondary]) {
               const group = getMuscleGroup(m);
               if (group && MUSCLE_GROUPS.includes(group)) {
                 if (!lastSeen[group] || lastSeen[group].hours > hoursAgo) {
                   lastSeen[group] = { hours: hoursAgo, type: 'strength' };
                 }
               }
             }
           }
        }
      }

      const heavy = [], recovering = [], supercomp = [], ready = [], scores = {};
      for (const m of MUSCLE_GROUPS) {
        const last = lastSeen[m];
        let score;
        if (!last) {
          score = 1;
        } else if (last.type === 'cardio') {
          // Cardio verfällt schneller als Kraft (kürzere Zeitfenster)
          if (last.hours > CARDIO_SUPER) score = 1;
          else if (last.hours > CARDIO_RECOVERING) score = 2;
          else if (last.hours > CARDIO_HEAVY) score = 3;
          else score = 4;
        } else if (last.hours > CAT_SUPER) {
          score = 1;
        } else if (last.hours > CAT_RECOVERING) {
          score = 2;
        } else if (last.hours > CAT_HEAVY) {
          score = 3;
        } else {
          score = 4;
        }
        scores[m] = { score, color: SCORE_COLORS[score] };
        if (score === 1) ready.push(m);
        else if (score === 2) supercomp.push(m);
        else if (score === 3) recovering.push(m);
        else heavy.push(m);
      }
      setHitAnalysis({ heavy, recovering, super: supercomp, ready, scores, lastSeen });
    }).catch(e => console.error(e)).finally(() => setLoading(false));
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
                exercises={recentExercises}
                gender={gender}
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

      <AnatomyDetailModal 
        muscleId={selectedMuscleId}
        muscleData={muscleData}
        loading={muscleLoading}
        onClose={() => setSelectedMuscleId(null)}
        muscleLanguage={muscleLanguage}
        taxonomy={taxonomy}
      />
    </div>
  );
}
