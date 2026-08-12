/**
 * DateStrip — Premium horizontal date selector.
 *
 * Redesigned from DateHeader.jsx:
 * - Compact sticky strip (no giant card)
 * - Smooth session dot indicators with block colors
 * - Touch-friendly 44px tap targets
 * - Integrated action buttons inline
 */

import { useState } from 'react';
import { ChevronLeft, ChevronRight, SlidersHorizontal, Settings2, Save } from 'lucide-react';
import { blockColor, DAY_LABELS } from './utils';
import { localToday } from '@utils';
import { sessionHasLoggedWorkout } from '../../lib/sessionGate.js';

export default function DateStrip({
  date, setDate, rollingDays, recentSessions,
  saving, autoSaveLabel, dirty,
  onSave, onOpenSidebar, onOpenSettings,
}) {
  const today = localToday();
  const todayIdx = rollingDays.findIndex(d => d === today);
  const [offset, setOffset] = useState(Math.max(0, todayIdx - 6));

  const visible = rollingDays.slice(offset, offset + 7);
  const canBack = offset > 0;
  const canFwd = offset + 7 < rollingDays.length;

  // Format selected date nicely
  const selectedObj = new Date(date + 'T12:00:00');
  const MON = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
  const dateLabel = `${selectedObj.getDate()}. ${MON[selectedObj.getMonth()]} ${selectedObj.getFullYear()}`;

  return (
    <div className="sticky top-0 z-30 px-2 pb-2 pt-2" style={{ background: 'var(--bg)' }}>
      {/* Top bar: date label + actions */}
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3 px-1">
        <div className="min-w-0 flex-1">
          <div className="text-[9px] font-black uppercase tracking-[0.3em] text-fit-dim/40">Session</div>
          <div className="truncate text-sm font-black text-fit-ink">{dateLabel}</div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 self-start">
          {autoSaveLabel && (
            <span className="text-[9px] font-black uppercase tracking-widest text-fit-accent/70 animate-in fade-in">
              {autoSaveLabel}
            </span>
          )}
          {dirty && !autoSaveLabel && (
            <span className="text-[9px] font-black uppercase tracking-widest text-fit-red/60">
              ●
            </span>
          )}
          <button
            onClick={onOpenSidebar}
            className="w-9 h-9 rounded-xl bg-fit-bg2 border border-fit-line flex items-center justify-center text-fit-dim hover:text-fit-accent hover:border-fit-accent/40 transition-all"
            title="Session Details"
          >
            <SlidersHorizontal size={15} />
          </button>
          <button
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-xl bg-fit-bg2 border border-fit-line flex items-center justify-center text-fit-dim hover:text-fit-accent hover:border-fit-accent/40 transition-all"
            title="Einstellungen"
          >
            <Settings2 size={15} />
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex h-9 items-center gap-2 rounded-xl bg-fit-accent px-3 sm:px-4 text-[10px] font-black uppercase tracking-[0.15em] text-black shadow-lg shadow-accent/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {saving
              ? <div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              : <Save size={13} strokeWidth={3} />}
            <span className="hidden sm:inline">Speichern</span>
          </button>
        </div>
      </div>

      {/* Day strip */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setOffset(Math.max(0, offset - 3))}
          disabled={!canBack}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-fit-dim hover:text-fit-accent disabled:opacity-0 transition-all shrink-0"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex-1 flex justify-between gap-1">
          {visible.map(d => {
            const sess = recentSessions[d];
            // block/activity allein reichen nicht: eine Session mit geloggten
            // Übungen aber ohne gesetzten Block-Namen (z.B. Kraft+Ausdauer am
            // selben Tag, activity ohne duration nie gespeichert) zeigte sonst
            // fälschlich keinen Haken, obwohl echte Daten vorliegen.
            const hasSess = sessionHasLoggedWorkout(sess);
            const isSelected = d === date;
            const isToday = d === today;
            const color = hasSess ? blockColor(sess?.block, sess?.activity, sess?.sessionMode) : null;
            const dateObj = new Date(d + 'T12:00:00');
            const dayName = DAY_LABELS[dateObj.getDay()];
            const dayNum = dateObj.getDate();

            return (
              <button
                key={d}
                onClick={() => setDate(d)}
                className="flex flex-col items-center gap-1.5 group flex-1 min-w-0 py-1"
              >
                <span className={`text-[9px] font-black uppercase tracking-wider transition-colors ${
                  isSelected ? 'text-fit-accent' : isToday ? 'text-fit-dim/60' : 'text-fit-dim/30'
                }`}>
                  {dayName}
                </span>
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-black relative transition-all duration-200 ${
                    isSelected
                      ? 'scale-110 shadow-lg shadow-accent/30'
                      : 'hover:scale-105'
                  }`}
                  style={{
                    background: isSelected
                      ? 'var(--accent)'
                      : hasSess
                        ? (color + '20')
                        : 'var(--bg2)',
                    color: isSelected ? '#000' : hasSess ? color : 'var(--dim)',
                    border: isSelected
                      ? '2px solid var(--accent)'
                      : hasSess
                        ? `2px solid ${color}50`
                        : '2px solid transparent',
                  }}
                >
                  {hasSess ? '✓' : dayNum}
                  {isToday && !isSelected && (
                    <span
                      className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-fit-bg"
                      style={{ background: 'var(--accent)' }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setOffset(Math.min(rollingDays.length - 7, offset + 3))}
          disabled={!canFwd}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-fit-dim hover:text-fit-accent disabled:opacity-0 transition-all shrink-0"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
