import { useState, useEffect, useMemo } from "react";
import BodyMap from "../BodyMap";
import DetailedMuscleMap from "../DetailedMuscleMap";
import AnatomyDetailModal from "../AnatomyDetailModal";
import { getMuscle } from "@db";

// Normalisiert Session-Muskelnamen auf interne Gruppen-IDs
function toGroup(m) {
  const g = String(m || '').toLowerCase().trim();
  const MAP = {
    chest: 'chest', pec: 'chest', pectoralis: 'chest',
    back: 'back', lat: 'back', lats: 'back', latissimus: 'back', trap: 'back', traps: 'back', rhomboid: 'back',
    shoulders: 'shoulders', shoulder: 'shoulders', delt: 'shoulders', delts: 'shoulders', deltoid: 'shoulders',
    arms: 'arms', arm: 'arms', bicep: 'arms', biceps: 'arms', tricep: 'arms', triceps: 'arms', forearm: 'arms',
    core: 'core', abs: 'core', ab: 'core', obliques: 'core',
    glutes: 'glutes', glute: 'glutes', gluteal: 'glutes', gluteus: 'glutes',
    quads: 'quads', quad: 'quads', quadriceps: 'quads', legs: 'quads', leg: 'quads',
    hamstrings: 'hamstrings', hamstring: 'hamstrings',
    calves: 'calves', calf: 'calves', gastrocnemius: 'calves',
  };
  return MAP[g] || null;
}

const ACTIVITY_MUSCLES = {
  // Brustschwimmen: Pec-Zug, Schultern, Arme, Core, Froschkick
  swimming:  ["chest", "shoulders", "arms", "core", "quads", "hamstrings"],
  // Laufen: Gluteus trägt wesentlich zur Propulsion bei
  running:   ["quads", "hamstrings", "calves", "glutes"],
  // Radfahren: Glutes + Hamstrings beim Aufwärtszug (Klickpedale)
  cycling:   ["quads", "hamstrings", "calves", "glutes"],
  // Wandern: ähnlich Laufen + Core für Balance
  hiking:    ["quads", "hamstrings", "calves", "glutes", "core"],
  // Rudern: Drive = Beine, Finish = Rücken + Arme, Shoulders überall
  rowing:    ["back", "shoulders", "arms", "quads", "hamstrings", "core"],
  // Yoga: Core + Schultern (Stütz), Rücken (Extensionen)
  yoga:      ["core", "shoulders", "back"],
  // Boxen: Schultern, Arme, Core-Rotation, Quads (Footwork)
  boxing:    ["shoulders", "arms", "core", "quads"],
};

// Tage seit letztem Training → Superkompensationsphase
// Cardio: kürzeres Fenster (schnellere Erholung), kein Rot (kein Muskeltrauma)
function superKompFreq(daysSince, isCardio = false) {
  if (isCardio) {
    if (daysSince <= 1) return 2;   // gelb: kurze Erholung
    if (daysSince <= 3) return 3;   // grün: bereit
    if (daysSince <= 10) return 4;  // blau: noch aktiv
    return 0;
  }
  if (daysSince <= 2) return 1;
  if (daysSince <= 4) return 2;
  if (daysSince <= 7) return 3;
  if (daysSince <= 21) return 4;
  return 0;
}

// Berechnet lastTrainedDate + isCardio pro Muskelgruppe aus Session-Array
function buildLastTrainedMap(sessions) {
  const last = {}; // { [group]: { date, isCardio } }
  const update = (date, group, isCardio) => {
    if (!last[group] || date > last[group].date) last[group] = { date, isCardio };
    // Kraft überschreibt Cardio wenn gleicher Tag
    else if (date === last[group].date && !isCardio) last[group].isCardio = false;
  };
  for (const s of sessions || []) {
    if (!s?.date) continue;
    // Kraft-Exercises
    for (const ex of s.exercises || []) {
      if (ex.done === false) continue;
      for (const m of [...(ex.primaryMuscles || []), ...(ex.secondaryMuscles || [])]) {
        const g = toGroup(m);
        if (g) update(s.date, g, false);
      }
    }
    // Cardio-Activity
    const actType = s.activity?.type;
    const actMuscles = actType && ACTIVITY_MUSCLES[actType];
    if (actMuscles) actMuscles.forEach(g => update(s.date, g, true));
  }
  return last;
}

const SUPERKOMP_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6'];

const LEGEND = [
  { freq: 1, color: '#ef4444', label: '0–2 Tage', sub: 'Erholung' },
  { freq: 2, color: '#f59e0b', label: '3–4 Tage', sub: 'fast bereit' },
  { freq: 3, color: '#22c55e', label: '5–7 Tage', sub: 'Peak — jetzt!' },
  { freq: 4, color: '#3b82f6', label: '8–21 Tage', sub: 'past Peak' },
];

export default function MuscleBody({ allSessions, enrichedRecent, recentDays = 7, highlighterMode = 'body', gender = 'male' }) {
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

  // Superkompensations-Scores aus Session-History
  const groupScores = useMemo(() => {
    const sessions = allSessions || enrichedRecent || [];
    const lastTrained = buildLastTrainedMap(sessions);
    const today = new Date().toISOString().slice(0, 10);
    const scores = {};
    for (const [group, { date, isCardio }] of Object.entries(lastTrained)) {
      const daysSince = Math.round((new Date(today) - new Date(date)) / 86400000);
      const freq = superKompFreq(daysSince, isCardio);
      if (freq > 0) scores[group] = { score: freq };
    }
    return scores;
  }, [allSessions, enrichedRecent]);

  const isMuscles = highlighterMode === 'muscles';
  const safeRecent = Array.isArray(enrichedRecent) ? enrichedRecent.filter(Boolean) : [];
  const recentExercises = safeRecent
    .flatMap(s => (s?.exercises || []).filter(ex => ex.done !== false))
    .filter(Boolean);

  const sharedProps = { onGroupClick: setSelectedMuscleId };

  const frontProps = isMuscles
    ? { exercises: recentExercises, gender, side: 'front', colors: SUPERKOMP_COLORS, ...sharedProps }
    : { groupScores, highlightedColors: SUPERKOMP_COLORS, style: { maxWidth: 160 }, ...sharedProps };

  const backProps = isMuscles
    ? { exercises: recentExercises, gender, side: 'back', colors: SUPERKOMP_COLORS, ...sharedProps }
    : { groupScores, highlightedColors: SUPERKOMP_COLORS, style: { maxWidth: 160 }, ...sharedProps };

  const HighlighterFront = isMuscles ? DetailedMuscleMap : BodyMap;
  const HighlighterBack  = isMuscles ? DetailedMuscleMap : BodyMap;

  return (
    <div className="alpha-card p-10 flex flex-col h-full bg-gradient-to-br from-fit-card to-fit-bg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="label-caps !mb-0">Muskel-Status</h3>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">
          Superkompensation · {recentDays}d
        </span>
      </div>

      <div className="flex flex-1 justify-center items-center gap-16 scale-110 origin-center">
        <HighlighterFront {...frontProps} />
        <HighlighterBack  {...backProps}  />
      </div>

      {/* Legende */}
      <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-1.5">
        {LEGEND.map(({ color, label, sub }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="text-[10px] opacity-60 leading-tight">
              <span className="font-bold">{label}</span> · {sub}
            </span>
          </div>
        ))}
      </div>

      <AnatomyDetailModal
        muscleId={selectedMuscleId}
        muscleData={muscleData}
        loading={muscleLoading}
        onClose={() => setSelectedMuscleId(null)}
      />
    </div>
  );
}
