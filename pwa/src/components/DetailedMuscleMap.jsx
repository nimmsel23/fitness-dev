import Body from 'react-muscle-highlighter';

// Maps our internal muscle group slugs to react-muscle-highlighter slugs
const MAP_TO_RBH = {
  chest: 'chest',
  back: 'upper-back',
  shoulders: 'deltoids',
  arms: 'biceps', // Simplified for demo
  core: 'abs',
  glutes: 'gluteal',
  quads: 'quadriceps',
  hamstrings: 'hamstring',
  calves: 'calves'
};

export default function DetailedMuscleMap({ exercises, style, colors }) {
  // Convert our exercises data to react-muscle-highlighter format
  const data = exercises.flatMap(ex => {
    const muscles = [...(ex.primaryMuscles || []), ...(ex.secondaryMuscles || [])];
    return muscles.map(m => ({
      slug: MAP_TO_RBH[m.toLowerCase()] || 'chest', // Default to chest if mapping missing
      intensity: 3 // Fixed intensity for now
    }));
  });

  return (
    <div style={{...style, display: 'flex', justifyContent: 'center' }}>
        <Body 
            data={data} 
            colors={colors || ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444']}
            side="front"
        />
    </div>
  );
}
