import Model, { MuscleType } from 'react-body-highlighter';
import { primeMuscleViz, hasMuscleViz, getMuscleVizMap } from '@db';

// Vom Package selbst exportierte gültige Slugs — nicht abgetippt.
const SUPPORTED_RBH_MUSCLES = new Set(Object.values(MuscleType));

let _vizMap = null;
let _vizLoadStarted = false;
function ensureVizLoading() {
  if (_vizLoadStarted || hasMuscleViz()) return;
  _vizLoadStarted = true;
  getMuscleVizMap().then((viz) => { _vizMap = viz; primeMuscleViz(viz); });
}

// region["101_pectoralis_major"] === "chest" — dasselbe Wort, das RBH selbst
// als Slug nutzt. Kein separates Mapping, direkte Wiederverwendung.
function muscleIdToRbh(muscleId) {
  return _vizMap?.region?.[muscleId] || null;
}

function addScore(scores, muscle, amount) {
  if (!SUPPORTED_RBH_MUSCLES.has(muscle)) return;
  scores[muscle] = (scores[muscle] || 0) + amount;
}

export function exercisesToModelData(exercises) {
  ensureVizLoading();
  const rbhScores = {};
  for (const ex of Array.isArray(exercises) ? exercises : []) {
    const primary = Array.isArray(ex?.primaryMuscles) ? ex.primaryMuscles : Array.isArray(ex?.primary_muscles) ? ex.primary_muscles : [];
    const secondary = Array.isArray(ex?.secondaryMuscles) ? ex.secondaryMuscles : Array.isArray(ex?.secondary_muscles) ? ex.secondary_muscles : [];

    primary.forEach((id) => { const m = muscleIdToRbh(id); if (m) addScore(rbhScores, m, 2); });
    secondary.forEach((id) => { const m = muscleIdToRbh(id); if (m) addScore(rbhScores, m, 1); });
  }

  return Object.entries(rbhScores).map(([muscle, score]) => ({
    name: muscle,
    muscles: [muscle],
    frequency: Math.ceil(score),
  }));
}

// groupScores: { [regionWord]: { score, color } }
function groupScoresToModelData(groupScores) {
  return Object.entries(groupScores || {}).flatMap(([region, gs]) => {
    if (!gs?.score || !SUPPORTED_RBH_MUSCLES.has(region)) return [];
    return [{ name: region, muscles: [region], frequency: Math.ceil(gs.score) }];
  });
}

export default function BodyMap({ exercises, groupScores = {}, onGroupClick, type = 'anterior', style, highlightedColors }) {
  ensureVizLoading();
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
