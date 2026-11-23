import { useEffect, useState } from 'react';
import { Play, Square, Dumbbell, Activity } from 'lucide-react';
import {
  normalizeSessionGate,
  isSessionGateActive,
  isSessionGateCompleted,
} from '../../lib/sessionGate.js';
import { useGateElapsed } from './useGateElapsed.js';
import { GATE_STOP_STYLE } from './gateTone.js';
import GateIdleSuggestion from './GateIdleSuggestion.jsx';
import GatePortalGrid from './GatePortalGrid.jsx';
import SplitPicker from './SplitPicker.jsx';
import GateNextPlanCard from './GateNextPlanCard.jsx';
import { countSessionProgress } from './SessionGateBar.jsx';

function TodayCounters({ exercises }) {
  const { exerciseCount, setCount, volume } = countSessionProgress(exercises);
  const items = [[exerciseCount, 'Übungen'], [setCount, 'Sätze'], [`${volume.toLocaleString('de-DE')} kg`, 'Volumen']];
  return (
    <div className="relative mt-4 grid grid-cols-3 gap-2">
      {items.map(([value, label]) => (
        <div key={label} className="rounded-xl py-2 text-center" style={{ background: 'var(--bg2)' }}>
          <div className="font-mono font-bold tabular-nums text-sm" style={{ color: 'var(--ink)' }}>{value}</div>
          <div className="text-[8px] font-bold tracking-[0.15em] uppercase mt-0.5" style={{ color: 'var(--dim)', opacity: 0.6 }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

export default function SessionGateCard({ sessionGate, currentSubTab = null, exercises = [], sessionMode = 'strength', setSessionMode, block = '', setBlock, onSplitLongPress, onApplyRoutine, onManualLog, hub = false, onSubNav, onLeave, onStart, onStop }) {
  const gate = normalizeSessionGate(sessionGate);
  const active = isSessionGateActive(gate);
  const completed = isSessionGateCompleted(gate);
  // Sichtbarer Status statt stillem No-op: `sendSessionGateNotification()`
  // bricht bei fehlender Permission unauffällig ab — ohne diese Anzeige hat
  // der User keine Chance zu sehen, dass genau das der Grund für "keine
  // Notification bisher" ist (iOS fragt den Permission-Dialog nur einmal ab,
  // ein Wegtippen/Verweigern bleibt sonst unsichtbar "denied").
  const [notifStatus, setNotifStatus] = useState(() =>
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
  );

  useEffect(() => {
    if (!active) return undefined;
    function refreshNotifStatus() {
      setNotifStatus(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission);
    }
    refreshNotifStatus();
    document.addEventListener('visibilitychange', refreshNotifStatus);
    return () => document.removeEventListener('visibilitychange', refreshNotifStatus);
  }, [active]);

  // Notifications/1h-Reminder laufen in useSessionGateLifecycle (SessionEditor),
  // nicht hier — die Card existiert nur, solange das Sheet offen ist.
  const { elapsedLabel } = useGateElapsed(gate);
  return (
    <section
      className="rounded-2xl p-4 sm:p-6 relative"
      style={{ background: 'var(--card)', border: '1px solid var(--line)' }}
    >
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
        {gate.startedAt && <div className="shrink-0 tabular-nums text-2xl font-semibold" style={{ color: 'var(--ink)' }} aria-label="Workout-Dauer">{elapsedLabel}</div>}

        {/* Status + CTA */}
        <div className="flex-1 min-w-0 w-full">
          <h3 className="text-lg sm:text-xl font-bold mt-1.5" style={{ color: 'var(--ink)' }}>
            {active ? 'Workout läuft' : completed ? 'Workout beendet' : 'Training'}
          </h3>
          <GateIdleSuggestion sessionGate={gate} onStop={onStop} className="mt-3" />

          <div className="flex flex-wrap items-stretch gap-2.5 mt-4">
            {!active ? (
              <button
                onClick={() => onStart?.()}
                className="flex-1 sm:flex-none sm:min-w-[15rem] h-12 px-6 rounded-full flex items-center justify-center gap-2.5 text-sm font-bold transition-all hover:scale-[1.01] active:scale-95"
                style={{ background: 'var(--accent)', color: 'var(--accent-ink, #000)' }}
              >
                <Play size={16} strokeWidth={2.5} />
                Workout starten
              </button>
            ) : (
              <button
                onClick={() => onStop?.()}
                className="flex-1 sm:flex-none sm:min-w-[15rem] h-12 px-6 rounded-full flex items-center justify-center gap-2.5 text-sm font-bold transition-all hover:scale-[1.01] active:scale-95"
                style={GATE_STOP_STYLE}
              >
                <Square size={16} strokeWidth={2.5} />
                Workout beenden
              </button>
            )}

            {active && notifStatus !== 'granted' && (
              <p role="status" className="w-full text-xs" style={{ color: 'var(--dim)' }}>
                {notifStatus === 'denied'
                  ? 'Benachrichtigungen sind in den Browser-Einstellungen blockiert.'
                  : notifStatus === 'unsupported'
                    ? 'Dieser Browser unterstützt keine Benachrichtigungen.'
                    : 'Benachrichtigungen sind nicht erlaubt.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {onApplyRoutine && !completed && (
        <GateNextPlanCard
          className="relative mt-5"
          onApply={async (draft) => { await onApplyRoutine(draft); onLeave?.(); }}
          onManual={() => { onManualLog?.(); onLeave?.(); }}
        />
      )}

      {setSessionMode && (
        <div className="relative mt-5">
          <div className="text-[10px] font-bold tracking-[0.15em] mb-2 font-mono" style={{ color: 'var(--dim)', opacity: 0.5 }}>TRAINING</div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {[['strength', 'Kraft', Dumbbell, 'var(--accent)'], ['cardio', 'Ausdauer', Activity, 'var(--orange)']].map(([key, label, Icon, color]) => {
              const on = sessionMode === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSessionMode(key)}
                  className="h-10 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all active:scale-95"
                  style={{ background: on ? color : 'var(--bg2)', color: on ? '#000' : 'var(--dim)', border: `1px solid ${on ? color : 'transparent'}` }}
                >
                  <Icon size={14} /> {label}
                </button>
              );
            })}
          </div>
          {sessionMode === 'strength' && setBlock && <SplitPicker block={block} setBlock={setBlock} onLongPress={onSplitLongPress} />}
        </div>
      )}

      {(active || completed) && <TodayCounters exercises={exercises} />}

      {/* Mobil im Sheet-Modus ersetzt die Hub-Leiste (GateHubBar im Sheet) das Raster; im Hub-Modus und auf Desktop bleibt es. */}
      <div className={`relative mt-5 pt-4 ${hub ? '' : 'hidden lg:block'}`} style={{ borderTop: '1px dashed var(--line)' }}>
        <GatePortalGrid hub={hub} currentSubTab={currentSubTab} onSubNav={onSubNav} onLeave={onLeave} />
      </div>
    </section>
  );
}
