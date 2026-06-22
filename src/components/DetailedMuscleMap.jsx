import Body from 'react-muscle-highlighter';
import { RBH_SLUGS } from '../lib/muscleMapping';

export default function DetailedMuscleMap({ exercises = [], style, colors, gender, side, onGroupClick }) {
  const safeExercises = Array.isArray(exercises) ? exercises : [];
  const muscleHits = {};
  safeExercises.forEach(ex => {
    const muscles = [...(ex.primaryMuscles || []), ...(ex.secondaryMuscles || [])];
    muscles.forEach(m => {
      const key = String(m || '').toLowerCase().trim();
      const slug = RBH_SLUGS[key] || RBH_SLUGS[key.replace(/_/g, ' ')];
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
