import Body from 'react-muscle-highlighter';

const GROUP_TO_RMH = {
  chest:      ['chest'],
  back:       ['upper-back', 'lower-back'],
  shoulders:  ['deltoids'],
  arms:       ['biceps', 'triceps', 'forearm'],
  core:       ['abs', 'obliques'],
  glutes:     ['gluteal'],
  quads:      ['quadriceps'],
  hamstrings: ['hamstring'],
  calves:     ['calves'],
  legs:       ['quadriceps', 'hamstring'],
};

// groupScores: { chest: { score: 3, color: '#22c55e' }, ... }
// color wird direkt übergeben — kein intensity-Index nötig
function groupScoresToData(groupScores) {
  return Object.entries(groupScores).flatMap(([group, { color }]) => {
    return (GROUP_TO_RMH[group] || []).map(slug => ({ slug, color }));
  });
}

export default function DetailedMuscleMap({ groupScores, style, gender, side, onGroupClick }) {
  const data = groupScores ? groupScoresToData(groupScores) : [];

  return (
    <div style={{ ...style, display: 'flex', justifyContent: 'center' }}>
      <Body
        data={data}
        gender={gender || 'male'}
        side={side || 'front'}
        defaultFill="var(--line)"
        border="none"
        onBodyPartPress={part => onGroupClick?.(part.slug)}
      />
    </div>
  );
}
