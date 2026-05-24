import Model from 'react-body-highlighter'

// wger muscle ID → react-body-highlighter muscle name
// Source: GET /api/v2/muscle/ (local wger :8000)
export const WGER_TO_RBH = {
  1:  'biceps',          // Biceps brachii
  2:  'front-deltoids',  // Anterior deltoid
  3:  'chest',           // Serratus anterior
  4:  'chest',           // Pectoralis major
  5:  'triceps',         // Triceps brachii
  6:  'abs',             // Rectus abdominis
  7:  'calves',          // Gastrocnemius
  8:  'gluteal',         // Gluteus maximus
  9:  'upper-back',      // Trapezius
  10: 'quadriceps',      // Quadriceps femoris
  11: 'hamstring',       // Biceps femoris
  12: 'upper-back',      // Latissimus dorsi
  13: 'forearm',         // Brachialis
  14: 'obliques',        // Obliquus externus abdominis
  15: 'calves',          // Soleus
  16: 'lower-back',      // Erector spinae
}

// Broad group → RBH names (fallback wenn keine wger-IDs vorhanden)
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

// Broad label → group key (für primaryMuscles aus Sessions)
const LABEL_TO_GROUP = {
  chest: 'chest', pec: 'chest', pecs: 'chest',
  back: 'back', lats: 'back', lat: 'back',
  shoulder: 'shoulders', shoulders: 'shoulders', delt: 'shoulders', delts: 'shoulders',
  arms: 'arms', arm: 'arms', biceps: 'arms', triceps: 'arms', forearm: 'arms', forearms: 'arms',
  core: 'core', abs: 'core',
  glutes: 'glutes', glute: 'glutes',
  legs: 'legs', quads: 'quads', quad: 'quads', quadriceps: 'quads',
  hamstrings: 'hamstrings', hamstring: 'hamstrings',
  calves: 'calves', calf: 'calves',
}

export const GROUP_COLORS = {
  chest:      '#ef4444',
  back:       '#3b82f6',
  shoulders:  '#f59e0b',
  arms:       '#a78bfa',
  core:       '#22c55e',
  glutes:     '#ec4899',
  quads:      '#f97316',
  hamstrings: '#06b6d4',
  calves:     '#8b5cf6',
}

export const GROUP_LABELS = {
  chest: 'Brust', back: 'Rücken', shoulders: 'Schultern', arms: 'Arme',
  core: 'Core', glutes: 'Gesäß', quads: 'Oberschenkel v.', hamstrings: 'Oberschenkel h.', calves: 'Waden',
}

// Converts a list of session exercises to IExerciseData[] for react-body-highlighter.
// Uses wger_muscle_ids when available (precise), falls back to primaryMuscles labels (broad).
export function exercisesToModelData(exercises) {
  const rbhScores = {}

  for (const ex of exercises) {
    const primary   = ex.wger_muscle_ids?.primary   || []
    const secondary = ex.wger_muscle_ids?.secondary || []

    if (primary.length || secondary.length) {
      // Precise path: wger muscle IDs → RBH names
      for (const id of primary) {
        const m = WGER_TO_RBH[id]
        if (m) rbhScores[m] = (rbhScores[m] || 0) + 2
      }
      for (const id of secondary) {
        const m = WGER_TO_RBH[id]
        if (m) rbhScores[m] = (rbhScores[m] || 0) + 1
      }
    } else {
      // Fallback: broad labels → group → RBH names
      for (const label of [...(ex.primaryMuscles || []), ...(ex.secondaryMuscles || [])]) {
        const group = LABEL_TO_GROUP[label.toLowerCase()]
        const weight = (ex.primaryMuscles || []).includes(label) ? 2 : 1
        for (const m of (GROUP_TO_RBH[group] || [])) {
          rbhScores[m] = (rbhScores[m] || 0) + weight
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

// Legacy: coverage-view groupScores → IExerciseData[]
function groupScoresToModelData(groupScores) {
  return Object.entries(groupScores).flatMap(([groupId, gs]) => {
    const muscles = GROUP_TO_RBH[groupId]
    if (!muscles || !gs?.score) return []
    return [{ name: groupId, muscles, frequency: Math.ceil(gs.score) }]
  })
}

// reverse-map RBH muscle name → group key
function rbhMuscleToGroup(muscle) {
  for (const [group, muscles] of Object.entries(GROUP_TO_RBH)) {
    if (muscles.includes(muscle)) return group
  }
  return null
}

// Props:
//   exercises   — session exercise array (preferred, uses wger_muscle_ids)
//   groupScores — coverage map {groupId: {score}} (fallback for Muscles.jsx)
//   onGroupClick, type, style
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
      style={{ maxWidth: '130px', cursor: onGroupClick ? 'pointer' : 'default', ...style }}
    />
  )
}
