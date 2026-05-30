import { useEffect, useRef } from 'react';
import { BodyChart } from 'body-muscles';

/**
 * React Wrapper for the framework-agnostic body-muscles library.
 * Provides deep anatomical visualization with 70+ regions.
 */
export default function BodyMusclesMap({ 
  side = 'front', 
  onMuscleClick,
  highlightedMuscles = [] 
}) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize the BodyChart
    chartRef.current = new BodyChart(containerRef.current, {
      view: side === 'front' ? 'FRONT' : 'BACK',
      bodyState: {},
      onMuscleClick: (id, name) => {
        // body-muscles ids are like 'biceps-left'. We extract the base group.
        const baseMuscle = id.split('-')[0];
        if (onMuscleClick) onMuscleClick(baseMuscle);
      }
    });

    // Cleanup on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []); // Run once on mount

  // Update view when side prop changes
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update({ view: side === 'front' ? 'FRONT' : 'BACK' });
    }
  }, [side]);

  // Update highlights
  useEffect(() => {
    if (chartRef.current && highlightedMuscles) {
      // Create bodyState object for highlighted muscles
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
