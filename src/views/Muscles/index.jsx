import { useState, useEffect } from "react";
import { getSessionHistory, getAllExercises, getMuscle } from "@db";
import { translateMuscle } from "../../lib/translations";
import { ACTIVITY_MUSCLE_GROUPS } from "../../constants/ActivityConstants";

import MuscleHeader from "./MuscleHeader";
import MuscleAnalysis from "./MuscleAnalysis";
import MuscleDetailedMap from "./MuscleDetailedMap";
import MuscleBodyMap from "./MuscleBodyMap";
import MuscleInsights from "./MuscleInsights";
import AnatomyDetailModal from "../../components/AnatomyDetailModal";

const CAT_HEAVY     = 72;   // < 3 Tage: stark belastet
const CAT_RECOVERING = 168;  // 3–7 Tage: Erholung
const CAT_SUPER      = 336;  // 7–14 Tage: Superkompensation
const MUSCLE_GROUPS = [
  "chest", "back", "shoulders", "arms", "core", "glutes", "quads", "hamstrings", "calves"
];

function getMuscleGroup(name) {
  const map = {
    chest: "chest", pec: "chest", pecs: "chest",
    back: "back", lats: "back", lat: "back", trapezius: "back",
    shoulder: "shoulders", shoulders: "shoulders", delts: "shoulders",
    arms: "arms", biceps: "arms", triceps: "arms", forearm: "arms",
    core: "core", abs: "core",
    glutes: "glutes",
    quads: "quads",
    hamstrings: "hamstrings",
    calves: "calves",
    // Numeric slugs
    "100_chest": "chest", "101_pectoralis_major": "chest", "102_pectoralis_major_clavicular": "chest",
    "200_back": "back", "201_latissimus_dorsi": "back", "202_trapezius_upper": "back",
    "300_shoulders": "shoulders", "301_anterior_deltoid": "shoulders",
    "400_arms": "arms", "401_biceps_brachii": "arms", "403_triceps_brachii": "arms",
    "500_core": "core", "501_rectus_abdominis": "core",
    "600_legs": "quads", "601_gluteus_maximus": "glutes", "603_quadriceps": "quads", "604_hamstrings": "hamstrings",
    "700_calves": "calves"
  };
  const k = String(name || "").toLowerCase().trim();
  if (map[k]) return map[k];
  const m = k.match(/^(\d+)_/);
  if (m) {
    const n = parseInt(m[1]);
    if (n >= 100 && n < 200) return 'chest';
    if (n >= 200 && n < 300) return 'back';
    if (n >= 300 && n < 400) return 'shoulders';
    if (n >= 400 && n < 500) return 'arms';
    if (n >= 500 && n < 600) return 'core';
    if (n >= 600 && n < 700) {
      if (n <= 602) return 'glutes';
      if (n === 603) return 'quads';
      if (n === 604) return 'hamstrings';
      return 'legs';
    }
    if (n >= 700 && n < 800) return 'calves';
  }
  return k;
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
        if (!last || last.type === 'cardio' || last.hours > CAT_SUPER) {
          ready.push(m); scores[m] = { score: 1 }; 
        } else if (last.hours > CAT_RECOVERING) {
          supercomp.push(m); scores[m] = { score: 2 }; 
        } else if (last.hours > CAT_HEAVY) {
          recovering.push(m); scores[m] = { score: 3 }; 
        } else {
          heavy.push(m); scores[m] = { score: 4 }; 
        }
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
