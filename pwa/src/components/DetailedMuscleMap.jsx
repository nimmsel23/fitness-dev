import Body from 'react-muscle-highlighter';

// Maps canonical muscle tags to react-muscle-highlighter slugs
const MAP_TO_RBH = {
  // Chest
  'chest': 'chest', 'pecs': 'chest', 'pectoralis': 'chest', 'serratus': 'chest',
  // Back
  'back': 'upper-back', 'lats': 'latissimus', 'latissimus': 'latissimus', 
  'traps': 'traps', 'trapezius': 'traps', 'upper-back': 'upper-back',
  'lower-back': 'lower-back', 'erector spinae': 'lower-back', 'lumbar': 'lower-back',
  // Shoulders
  'shoulders': 'front-deltoids', 'delts': 'front-deltoids', 'deltoid': 'front-deltoids', 'front-deltoids': 'front-deltoids',
  // Arms
  'biceps': 'biceps', 'triceps': 'triceps', 'forearms': 'forearm', 'forearm': 'forearm', 'brachialis': 'biceps',
  // Core
  'abs': 'abs', 'core': 'abs', 'obliques': 'abs', 'obliquus': 'abs',
  // Legs/Posterior Chain
  'glutes': 'gluteal', 'gluteus': 'gluteal', 
  'quads': 'quadriceps', 'quadriceps': 'quadriceps', 
  'hamstrings': 'hamstring', 'hamstring': 'hamstring', 
  'calves': 'calves', 'gastrocnemius': 'calves', 'soleus': 'calves'
};

export default function DetailedMuscleMap({ exercises, style, colors, gender, side, onGroupClick }) {
  // 1. Group exercises by muscle slug and calculate "hits"
  const muscleHits = {};
  exercises.forEach(ex => {
    const muscles = [...(ex.primaryMuscles || []), ...(ex.secondaryMuscles || [])];
    muscles.forEach(m => {
      const slug = MAP_TO_RBH[m.toLowerCase()];
      if (slug) {
        muscleHits[slug] = (muscleHits[slug] || 0) + 1;
      }
    });
  });

  // 2. Convert to react-muscle-highlighter format with intensity scale (1-4)
  const data = Object.entries(muscleHits).map(([slug, hits]) => {
    // Basic scaling: 1 hit = intensity 1, 2-3 = 2, 4-5 = 3, 6+ = 4
    const intensity = hits >= 6 ? 4 : hits >= 4 ? 3 : hits >= 2 ? 2 : 1;
    return { slug, intensity };
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
            side={side || 'front'}
            onBodyPartPress={handlePress}
        />
    </div>
  );
}
