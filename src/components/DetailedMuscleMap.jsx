import Body from 'react-muscle-highlighter';
import { muscleToRegion } from '../lib/db/shared/muscle.js';

// groupScores: { [region]: { score: 3, color: '#22c55e' }, ... }
function groupScoresToData(groupScores) {
  return Object.entries(groupScores).map(([slug, { color }]) => ({ slug, color }));
}

const DONE_COLOR = '#22c55e';

function exercisesToData(exercises) {
  const slugs = new Set();
  for (const ex of Array.isArray(exercises) ? exercises : []) {
    const primary = ex?.primaryMuscles || ex?.primary_muscles || [];
    const secondary = ex?.secondaryMuscles || ex?.secondary_muscles || [];
    for (const m of [...primary, ...secondary]) {
      const region = muscleToRegion(m);
      if (region) slugs.add(region);
    }
  }
  return [...slugs].map(slug => ({ slug, color: DONE_COLOR }));
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
