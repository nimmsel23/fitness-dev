import Body from 'react-muscle-highlighter';
import { muscleToGroups } from '../lib/muscleMapping.js';

const GROUP_TO_RMH = {
  chest:      ['chest'],
  back:       ['upper-back', 'lower-back', 'trapezius'],
  shoulders:  ['deltoids'],
  arms:       ['biceps', 'triceps', 'forearm'],
  core:       ['abs', 'obliques'],
  glutes:     ['gluteal'],
  quads:      ['quadriceps'],
  hamstrings: ['hamstring'],
  calves:     ['calves'],
  legs:       ['quadriceps', 'hamstring'],
};

// groupScores: { chest: { score: 3, color: '#22c55e' }, ... }
// color wird direkt übergeben — kein intensity-Index nötig
function groupScoresToData(groupScores) {
  return Object.entries(groupScores).flatMap(([group, { color }]) => {
    return (GROUP_TO_RMH[group] || []).map(slug => ({ slug, color }));
  });
}

const DONE_COLOR = '#22c55e';

// Direkter exercises-Modus (analog zu BodyMap.jsx/RBH) — zeigt schlicht, welche
// Muskelgruppen die übergebenen Übungen betreffen, ohne Superkomp-Score.
// Vormals fehlte dieser Pfad komplett: MuscleMapModal.jsx übergab exercises,
// die Komponente kannte aber nur groupScores und rendere daher immer leer.
function exercisesToData(exercises) {
  const groups = new Set();
  for (const ex of Array.isArray(exercises) ? exercises : []) {
    const primary = ex?.primaryMuscles || ex?.primary_muscles || [];
    const secondary = ex?.secondaryMuscles || ex?.secondary_muscles || [];
    const exName = (ex?.name || '').toLowerCase();
    for (const m of [...primary, ...secondary]) {
      muscleToGroups(m, exName).forEach(g => groups.add(g));
    }
  }
  return [...groups].flatMap(group => (GROUP_TO_RMH[group] || []).map(slug => ({ slug, color: DONE_COLOR })));
}

export default function DetailedMuscleMap({ groupScores, exercises, style, gender, side, scale = 2, onGroupClick }) {
  const data = exercises ? exercisesToData(exercises) : (groupScores ? groupScoresToData(groupScores) : []);

  return (
    <div style={{ ...style, display: 'flex', justifyContent: 'center' }}>
      <Body
        data={data}
        gender={gender || 'male'}
        side={side || 'front'}
        scale={scale}
        defaultFill="var(--line)"
        border="none"
        onBodyPartPress={part => onGroupClick?.(part.slug)}
      />
    </div>
  );
}
