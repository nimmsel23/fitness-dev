/**
 * ActivitySection — Dedicated Cardio/Endurance Logger
 *
 * Used when sessionMode === 'cardio'. Replaces the old ExerciseSection entirely.
 * Activity types cover the main endurance/sport disciplines.
 */

import { ACTIVITY_MUSCLE_DEFAULTS, MUSCLE_TARGET_GROUPS } from '../../constants/ActivityConstants';

const ACTIVITY_TYPES = [
  { value: 'running',   label: 'Laufen',      icon: '🏃' },
  { value: 'cycling',   label: 'Radfahren',   icon: '🚴' },
  { value: 'swimming',  label: 'Schwimmen',   icon: '🏊' },
  { value: 'hiking',    label: 'Wandern',     icon: '🥾' },
  { value: 'rowing',    label: 'Rudern',      icon: '🚣' },
  { value: 'climbing',  label: 'Klettern',    icon: '🧗' },
  { value: 'yoga',      label: 'Yoga',        icon: '🧘' },
  { value: 'stretching',label: 'Stretching',  icon: '🤸' },
  { value: 'hiit',      label: 'HIIT',        icon: '⚡' },
  { value: 'walking',   label: 'Spazieren',   icon: '🚶' },
];

const MUSCLE_TARGETS = [
  { value: 'core',  label: 'Core' },
  { value: 'legs',  label: 'Beine' },
  { value: 'full',  label: 'Full Body' },
];

export default function ActivitySection({ activity, setActivity }) {
  const selected = ACTIVITY_TYPES.find(t => t.value === activity.type) || ACTIVITY_TYPES[0];
  const activeTarget = activity.muscleTarget || ACTIVITY_MUSCLE_DEFAULTS[activity.type] || 'full';

  return (
    <div className="space-y-6">
      {/* Activity Type Grid */}
      <div>
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-fit-dim/40 mb-3 ml-1">
          Art der Aktivität
        </div>
        <div className="grid grid-cols-5 gap-2">
          {ACTIVITY_TYPES.map(t => {
            const isActive = activity.type === t.value;
            return (
              <button
                key={t.value}
                onClick={() => {
                  const target = ACTIVITY_MUSCLE_DEFAULTS[t.value] || 'full';
                  setActivity({ ...activity, type: t.value, muscleTarget: target, muscles: MUSCLE_TARGET_GROUPS[target] });
                }}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${
                  isActive
                    ? 'border-fit-orange bg-fit-orange/10 shadow-lg shadow-orange/10'
                    : 'border-fit-line bg-fit-bg2 hover:border-fit-orange/30 hover:bg-fit-orange/5'
                }`}
              >
                <span className="text-xl leading-none">{t.icon}</span>
                <span className={`text-[9px] font-black uppercase tracking-wider leading-tight text-center ${
                  isActive ? 'text-fit-orange' : 'text-fit-dim'
                }`}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Activity Summary + Muscle Target */}
      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-fit-orange/5 border border-fit-orange/20">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{selected.icon}</span>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-fit-orange">
              {selected.label}
            </div>
            <div className="text-[11px] text-fit-dim/40 font-medium mt-0.5">
              Ausdauer · Cardio
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {MUSCLE_TARGETS.map(t => (
            <button
              key={t.value}
              onClick={() => setActivity({ ...activity, muscleTarget: t.value, muscles: MUSCLE_TARGET_GROUPS[t.value] })}
              className={`px-2.5 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-wider transition-all ${
                activeTarget === t.value
                  ? 'border-fit-orange bg-fit-orange/15 text-fit-orange'
                  : 'border-fit-line bg-fit-bg2 text-fit-dim hover:border-fit-orange/30'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-fit-dim/40 mb-2 block ml-1">
          ⏱ Dauer
        </label>
        <div className="relative">
          <input
            type="number"
            placeholder="z.B. 45"
            value={activity.duration}
            onChange={e => setActivity({ ...activity, duration: e.target.value })}
            className="w-full p-4 pr-20 rounded-2xl border bg-fit-bg2 border-fit-line text-fit-ink font-bold text-sm focus:border-fit-orange outline-none transition-all"
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-fit-dim/30">
            Minuten
          </span>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-fit-dim/40 mb-2 block ml-1">
          📝 Notizen
        </label>
        <textarea
          rows={3}
          placeholder={`Wie war die ${selected.label}-Session? Strecke, Tempo, Gefühl…`}
          value={activity.notes || ''}
          onChange={e => setActivity({ ...activity, notes: e.target.value })}
          className="w-full p-4 rounded-2xl border bg-fit-bg2 border-fit-line text-fit-ink font-medium text-sm focus:border-fit-orange outline-none resize-none leading-relaxed transition-all"
        />
      </div>
    </div>
  );
}
