import { useEffect, useRef } from 'react';
import { BodyChart } from 'body-muscles';
import { BODY_MUSCLES_MAP } from '../lib/muscleMapping';

export default function MuscleHighlightMap({ muscleId, size = 160 }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  const entry = muscleId ? BODY_MUSCLES_MAP[muscleId.toLowerCase()] : null;

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
