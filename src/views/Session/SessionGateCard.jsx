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
  { id: 'today', label: 'Session', code: '01', Icon: CalendarDays },
  { id: 'plan', label: 'Plan', code: '02', Icon: ClipboardList, comingSoon: true },
  { id: 'history', label: 'Verlauf', code: '03', Icon: History },
  { id: 'timer', label: '6 Pack', code: '04', Icon: TimerReset, comingSoon: true },
  { id: 'skills', label: 'Skills', code: '05', Icon: Sparkles, comingSoon: true },
];

// Ring füllt sich sichtbar über eine 90-Minuten-Referenzsession, läuft danach
// einfach weiter am Anschlag (kein harter Cutoff, nur ein Referenzrahmen für
// den optischen Fortschritt — reine Deko, keine Funktionsgrenze).
const RING_REFERENCE_MS = 90 * 60 * 1000;
const RING_R = 42;
const RING_C = 2 * Math.PI * RING_R;

function StatusEyebrow({ active, completed }) {
  const label = active ? 'LIVE · TRACKING' : completed ? 'GATE GESCHLOSSEN' : 'GATE BEREIT';
  const color = active ? 'var(--accent)' : completed ? '#34d399' : 'var(--dim)';
  return (
    <div className="flex items-center gap-2">
      <span
        className={active ? 'session-gate-dot' : ''}
        style={{
          width: 6, height: 6, borderRadius: 9999,
          background: color,
          boxShadow: active ? `0 0 0 3px color-mix(in srgb, ${color} 20%, transparent)` : 'none',
          flexShrink: 0,
        }}
      />
      <span
        className="text-[10px] font-bold tracking-[0.2em] font-mono"
        style={{ color, opacity: active ? 1 : 0.6 }}
      >
        {label}
      </span>
    </div>
  );
}

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

  const elapsedMs = getSessionGateElapsedMs(gate, nowMs);
  const elapsedLabel = useMemo(() => formatSessionGateElapsed(elapsedMs), [elapsedMs]);
  const ringProgress = gate.startedAt ? Math.min(1, elapsedMs / RING_REFERENCE_MS) : 0;
  const ringOffset = RING_C * (1 - ringProgress);
  const ringColor = active ? 'var(--accent)' : completed ? '#34d399' : 'var(--line)';

  async function handleStart() {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      try { await Notification.requestPermission(); } catch {}
    }
    await onStart?.();
  }

  return (
    <section
      className={`rounded-3xl p-4 sm:p-6 overflow-hidden relative ${active ? 'session-gate-stripes' : ''}`}
      style={{
        background: active
          ? 'rgba(200,255,0,0.05)'
          : completed
            ? 'rgba(52,211,153,0.05)'
            : 'var(--card)',
        border: active
          ? '1px solid rgba(200,255,0,0.3)'
          : completed
            ? '1px solid rgba(52,211,153,0.25)'
            : '1px solid var(--line)',
      }}
    >
      {!active && !completed && (
        <div
          className="session-gate-blueprint absolute inset-0 pointer-events-none opacity-[0.35]"
          style={{ maskImage: 'linear-gradient(to bottom, black, transparent 75%)' }}
        />
      )}

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
        {/* Ring-Stoppuhr */}
        <div className="relative shrink-0 mx-auto sm:mx-0" style={{ width: 108, height: 108 }}>
          <svg width={108} height={108} viewBox="0 0 100 100" className={active ? 'session-gate-ring-spin' : ''} style={{ animationDuration: '14s' }}>
            <circle cx="50" cy="50" r={RING_R} fill="none" stroke="var(--bg2)" strokeWidth="5" />
            <circle
              cx="50" cy="50" r={RING_R} fill="none"
              stroke={ringColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={RING_C}
              strokeDashoffset={active ? ringOffset : completed ? 0 : RING_C}
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-mono font-bold tabular-nums leading-none"
              style={{ fontSize: gate.startedAt ? '1.15rem' : '1.4rem', color: 'var(--ink)' }}
            >
              {gate.startedAt ? elapsedLabel : '—:—'}
            </span>
            <span className="text-[8px] font-bold tracking-[0.15em] mt-1" style={{ color: 'var(--dim)', opacity: 0.6 }}>
              {gate.startedAt ? 'MIN : SEC' : 'STANDBY'}
            </span>
          </div>
        </div>

        {/* Status + CTA */}
        <div className="flex-1 min-w-0 w-full">
          <StatusEyebrow active={active} completed={completed} />
          <h3 className="text-lg sm:text-xl font-bold mt-1.5" style={{ color: 'var(--ink)' }}>
            {active ? 'Im Gym. Handy weg.' : completed ? 'Workout ist geloggt.' : 'Workout schnell starten.'}
          </h3>
          <p className="text-[13px] mt-1 max-w-xl" style={{ color: 'var(--dim)', opacity: 0.75 }}>
            {active
              ? 'Die Zeit läuft bereits. Das eigentliche Tracking kann komplett später passieren.'
              : completed
                ? 'Der Trainingstag steht. Unten kannst du Übungen und Details in Ruhe nachtragen.'
                : 'Start heißt nur: Session läuft. Erst beim Beenden gilt das Workout als wirklich done und geloggt.'}
          </p>

          <div className="flex flex-wrap items-stretch gap-2.5 mt-4">
            {!active ? (
              <button
                onClick={handleStart}
                className="flex-1 sm:flex-none sm:min-w-[15rem] h-12 px-6 rounded-full flex items-center justify-center gap-2.5 text-sm font-bold transition-all hover:scale-[1.01] active:scale-95"
                style={{ background: 'var(--accent)', color: '#000' }}
              >
                <Play size={16} strokeWidth={2.5} />
                Workout starten
              </button>
            ) : (
              <button
                onClick={onStop}
                className="flex-1 sm:flex-none sm:min-w-[15rem] h-12 px-6 rounded-full flex items-center justify-center gap-2.5 text-sm font-bold transition-all hover:scale-[1.01] active:scale-95"
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
        </div>
      </div>

      <div className="relative mt-5 pt-4" style={{ borderTop: '1px dashed var(--line)' }}>
        <div className="text-[10px] font-bold tracking-[0.15em] mb-2.5 font-mono" style={{ color: 'var(--dim)', opacity: 0.5 }}>
          BEREICHE
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {SESSION_NAV_ITEMS.map(({ id, label, code, Icon, comingSoon }) => {
            const selected = (currentSubTab || 'today') === id;
            return (
              <button
                key={id}
                onClick={() => onSubNav?.(id)}
                className="relative rounded-xl px-3 py-2.5 text-left transition-all active:scale-[0.98]"
                style={{
                  background: selected ? 'rgba(200,255,0,0.08)' : 'var(--bg2)',
                  border: selected ? '1px solid rgba(200,255,0,0.3)' : '1px solid transparent',
                }}
              >
                <span
                  className="absolute top-1.5 right-2 text-[8px] font-mono font-bold"
                  style={{ color: selected ? 'var(--accent)' : 'var(--dim)', opacity: 0.4 }}
                >
                  {code}
                </span>
                <div className="flex items-center gap-2">
                  <Icon size={13} style={{ color: selected ? 'var(--accent)' : 'var(--dim)' }} />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: selected ? 'var(--accent)' : 'var(--ink)' }}
                  >
                    {label}
                  </span>
                </div>
                {comingSoon && (
                  <span
                    className="mt-1 inline-block text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                    style={{ background: 'var(--bg)', color: 'var(--dim)', opacity: 0.7 }}
                  >
                    Bald
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
