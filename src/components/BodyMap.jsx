import Model from 'react-body-highlighter';
import { GROUP_TO_RBH, WGER_TO_RBH, SUPPORTED_RBH_MUSCLES, muscleToGroups } from '../lib/muscleMapping';

export { WGER_TO_RBH };

function addScore(scores, muscle, amount) {
  if (!SUPPORTED_RBH_MUSCLES.has(muscle)) return;
  scores[muscle] = (scores[muscle] || 0) + amount;
}

function groupsToRbh(label, exName) {
  return muscleToGroups(label, exName).flatMap(g => GROUP_TO_RBH[g] || []);
}

export function exercisesToModelData(exercises) {
  const rbhScores = {};
  for (const ex of Array.isArray(exercises) ? exercises : []) {
    const primary = Array.isArray(ex?.primaryMuscles) ? ex.primaryMuscles : Array.isArray(ex?.primary_muscles) ? ex.primary_muscles : [];
    const secondary = Array.isArray(ex?.secondaryMuscles) ? ex.secondaryMuscles : Array.isArray(ex?.secondary_muscles) ? ex.secondary_muscles : [];
    const exName = (ex?.name || '').toLowerCase();

    const sourcePrimary = primary.length > 0 || secondary.length > 0
      ? primary
      : muscleToGroups('', exName); // name-based fallback wenn keine Muskeln

    for (const label of sourcePrimary) {
      groupsToRbh(label, exName).forEach(m => addScore(rbhScores, m, 2));
    }
    for (const label of secondary) {
      groupsToRbh(label, exName).forEach(m => addScore(rbhScores, m, 1));
    }

    // wger ID Fallback
    (ex?.wger_muscle_ids?.primary || []).forEach(id => { const m = WGER_TO_RBH[id]; if (m) addScore(rbhScores, m, 2); });
    (ex?.wger_muscle_ids?.secondary || []).forEach(id => { const m = WGER_TO_RBH[id]; if (m) addScore(rbhScores, m, 1); });
  }

  return Object.entries(rbhScores).map(([muscle, score]) => ({
    name: muscle,
    muscles: [muscle],
    frequency: Math.ceil(score),
  }));
}

function groupScoresToModelData(groupScores) {
  return Object.entries(groupScores || {}).flatMap(([groupId, gs]) => {
    const muscles = GROUP_TO_RBH[groupId];
    if (!muscles || !gs?.score) return [];
    const safeMuscles = muscles.filter(m => SUPPORTED_RBH_MUSCLES.has(m));
    if (safeMuscles.length === 0) return [];
    return [{ name: groupId, muscles: safeMuscles, frequency: Math.ceil(gs.score) }];
  });
}

function rbhMuscleToGroup(muscle) {
  for (const [group, muscles] of Object.entries(GROUP_TO_RBH)) {
    if (muscles.includes(muscle)) return group;
  }
  return null;
}

export default function BodyMap({ exercises, groupScores = {}, onGroupClick, type = 'anterior', style, highlightedColors }) {
  const data = exercises ? exercisesToModelData(exercises) : groupScoresToModelData(groupScores);

  function handleClick(stats) {
    if (!onGroupClick || !stats?.muscle) return;
    const group = rbhMuscleToGroup(stats.muscle);
    if (group) onGroupClick(group);
  }

  return (
    <Model
      type={type}
      data={data}
      highlightedColors={highlightedColors || ['#1e3a5f', '#1d6fa5', '#1a9fd4', '#22c55e']}
      bodyColor="var(--line)"
      onClick={handleClick}
      style={{ maxWidth: '140px', cursor: onGroupClick ? 'pointer' : 'default', ...style }}
    />
  );
}
