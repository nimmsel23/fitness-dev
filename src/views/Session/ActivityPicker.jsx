/**
 * ActivityPicker — shared Activity-Picker UI behind ActivityAddon.jsx
 * (Kraft-Session-Finisher) and ActivitySection.jsx (Cardio-Mode).
 *
 * This component is a pure structural merge (2026-09-05) — it does NOT
 * change observable behavior at either call site. `mode="addon"` renders
 * exactly what `ActivityAddon.jsx` used to render inline; `mode="standalone"`
 * renders exactly what `ActivitySection.jsx` used to render inline.
 * `ActivityAddon.jsx` / `ActivitySection.jsx` are now thin re-exports that
 * just pin the mode, so existing imports (incl. `ADDON_TYPES`, still
 * consumed by `SessionSlots.jsx` and `ActivityAddonHistory.jsx`) keep working.
 *
 * KNOWN INCONSISTENCIES (found during this merge, deliberately NOT fixed —
 * open questions for the user, see PHASE2_TODO.md):
 *
 * 1. "9 vs 10 activity types" — this claim from the original audit /
 *    PHASE2_TODO.md is STALE as of 2026-09-05: both ActivityAddon's
 *    ADDON_TYPES and ActivitySection's ACTIVITY_TYPES already contained the
 *    identical 10 values (incl. "walking") by the time of this merge — only
 *    their *display order* differs per mode. Someone fixed the count
 *    mismatch at some point without updating the audit docs. The per-mode
 *    order is preserved below (ADDON_ORDER vs STANDALONE_ORDER) since a
 *    reordered button grid is an observable UI change this refactor is not
 *    meant to make.
 * 2. Muscle-Target/Swim-Style visibility genuinely still differs and is
 *    reproduced as-is: in `mode="addon"` the Muscle-Target switch (Core/
 *    Beine/Full Body) is ALWAYS shown, regardless of activity type. In
 *    `mode="standalone"` it is shown ONLY for `type === 'hiit'`, and the
 *    Swim-Style switch (Brust/Rücken) is shown ONLY for `type === 'swimming'`
 *    — for every other standalone type neither switch renders at all.
 *    Reason for the divergence was never documented; not decided here.
 */

import { Plus, X } from 'lucide-react';
import {
  ACTIVITY_MUSCLE_DEFAULTS,
  ACTIVITY_MUSCLE_GROUPS,
  MUSCLE_TARGET_GROUPS,
  SWIM_STYLE_MUSCLES,
  SWIM_STYLE_PRIMARY_MUSCLES,
} from '../../constants/ActivityConstants';

// Shared activity-type metadata (label + icon), keyed by value — both modes
// draw from the same set (see inconsistency note #1 above). Only the
// per-mode ORDER differs, preserved exactly as each component had it before
// this merge.
const ACTIVITY_TYPE_META = {
  hiit:       { label: 'HIIT',        icon: '⚡' },
  stretching: { label: 'Stretching',  icon: '🤸' },
  yoga:       { label: 'Yoga',        icon: '🧘' },
  running:    { label: 'Laufen',      icon: '🏃' },
  cycling:    { label: 'Radfahren',   icon: '🚴' },
  rowing:     { label: 'Rudern',      icon: '🚣' },
  walking:    { label: 'Spazieren',   icon: '🚶' },
  swimming:   { label: 'Schwimmen',   icon: '🏊' },
  hiking:     { label: 'Wandern',     icon: '🥾' },
  climbing:   { label: 'Klettern',    icon: '🧗' },
};

// Order as previously defined in ActivityAddon.jsx.
const ADDON_ORDER = [
  'hiit', 'stretching', 'yoga', 'running', 'cycling',
  'rowing', 'walking', 'swimming', 'hiking', 'climbing',
];

// Order as previously defined in ActivitySection.jsx.
const STANDALONE_ORDER = [
  'running', 'cycling', 'swimming', 'hiking', 'rowing',
  'climbing', 'yoga', 'stretching', 'hiit', 'walking',
];

const toTypeList = order => order.map(value => ({ value, ...ACTIVITY_TYPE_META[value] }));

