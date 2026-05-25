import Model from 'react-body-highlighter'

// wger muscle ID → react-body-highlighter muscle name
export const WGER_TO_RBH = {
  1:  'biceps', 2:  'front-deltoids', 3:  'chest', 4:  'chest', 5:  'triceps', 6:  'abs', 
  7:  'calves', 8:  'gluteal', 9:  'upper-back', 10: 'quadriceps', 11: 'hamstring', 
  12: 'upper-back', 13: 'forearm', 14: 'obliques', 15: 'calves', 16: 'lower-back',
}

const GROUP_TO_RBH = {
  chest:      ['chest'],
  back:       ['upper-back', 'lower-back'],
  shoulders:  ['front-deltoids', 'back-deltoids'],
  arms:       ['biceps', 'triceps', 'forearm'],
  core:       ['abs', 'obliques'],
  glutes:     ['gluteal'],
  quads:      ['quadriceps'],
  hamstrings: ['hamstring'],
  calves:     ['calves'],
  legs:       ['quadriceps', 'hamstring'],
}

const LABEL_TO_GROUP = {
  chest: 'chest', pec: 'chest', pecs: 'chest', pectoralis: 'chest', 'pectoralis major': 'chest',
  back: 'back', lats: 'back', lat: 'back', trapezius: 'back', traps: 'back', latissimus: 'back', rhoboids: 'back', deadlift: 'back',
  shoulder: 'shoulders', shoulders: 'shoulders', delt: 'shoulders', delts: 'shoulders', deltoid: 'shoulders',
  arms: 'arms', arm: 'arms', biceps: 'arms', triceps: 'arms', forearm: 'arms', forearms: 'arms',
  core: 'core', abs: 'core', abdominal: 'core',
  glutes: 'glutes', glute: 'glutes', gluteus: 'glutes',
  legs: 'legs', quads: 'quads', quad: 'quads', quadriceps: 'quads',
  hamstrings: 'hamstrings', hamstring: 'hamstrings',
  calves: 'calves', calf: 'calves', gastrocnemius: 'calves',
}

export function exercisesToModelData(exercises) {
  const rbhScores = {}

  for (const ex of exercises) {
    // Priority: use the labels directly from the exercise catalog
    let primary   = ex.primaryMuscles || ex.primary_muscles || []
    let secondary = ex.secondaryMuscles || ex.secondary_muscles || []
    const exName = (ex.name || "").toLowerCase();

    // Fallback: Infer muscles from name if tags are missing
    const hasValidMuscles = (primary.length > 0 && primary.some(m => m)) || (secondary.length > 0 && secondary.some(m => m));

    if (!hasValidMuscles) {
      console.log(`BodyMap [${ex.name}] - Tags missing or invalid (P: ${primary}, S: ${secondary}), attempting fallback...`);
      for (const [key, group] of Object.entries(LABEL_TO_GROUP)) {
        if (exName.includes(key.toLowerCase())) {
          console.log(`BodyMap [${ex.name}] - Fallback found match: ${key} -> ${group}`);
          // Add the group directly to primary muscles as a fallback tag
          primary.push(group);
        }
      }
    }

    console.log(`BodyMap [${ex.name}] - Final primary:`, primary, "secondary:", secondary);

    if (primary.length > 0 || secondary.length > 0) {
      for (const label of primary) {
        const group = LABEL_TO_GROUP[label.toLowerCase()] || label.toLowerCase();
        // Check if group exists in GROUP_TO_RBH, otherwise it might be a raw muscle
        if (GROUP_TO_RBH[group]) {
           for (const m of GROUP_TO_RBH[group]) {
             rbhScores[m] = (rbhScores[m] || 0) + 2
             console.log(`BodyMap [${ex.name}] - added score to ${m}, total: ${rbhScores[m]}`);
           }
        }
      }
      for (const label of secondary) {
        const group = LABEL_TO_GROUP[label.toLowerCase()] || label.toLowerCase();
        if (GROUP_TO_RBH[group]) {
           for (const m of GROUP_TO_RBH[group]) {
             rbhScores[m] = (rbhScores[m] || 0) + 1
             console.log(`BodyMap [${ex.name}] - added score to ${m}, total: ${rbhScores[m]}`);
           }
        }
      }
    } else {
      // Fallback: WGER IDs if catalog labels are missing
      const wPrimary = ex.wger_muscle_ids?.primary || []
      const wSecondary = ex.wger_muscle_ids?.secondary || []
      
      for (const id of wPrimary) { const m = WGER_TO_RBH[id]; if (m) { rbhScores[m] = (rbhScores[m] || 0) + 2; console.log(`BodyMap [${ex.name}] - WGER primary score to ${m}, total: ${rbhScores[m]}`); } }
      for (const id of wSecondary) { const m = WGER_TO_RBH[id]; if (m) { rbhScores[m] = (rbhScores[m] || 0) + 1; console.log(`BodyMap [${ex.name}] - WGER secondary score to ${m}, total: ${rbhScores[m]}`); } }
    }
  }

  const data = Object.entries(rbhScores).map(([muscle, score]) => ({
    name: muscle,
    muscles: [muscle],
    frequency: Math.ceil(score),
  }));
  console.log("BodyMap - FINAL generated data [v2.0]:", data);
  return data;
}

function groupScoresToModelData(groupScores) {
  return Object.entries(groupScores).flatMap(([groupId, gs]) => {
    const muscles = GROUP_TO_RBH[groupId]
    if (!muscles || !gs?.score) return []
    return [{ name: groupId, muscles, frequency: Math.ceil(gs.score) }]
  })
}

function rbhMuscleToGroup(muscle) {
  for (const [group, muscles] of Object.entries(GROUP_TO_RBH)) {
    if (muscles.includes(muscle)) return group
  }
  return null
}

export default function BodyMap({ exercises, groupScores = {}, onGroupClick, type = 'anterior', style }) {
  const data = exercises
    ? exercisesToModelData(exercises)
    : groupScoresToModelData(groupScores)

  function handleClick(stats) {
    if (!onGroupClick || !stats?.muscle) return
    const group = rbhMuscleToGroup(stats.muscle)
    if (group) onGroupClick(group)
  }

  return (
    <Model
      type={type}
      data={data}
      highlightedColors={['#1e3a5f', '#1d6fa5', '#1a9fd4', '#22c55e']}
      bodyColor="var(--line)"
      onClick={handleClick}
      style={{ maxWidth: '140px', cursor: onGroupClick ? 'pointer' : 'default', ...style }}
    />
  )
}
