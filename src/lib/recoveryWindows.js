/**
 * recoveryWindows.js — konkrete Superkompensations-Fenster pro Muskelgruppe.
 *
 * superkompensation.js liefert die Phase (heavy/recovering/super/ready),
 * aber die Kern-Frage der App-Vision bleibt dort abstrakt: WANN ist genug
 * Zeit vergangen? Dieses Modul übersetzt die lastSeen-Daten (Stunden seit
 * letzter Belastung, Typ) in konkrete, datierte Aussagen:
 *
 *   "Beine — Fenster öffnet sich Mi ~18:00 (noch ~14 Std)"
 *   "Brust — jetzt optimal trainierbar (Fenster bis Sa ~15:00)"
 *   "Rücken — Fenster überschritten, wieder bereit"
 *
 * Die Stunden-Werte sind bereits effort-adjustiert (RPE-skaliert), d.h. eine
 * leichte Session "verjüngt" schneller — das Fenstermodell arbeitet auf
 * denselben Zahlen wie die Phasen-Berechnung, keine zweite Wahrheit.
 */
import { CAT_HEAVY, CAT_RECOVERING, CAT_SUPER, CARDIO_HEAVY, CARDIO_RECOVERING, CARDIO_SUPER, HIIT_HEAVY, HIIT_RECOVERING, HIIT_SUPER } from './recoveryThresholds.js';

const HOUR = 3600 * 1000;

/** Fenster-Grenzen [schwer, erholend, super] je Belastungstyp (Stunden). */
function windowsFor(type) {
  if (type === 'hiit') return { heavy: HIIT_HEAVY, recovering: HIIT_RECOVERING, super: HIIT_SUPER };
  if (type === 'cardio') return { heavy: CARDIO_HEAVY, recovering: CARDIO_RECOVERING, super: CARDIO_SUPER };
  return { heavy: CAT_HEAVY, recovering: CAT_RECOVERING, super: CAT_SUPER };
}

/**
 * @param {number} hours — Stunden seit letzter (effort-adjustierter) Belastung
 * @param {string} type — 'strength' | 'cardio' | 'hiit'
 * @param {Date} [now] — Referenzzeit (Tests)
 * @returns {{ phase: 'heavy'|'recovering'|'super'|'ready',
 *             windowFrom: Date, windowTo: Date,
 *             opensInHours: number|null, closesInHours: number|null,
 *             advice: string }}
 */
export function recoveryWindow(hours, type = 'strength', now = new Date()) {
  const w = windowsFor(type);
  const h = Number.isFinite(hours) ? hours : Infinity;

  // Phase 1: noch stark belastet — Fenster öffnet sich erst
  if (h <= w.heavy) {
    const opensIn = w.heavy - h;
    const from = new Date(now.getTime() + opensIn * HOUR);
    return {
      phase: 'heavy',
      windowFrom: from,
      windowTo: new Date(now.getTime() + (w.super - h) * HOUR),
      opensInHours: round1(opensIn),
      closesInHours: null,
      advice: `Noch ${fmtHours(opensIn)} im Erholungs-Defizit — Fenster öffnet sich ${fmtWhen(from, now)}.`,
    };
  }

  // Phase 2: Erholung läuft — Fenster öffnet sich in absehbarer Zeit
  if (h <= w.recovering) {
    const opensIn = w.recovering - h;
    const from = new Date(now.getTime() + opensIn * HOUR);
    return {
      phase: 'recovering',
      windowFrom: from,
      windowTo: new Date(now.getTime() + (w.super - h) * HOUR),
      opensInHours: round1(opensIn),
      closesInHours: round1(w.super - h),
      advice: `Erholung bei ~${Math.round(((h - w.heavy) / (w.recovering - w.heavy)) * 100)}% — optimal trainierbar ab ${fmtWhen(from, now)}.`,
    };
  }

  // Phase 3: Superkompensations-Fenster offen
  if (h <= w.super) {
    const closesIn = w.super - h;
    const to = new Date(now.getTime() + closesIn * HOUR);
    return {
      phase: 'super',
      windowFrom: new Date(now.getTime() - (h - w.recovering) * HOUR),
      windowTo: to,
      opensInHours: 0,
      closesInHours: round1(closesIn),
      advice: `Jetzt im Superkompensations-Fenster — optimal trainierbar noch ${fmtHours(closesIn)} (bis ${fmtWhen(to, now)}).`,
    };
  }

  // Phase 4: Fenster überschritten — Muskel "verliert" den Reiz nicht, aber der Superkomp-Effekt klingt ab
  return {
    phase: 'ready',
    windowFrom: new Date(now.getTime() - (h - w.super) * HOUR),
    windowTo: new Date(now.getTime() - (h - w.super) * HOUR),
    opensInHours: null,
    closesInHours: null,
    advice: 'Voll erholt — jederzeit trainierbar, Superkompensation hat sich abgebaut (Progression wieder von unten aufbauen).',
  };
}

