import { useEffect, useMemo, useState } from 'react';
import { Play, Square, Clock3, CheckCircle2, PencilLine, CalendarDays, ClipboardList, History, TimerReset, Sparkles } from 'lucide-react';
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
  { id: 'plan', label: 'Plan', Icon: ClipboardList, comingSoon: true },
  { id: 'history', label: 'Verlauf', Icon: History },
  { id: 'timer', label: '6 Pack', Icon: TimerReset, comingSoon: true },
  { id: 'skills', label: 'Skills', Icon: Sparkles, comingSoon: true },
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
      className="rounded-2xl p-4 sm:p-5 overflow-hidden relative"
      style={{
        background: active
          ? 'rgba(200,255,0,0.06)'
          : completed
            ? 'rgba(52,211,153,0.06)'
            : 'var(--card)',
        border: active
          ? '1px solid rgba(200,255,0,0.25)'
          : completed
            ? '1px solid rgba(52,211,153,0.2)'
            : '1px solid var(--line)',
      }}
    >
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <div
            className="text-[10px] font-semibold tracking-wide mb-1"
            style={{ color: active ? 'var(--accent)' : completed ? '#34d399' : 'var(--dim)', opacity: 0.7 }}
          >
            Session Gate
          </div>
          <h3 className="text-base sm:text-lg font-bold" style={{ color: 'var(--ink)' }}>
            {active ? 'Im Gym. Handy weg.' : completed ? 'Workout ist geloggt.' : 'Workout schnell starten.'}
          </h3>
          <p className="text-[13px] mt-1 max-w-xl" style={{ color: 'var(--dim)', opacity: 0.75 }}>
            {active
              ? 'Die Zeit läuft bereits. Das eigentliche Tracking kann komplett später passieren.'
              : completed
                ? 'Der Trainingstag steht. Unten kannst du Übungen und Details in Ruhe nachtragen.'
                : 'Start heißt nur: Session läuft. Erst beim Beenden gilt das Workout als wirklich done und geloggt.'}
          </p>
        </div>
        <div className="w-full sm:w-auto shrink-0 text-left sm:text-right">
          <div className="text-[10px] font-semibold tracking-wide" style={{ color: 'var(--dim)', opacity: 0.55 }}>
            Stoppuhr
          </div>
          <div className="text-xl sm:text-2xl font-bold tabular-nums mt-0.5" style={{ color: 'var(--ink)' }}>
            {gate.startedAt ? elapsedLabel : '00:00'}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-stretch gap-2.5 mt-4">
        {!active ? (
          <button
            onClick={handleStart}
            className="w-full sm:w-auto sm:min-w-[16rem] h-12 px-6 rounded-full flex items-center justify-center gap-2.5 text-sm font-bold transition-all hover:scale-[1.01] active:scale-95"
            style={{ background: 'var(--accent)', color: '#000' }}
          >
            <Play size={16} strokeWidth={2.5} />
            Workout starten
          </button>
        ) : (
          <button
            onClick={onStop}
            className="w-full sm:w-auto sm:min-w-[16rem] h-12 px-6 rounded-full flex items-center justify-center gap-2.5 text-sm font-bold transition-all hover:scale-[1.01] active:scale-95"
            style={{ background: '#fb923c', color: '#120c00' }}
          >
            <Square size={16} strokeWidth={2.5} />
            Workout beenden
          </button>
        )}

        <div
          className="w-full sm:flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-medium"
          style={{ background: 'var(--bg2)', color: 'var(--dim)' }}
        >
          {active ? <Clock3 size={13} /> : completed ? <CheckCircle2 size={13} /> : <PencilLine size={13} />}
          <span>
            {active
              ? 'Live-Status läuft als App-Benachrichtigung weiter, solange der Browser das zulässt.'
              : completed
                ? 'Manuelles Nachtragen bleibt offen.'
                : 'Kein Plan-Zwang. Erst aktive Session, geloggt erst bei done.'}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--line)' }}>
        <div className="text-[10px] font-semibold tracking-wide mb-2.5" style={{ color: 'var(--dim)', opacity: 0.55 }}>
          Bereiche
        </div>
        <div className="grid grid-cols-2 gap-2">
          {SESSION_NAV_ITEMS.map(({ id, label, Icon, comingSoon }) => {
            const selected = (currentSubTab || 'today') === id;
            return (
              <button
                key={id}
                onClick={() => onSubNav?.(id)}
                className="rounded-xl px-3.5 py-2.5 text-left transition-all active:scale-[0.98]"
                style={{
                  background: selected ? 'rgba(200,255,0,0.08)' : 'var(--bg2)',
                  border: selected ? '1px solid rgba(200,255,0,0.3)' : '1px solid transparent',
                }}
              >
                <div className="flex items-center gap-2">
                  <Icon size={13} style={{ color: selected ? 'var(--accent)' : 'var(--dim)' }} />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: selected ? 'var(--accent)' : 'var(--ink)' }}
                  >
                    {label}
                  </span>
                  {comingSoon && (
                    <span
                      className="ml-auto text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                      style={{ background: 'var(--bg)', color: 'var(--dim)', opacity: 0.7 }}
                    >
                      Bald
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
