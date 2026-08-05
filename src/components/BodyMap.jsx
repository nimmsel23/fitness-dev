import Model from 'react-body-highlighter';
import { muscleToRbhSlug } from '../lib/translations.js';

function addScore(scores, muscle, amount) {
  const slug = muscleToRbhSlug(muscle);
  if (!slug) return;
  scores[slug] = (scores[slug] || 0) + amount;
}

export function exercisesToModelData(exercises) {
  const rbhScores = {};
  for (const ex of Array.isArray(exercises) ? exercises : []) {
    const primary = Array.isArray(ex?.primaryMuscles) ? ex.primaryMuscles : Array.isArray(ex?.primary_muscles) ? ex.primary_muscles : [];
    const secondary = Array.isArray(ex?.secondaryMuscles) ? ex.secondaryMuscles : Array.isArray(ex?.secondary_muscles) ? ex.secondary_muscles : [];

    primary.forEach((id) => addScore(rbhScores, id, 2));
    secondary.forEach((id) => addScore(rbhScores, id, 1));
  }

  return Object.entries(rbhScores).map(([muscle, score]) => ({
    name: muscle,
    muscles: [muscle],
    frequency: Math.ceil(score),
  }));
}

// groupScores: { [muscleIdOrWord]: { score, color } } — Keys können jetzt
// Einzelmuskel-IDs sein (z.B. "603_gluteus_maximus" und "608_gluteus_medius"
// getrennt), die beide auf denselben RBH-Slug ("gluteal") rollen. Deshalb
// erst nach Ziel-Slug aggregieren (niedrigster Score = frischest trainiert
// gewinnt), statt 1:1 pro Input-Key einen Eintrag zu erzeugen — sonst
// bekäme react-body-highlighter zwei Einträge für denselben Slug und der
// zuletzt iterierte (nicht der frischeste) würde zufällig gewinnen.
function groupScoresToModelData(groupScores) {
  const bySlug = {};
  for (const [region, gs] of Object.entries(groupScores || {})) {
    if (!gs?.score) continue;
    const slug = muscleToRbhSlug(region);
    if (!slug) continue;
    if (!bySlug[slug] || gs.score < bySlug[slug]) bySlug[slug] = gs.score;
  }
  return Object.entries(bySlug).map(([slug, score]) => ({
    name: slug,
    muscles: [slug],
    frequency: Math.ceil(score),
  }));
}

export default function BodyMap({ exercises, groupScores = {}, onGroupClick, type = 'anterior', style, highlightedColors }) {
  const data = exercises ? exercisesToModelData(exercises) : groupScoresToModelData(groupScores);

  return (
    <Model
      type={type}
      data={data}
      highlightedColors={highlightedColors || ['#1e3a5f', '#1d6fa5', '#1a9fd4', '#22c55e']}
      bodyColor="var(--line)"
      onClick={(stats) => stats?.muscle && onGroupClick?.(stats.muscle)}
      style={{ maxWidth: '140px', cursor: onGroupClick ? 'pointer' : 'default', ...style }}
    />
  );
}
