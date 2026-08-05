import Body from 'react-muscle-highlighter';
import { muscleToRmhSlug } from '../lib/translations.js';

// groupScores: { [muscleIdOrWord]: { score, color } } — mehrere Keys können
// auf denselben RMH-Slug rollen (z.B. einzelne Trapezius-Köpfe → "trapezius").
// Nach Ziel-Slug aggregieren (niedrigster Score = frischest trainiert
// gewinnt), sonst überschreiben sich Duplikate zufällig statt sinnvoll.
function groupScoresToData(groupScores) {
  const bySlug = {};
  for (const [region, gs] of Object.entries(groupScores || {})) {
    if (!gs?.score) continue;
    const slug = muscleToRmhSlug(region);
    if (!slug) continue;
    if (!bySlug[slug] || gs.score < bySlug[slug].score) bySlug[slug] = { score: gs.score, color: gs.color };
  }
  return Object.entries(bySlug).map(([slug, { color }]) => ({ slug, color }));
}

const DONE_COLOR = '#22c55e';

function exercisesToData(exercises) {
  const slugs = new Set();
  for (const ex of Array.isArray(exercises) ? exercises : []) {
    const primary = ex?.primaryMuscles || ex?.primary_muscles || [];
    const secondary = ex?.secondaryMuscles || ex?.secondary_muscles || [];
    for (const m of [...primary, ...secondary]) {
      const slug = muscleToRmhSlug(m);
      if (slug) slugs.add(slug);
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
