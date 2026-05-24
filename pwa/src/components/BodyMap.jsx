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
  chest: 'chest', pec: 'chest', pecs: 'chest', pectoralis: 'chest',
  back: 'back', lats: 'back', lat: 'back', trapezius: 'back', traps: 'back',
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
    const primary   = ex.wger_muscle_ids?.primary   || []
    const secondary = ex.wger_muscle_ids?.secondary || []

    if (primary.length || secondary.length) {
      for (const id of primary) { const m = WGER_TO_RBH[id]; if (m) rbhScores[m] = (rbhScores[m] || 0) + 2 }
      for (const id of secondary) { const m = WGER_TO_RBH[id]; if (m) rbhScores[m] = (rbhScores[m] || 0) + 1 }
    } else {
      const allLabels = [...(ex.primaryMuscles || []), ...(ex.secondaryMuscles || [])]
      for (const label of allLabels) {
        const lowerLabel = label.toLowerCase()
        let group = null
        for (const [key, g] of Object.entries(LABEL_TO_GROUP)) {
          if (lowerLabel.includes(key)) { group = g; break }
        }
        if (group) {
          const weight = (ex.primaryMuscles || []).includes(label) ? 2 : 1
          for (const m of (GROUP_TO_RBH[group] || [])) {
            rbhScores[m] = (rbhScores[m] || 0) + weight
          }
        }
      }
    }
  }

  return Object.entries(rbhScores).map(([muscle, score]) => ({
    name: muscle,
    muscles: [muscle],
    frequency: Math.ceil(score),
  }))
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
