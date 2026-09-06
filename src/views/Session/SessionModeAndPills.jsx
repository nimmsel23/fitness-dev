/**
 * SessionModeAndPills — session pills (multi-session switcher, "+"/delete)
 * plus the Kraft/Ausdauer mode underline-tabs, merged into one quiet row.
 * Extracted 1:1 out of SessionHeader.jsx, no behavior change.
 */

import { Dumbbell, Activity, Plus, X } from 'lucide-react';
import { blockColor } from './utils';
import { classifySession, ACTIVITY_LABELS } from '../../constants/ActivityConstants';

// Label für die aktuell im Editor bearbeitete Session — aus dem LIVE-State
// (block/sessionMode/activity), nicht aus dem zuletzt gespeicherten
// daySessions-Snapshot. Ohne das zeigte der Pill bis zum nächsten
// Autosave+Refetch weiter "Neues Workout", selbst nachdem längst ein Split
// gewählt oder auf Ausdauer gewechselt wurde (User-Feedback 2026-09-06).
function liveSessionLabel(sessionMode, block, activityType) {
  if (sessionMode === 'cardio') return ACTIVITY_LABELS[activityType] || 'Ausdauer';
  return block || 'Kraft'; // Kraft-Session ohne Split-Wahl wird trotzdem als Kraft geführt, nicht als "Neues Workout".
}

export default function SessionModeAndPills({
  daySessions, sessionId, selectSession, onNew, onDelete,
  sessionMode, setSessionMode, block, activity,
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {daySessions.length === 0 ? (
        // Kein Button hier mehr (User-Feedback 2026-09-06): die Übungsliste
        // darunter ist bei leerem Tag bereits voll nutzbar, ganz ohne
        // vorherigen Klick — "Workout anlegen" suggerierte einen nötigen
        // ersten Schritt, der tatsächlich nur eine zweite, überflüssige
        // Session-Identität (zufällige UUID statt der impliziten
        // Haupt-Session) erzeugte. Der kleine "+"-Button unten bleibt für
        // den echten Anwendungsfall bestehen: eine ZUSÄTZLICHE Session
        // starten, wenn an dem Tag schon mindestens eine existiert.
        <div />
      ) : (
        <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
          {daySessions.map(s => {
            const isSelected = s.id === sessionId;
            const label = isSelected
              ? liveSessionLabel(sessionMode, block, activity?.type)
              : (classifySession(s).label || 'Kraft');
            const color = isSelected
              ? blockColor(block, activity, sessionMode)
              : blockColor(s.block, s.activity, s.sessionMode);
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
  );
}
