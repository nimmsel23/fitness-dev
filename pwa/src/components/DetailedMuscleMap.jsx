import Body from 'react-muscle-highlighter';

// Maps canonical muscle tags to react-muscle-highlighter slugs
const MAP_TO_RBH = {
  // Chest
  'chest': 'chest', 'pecs': 'chest',
  // Back
  'back': 'upper-back', 'lats': 'upper-back', 'traps': 'upper-back',
  // Shoulders
  'shoulders': 'deltoids', 'delts': 'deltoids',
  // Arms
  'biceps': 'biceps', 'triceps': 'triceps', 'forearms': 'forearm',
  // Core
  'abs': 'abs', 'core': 'abs', 'obliques': 'abs',
  // Legs/Posterior Chain
  'glutes': 'gluteal', 'quads': 'quadriceps', 'hamstrings': 'hamstring', 'calves': 'calves'
};

export default function DetailedMuscleMap({ exercises, style, colors, gender, onGroupClick }) {
  // Convert our exercises data to react-muscle-highlighter format
  const data = exercises.flatMap(ex => {
    const muscles = [...(ex.primaryMuscles || []), ...(ex.secondaryMuscles || [])];
    return muscles
      .filter(m => MAP_TO_RBH[m.toLowerCase()])
      .map(m => ({
        slug: MAP_TO_RBH[m.toLowerCase()],
        intensity: 3
      }));
  });

  function handlePress(part) {
    if (onGroupClick) onGroupClick(part.slug);
  }

  return (
    <div style={{...style, display: 'flex', justifyContent: 'center' }}>
        <Body 
            data={data} 
            colors={colors || ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444']}
            gender={gender || 'male'}
            side="front"
            onBodyPartPress={handlePress}
        />
    </div>
  );
}
