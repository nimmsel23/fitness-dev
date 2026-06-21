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
  // Generic English
  chest: 'chest', pec: 'chest', pecs: 'chest', pectoralis: 'chest', 'pectoralis major': 'chest',
  'pectoralis minor': 'chest', 'serratus anterior': 'chest',
  back: 'back', lats: 'back', lat: 'back', latissimus: 'back', 'latissimus dorsi': 'back',
  rhomboids: 'back', 'erector spinae': 'back', 'teres major': 'back', deadlift: 'back',
  trapezius: 'trapezius', traps: 'trapezius', 'trapezius upper': 'trapezius',
  'trapezius middle': 'trapezius', 'trapezius lower': 'trapezius',
  shoulder: 'shoulders', shoulders: 'shoulders', delt: 'shoulders', delts: 'shoulders',
  deltoid: 'shoulders', 'anterior deltoid': 'shoulders', 'lateral deltoid': 'shoulders',
  'posterior deltoid': 'shoulders', 'rotator cuff': 'shoulders',
  arms: 'arms', arm: 'arms', biceps: 'arms', 'biceps brachii': 'arms',
  brachialis: 'arms', triceps: 'arms', 'triceps brachii': 'arms',
  forearm: 'arms', forearms: 'arms', brachioradialis: 'arms',
  core: 'core', abs: 'core', abdominal: 'core', 'rectus abdominis': 'core',
  obliques: 'core', 'transverse abdominis': 'core',
  glutes: 'glutes', glute: 'glutes', gluteus: 'glutes',
  'gluteus maximus': 'glutes', 'gluteus medius': 'glutes',
  legs: 'legs', quads: 'quads', quad: 'quads', quadriceps: 'quads',
  hamstrings: 'hamstrings', hamstring: 'hamstrings', adductors: 'legs',
  calves: 'calves', calf: 'calves', gastrocnemius: 'calves', soleus: 'calves',
  // German display_name / label_de
  brust: 'chest', rücken: 'back', schultern: 'shoulders', schulter: 'shoulders',
  arme: 'arms', bauch: 'core', gesäß: 'glutes', oberschenkel: 'legs', waden: 'calves',
  nacken: 'trapezius', trapez: 'trapezius',
  // Catalog numeric IDs (1xx=chest, 2xx=back, 3xx=shoulders, 4xx=arms, 5xx=core, 6xx=legs, 7xx=calves)
  '100_chest': 'chest', '101_pectoralis_major': 'chest', '102_pectoralis_major_clavicular': 'chest',
  '103_pectoralis_minor': 'chest', '104_serratus_anterior': 'chest',
  '200_back': 'back', '201_latissimus_dorsi': 'back', '202_trapezius_upper': 'trapezius',
  '203_trapezius_middle': 'trapezius', '204_trapezius_lower': 'trapezius',
  '205_rhomboids': 'back', '206_erector_spinae': 'back', '207_teres_major': 'back',
  '208_quadratus_lumborum': 'back',
  '300_shoulders': 'shoulders', '301_anterior_deltoid': 'shoulders',
  '302_lateral_deltoid': 'shoulders', '303_posterior_deltoid': 'shoulders',
  '304_rotator_cuff': 'shoulders',
  '400_arms': 'arms', '401_biceps_brachii': 'arms', '402_brachialis': 'arms',
  '403_triceps_brachii': 'arms', '404_brachioradialis': 'arms',
  '405_forearm_flexors': 'arms', '406_anconeus': 'arms',
  '500_core': 'core', '501_rectus_abdominis': 'core', '502_obliques': 'core',
  '503_transverse_abdominis': 'core',
  '600_legs': 'legs', '601_gluteus_maximus': 'glutes', '602_gluteus_medius': 'glutes',
  '603_quadriceps': 'quads', '604_hamstrings': 'hamstrings', '605_adductors': 'legs',
  '700_calves': 'calves', '701_gastrocnemius': 'calves', '702_soleus': 'calves',
  '703_tibialis_anterior': 'calves',
};

// Prefix fallback for unknown numeric IDs (e.g. future catalog additions)
function resolveLabel(raw) {
  const label = String(raw).toLowerCase().trim();
  if (LABEL_TO_GROUP[label]) return LABEL_TO_GROUP[label];
  const m = label.match(/^(\d+)_/);
  if (m) {
    const n = parseInt(m[1]);
    if (n >= 100 && n < 200) return n >= 202 && n <= 204 ? 'trapezius' : 'chest';
    if (n >= 200 && n < 300) return n >= 202 && n <= 204 ? 'trapezius' : 'back';
    if (n >= 300 && n < 400) return 'shoulders';
    if (n >= 400 && n < 500) return 'arms';
    if (n >= 500 && n < 600) return 'core';
    if (n >= 600 && n < 700) {
      if (n <= 602) return 'glutes';
      if (n === 603) return 'quads';
      if (n === 604) return 'hamstrings';
      return 'legs';
    }
    if (n >= 700 && n < 800) return 'calves';
  }
  return label;
}

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
        const group = resolveLabel(label);
        const muscles = GROUP_TO_RBH[group];
        if (muscles) muscles.forEach(m => addScore(rbhScores, m, 2));
      }
      for (const label of sourceSecondary) {
        const group = resolveLabel(label);
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
