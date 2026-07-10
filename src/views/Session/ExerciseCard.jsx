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
 */

import { useState, useEffect } from 'react';
import { getProgressTrend } from '@db';
import {
  TrendingUp, TrendingDown, Plus, Info, X, Clock, History,
  ChevronDown, ChevronUp, GripVertical,
} from 'lucide-react';
import {
  formatMuscleDetail, loadMuscleDetail, MUSCLE_DETAIL_KEY, splitMuscleEntries,
} from '../../lib/translations.js';

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
    const next = Math.max(0, Math.round((parseFloat(raw) || 0 + delta) * 100) / 100);
    updateEx(i, 'weight', Number.isInteger(next) ? String(next) : String(next), sIdx);
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
        <div className="flex items-start gap-2">

          {/* Move handles */}
          <div className="flex flex-col gap-0.5 shrink-0 mt-0.5 opacity-20 hover:opacity-60 transition-opacity">
            <button
              onClick={() => moveEx(i, -1)}
              disabled={isFirst}
              className="w-5 h-5 flex items-center justify-center disabled:opacity-0 hover:text-fit-accent transition-all"
            >
              <ChevronUp size={12} />
            </button>
            <button
              onClick={() => moveEx(i, 1)}
              disabled={isLast}
              className="w-5 h-5 flex items-center justify-center disabled:opacity-0 hover:text-fit-accent transition-all"
            >
              <ChevronDown size={12} />
            </button>
          </div>

          {/* Exercise info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3
                  onClick={() => onInspectExercise?.(ex)}
                  className={`font-black text-[15px] leading-tight tracking-tight transition-colors ${
                    onInspectExercise ? 'cursor-pointer hover:text-fit-accent' : ''
                  }`}
                  style={{ color: 'var(--ink)' }}
                >
                  {ex.name || <span style={{ color: 'var(--dim)', fontStyle: 'italic' }}>Übung</span>}
                </h3>

                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  {/* Muscle tags */}
                  {muscleTags.map(label => (
                    <span
                      key={label}
                      className="text-[9px] font-bold uppercase tracking-widest"
                      style={{ color: 'var(--dim)', opacity: 0.6 }}
                    >
                      {label}
                    </span>
                  ))}

                  {/* Source badge */}
                  {ex.source && ex.source !== 'expert' && (
                    <span
                      className="text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-[0.15em]"
                      style={{
                        background: ex.source === 'bulk' ? 'var(--bg2)' : 'rgba(255,140,50,0.08)',
                        color: ex.source === 'bulk' ? 'var(--dim)' : 'var(--orange)',
                        border: `1px solid ${ex.source === 'bulk' ? 'var(--line)' : 'rgba(255,140,50,0.15)'}`,
                      }}
                    >
                      {ex.source}
                    </span>
                  )}

                  {/* Trend */}
                  {trend && trend.status !== 'neutral' && (
                    <div
                      className="flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-full"
                      style={{
                        background: trend.status === 'up' ? 'rgba(var(--green-rgb,80,200,100),0.1)' : 'rgba(var(--red-rgb,255,80,80),0.1)',
                        color: trend.status === 'up' ? 'var(--green)' : 'var(--red)',
                      }}
                    >
                      {trend.status === 'up' ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                      {trend.change}%
                    </div>
                  )}

                  {/* Recovery */}
                  {exRecoveryHours !== null && (
                    <div
                      className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest"
                      style={{
                        background: 'rgba(var(--accent-rgb,200,255,0),0.06)',
                        color: 'var(--accent)',
                      }}
                    >
                      <Clock size={9} />
                      {exRecoveryHours}h
                    </div>
                  )}

                  {/* Volume summary */}
                  {volumeSummary && (
                    <span
                      className="text-[9px] font-mono font-bold"
                      style={{ color: 'var(--dim)', opacity: 0.5 }}
                    >
                      {volumeSummary}
                    </span>
                  )}
                </div>
              </div>

              {/* Delete */}
              <button
                onClick={() => removeEx(i)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0"
                style={{ color: 'var(--dim)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,80,80,0.08)'; e.currentTarget.style.color = 'var(--red)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--dim)'; }}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Previous stats bar */}
        {prev && (
          <button
            onClick={() => setShowHistory(h => !h)}
            className="mt-3 w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all"
            style={{
              background: showHistory ? 'rgba(var(--accent-rgb,200,255,0),0.05)' : 'var(--bg2)',
              border: showHistory ? '1px solid rgba(var(--accent-rgb,200,255,0),0.15)' : '1px solid var(--line)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--card)', border: '1px solid var(--line)' }}
              >
                <History size={11} style={{ color: 'var(--dim)' }} />
              </div>
              <div className="text-left">
                <div
                  className="text-[9px] font-black uppercase tracking-[0.2em]"
                  style={{ color: 'var(--dim)', opacity: 0.4 }}
                >
                  Zuletzt · {prev.date}
                </div>
                <div
                  className="text-[11px] font-mono font-bold"
                  style={{ color: 'var(--dim)', opacity: 0.8 }}
                >
                  {prev.setsArray
                    ? `${prev.setsArray.length}×${prev.setsArray[0]?.reps}${prev.setsArray[0]?.weight ? ` @ ${prev.setsArray[0].weight}kg` : ''}`
                    : `${prev.sets}×${prev.reps}${prev.weight ? ` @ ${prev.weight}kg` : ''}`}
                </div>
              </div>
            </div>
            <ChevronDown
              size={13}
              style={{
                color: 'var(--dim)',
                opacity: 0.4,
                transform: showHistory ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            />
          </button>
        )}

        {/* Expanded history */}
        {showHistory && prev && (
          <div
            className="mt-2 p-3 rounded-xl space-y-1.5 animate-in slide-in-from-top-2 duration-200"
            style={{ background: 'var(--bg2)', border: '1px solid var(--line)' }}
          >
            {prev.setsArray ? prev.setsArray.map((s, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span
                  className="text-[9px] font-black uppercase w-5"
                  style={{ color: 'var(--dim)', opacity: 0.35 }}
                >
                  S{idx + 1}
                </span>
                <span
                  className="text-[11px] font-mono font-bold"
                  style={{ color: 'var(--dim)', opacity: 0.7 }}
                >
                  {s.reps} reps{s.weight ? ` @ ${s.weight}kg` : ''}
                </span>
              </div>
            )) : (
              <span
                className="text-[11px] font-mono font-bold"
                style={{ color: 'var(--dim)', opacity: 0.7 }}
              >
                {prev.sets}×{prev.reps}{prev.weight ? ` @ ${prev.weight}kg` : ''}
              </span>
            )}
            {trend && trend.status !== 'neutral' && (
              <div
                className="pt-1.5 mt-1 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest"
                style={{
                  borderTop: '1px solid var(--line)',
                  color: trend.status === 'up' ? 'var(--green)' : 'var(--red)',
                  opacity: 0.7,
                }}
              >
                {trend.status === 'up' ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                {trend.change}% zum Vorwert
              </div>
            )}
          </div>
        )}
      </div>

      {/* Set grid */}
      {setsArr.length > 0 && (
        <div className="px-3 pb-3">
          {/* Pattern / Drop-set banner */}
          {(expandHint || patternSummary || isDropSet) && (
            <div
              className="flex items-center justify-between gap-2 px-3 py-1.5 mb-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
              style={{
                background: expandHint
                  ? 'rgba(var(--accent-rgb,200,255,0),0.08)'
                  : isDropSet
                    ? 'rgba(255,140,50,0.08)'
                    : 'var(--bg2)',
                border: expandHint
                  ? '1px solid rgba(var(--accent-rgb,200,255,0),0.2)'
                  : isDropSet
                    ? '1px solid rgba(255,140,50,0.2)'
                    : '1px solid var(--line)',
                color: expandHint ? 'var(--accent)' : isDropSet ? 'var(--orange)' : 'var(--dim)',
              }}
            >
              {expandHint
                ? `✓ ${expandHint.sets} × ${expandHint.reps} Reps`
                : isDropSet
                  ? '↓ Drop-Set'
                  : `Straight · ${patternSummary.count}×${patternSummary.reps}${patternSummary.weight ? ` @ ${patternSummary.weight}kg` : ''}`}
            </div>
          )}

          {/* Column headers */}
          <div className="grid grid-cols-[24px_1fr_auto_1fr_28px] gap-1 px-1 mb-1.5">
            <span />
            <span
              className="text-[9px] font-black uppercase tracking-widest text-center"
              style={{ color: 'var(--dim)', opacity: 0.4 }}
            >
              Reps
            </span>
            <span />
            <span
              className="text-[9px] font-black uppercase tracking-widest text-center"
              style={{ color: 'var(--dim)', opacity: 0.4 }}
            >
              kg
            </span>
            <span />
          </div>

          {/* Set rows */}
          <div className="space-y-1.5">
            {setsArr.map((set, sIdx) => {
              const flashReps   = flashSet?.idx === sIdx && flashSet?.field === 'reps';
              const flashWeight = flashSet?.idx === sIdx && flashSet?.field === 'weight';
              return (
                <div
                  key={sIdx}
                  className="grid grid-cols-[24px_1fr_auto_1fr_28px] items-center gap-1 animate-in slide-in-from-left-1 duration-150"
                >
                  {/* Set label */}
                  <span
                    className="text-[9px] font-black text-center"
                    style={{ color: 'var(--dim)', opacity: 0.3 }}
                  >
                    {sIdx + 1}
                  </span>

                  {/* Reps */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => stepReps(sIdx, -1)}
                      className="absolute left-0 top-0 bottom-0 w-9 flex items-center justify-center transition-all z-10 rounded-l-xl"
                      style={{ color: 'var(--dim)', opacity: 0.5 }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--accent)'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = 'var(--dim)'; }}
                    >
                      <ChevronDown size={14} />
                    </button>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder={sIdx === 0 ? '5×5' : '—'}
                      value={set.reps || ''}
                      onChange={e => updateEx(i, 'reps', e.target.value, sIdx)}
                      onBlur={e => tryExpandReps(e.target.value, sIdx)}
                      onKeyDown={e => { if (e.key === 'Enter' && tryExpandReps(e.target.value, sIdx)) e.target.blur(); }}
                      className="w-full text-center font-mono font-black py-2.5 px-9 rounded-xl text-sm outline-none transition-all"
                      style={{
                        background: flashReps ? 'rgba(var(--accent-rgb,200,255,0),0.08)' : 'var(--bg2)',
                        border: flashReps ? '1.5px solid var(--accent)' : '1.5px solid var(--line)',
                        color: 'var(--ink)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => stepReps(sIdx, +1)}
                      className="absolute right-0 top-0 bottom-0 w-9 flex items-center justify-center transition-all z-10 rounded-r-xl"
                      style={{ color: 'var(--dim)', opacity: 0.5 }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--accent)'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = 'var(--dim)'; }}
                    >
                      <ChevronUp size={14} />
                    </button>
                    {flashReps && flashSet?.delta != null && (
                      <span
                        className="pointer-events-none absolute -top-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase animate-in fade-in slide-in-from-bottom-1 duration-150"
                        style={{ background: 'var(--accent)', color: '#000' }}
                      >
                        {flashSet.delta > 0 ? `+${flashSet.delta}` : flashSet.delta}
                      </span>
                    )}
                  </div>

                  <span
                    className="text-[11px] font-black italic text-center"
                    style={{ color: 'var(--dim)', opacity: 0.3 }}
                  >
                    @
                  </span>

                  {/* Weight */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => stepWeight(sIdx, -2.5)}
                      className="absolute left-0 top-0 bottom-0 w-9 flex items-center justify-center transition-all z-10 rounded-l-xl"
                      style={{ color: 'var(--dim)', opacity: 0.5 }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--accent)'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = 'var(--dim)'; }}
                    >
                      <ChevronDown size={14} />
                    </button>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="kg"
                      value={set.weight || ''}
                      onChange={e => updateEx(i, 'weight', e.target.value, sIdx)}
                      className="w-full text-center font-mono font-black py-2.5 px-9 rounded-xl text-sm outline-none transition-all"
                      style={{
                        background: flashWeight ? 'rgba(var(--accent-rgb,200,255,0),0.08)' : 'var(--bg2)',
                        border: flashWeight ? '1.5px solid var(--accent)' : '1.5px solid var(--line)',
                        color: 'var(--ink)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => stepWeight(sIdx, +2.5)}
                      className="absolute right-0 top-0 bottom-0 w-9 flex items-center justify-center transition-all z-10 rounded-r-xl"
                      style={{ color: 'var(--dim)', opacity: 0.5 }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--accent)'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = 'var(--dim)'; }}
                    >
                      <ChevronUp size={14} />
                    </button>
                    {flashWeight && flashSet?.delta != null && (
                      <span
                        className="pointer-events-none absolute -top-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase animate-in fade-in slide-in-from-bottom-1 duration-150"
                        style={{ background: 'var(--accent)', color: '#000' }}
                      >
                        {flashSet.delta > 0 ? `+${flashSet.delta}` : flashSet.delta}
                      </span>
                    )}
                  </div>

                  {/* Remove set */}
                  <button
                    onClick={() => removeSet(i, sIdx)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                    style={{ color: 'var(--dim)', opacity: 0.3 }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'rgba(255,80,80,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '0.3'; e.currentTarget.style.color = 'var(--dim)'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add set */}
          <button
            onClick={() => addSet(i)}
            className="w-full mt-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-1.5 transition-all"
            style={{
              background: 'rgba(var(--accent-rgb,200,255,0),0.04)',
              border: '1.5px dashed rgba(var(--accent-rgb,200,255,0),0.2)',
              color: 'var(--accent)',
              opacity: 0.7,
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(var(--accent-rgb,200,255,0),0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.background = 'rgba(var(--accent-rgb,200,255,0),0.04)'; }}
          >
            <Plus size={12} strokeWidth={3} />
            Satz hinzufügen
          </button>
        </div>
      )}

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
