import { useEffect, useRef, useMemo } from 'react';
import { BodyChart } from 'body-muscles';
import { BODY_MUSCLES_SLUGS } from '../../lib/muscleMapping';

export default function BodyMusclesMap({
  side = 'front',
  onMuscleClick,
  exercises = []
}) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  const highlightedMuscles = useMemo(() => {
    const muscleHits = {};
    exercises.forEach(ex => {
      const muscles = [...(ex.primaryMuscles || []), ...(ex.secondaryMuscles || [])];
      muscles.forEach(m => {
        const key = String(m || '').toLowerCase().trim();
        const slug = BODY_MUSCLES_SLUGS[key] || BODY_MUSCLES_SLUGS[key.replace(/_/g, ' ')];
        if (slug) muscleHits[slug] = (muscleHits[slug] || 0) + 1;
      });
    });
    return Object.entries(muscleHits).map(([slug, hits]) => ({
      slug,
      intensity: Math.min(10, hits * 2)
    }));
  }, [exercises]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize the BodyChart
    chartRef.current = new BodyChart(containerRef.current, {
      view: side === 'front' ? 'FRONT' : 'BACK',
      bodyState: {},
      onMuscleClick: (id) => {
        const baseMuscle = id.split('-')[0];
        if (onMuscleClick) onMuscleClick(baseMuscle);
      }
    });

    return () => chartRef.current?.destroy();
  }, []); // Run once on mount

  useEffect(() => {
    chartRef.current?.update({ view: side === 'front' ? 'FRONT' : 'BACK' });
  }, [side]);

  useEffect(() => {
    if (chartRef.current && highlightedMuscles) {
      const newState = {};
      highlightedMuscles.forEach(m => {
         newState[m.slug] = { intensity: m.intensity || 5, selected: true };
      });
      chartRef.current.update({ bodyState: newState });
    }
  }, [highlightedMuscles]);

  return (
    <div className="w-full flex items-center justify-center p-4 touch-pan-y">
      <div 
        ref={containerRef} 
        className="w-full max-w-[400px] min-h-[500px] flex items-center justify-center"
        style={{ '--muscle-accent': 'var(--accent)', '--muscle-bg': 'var(--bg2)' }}
      />
    </div>
  );
}
