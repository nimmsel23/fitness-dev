/**
 * ExerciseCard — Premium exercise item. Full rewrite of ExerciseItem.jsx.
 *
 * Visual overhaul:
 * - Glassmorphism card with accent left-glow
 * - Compact set grid (no giant stepper buttons hogging space)
 * - Inline +/- steppers as small overlays
 * - Collapsible previous-stats bar
 * - Trend badge, muscle tags, recovery indicator
 * - NxM expansion, drop-set detection
 * - Smooth animations throughout
 *
 * Orchestrator: owns state + all computed values + handlers, and composes
 * ExerciseCardHeader / ExerciseHistoryCollapse / SetGridEditor. The note
 * footer stays inline here (too small to warrant its own sub-component).
 */

import { useState, useEffect } from 'react';
import { getProgressTrend } from '@db';
import { Info } from 'lucide-react';
import {
  formatMuscleDetail, loadMuscleDetail, MUSCLE_DETAIL_KEY, splitMuscleEntries,
} from '../../lib/kb/muscles.js';
import ExerciseCardHeader from './ExerciseCardHeader.jsx';
import ExerciseHistoryCollapse from './ExerciseHistoryCollapse.jsx';
import SetGridEditor from './SetGridEditor.jsx';

const NXM_PATTERN = /^\s*(\d{1,2})\s*[xX×*]\s*(\d{1,3})\s*$/;

