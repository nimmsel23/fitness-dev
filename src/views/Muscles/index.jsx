import { useState, useEffect } from "react";
import { Brain, LayoutGrid, User } from "lucide-react";
import { getSessionHistory, getAllExercises, getMuscle } from "@db";

import MuscleHeader from "./MuscleHeader";
import MuscleAnalysis from "./MuscleAnalysis";
import MuscleDetailedMap from "./MuscleDetailedMap";
import MuscleBodyMap from "./MuscleBodyMap";
import MuscleInsights from "./MuscleInsights";
import AnatomyDetailModal from "../../components/AnatomyDetailModal";

const CAT_HEAVY = 72;
const CAT_RECOVERING = 96;
const CAT_SUPER = 168;
const MUSCLE_GROUPS = [
  "chest", "back", "shoulders", "arms", "core", "glutes", "quads", "hamstrings", "calves"
];

function getMuscleGroup(name) {
  const map = {
    chest: "chest", pec: "chest",
    back: "back", lats: "back", lat: "back", trapezius: "back",
    shoulder: "shoulders", shoulders: "shoulders", delts: "shoulders",
    arms: "arms", biceps: "arms", triceps: "arms", forearm: "arms",
    core: "core", abs: "core",
    glutes: "glutes",
    quads: "quads",
    hamstrings: "hamstrings",
    calves: "calves"
  };
  return map[name?.toLowerCase()] || name?.toLowerCase();
}

export default function Muscles({ hitMode, gender }) {
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [volExercises, setVolExercises] = useState([]);
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
        kbMap.set((ex.display_name || ex.name).toLowerCase(), ex);
      });

      // Volume Logic
      const cutoffVol = new Date();
      cutoffVol.setDate(cutoffVol.getDate() - days);
      const cutoffStr = cutoffVol.toISOString().slice(0, 10);
      
      const inRange = safeSessions
        .filter(s => s.date >= cutoffStr)
        .flatMap(s => s.exercises || [])
        .filter(ex => ex.done)
        .map(ex => {
          const kbEx = kbMap.get((ex.name || "").toLowerCase());
          return {
            ...ex,
            primaryMuscles: kbEx?.primary_muscles || kbEx?.primaryMuscles || ex.primaryMuscles || [],
            secondaryMuscles: kbEx?.secondary_muscles || kbEx?.secondaryMuscles || ex.secondaryMuscles || []
          };
        });
      setVolExercises(inRange);

      // HIT Logic
      const now = new Date();
      const lastSeen = {};
      const sortedSessions = [...safeSessions].sort((a, b) => b.date.localeCompare(a.date));

      for (const s of sortedSessions) {
        const sessionDate = new Date(s.date + "T12:00:00");
        const hoursAgo = (now - sessionDate) / (1000 * 60 * 60);

        if (s.activity) {
           if (hoursAgo <= 72) {
             const activeMuscles = s.activity.type === 'running' || s.activity.type === 'cycling' ? ['quads', 'calves', 'hamstrings', 'glutes'] :
                                   s.activity.type === 'swimming' ? ['back', 'shoulders', 'arms', 'core', 'quads'] :
                                   ['quads', 'calves'];
             for (const m of activeMuscles) {
               if (!lastSeen[m] || lastSeen[m].hours > hoursAgo) {
                 if (!lastSeen[m] || lastSeen[m].type !== 'strength' || lastSeen[m].hours > 72) {
                    lastSeen[m] = { hours: hoursAgo, type: 'cardio' };
                 }
               }
             }
           }
        } else {
           for (const ex of (s.exercises || []).filter(e => e.done)) {
             const kbEx = kbMap.get((ex.name || "").toLowerCase());
             const primary = kbEx?.primary_muscles || kbEx?.primaryMuscles || ex.primaryMuscles || [];
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
        hitMode={hitMode} 
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
          <div className="lg:col-span-8 p-10 rounded-[40px] border flex justify-center gap-20 bg-card border-line shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
            {showDetailed ? (
              <MuscleDetailedMap 
                exercises={volExercises} 
                gender={gender} 
                onGroupClick={setSelectedMuscleId}
              />
            ) : (
              <MuscleBodyMap 
                hitMode={hitMode} 
                scores={hitAnalysis.scores} 
                volExercises={volExercises} 
              />
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <MuscleAnalysis hitMode={hitMode} hitAnalysis={hitAnalysis} days={days} volExercises={volExercises} />
            <MuscleInsights hitMode={hitMode} hitAnalysis={hitAnalysis} />
          </div>
        </div>
      )}

      <AnatomyDetailModal 
        muscleId={selectedMuscleId}
        muscleData={muscleData}
        loading={muscleLoading}
        onClose={() => setSelectedMuscleId(null)}
      />
    </div>
  );
}