/**
 * Bündelt die 16 feinen Gruppen in die 5 UI-Hauptgruppen und berechnet
 * deren Fenster. "Beste Gruppe" = die mit dem am weitesten geöffneten
 * Super-Fenster (Priorität: super > recovering-nah > ready > heavy).
 *
 * @param {Record<string, {hours:number,type:string}>} lastSeen — aus computeMuscleScores()
 * @param {Record<string, {members:string[]}>} broadGroups — z.B. BROAD_GROUPS aus ReviewReadiness
 * @param {Date} [now]
 */
export function broadGroupWindows(lastSeen, broadGroups, now = new Date()) {
  const result = [];
  for (const [id, g] of Object.entries(broadGroups)) {
    const seen = g.members
      .map((m) => lastSeen?.[m])
      .filter(Boolean)
      .sort((a, b) => a.hours - b.hours); // frischeste Belastung zuerst
    if (!seen.length) {
      result.push({ id, label: g.name, window: recoveryWindow(Infinity, 'strength', now), hasData: false, freshest: null });
      continue;
    }
    // Eine Gruppe ist so frisch wie ihre am frischesten belastete Region
    // (wer Beine trainiert hat, hat Quadrizeps UND Hamstrings gereizt).
    const freshest = seen[0];
    const mixed = seen.length > 1 && seen.some((s) => s.type !== freshest.type);
    const window = recoveryWindow(freshest.hours, freshest.type, now);
    result.push({ id, label: g.name, window, hasData: true, mixed, seenCount: seen.length, freshest });
  }
  return result.sort(byTrainability);
}

const PHASE_RANK = { super: 0, recovering: 1, ready: 2, heavy: 3 };
function byTrainability(a, b) {
  const rank = PHASE_RANK[a.window.phase] - PHASE_RANK[b.window.phase];
  if (rank !== 0) return rank;
  // innerhalb der Phase: das am längsten offene Super-Fenster zuerst
  return (b.window.closesInHours ?? -1) - (a.window.closesInHours ?? -1);
}

/** "heute 18:00" / "morgen 14:00" / "Mi 15:00" */
function fmtWhen(date, now) {
  const d = new Date(date);
  const sameDay = new Date(now).toDateString() === d.toDateString();
  const tomorrow = new Date(now.getTime() + 24 * HOUR).toDateString() === d.toDateString();
  const time = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  if (sameDay) return `heute ${time}`;
  if (tomorrow) return `morgen ${time}`;
  return `${d.toLocaleDateString('de-DE', { weekday: 'short' })} ${time}`;
}

/** 90 → "1,5 Tage", 14 → "14 Std", 3 → "3 Std" */
function fmtHours(h) {
  if (h >= 48) return `${round1(h / 24).toLocaleString('de-DE')} Tage`;
  if (h >= 1) return `${round1(h).toLocaleString('de-DE')} Std`;
  return `${Math.round(h * 60)} min`;
}

function round1(n) { return Math.round(n * 10) / 10; }
