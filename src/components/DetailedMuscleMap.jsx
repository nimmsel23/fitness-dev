import Body from 'react-muscle-highlighter';
import { getMuscleVizMap, primeMuscleViz, hasMuscleViz } from '@db';

let _vizMap = null;
let _vizLoadStarted = false;
function ensureVizLoading() {
  if (_vizLoadStarted || hasMuscleViz()) return;
  _vizLoadStarted = true;
  getMuscleVizMap().then((viz) => { _vizMap = viz; primeMuscleViz(viz); });
}

// groupScores: { [region]: { score: 3, color: '#22c55e' }, ... }
// region ist dasselbe Wort wie in BodyMap.jsx (region["101_..."] === "chest"),
// hier direkt als RMH-Slug weiterverwendet — kein eigenes Mapping.
function groupScoresToData(groupScores) {
  return Object.entries(groupScores).map(([slug, { color }]) => ({ slug, color }));
}

const DONE_COLOR = '#22c55e';

function exercisesToData(exercises) {
  ensureVizLoading();
  const slugs = new Set();
  for (const ex of Array.isArray(exercises) ? exercises : []) {
    const primary = ex?.primaryMuscles || ex?.primary_muscles || [];
    const secondary = ex?.secondaryMuscles || ex?.secondary_muscles || [];
    for (const m of [...primary, ...secondary]) {
      const region = _vizMap?.region?.[m];
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
