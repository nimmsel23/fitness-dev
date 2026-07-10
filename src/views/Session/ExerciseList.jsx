/**
 * ExerciseList — Container for exercise cards + add/quick-add controls.
 * Upgraded version of ExerciseSection.jsx.
 */

import { useState } from 'react';
import { Dumbbell, Plus, Search, Zap } from 'lucide-react';
import ExerciseCard from './ExerciseCard';
import ExerciseSearchOverlay from '../../components/ExerciseSearchOverlay';

export default function ExerciseList({
  exercises = [], restHours, muscleRecovery = {},
  updateEx, addSet, removeSet, removeEx, replaceSets, moveEx,
  date, addEx, quickInput, setQuickInput, addQuick,
  prevMap = {}, onInspectExercise,
  hint, gaps,
}) {
  const [showSearch, setShowSearch] = useState(false);
  const safe = Array.isArray(exercises) ? exercises : [];

  return (
    <div className="space-y-5">

      {/* Plan hint */}
      {hint && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl animate-in slide-in-from-top-2 duration-300"
          style={{
            background: 'rgba(var(--accent-rgb,200,255,0),0.04)',
            border: '1px solid rgba(var(--accent-rgb,200,255,0),0.15)',
          }}
        >
          <Zap size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <div className="min-w-0">
            <span
              className="text-[10px] font-black uppercase tracking-widest mr-2"
              style={{ color: 'var(--accent)' }}
            >
              {hint.block}
            </span>
            <span
              className="text-[11px]"
              style={{ color: 'var(--muted)' }}
            >
              {(hint.exercises || []).slice(0, 3).join(' · ')}
            </span>
          </div>
        </div>
      )}

      {/* Coverage gaps */}
      {gaps.length > 0 && (
        <div
          className="px-4 py-3 rounded-2xl"
          style={{
            background: 'rgba(255,80,80,0.04)',
            border: '1px solid rgba(255,80,80,0.15)',
          }}
        >
          <div
            className="text-[9px] font-black uppercase tracking-[0.2em] mb-2"
            style={{ color: 'var(--red)' }}
          >
            Coverage-Lücken
          </div>
          <div className="flex flex-wrap gap-1.5">
            {gaps.map(g => (
              <span
                key={g.name}
                className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg"
                style={{
                  background: 'rgba(255,80,80,0.08)',
                  color: 'var(--red)',
                  border: '1px solid rgba(255,80,80,0.2)',
                }}
              >
                {g.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Rest hours badge */}
      {restHours !== null && (
        <div className="flex items-center gap-2">
          <div
            className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg font-mono"
            style={{
              background: 'rgba(var(--accent-rgb,200,255,0),0.06)',
              color: 'var(--accent)',
              border: '1px solid rgba(var(--accent-rgb,200,255,0),0.15)',
            }}
          >
            ⏱ {restHours}h Rest
          </div>
        </div>
      )}

      {/* Exercise cards */}
      <div className="space-y-2">
        {safe.map((ex, idx) => (
          <ExerciseCard
            key={idx}
            ex={ex}
            i={idx}
            muscleRecovery={muscleRecovery}
            updateEx={updateEx}
            addSet={addSet}
            removeSet={removeSet}
            removeEx={removeEx}
            replaceSets={replaceSets}
            moveEx={moveEx}
            isFirst={idx === 0}
            isLast={idx === safe.length - 1}
            prev={prevMap[ex.name]}
            onInspectExercise={onInspectExercise}
          />
        ))}

        {/* Empty state */}
        {safe.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-14 rounded-3xl"
            style={{
              background: 'rgba(var(--bg2-rgb,30,30,40),0.3)',
              border: '2px dashed var(--line)',
              opacity: 0.5,
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: 'var(--line)' }}
            >
              <Dumbbell size={26} style={{ color: 'var(--dim)' }} />
            </div>
            <p
              className="text-[11px] font-black uppercase tracking-[0.25em]"
              style={{ color: 'var(--dim)' }}
            >
              Noch keine Übungen
            </p>
            <p
              className="text-[10px] mt-1"
              style={{ color: 'var(--dim)', opacity: 0.5 }}
            >
              Übung hinzufügen oder Quick-Input nutzen
            </p>
          </div>
        )}
      </div>

      {/* Add controls */}
      <div className="space-y-2">
        {/* Primary: Search */}
        <button
          onClick={() => setShowSearch(true)}
          className="w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-[11px] transition-all hover:scale-[1.01] active:scale-95"
          style={{
            background: 'var(--accent)',
            color: '#000',
            boxShadow: '0 6px 20px -4px rgba(200,255,0,0.3)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <Plus size={16} strokeWidth={3} />
            Übung hinzufügen
          </div>
          <Search size={14} style={{ opacity: 0.5 }} />
        </button>

        {/* Secondary: Quick input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={quickInput}
            onChange={e => setQuickInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addQuick()}
            placeholder="Quick: bench 3×8@80"
            className="flex-1 px-4 py-3 rounded-xl font-mono text-[12px] outline-none transition-all"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--line)',
              color: 'var(--ink)',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,255,0,0.06)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.boxShadow = 'none'; }}
          />
          <button
            onClick={addQuick}
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--line)',
              color: 'var(--ink)',
            }}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {showSearch && (
        <ExerciseSearchOverlay
          onSelect={addEx}
          onClose={() => setShowSearch(false)}
          date={date}
        />
      )}
    </div>
  );
}
