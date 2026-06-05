import Model from 'react-body-highlighter';

// wger muscle ID → react-body-highlighter muscle name
export const WGER_TO_RBH = {
  1:  'biceps', 2:  'front-deltoids', 3:  'chest', 4:  'chest', 5:  'triceps', 6:  'abs', 
  7:  'calves', 8:  'gluteal', 9:  'upper-back', 10: 'quadriceps', 11: 'hamstring', 
  12: 'upper-back', 13: 'forearm', 14: 'obliques', 15: 'calves', 16: 'lower-back',
}

const SUPPORTED_RBH_MUSCLES = new Set([
  'trapezius', 'upper-back', 'lower-back', 'chest', 'biceps', 'triceps', 'forearm',
  'back-deltoids', 'front-deltoids', 'abs', 'obliques', 'adductor', 'hamstring',
  'quadriceps', 'abductors', 'calves', 'gluteal', 'head', 'neck', 'knees',
  'left-soleus', 'right-soleus',
]);

const GROUP_TO_RBH = {
  chest:      ['chest'],
  back:       ['upper-back', 'lower-back'],
  trapezius:  ['trapezius'],
  shoulders:  ['front-deltoids', 'back-deltoids'],
  arms:       ['biceps', 'triceps', 'forearm'],
  core:       ['abs', 'obliques'],
  glutes:     ['gluteal'],
  quads:      ['quadriceps'],
  hamstrings: ['hamstring'],
  calves:     ['calves'],
  legs:       ['quadriceps', 'hamstring'],
};

const LABEL_TO_GROUP = {
  chest: 'chest', pec: 'chest', pecs: 'chest', pectoralis: 'chest', 'pectoralis major': 'chest',
  back: 'back', lats: 'back', lat: 'back', latissimus: 'back', rhoboids: 'back', deadlift: 'back',
  trapezius: 'trapezius', traps: 'trapezius', shrugs: 'trapezius', nacken: 'trapezius',
  shoulder: 'shoulders', shoulders: 'shoulders', delt: 'shoulders', delts: 'shoulders', deltoid: 'shoulders',
  arms: 'arms', arm: 'arms', biceps: 'arms', triceps: 'arms', forearm: 'arms', forearms: 'arms',
  core: 'core', abs: 'core', abdominal: 'core',
  glutes: 'glutes', glute: 'glutes', gluteus: 'glutes',
  legs: 'legs', quads: 'quads', quad: 'quads', quadriceps: 'quads',
  hamstrings: 'hamstrings', hamstring: 'hamstrings',
  calves: 'calves', calf: 'calves', gastrocnemius: 'calves',
};

function addScore(scores, muscle, amount) {
  if (!SUPPORTED_RBH_MUSCLES.has(muscle)) return;
  scores[muscle] = (scores[muscle] || 0) + amount;
}

export function exercisesToModelData(exercises) {
  const rbhScores = {};
  for (const ex of Array.isArray(exercises) ? exercises : []) {
    const primary = Array.isArray(ex?.primaryMuscles) ? ex.primaryMuscles : Array.isArray(ex?.primary_muscles) ? ex.primary_muscles : [];
    const secondary = Array.isArray(ex?.secondaryMuscles) ? ex.secondaryMuscles : Array.isArray(ex?.secondary_muscles) ? ex.secondary_muscles : [];
    const exName = (ex?.name || '').toLowerCase();
    
    const sourcePrimary = [...primary];
    const sourceSecondary = [...secondary];

    const hasValidMuscles = (primary.length > 0 && primary.some(Boolean)) || (secondary.length > 0 && secondary.some(Boolean));
    if (!hasValidMuscles) {
      for (const [key, group] of Object.entries(LABEL_TO_GROUP)) {
        if (exName.includes(key)) sourcePrimary.push(group);
      }
    }

    if (sourcePrimary.length > 0 || sourceSecondary.length > 0) {
      for (const label of sourcePrimary) {
        const group = LABEL_TO_GROUP[String(label).toLowerCase()] || String(label).toLowerCase();
        const muscles = GROUP_TO_RBH[group];
        if (muscles) muscles.forEach(m => addScore(rbhScores, m, 2));
      }
      for (const label of sourceSecondary) {
        const group = LABEL_TO_GROUP[String(label).toLowerCase()] || String(label).toLowerCase();
        const muscles = GROUP_TO_RBH[group];
        if (muscles) muscles.forEach(m => addScore(rbhScores, m, 1));
      }
    }

    // WGER Fallback
    const wPrimary = Array.isArray(ex?.wger_muscle_ids?.primary) ? ex.wger_muscle_ids.primary : [];
    const wSecondary = Array.isArray(ex?.wger_muscle_ids?.secondary) ? ex.wger_muscle_ids.secondary : [];
    wPrimary.forEach(id => { const m = WGER_TO_RBH[id]; if (m) addScore(rbhScores, m, 2); });
    wSecondary.forEach(id => { const m = WGER_TO_RBH[id]; if (m) addScore(rbhScores, m, 1); });
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
