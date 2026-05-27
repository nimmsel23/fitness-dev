import { useEffect, useState } from "react";
import { Brain } from "lucide-react";
import { api } from "../api.js";
import BodyMap from "../components/BodyMap.jsx";
import { useLocalSettings } from "./Settings.jsx";

const DAYS_OPTIONS = [7, 14, 28];
const MUSCLE_GROUPS = [
  "chest", "back", "shoulders", "arms", "core", "glutes", "quads", "hamstrings", "calves"
];

// Time brackets in hours
const CAT_HEAVY = 72;
const CAT_RECOVERING = 96;
const CAT_SUPER = 168;

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

export default function Muscles() {
  const { hit_default: hitMode } = useLocalSettings();
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [volExercises, setVolExercises] = useState([]);
  const [hitAnalysis, setHitAnalysis] = useState({ heavy: [], recovering: [], super: [], ready: [], scores: {} });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get("/session/history?limit=60"),
      api.get("/fitness/exercises/all")
    ]).then(([sessData, exData]) => {
      
      const sessions = sessData?.sessions || [];
      const kbExercises = exData?.exercises || [];

      const kbMap = new Map();
      kbExercises.forEach(ex => {
        kbMap.set((ex.display_name || ex.name || ex.exercise_id).toLowerCase(), ex);
      });

      // --- VOLUME LOGIC ---
      const cutoffVol = new Date();
      cutoffVol.setDate(cutoffVol.getDate() - days);
      const cutoffStr = cutoffVol.toISOString().slice(0, 10);
      
      const inRange = sessions
        .filter(s => s.date >= cutoffStr)
        .flatMap(s => s.exercises || [])
        .filter(ex => ex.done)
        .map(ex => {
          const kbEx = kbMap.get((ex.name || ex.display_name || ex.exercise_id || "").toLowerCase());
          return {
            ...ex,
            primaryMuscles: kbEx?.primary_muscles || kbEx?.primaryMuscles || ex.primaryMuscles || [],
            secondaryMuscles: kbEx?.secondary_muscles || kbEx?.secondaryMuscles || ex.secondaryMuscles || []
          };
        });
      setVolExercises(inRange);

      // --- HIT LOGIC ---
      const now = new Date();
      const lastSeen = {};
      const sortedSessions = [...sessions].sort((a, b) => b.date.localeCompare(a.date));

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
             const kbEx = kbMap.get((ex.name || ex.display_name || ex.exercise_id || "").toLowerCase());
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

      const heavy = [];
      const recovering = [];
      const supercomp = [];
      const ready = [];
      const scores = {};

      scores['fake_1'] = { score: 1 };
      scores['fake_2'] = { score: 2 };
      scores['fake_3'] = { score: 3 };
      scores['fake_4'] = { score: 4 };

      for (const m of MUSCLE_GROUPS) {
        const last = lastSeen[m];
        if (!last || last.type === 'cardio' || last.hours > CAT_SUPER) {
          ready.push(m);
          scores[m] = { score: 1 }; 
        } else if (last.hours > CAT_RECOVERING) {
          supercomp.push(m);
          scores[m] = { score: 2 }; 
        } else if (last.hours > CAT_HEAVY) {
          recovering.push(m);
          scores[m] = { score: 3 }; 
        } else {
          heavy.push(m);
          scores[m] = { score: 4 }; 
        }
      }

      setHitAnalysis({ heavy, recovering, super: supercomp, ready, scores, lastSeen });
    }).catch(e => console.error(e)).finally(() => setLoading(false));
  }, [days]); // Need to recalculate when days changes for volume mode

  // ==========================================
  // VIEW: HIT SUPERCOMPENSATION
  // ==========================================
  if (hitMode) {
    const { heavy, recovering, super: supercomp, ready, scores } = hitAnalysis;
    const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];

    const insightText = supercomp.length >= 3 
      ? "Perfektes Zeitfenster! Viele Muskeln sind superkompensiert. Ein intensiver Reiz heute bringt maximalen Fortschritt."
      : heavy.length >= 4 
      ? "Dein Nervensystem und viele Muskeln sind stark belastet. Fokus auf Erholung, leichte Aktivität oder Mobility empfohlen."
      : recovering.length >= 3
      ? "Einige Muskeln sind noch in Erholung. Ein leichtes Pump-Training oder gezieltes Training anderer Gruppen ist optimal."
      : "Du bist frisch und bereit. Such dir eine Fokus-Region aus und setze einen neuen Reiz!";

    return (
      <div className="pb-20">
        <div className="mb-8">
           <div className="text-[10px] font-black uppercase tracking-widest text-accent mb-2">HIT Modus</div>
           <h2 className="text-2xl font-black text-ink">Superkompensation</h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-30">
            <div className="spinner mb-6" />
            <p className="text-xs font-black uppercase tracking-[0.3em]">Berechne…</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 p-10 rounded-[40px] border flex justify-center gap-20 bg-card border-line shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
              <div className="text-center relative z-10">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20 mb-8">Anterior</div>
                <BodyMap groupScores={scores} highlightedColors={colors} style={{ maxWidth: 200 }} />
              </div>
              <div className="text-center relative z-10">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20 mb-8">Posterior</div>
                <BodyMap groupScores={scores} type="posterior" highlightedColors={colors} style={{ maxWidth: 200 }} />
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="card p-8 border-accent/20 shadow-xl bg-gradient-to-b from-card to-bg2">
                <div className="label-caps mb-6 flex items-center gap-2 text-accent">
                   <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                   Fokus-Analyse
                </div>
                <div className="space-y-6">
                  <p className="text-sm font-medium opacity-70 leading-relaxed">
                    Basierend auf der Zeit seit deinem letzten Training:
                  </p>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-3 text-xs">
                        <div className="w-4 h-4 rounded-lg bg-[#ef4444] shadow-lg shadow-[#ef4444]/20" />
                        <span className="font-bold opacity-50 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">Stark belastet</span>
                      </div>
                      <span className="text-[11px] font-black">{heavy.length} Muskeln</span>
                    </div>
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-3 text-xs">
                        <div className="w-4 h-4 rounded-lg bg-[#f59e0b] shadow-lg shadow-[#f59e0b]/20" />
                        <span className="font-bold opacity-50 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">In Erholung</span>
                      </div>
                      <span className="text-[11px] font-black">{recovering.length} Muskeln</span>
                    </div>
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-3 text-xs">
                        <div className="w-4 h-4 rounded-lg bg-[#22c55e] shadow-lg shadow-[#22c55e]/20" />
                        <span className="font-bold opacity-50 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">Superkompensiert</span>
                      </div>
                      <span className="text-[11px] font-black">{supercomp.length} Muskeln</span>
                    </div>
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-3 text-xs">
                        <div className="w-4 h-4 rounded-lg bg-[#3b82f6] shadow-lg shadow-[#3b82f6]/20" />
                        <span className="font-bold opacity-50 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">Leicht belastet / Bereit</span>
                      </div>
                      <span className="text-[11px] font-black">{ready.length} Muskeln</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-6 bg-accent/5 border-accent/10 shadow-lg border-dashed">
                <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                  <Brain size={12} /> Smart Insight
                </h4>
                <p className="text-[11px] font-medium opacity-80 leading-relaxed text-accent">
                  {insightText}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW: VOLUME MODE
  // ==========================================
  return (
    <div className="pb-20">
      <div className="mb-4">
         <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Volume Modus</div>
         <h2 className="text-2xl font-black text-ink mb-6">Muskel-Coverage</h2>
         
         <div className="flex gap-2 bg-card p-1.5 rounded-2xl border border-line shadow-inner max-w-xl">
           {DAYS_OPTIONS.map(d => (
             <button key={d} onClick={() => setDays(d)} 
               className={`flex-1 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${days === d ? 'bg-accent text-black shadow-lg shadow-accent/20' : 'text-dim hover:text-ink hover:bg-white/5'}`}>
               {d} Tage Fokus
             </button>
           ))}
         </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-30">
          <div className="spinner mb-6" />
          <p className="text-xs font-black uppercase tracking-[0.3em]">Analysiere Muskelgruppen…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          <div className="lg:col-span-8 p-10 rounded-[40px] border flex justify-center gap-20 bg-card border-line shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
            <div className="text-center relative z-10">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20 mb-8">Anterior</div>
              <BodyMap exercises={volExercises} highlightedColors={['#ef4444', '#f59e0b', '#22c55e', '#3b82f6']} style={{ maxWidth: 200 }} />
            </div>
            <div className="text-center relative z-10">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20 mb-8">Posterior</div>
              <BodyMap exercises={volExercises} type="posterior" highlightedColors={['#ef4444', '#f59e0b', '#22c55e', '#3b82f6']} style={{ maxWidth: 200 }} />
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="card p-8 border-accent/20 shadow-xl bg-gradient-to-b from-card to-bg2">
              <div className="label-caps mb-6 flex items-center gap-2 text-accent">
                 <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                 Fokus-Analyse
              </div>
              {volExercises.length === 0 ? (
                <p className="text-sm opacity-40 py-8 text-center border border-dashed border-line rounded-2xl">Keine Trainingseinheiten im gewählten Zeitraum gefunden.</p>
              ) : (
                <div className="space-y-6">
                  <p className="text-sm font-medium opacity-70 leading-relaxed">
                    Die Heatmap visualisiert die kumulierte Belastung deiner Muskulatur in den letzten {days} Tagen.
                  </p>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-xs">
                      <div className="w-4 h-4 rounded-lg bg-[#ef4444] shadow-lg shadow-[#ef4444]/20" />
                      <span className="font-bold opacity-60">Sehr hohe Belastung</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="w-4 h-4 rounded-lg bg-[#f59e0b] shadow-lg shadow-[#f59e0b]/20" />
                      <span className="font-bold opacity-60">Hohe Belastung</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="w-4 h-4 rounded-lg bg-[#22c55e] shadow-lg shadow-[#22c55e]/20" />
                      <span className="font-bold opacity-60">Moderate Belastung</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="w-4 h-4 rounded-lg bg-[#3b82f6] shadow-lg shadow-[#3b82f6]/20" />
                      <span className="font-bold opacity-60">Leichte Belastung</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="card p-6 bg-accent/5 border-accent/10 shadow-lg border-dashed">
              <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <Brain size={12} />
                Smart Insight
              </h4>
              <p className="text-[11px] font-medium opacity-60 leading-relaxed">
                Nutze diese Ansicht, um Coverage-Gaps zu identifizieren. Blaue oder graue Bereiche 
                sollten im nächsten Training bevorzugt werden, um Dysbalancen zu vermeiden.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
