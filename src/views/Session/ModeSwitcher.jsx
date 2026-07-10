/**
 * ModeSwitcher — Strength / Cardio toggle pill.
 * Premium pill design, animated slide.
 */

import { Dumbbell, Activity } from 'lucide-react';

const MODES = [
  { value: 'strength', label: 'Krafttraining', icon: Dumbbell },
  { value: 'cardio',   label: 'Ausdauer',      icon: Activity },
];

export default function ModeSwitcher({ sessionMode, setSessionMode }) {
  return (
    <div
      className="relative flex rounded-2xl p-1 gap-0"
      style={{ background: 'var(--bg2)', border: '1px solid var(--line)' }}
    >
      {/* Sliding pill */}
      <div
        className="absolute top-1 bottom-1 rounded-xl transition-all duration-300 ease-out"
        style={{
          left: sessionMode === 'strength' ? '4px' : '50%',
          width: 'calc(50% - 4px)',
          background: sessionMode === 'cardio' ? 'var(--orange)' : 'var(--accent)',
          boxShadow: sessionMode === 'cardio'
            ? '0 4px 16px -2px rgba(var(--orange-rgb, 255,120,50),0.35)'
            : '0 4px 16px -2px rgba(var(--accent-rgb, 200,255,0),0.35)',
        }}
      />
      {MODES.map(m => {
        const Icon = m.icon;
        const isActive = sessionMode === m.value;
        return (
          <button
            key={m.value}
            onClick={() => setSessionMode(m.value)}
            className="relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] transition-colors duration-200"
            style={{ color: isActive ? '#000' : 'var(--dim)' }}
          >
            <Icon size={14} strokeWidth={2.5} />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
