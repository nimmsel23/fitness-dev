import Model from 'react-body-highlighter'

// Map coverage group IDs → react-body-highlighter muscle names
const GROUP_TO_MUSCLES = {
  chest:      ['chest'],
  back:       ['upper-back', 'lower-back'],
  shoulders:  ['front-deltoids', 'back-deltoids'],
  arms:       ['biceps', 'triceps', 'forearm'],
  core:       ['abs', 'obliques'],
  glutes:     ['gluteal'],
  quads:      ['quadriceps'],
  hamstrings: ['hamstring'],
  calves:     ['calves'],
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
  chest:'Brust', back:'Rücken', shoulders:'Schultern', arms:'Arme',
  core:'Core', glutes:'Gesäß', quads:'Oberschenkel v.', hamstrings:'Oberschenkel h.', calves:'Waden',
}

// Convert coverage groups to IExerciseData[] for the model
function toExerciseData(groupScores) {
  return Object.entries(groupScores).flatMap(([groupId, gs]) => {
    const muscles = GROUP_TO_MUSCLES[groupId]
    if (!muscles || !gs?.score) return []
    return [{ name: groupId, muscles, frequency: Math.ceil(gs.score) }]
  })
}

export default function BodyMap({ groupScores = {}, onGroupClick, type = 'anterior' }) {
  const data = toExerciseData(groupScores)

  function handleClick(stats) {
    if (!onGroupClick || !stats?.muscle) return
    // reverse-map muscle → group
    for (const [groupId, muscles] of Object.entries(GROUP_TO_MUSCLES)) {
      if (muscles.includes(stats.muscle)) { onGroupClick(groupId); return }
    }
  }

  return (
    <Model
      type={type}
      data={data}
      highlightedColors={['#1e3a5f', '#1d6fa5', '#1a9fd4', '#22c55e']}
      bodyColor="var(--line)"
      onClick={handleClick}
      style={{ maxWidth: '130px', cursor: 'pointer' }}
    />
  )
}
