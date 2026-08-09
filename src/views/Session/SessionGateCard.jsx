import { useEffect, useMemo, useState } from 'react';
import { Play, Square, Clock3, CheckCircle2, PencilLine, CalendarDays, ClipboardList, History, TimerReset } from 'lucide-react';
import {
  normalizeSessionGate,
  isSessionGateActive,
  isSessionGateCompleted,
  getSessionGateElapsedMs,
  formatSessionGateElapsed,
} from '../../lib/sessionGate.js';

const NOTIFICATION_TAG = 'fitness-workout-session';

async function sendSessionGateNotification(sessionGate, date) {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
  if (!('serviceWorker' in navigator) || typeof Notification === 'undefined') return;

  const gate = normalizeSessionGate(sessionGate);
  const registration = window.__swRegistration || await navigator.serviceWorker.getRegistration();
  if (!registration?.active) return;

  if (Notification.permission !== 'granted') {
    if (!gate.startedAt) {
      registration.active.postMessage({ type: 'CLEAR_WORKOUT_TIMER_NOTIFICATION', tag: NOTIFICATION_TAG });
    }
    return;
  }

  if (!gate.startedAt) {
    registration.active.postMessage({ type: 'CLEAR_WORKOUT_TIMER_NOTIFICATION', tag: NOTIFICATION_TAG });
    return;
  }

  const elapsedLabel = formatSessionGateElapsed(getSessionGateElapsedMs(gate));
  registration.active.postMessage({
    type: 'SHOW_WORKOUT_TIMER_NOTIFICATION',
    tag: NOTIFICATION_TAG,
    title: isSessionGateActive(gate) ? 'Workout läuft' : 'Workout geloggt',
    body: isSessionGateActive(gate)
      ? `Stoppuhr: ${elapsedLabel} · Tippen zum Zurückkehren`
      : `Zeit: ${elapsedLabel} · Details können später nachgetragen werden`,
    date,
    active: isSessionGateActive(gate),
  });
}

const SESSION_NAV_ITEMS = [
  { id: 'today', label: 'Session', Icon: CalendarDays },
  { id: 'plan', label: 'Plan', Icon: ClipboardList },
  { id: 'history', label: 'Verlauf', Icon: History },
  { id: 'timer', label: 'Timer/Stoppuhr', Icon: TimerReset },
];