// Exported so existing consumers of ActivityAddon's ADDON_TYPES
// (SessionSlots.jsx, ActivityAddonHistory.jsx) keep working unchanged.
export const ADDON_TYPES = toTypeList(ADDON_ORDER);
export const STANDALONE_ACTIVITY_TYPES = toTypeList(STANDALONE_ORDER);

const MUSCLE_TARGETS = [
  { value: 'core',  label: 'Core' },
  { value: 'legs',  label: 'Beine' },
  { value: 'full',  label: 'Full Body' },
];

const SWIM_STYLES = [
  { value: 'breast', label: 'Brust' },
  { value: 'back',   label: 'Rücken' },
];

// Standalone-mode-only helpers, unchanged from ActivitySection.jsx.
function musclesForActivity(type, { muscleTarget, swimStyle } = {}) {
  if (type === 'hiit') {
    const t = muscleTarget || ACTIVITY_MUSCLE_DEFAULTS.hiit;
    return MUSCLE_TARGET_GROUPS[t] || MUSCLE_TARGET_GROUPS.full;
  }
  if (type === 'swimming') {
    return SWIM_STYLE_MUSCLES[swimStyle || 'breast'];
  }
  return ACTIVITY_MUSCLE_GROUPS[type] || MUSCLE_TARGET_GROUPS.full;
}

// Primary-Mover-Teilmenge für die Coverage-Berechnung — nur beim Schwimmen
// bislang differenziert (siehe SWIM_STYLE_PRIMARY_MUSCLES), sonst leer
// (alle Muskeln bleiben secondary-gewichtet, unverändertes Altverhalten).
function primaryMusclesForActivity(type, { swimStyle } = {}) {
  if (type === 'swimming') {
    return SWIM_STYLE_PRIMARY_MUSCLES[swimStyle || 'breast'] || [];
  }
  return [];
}

