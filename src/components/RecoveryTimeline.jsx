/**
 * RecoveryTimeline — visualisiert das Superkompensations-Fenster einer
 * Muskelgruppe als Phasen-Balken mit "du bist hier"-Marker und der
 * konkreten Empfehlung (Datum/Uhrzeit), statt nur einem abstrakten %.
 *
 * Die Balkenbreite der Phasen ist proportional zur tatsächlichen Zeit
 * (Kraft: 72h belastet / 96h Erholung / 168h Superkompensation), der
 * Marker steht exakt auf der verstrichenen Zeit seit letzter Belastung.
 */
import { recoveryWindow } from '../lib/recoveryWindows.js';

const PHASE_COLORS = {
  heavy: 'bg-[#ef4444]',
  recovering: 'bg-[#f59e0b]',
  super: 'bg-[#22c55e]',
  ready: 'bg-[#3b82f6]',
};

const PHASE_LABELS = {
  de: { heavy: 'Belastet', recovering: 'Erholung', super: 'Superkompensation', ready: 'Bereit' },
};

export default function RecoveryTimeline({ hours, type = 'strength', now = null, compact = false }) {
  const w = recoveryWindow(hours, type, now || new Date());
  const total = w.phase === 'heavy' || w.phase === 'recovering' || w.phase === 'super'
    ? Math.max(...phaseBounds(type))
    : Math.max(...phaseBounds(type));
  const bounds = phaseBounds(type);
  const pos = Math.min(100, Math.max(0, (Number.isFinite(hours) ? hours / total : 1) * 100));
  const seg = (from, to, phase) => ({
    phase,
    width: ((to - from) / total) * 100,
  });
  const segments = [
    seg(0, bounds[0], 'heavy'),
    seg(bounds[0], bounds[1], 'recovering'),
    seg(bounds[1], bounds[2], 'super'),
  ];

  return (
    <div className="w-full select-none">
      <div className="relative h-2.5 rounded-full overflow-hidden bg-fit-bg flex">
        {segments.map((s, i) => (
          <div key={i} className={PHASE_COLORS[s.phase]} style={{ width: `${s.width}%` }} />
        ))}
        {/* Ready-Anteil: Balken läuft nach dem Super-Fenster in Blau weiter */}
        <div className={PHASE_COLORS.ready} style={{ width: `${Math.max(0, 100 - segments.reduce((a, s) => a + s.width, 0))}%` }} />
      </div>

      {/* "du bist hier"-Marker — h-4 statt h-0, damit das "du"-Label die
          Phasen-Labels-Zeile darunter nicht überlappt */}
      <div className="relative h-4">
        <div
          className="absolute -translate-x-1/2 flex flex-col items-center"
          style={{ left: `${pos}%` }}
        >
          <div className="w-0.5 h-3 bg-fit-ink -mt-0.5 rounded-full" />
          <span className="text-[8px] font-black uppercase tracking-widest text-fit-ink/70 mt-0.5 whitespace-nowrap">
            du
          </span>
        </div>
      </div>

      <div className="flex justify-between text-[8px] font-bold text-fit-dim/70 mt-1">
        <span>{PHASE_LABELS.de.heavy}</span>
        <span>{PHASE_LABELS.de.recovering}</span>
        <span>{PHASE_LABELS.de.super}</span>
        <span>{PHASE_LABELS.de.ready}</span>
      </div>

      {!compact && (
        <p className="text-[10px] font-medium text-fit-dim leading-snug mt-1.5">{w.advice}</p>
      )}
    </div>
  );
}

/** Phasengrenzen je Typ — identisch zu recoveryThresholds.js. */
function phaseBounds(type) {
  if (type === 'hiit') return [4, 24, 72];
  if (type === 'cardio') return [24, 96, 240];
  return [72, 168, 336];
}
