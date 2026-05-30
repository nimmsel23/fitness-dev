import { useEffect, useRef } from 'react';
import { BodyChart } from 'body-muscles';

/**
 * React Wrapper for the framework-agnostic body-muscles library.
 * Provides deep anatomical visualization with 70+ regions.
 */
export default function BodyMusclesMap({ 
  gender = 'male', 
  side = 'front', 
  onMuscleClick,
  highlightedMuscles = [] 
}) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize the BodyChart
    chartRef.current = new BodyChart({
      target: containerRef.current,
      gender: gender,
      side: side,
      onMuscleClick: (muscle) => {
        if (onMuscleClick) onMuscleClick(muscle);
      }
    });

    // Cleanup on unmount
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  // Update gender and side when props change
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.setGender(gender);
      chartRef.current.setSide(side);
    }
  }, [gender, side]);

  // Update highlights
  useEffect(() => {
    if (chartRef.current && highlightedMuscles) {
      // The library expects an array of { id: string, intensity: number }
      // For the Learn tab, we might just want to highlight the selected muscle
      chartRef.current.setData(highlightedMuscles);
    }
  }, [highlightedMuscles]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div 
        ref={containerRef} 
        className="w-full h-full max-h-[600px] flex items-center justify-center"
        style={{ '--muscle-accent': 'var(--accent)', '--muscle-bg': 'var(--bg2)' }}
      />
    </div>
  );
}