function AddonPicker({ hasActivity, setHasActivity, activity, setActivity }) {
  if (!hasActivity) {
    return (
      <button
        onClick={() => {
          setHasActivity(true);
          // Default 5min: der weit überwiegende Fall in der Praxis (Coach-
          // Feedback), Nutzer können den Wert weiterhin frei überschreiben.
          setActivity({ type: 'hiit', duration: '5', notes: '', muscleTarget: 'core', muscles: ['core'] });
        }}
        className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl border border-dashed border-fit-line text-fit-dim hover:border-fit-orange/40 hover:text-fit-orange hover:bg-fit-orange/5 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-200"
      >
        <Plus size={13} strokeWidth={3} />
        Activity-Finisher hinzufügen
      </button>
    );
  }

  const selected = ADDON_TYPES.find(t => t.value === activity.type) || ADDON_TYPES[0];

  return (
    <div className="rounded-[24px] border border-fit-orange/20 bg-fit-orange/5 p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{selected.icon}</span>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-fit-orange">
              Activity-Finisher
            </div>
            <div className="text-[9px] text-fit-dim/40 font-medium">
              Anhang zu diesem Workout
            </div>
          </div>
        </div>
        <button
          onClick={() => setHasActivity(false)}
          className="w-7 h-7 rounded-lg bg-fit-bg2 flex items-center justify-center text-fit-dim hover:text-fit-red hover:bg-fit-red/10 transition-all"
        >
          <X size={13} />
        </button>
      </div>

      {/* Type + Duration inline */}
      <div className="flex gap-2">
        {/* Type selector — compact horizontal scroll */}
        <div className="flex-1 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {ADDON_TYPES.map(t => {
            const isActive = activity.type === t.value;
            return (
              <button
                key={t.value}
                onClick={() => {
                  const target = ACTIVITY_MUSCLE_DEFAULTS[t.value] || 'full';
                  setActivity({ ...activity, type: t.value, muscleTarget: target, muscles: MUSCLE_TARGET_GROUPS[target] });
                }}
                title={t.label}
                className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all ${
                  isActive
                    ? 'border-fit-orange bg-fit-orange/15 shadow-sm'
                    : 'border-fit-line bg-fit-bg2 hover:border-fit-orange/30'
                }`}
              >
                <span className="text-base leading-none">{t.icon}</span>
                <span className={`text-[8px] font-black uppercase tracking-wide whitespace-nowrap ${
                  isActive ? 'text-fit-orange' : 'text-fit-dim'
                }`}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Muscle Target Switch — addon mode: always shown (see inconsistency
          note #2 at top of file). */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-black uppercase tracking-widest text-fit-dim/40 shrink-0">Ziel</span>
        <div className="flex gap-1">
          {MUSCLE_TARGETS.map(t => {
            const isActive = (activity.muscleTarget || ACTIVITY_MUSCLE_DEFAULTS[activity.type] || 'full') === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setActivity({ ...activity, muscleTarget: t.value, muscles: MUSCLE_TARGET_GROUPS[t.value] })}
                className={`px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-wider transition-all ${
                  isActive
                    ? 'border-fit-orange bg-fit-orange/15 text-fit-orange'
                    : 'border-fit-line bg-fit-bg2 text-fit-dim hover:border-fit-orange/30'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Duration */}
      <div className="relative">
        <input
          type="number"
          placeholder="Dauer"
          value={activity.duration}
          onChange={e => setActivity({ ...activity, duration: e.target.value })}
          className="w-full p-3 pr-20 rounded-xl border bg-fit-bg2 border-fit-line text-fit-ink font-bold text-sm focus:border-fit-orange outline-none transition-all"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-fit-dim/30">
          min
        </span>
      </div>
    </div>
  );
}

function StandalonePicker({ activity, setActivity }) {
  const selected = STANDALONE_ACTIVITY_TYPES.find(t => t.value === activity.type) || STANDALONE_ACTIVITY_TYPES[0];
  const activeTarget = activity.muscleTarget || ACTIVITY_MUSCLE_DEFAULTS[activity.type] || 'full';
  const activeSwimStyle = activity.swimStyle || 'breast';

  return (
    <div className="space-y-6">
      {/* Activity Type Grid */}
      <div>
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-fit-dim/40 mb-3 ml-1">
          Art der Aktivität
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {STANDALONE_ACTIVITY_TYPES.map(t => {
            const isActive = activity.type === t.value;
            return (
              <button
                key={t.value}
                onClick={() => {
                  const target = ACTIVITY_MUSCLE_DEFAULTS[t.value] || 'full';
                  const next = { ...activity, type: t.value, muscleTarget: target };
                  next.muscles = musclesForActivity(t.value, next);
                  next.primaryMuscles = primaryMusclesForActivity(t.value, next);
                  setActivity(next);
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

      {/* Selected Activity Summary + Muscle Target — standalone mode: switches
          shown only for 'hiit'/'swimming' respectively (see inconsistency
          note #2 at top of file). */}
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
        {activity.type === 'hiit' && (
          <div className="flex items-center gap-1.5">
            {MUSCLE_TARGETS.map(t => (
              <button
                key={t.value}
                onClick={() => {
                  const next = { ...activity, muscleTarget: t.value };
                  next.muscles = musclesForActivity('hiit', next);
                  next.primaryMuscles = primaryMusclesForActivity('hiit', next);
                  setActivity(next);
                }}
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
        )}
        {activity.type === 'swimming' && (
          <div className="flex items-center gap-1.5">
            {SWIM_STYLES.map(s => (
              <button
                key={s.value}
                onClick={() => {
                  const next = { ...activity, swimStyle: s.value };
                  next.muscles = musclesForActivity('swimming', next);
                  next.primaryMuscles = primaryMusclesForActivity('swimming', next);
                  setActivity(next);
                }}
                className={`px-2.5 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-wider transition-all ${
                  activeSwimStyle === s.value
                    ? 'border-fit-orange bg-fit-orange/15 text-fit-orange'
                    : 'border-fit-line bg-fit-bg2 text-fit-dim hover:border-fit-orange/30'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
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

export default function ActivityPicker({ mode, hasActivity, setHasActivity, activity, setActivity }) {
  if (mode === 'addon') {
    return (
      <AddonPicker
        hasActivity={hasActivity}
        setHasActivity={setHasActivity}
        activity={activity}
        setActivity={setActivity}
      />
    );
  }
  return <StandalonePicker activity={activity} setActivity={setActivity} />;
}
