/**
 * SessionHeader — merges DateStrip + SessionSwitcher + hint-banner + ModeSwitcher
 * into one calm unit. Sentence case, minimal borders, accent color reserved for
 * the single primary action. Icon clutter reduced (calendar-jump + save stay
 * visible, sidebar/settings collapse into one overflow button). Day-strip has
 * no per-day pill background — just a number with an underline for selected/today.
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, CalendarDays, MoreHorizontal, Save, Zap, Dumbbell, Activity, Plus, X } from 'lucide-react';
import { useDayStrip } from './useDayStrip';
import { blockColor, DAY_LABELS } from './utils';
import { sessionHasLoggedWorkout } from '../../lib/sessionGate.js';

export default function CalmHeader({
  date, setDate, rollingDays, recentSessions,
  saving, autoSaveLabel, dirty, onSave, onOpenSidebar, onOpenSettings,
  hint,
  daySessions, sessionId, selectSession, onNew, onDelete,
  sessionMode, setSessionMode,
}) {
  const { today, visible, canBack, canFwd, dateInputRef, dateLabel, goBack, goFwd, jumpToDate } =
    useDayStrip({ date, setDate, rollingDays });
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="sticky top-0 z-30 px-3 pt-3 pb-2" style={{ background: 'var(--bg)' }}>
      {/* Title row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold tracking-wide" style={{ color: 'var(--dim)', opacity: 0.55 }}>
            Session
          </div>
          <div className="text-base font-bold truncate" style={{ color: 'var(--ink)' }}>{dateLabel}</div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {dirty && !autoSaveLabel && (
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--red)', opacity: 0.7 }} />
          )}
          {autoSaveLabel && (
            <span className="text-[9px] font-medium" style={{ color: 'var(--accent)', opacity: 0.8 }}>{autoSaveLabel}</span>
          )}
          <button
            onClick={() => dateInputRef.current?.showPicker?.() ?? dateInputRef.current?.click()}
            className="relative w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ color: 'var(--dim)' }}
            title="Datum wählen"
          >
            <CalendarDays size={15} />
            <input
              ref={dateInputRef}
              type="date"
              value={date}
              onChange={(e) => jumpToDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
              aria-label="Datum wählen"
            />
          </button>
          <div className="relative">
            <button
              onClick={() => setMoreOpen(v => !v)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ color: 'var(--dim)' }}
              title="Mehr"
            >
              <MoreHorizontal size={15} />
            </button>
            {moreOpen && createPortal(
              <>
                <div className="fixed inset-0 z-[150]" onClick={() => setMoreOpen(false)} />
                <div
                  className="fixed right-3 top-14 z-[151] w-44 rounded-xl overflow-hidden shadow-xl"
                  style={{ background: 'var(--card)', border: '1px solid var(--line)' }}
                >
                  <button
                    onClick={() => { setMoreOpen(false); onOpenSidebar(); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium transition-colors"
                    style={{ color: 'var(--ink)' }}
                  >
                    Session-Details
                  </button>
                  <button
                    onClick={() => { setMoreOpen(false); onOpenSettings(); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium transition-colors"
                    style={{ color: 'var(--ink)' }}
                  >
                    Übungsquellen
                  </button>
                </div>
              </>,
              document.body
            )}
          </div>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[11px] font-bold transition-all active:scale-95 disabled:opacity-50"
            style={{ background: 'var(--accent)', color: '#000' }}
          >
            {saving
              ? <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              : <Save size={12} strokeWidth={2.5} />}
            <span className="hidden xs:inline">Speichern</span>
          </button>
        </div>
      </div>

      {/* Day strip — flat, no boxes */}
      <div className="flex items-center gap-1 mb-3">
        <button onClick={goBack} disabled={!canBack} className="w-6 h-6 flex items-center justify-center shrink-0 disabled:opacity-0" style={{ color: 'var(--dim)' }}>
          <ChevronLeft size={14} />
        </button>
        <div className="flex-1 flex justify-between min-w-0">
          {visible.map(d => {
            const sess = recentSessions[d];
            const hasSess = sessionHasLoggedWorkout(sess);
            const isSelected = d === date;
            const isToday = d === today;
            const color = hasSess ? blockColor(sess?.block, sess?.activity, sess?.sessionMode) : null;
            const dateObj = new Date(d + 'T12:00:00');
            return (
              <button key={d} onClick={() => setDate(d)} className="flex flex-col items-center gap-1 flex-1 min-w-0 py-1">
                <span className="text-[9px] font-medium" style={{ color: isSelected ? 'var(--accent)' : 'var(--dim)', opacity: isSelected ? 1 : 0.4 }}>
                  {DAY_LABELS[dateObj.getDay()]}
                </span>
                <span
                  className="text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full"
                  style={{
                    color: isSelected ? '#000' : hasSess ? color : 'var(--ink)',
                    background: isSelected ? 'var(--accent)' : 'transparent',
                    opacity: isSelected ? 1 : (isToday || hasSess) ? 1 : 0.35,
                  }}
                >
                  {hasSess && !isSelected ? '·' : dateObj.getDate()}
                </span>
              </button>
            );
          })}
        </div>
        <button onClick={goFwd} disabled={!canFwd} className="w-6 h-6 flex items-center justify-center shrink-0 disabled:opacity-0" style={{ color: 'var(--dim)' }}>
          <ChevronRight size={14} />
        </button>
      </div>

      {hint && (
        <div className="flex items-center gap-2 mb-3 text-[11px]" style={{ color: 'var(--dim)' }}>
          <Zap size={12} style={{ color: 'var(--accent)' }} />
          <span style={{ color: 'var(--ink)' }} className="font-semibold">{hint.block}</span>
          <span className="truncate opacity-70">{(hint.exercises || []).slice(0, 3).join(' · ')}</span>
        </div>
      )}

      {/* Session pills + mode, merged into one quiet row */}
      <div className="flex items-center gap-2 flex-wrap">
        {daySessions.length === 0 ? (
          <button
            onClick={onNew}
            className="flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: 'var(--accent)' }}
          >
            <Plus size={13} strokeWidth={2.5} /> Workout anlegen
          </button>
        ) : (
          <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
            {daySessions.map(s => {
              const isSelected = s.id === sessionId;
              const label = s.block || (s.id === null ? 'Hauptsession' : 'Workout');
              const color = blockColor(s.block, s.activity, s.sessionMode);
              return (
                <button
                  key={s.id ?? 'main'}
                  onClick={() => selectSession(s.id)}
                  className="px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all"
                  style={isSelected
                    ? { background: color + '22', color, border: `1px solid ${color}55` }
                    : { color: 'var(--dim)', border: '1px solid transparent' }}
                >
                  {label}
                </button>
              );
            })}
            <button onClick={onNew} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ color: 'var(--dim)' }} title="Neues Workout">
              <Plus size={12} />
            </button>
            {daySessions.some(s => s.id === sessionId) && (
              <button onClick={onDelete} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ color: 'var(--dim)', opacity: 0.5 }} title="Löschen">
                <X size={12} />
              </button>
            )}
          </div>
        )}

        <div className="ml-auto flex items-center gap-3 text-[11px] font-semibold shrink-0">
          <button
            onClick={() => setSessionMode('strength')}
            className="flex items-center gap-1 pb-0.5"
            style={{
              color: sessionMode === 'strength' ? 'var(--accent)' : 'var(--dim)',
              borderBottom: sessionMode === 'strength' ? '2px solid var(--accent)' : '2px solid transparent',
            }}
          >
            <Dumbbell size={12} /> Kraft
          </button>
          <button
            onClick={() => setSessionMode('cardio')}
            className="flex items-center gap-1 pb-0.5"
            style={{
              color: sessionMode === 'cardio' ? 'var(--orange)' : 'var(--dim)',
              borderBottom: sessionMode === 'cardio' ? '2px solid var(--orange)' : '2px solid transparent',
            }}
          >
            <Activity size={12} /> Ausdauer
          </button>
        </div>
      </div>
    </div>
  );
}