export default function ExerciseCard({
  ex, i, muscleRecovery = {}, updateEx, addSet, removeSet, removeEx, replaceSets, moveEx,
  isFirst, isLast, prev, onInspectExercise,
}) {
  const [trend, setTrend]             = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [expandHint, setExpandHint]   = useState(null);
  const [flashSet, setFlashSet]       = useState(null);
  const [muscleDetail, setMuscleDetail] = useState(() => loadMuscleDetail());
  const muscleLang = (typeof localStorage !== 'undefined' && localStorage.getItem('fitness-muscleLanguage')) || 'de';

  useEffect(() => {
    const onStorage = e => { if (!e.key || e.key === MUSCLE_DETAIL_KEY) setMuscleDetail(loadMuscleDetail()); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (ex.name) getProgressTrend(ex.name).then(setTrend);
  }, [ex.name]);

  const formatMuscle = m => formatMuscleDetail(m, null, muscleLang, muscleDetail);

  // ── NxM Expansion ────────────────────────────────────────────
  const tryExpandReps = (val, sIdx) => {
    const m = NXM_PATTERN.exec(val);
    if (!m || !replaceSets) return false;
    const nSets = Math.min(parseInt(m[1], 10), 20);
    const nReps = String(parseInt(m[2], 10));
    if (nSets < 1) return false;
    const baseWeight = ex.setsArray?.[sIdx]?.weight || ex.setsArray?.[0]?.weight || '';
    replaceSets(i, Array.from({ length: nSets }, () => ({ reps: nReps, weight: baseWeight })));
    setExpandHint({ sets: nSets, reps: nReps });
    setTimeout(() => setExpandHint(null), 2200);
    return true;
  };

  // ── Steppers ──────────────────────────────────────────────────
  const flash = (idx, field, delta) => {
    setFlashSet({ idx, field, delta });
    setTimeout(() => setFlashSet(c => (c?.idx === idx && c?.field === field ? null : c)), 600);
  };

  const stepReps = (sIdx, delta) => {
    const raw = ex.setsArray?.[sIdx]?.reps || '';
    if (NXM_PATTERN.test(raw)) return;
    const next = String(Math.max(0, (parseInt(raw, 10) || 0) + delta));
    updateEx(i, 'reps', next, sIdx);
    flash(sIdx, 'reps', delta);
  };

  const stepWeight = (sIdx, delta) => {
    const raw = String(ex.setsArray?.[sIdx]?.weight || '').replace(',', '.');
    const next = Math.max(0, Math.round(((parseFloat(raw) || 0) + delta) * 100) / 100);
    updateEx(i, 'weight', String(next), sIdx);
    flash(sIdx, 'weight', delta);
  };

  // ── Pattern / Drop-set detection ─────────────────────────────
  const setsArr = ex.setsArray || [];
  const patternSummary = (() => {
    if (setsArr.length < 2) return null;
    const r0 = setsArr[0]?.reps, w0 = setsArr[0]?.weight;
    if (!r0) return null;
    return setsArr.every(s => s.reps === r0 && (s.weight || '') === (w0 || ''))
      ? { count: setsArr.length, reps: r0, weight: w0 }
      : null;
  })();

  const isDropSet = (() => {
    if (setsArr.length < 2) return false;
    const w = setsArr.map(s => parseFloat(String(s.weight || '').replace(',', '.'))).filter(v => !isNaN(v));
    if (w.length !== setsArr.length) return false;
    let dropped = false;
    for (let k = 1; k < w.length; k++) {
      if (w[k] > w[k - 1]) return false;
      if (w[k] < w[k - 1]) dropped = true;
    }
    return dropped;
  })();

  // ── Recovery ──────────────────────────────────────────────────
  let exRecoveryHours = null;
  if (ex.primaryMuscles?.length > 0) {
    const hours = ex.primaryMuscles.map(m => muscleRecovery[m]).filter(h => h !== undefined);
    if (hours.length > 0) exRecoveryHours = Math.min(...hours);
  }

  // ── Muscle tags ───────────────────────────────────────────────
  const muscleTags = (() => {
    const raw = splitMuscleEntries(ex.primaryMuscles || []);
    const seen = new Set();
    const labels = [];
    for (const m of raw) {
      const label = formatMuscle(m);
      if (label && !seen.has(label)) { seen.add(label); labels.push(label); }
      if (labels.length >= 3) break;
    }
    return labels;
  })();

  // ── Volume summary ────────────────────────────────────────────
  const volumeSummary = (() => {
    if (!setsArr.length) return null;
    const filled = setsArr.filter(s => s.reps);
    if (!filled.length) return null;
    if (patternSummary) {
      return `${patternSummary.count}×${patternSummary.reps}${patternSummary.weight ? ` @ ${patternSummary.weight}kg` : ''}`;
    }
    return `${filled.length} Sätze`;
  })();

  return (
    <div
      className="relative overflow-hidden transition-all duration-300"
      style={{
        borderRadius: '20px',
        background: 'var(--card)',
        border: '1px solid var(--line)',
        boxShadow: showHistory
          ? '0 8px 32px -8px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(var(--accent-rgb,200,255,0),0.08)'
          : '0 2px 8px -4px rgba(0,0,0,0.3)',
      }}
    >
      {/* Accent left bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 transition-all duration-300"
        style={{
          background: exRecoveryHours !== null
            ? `linear-gradient(to bottom, var(--accent), var(--orange))`
            : 'var(--accent)',
          opacity: showHistory ? 1 : 0.5,
        }}
      />

      {/* Header */}
      <div className="pl-4 pr-3 pt-4 pb-3">
        <ExerciseCardHeader
          ex={ex}
          i={i}
          moveEx={moveEx}
          removeEx={removeEx}
          isFirst={isFirst}
          isLast={isLast}
          onInspectExercise={onInspectExercise}
          muscleTags={muscleTags}
          trend={trend}
          exRecoveryHours={exRecoveryHours}
          volumeSummary={volumeSummary}
        />

        <ExerciseHistoryCollapse
          prev={prev}
          trend={trend}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
        />
      </div>

      {/* Set grid */}
      <SetGridEditor
        i={i}
        setsArr={setsArr}
        updateEx={updateEx}
        removeSet={removeSet}
        addSet={addSet}
        expandHint={expandHint}
        patternSummary={patternSummary}
        isDropSet={isDropSet}
        flashSet={flashSet}
        tryExpandReps={tryExpandReps}
        stepReps={stepReps}
        stepWeight={stepWeight}
      />

      {/* Note footer */}
      <div
        className="px-3 pb-3"
        style={{ borderTop: setsArr.length > 0 ? '1px solid var(--line)' : 'none', marginTop: setsArr.length > 0 ? 0 : undefined, paddingTop: setsArr.length > 0 ? '10px' : 0 }}
      >
        <div className="relative">
          <Info size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--dim)', opacity: 0.3 }} />
          <input
            type="text"
            placeholder="Notiz…"
            value={ex.note || ''}
            onChange={e => updateEx(i, 'note', e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-[11px] font-medium rounded-lg outline-none transition-all"
            style={{
              background: 'transparent',
              border: '1px solid transparent',
              color: 'var(--dim)',
            }}
            onFocus={e => { e.currentTarget.style.background = 'var(--bg2)'; e.currentTarget.style.borderColor = 'var(--line)'; }}
            onBlur={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
          />
        </div>
      </div>
    </div>
  );
}
