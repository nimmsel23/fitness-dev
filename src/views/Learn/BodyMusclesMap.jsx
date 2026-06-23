import { useEffect, useRef } from 'react';
import { BodyChart } from 'body-muscles';
import { BODY_MUSCLES_SLUGS } from '../../lib/muscleMapping';

export default function BodyMusclesMap({ side = 'front', onMuscleClick, selectedExercise }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    chartRef.current = new BodyChart(containerRef.current, {
      view: side === 'front' ? 'FRONT' : 'BACK',
      bodyState: {},
      onMuscleClick: (id) => {
        const baseMuscle = id.split('-')[0];
        if (onMuscleClick) onMuscleClick(baseMuscle);
      }
    });
    return () => chartRef.current?.destroy();
  }, []);

  useEffect(() => {
    chartRef.current?.update({ view: side === 'front' ? 'FRONT' : 'BACK' });
  }, [side]);

  useEffect(() => {
    if (!chartRef.current) return;

    const bodyState = {};

    if (selectedExercise) {
      const primary   = selectedExercise.primaryMuscles   || selectedExercise.primary_muscles   || [];
      const secondary = selectedExercise.secondaryMuscles || selectedExercise.secondary_muscles || [];

      primary.forEach(m => {
        const slug = BODY_MUSCLES_SLUGS[String(m).toLowerCase().trim()];
        if (slug) bodyState[slug] = { intensity: 9, selected: true };
      });
      secondary.forEach(m => {
        const slug = BODY_MUSCLES_SLUGS[String(m).toLowerCase().trim()];
        if (slug && !bodyState[slug]) bodyState[slug] = { intensity: 4, selected: false };
      });
    }

    chartRef.current.update({ bodyState });
  }, [selectedExercise]);

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 touch-pan-y">
      {!selectedExercise && (
        <p className="text-[11px] font-bold opacity-30 uppercase tracking-widest mb-4">
          Übung aus der Library wählen
        </p>
      )}
      <div
        ref={containerRef}
        className="w-full max-w-[400px] min-h-[500px] flex items-center justify-center"
        style={{ '--muscle-accent': 'var(--accent)', '--muscle-bg': 'var(--bg2)' }}
      />
    </div>
  );
}