export default function SessionGateCard({ date, sessionGate, currentSubTab = null, onSubNav, onStart, onStop }) {
  const gate = normalizeSessionGate(sessionGate);
  const active = isSessionGateActive(gate);
  const completed = isSessionGateCompleted(gate);
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    if (!active) return undefined;
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [active]);

  useEffect(() => {
    setNowMs(Date.now());
  }, [gate.startedAt, gate.endedAt, gate.status]);

  useEffect(() => {
    sendSessionGateNotification(gate, date).catch(() => {});
    if (!active) return undefined;
    const notificationTimer = window.setInterval(() => {
      sendSessionGateNotification(gate, date).catch(() => {});
    }, 30000);
    return () => window.clearInterval(notificationTimer);
  }, [active, completed, gate, date]);

  const elapsedLabel = useMemo(
    () => formatSessionGateElapsed(getSessionGateElapsedMs(gate, nowMs)),
    [gate, nowMs],
  );

  async function handleStart() {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      try { await Notification.requestPermission(); } catch {}
    }
    await onStart?.();
  }

  return (
    <section
      className="rounded-[2rem] p-5 sm:p-6 overflow-hidden relative"
      style={{
        background: active
          ? 'linear-gradient(135deg, rgba(200,255,0,0.16), rgba(200,255,0,0.05))'
          : completed
            ? 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(52,211,153,0.05))'
            : 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
        border: active
          ? '1px solid rgba(200,255,0,0.35)'
          : completed
            ? '1px solid rgba(52,211,153,0.28)'
            : '1px solid var(--line)',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div
            className="text-[10px] font-black uppercase tracking-[0.22em] mb-2"
            style={{ color: active ? 'var(--accent)' : completed ? '#34d399' : 'var(--dim)' }}
          >
            Gym Session Gate
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-fit-ink">
            {active ? 'Im Gym. Handy weg.' : completed ? 'Workout ist geloggt.' : 'Workout schnell starten.'}
          </h3>
          <p className="text-sm mt-2 max-w-xl" style={{ color: 'var(--dim)', opacity: 0.8 }}>
            {active
              ? 'Die Zeit läuft bereits. Das eigentliche Tracking kann komplett später passieren.'
              : completed
                ? 'Der Trainingstag steht. Unten kannst du Übungen und Details in Ruhe nachtragen.'
                : 'Start heißt nur: Session läuft. Erst beim Beenden gilt das Workout als wirklich done und geloggt.'}
          </p>
        </div>
        <div
          className="shrink-0 rounded-2xl px-3 py-2 text-right"
          style={{ background: 'rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: 'var(--dim)' }}>
            Stoppuhr
          </div>
          <div className="text-2xl sm:text-3xl font-black tabular-nums text-fit-ink mt-1">
            {gate.startedAt ? elapsedLabel : '00:00'}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-6">
        {!active ? (
          <button
            onClick={handleStart}
            className="w-full sm:w-auto sm:min-w-[24rem] min-h-[5.5rem] px-8 rounded-[1.75rem] flex items-center justify-center gap-4 text-base sm:text-lg font-black uppercase tracking-[0.16em] transition-all hover:scale-[1.01] active:scale-[0.98]"
            style={{
              background: 'var(--accent)',
              color: '#000',
              boxShadow: '0 24px 60px -20px rgba(200,255,0,0.75)',
            }}
          >
            <Play size={24} strokeWidth={3.3} />
            Workout starten
          </button>
        ) : (
          <button
            onClick={onStop}
            className="w-full sm:w-auto sm:min-w-[24rem] min-h-[5.5rem] px-8 rounded-[1.75rem] flex items-center justify-center gap-4 text-base sm:text-lg font-black uppercase tracking-[0.16em] transition-all hover:scale-[1.01] active:scale-[0.98]"
            style={{
              background: '#fb923c',
              color: '#120c00',
              boxShadow: '0 24px 60px -20px rgba(251,146,60,0.65)',
            }}
          >
            <Square size={24} strokeWidth={3.3} />
            Workout beenden
          </button>
        )}

        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold"
          style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--dim)' }}
        >
          {active ? <Clock3 size={14} /> : completed ? <CheckCircle2 size={14} /> : <PencilLine size={14} />}
          <span>
            {active
              ? 'Live-Status läuft als App-Benachrichtigung weiter, solange der Browser das zulässt.'
              : completed
                ? 'Manuelles Nachtragen bleibt offen.'
                : 'Kein Plan-Zwang. Erst aktive Session, geloggt erst bei done.'}
          </span>
        </div>
      </div>

      <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--dim)', opacity: 0.65 }}>
          Bereiche
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {SESSION_NAV_ITEMS.map(({ id, label, Icon }) => {
            const selected = (currentSubTab || 'today') === id;
            return (
              <button
                key={id}
                onClick={() => onSubNav?.(id)}
                className="rounded-2xl px-4 py-3 text-left transition-all active:scale-[0.98]"
                style={{
                  background: selected ? 'rgba(200,255,0,0.12)' : 'var(--bg2)',
                  border: selected ? '1px solid rgba(200,255,0,0.35)' : '1px solid var(--line)',
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: selected ? 'var(--accent)' : 'rgba(255,255,255,0.05)', color: selected ? '#000' : 'var(--dim)' }}
                  >
                    <Icon size={14} />
                  </div>
                  <span
                    className="text-[11px] font-black uppercase tracking-[0.14em]"
                    style={{ color: selected ? 'var(--accent)' : 'var(--ink)' }}
                  >
                    {label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
