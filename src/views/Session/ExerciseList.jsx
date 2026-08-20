/**
 * ExerciseList — Container for exercise cards + add/quick-add controls.
 * Upgraded version of ExerciseSection.jsx.
 */

import { useState } from 'react';
import { Dumbbell, Plus, Search } from 'lucide-react';
import ExerciseCard from './ExerciseCard';
import ExerciseSearchOverlay from '../../components/ExerciseSearchOverlay';

export default function ExerciseList({
  exercises = [], restHours, muscleRecovery = {},
  updateEx, addSet, removeSet, removeEx, replaceSets, moveEx,
  date, addEx, quickInput, setQuickInput, addQuick,
  prevMap = {}, onInspectExercise,
  gaps,
}) {
  const [showSearch, setShowSearch] = useState(false);
  const safe = Array.isArray(exercises) ? exercises : [];

  return (
    <div className="space-y-5">

      {/* Coverage gaps — informational, not alarm-red: these are muscles that
          simply haven't been trained in a while, not an error state. */}
      {gaps.length > 0 && (
        <div className="flex items-start gap-2 px-1">
          <span className="text-[10px] font-semibold shrink-0 mt-0.5" style={{ color: 'var(--dim)', opacity: 0.6 }}>
            Länger nicht trainiert
          </span>
          <div className="flex flex-wrap gap-1.5">
            {gaps.map(g => (
              <span
                key={g.name}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: 'var(--bg2)', color: 'var(--dim)' }}
              >
                {g.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Rest hours badge */}
      {restHours !== null && (
        <div className="flex items-center gap-1.5 px-1 text-[11px] font-medium" style={{ color: 'var(--dim)' }}>
          <span style={{ color: 'var(--accent)' }}>⏱</span> {restHours}h seit letztem Training
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
          <div className="flex flex-col items-center justify-center py-12 rounded-2xl" style={{ border: '1px dashed var(--line)' }}>
            <Dumbbell size={20} style={{ color: 'var(--dim)', opacity: 0.4 }} className="mb-2" />
            <p className="text-sm font-semibold" style={{ color: 'var(--dim)' }}>
              Noch keine Übungen
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--dim)', opacity: 0.5 }}>
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
          className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-[1.01] active:scale-95"
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
