import { useEffect, useRef } from 'react';
import { BodyChart } from 'body-muscles';
import { useMuscleMap } from '../lib/muscleMap';

export default function MuscleHighlightMap({ muscleId, size = 160 }) {
  const muscleMap = useMuscleMap();
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  const entry = muscleId && muscleMap ? muscleMap.body_muscles[muscleId.toLowerCase()] : null;

  useEffect(() => {
    if (!containerRef.current || !entry) return;

    const bodyState = {};
    entry.ids.forEach(id => { bodyState[id] = { intensity: 8, selected: false }; });

    chartRef.current = new BodyChart(containerRef.current, {
      view: entry.view,
      bodyState,
    });

    return () => { chartRef.current?.destroy(); chartRef.current = null; };
  }, [muscleId]);

  if (!entry) return null;

  return (
    <div
      ref={containerRef}
      style={{ width: size, height: size * 1.6, flexShrink: 0 }}
      className="opacity-90"
    />
  );
}
