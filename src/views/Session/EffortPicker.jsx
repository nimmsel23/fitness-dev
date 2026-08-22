/**
 * EffortPicker — RPE (1-10) prominent statt hinter "Details & Notizen"
 * versteckt. War vorher nur als Slider tief in SessionSidebar erreichbar.
 */

import { Flame } from 'lucide-react';

function effortColor(v) {
  if (v <= 3) return '#22c55e';
  if (v <= 6) return '#f59e0b';
  if (v <= 8) return '#fb923c';
  return '#ef4444';
}

export default function EffortPicker({ effort, setEffort }) {
  const color = effortColor(effort);
  const pct = ((effort - 1) / 9) * 100;
  return (
    <div
      className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl"
      style={{ background: 'var(--card)', border: '1px solid var(--line)' }}
    >
      <div className="flex items-center gap-1.5 shrink-0" style={{ color }}>
        <Flame size={13} strokeWidth={2.5} />
        <span className="text-[11px] font-black uppercase tracking-wide">RPE</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={effort}
        onChange={e => setEffort(Number(e.target.value))}
        className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${color} ${pct}%, var(--line) ${pct}%)`,
          accentColor: color,
        }}
      />
      <span className="text-sm font-black w-4 text-center shrink-0" style={{ color }}>
        {effort}
      </span>
    </div>
  );
}
