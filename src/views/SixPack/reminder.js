// Tägliche Trainings-Erinnerung (Settings). Einstellungen liegen im Programm-Dokument
// (`program.settings.reminder`), werden also mit users/{uid}/meta/sixpack synchronisiert.
// Auslieferung: lokal, solange App/Service Worker lebt (Zeitpunkt erreicht → Benachrichtigung).
// Zuverlässige Hintergrund-Zustellung bräuchte einen Server-Scheduler (nicht Teil davon).

export const DEFAULT_REMINDER = { enabled: false, time: '18:00' };
const LAST_KEY = 'fitness-sixpack-reminder-last-v1';

export function getReminder(program) {
  const r = program?.settings?.reminder || {};
  return { enabled: !!r.enabled, time: /^\d{2}:\d{2}$/.test(r.time) ? r.time : DEFAULT_REMINDER.time };
}

// Fällig: aktiviert, Uhrzeit erreicht, heute noch nicht trainiert/erinnert, kein Ruhetag.
export function reminderDue({ reminder, now, today, trainedToday, restToday, lastSent }) {
  if (!reminder.enabled || trainedToday || restToday || lastSent === today) return false;
  const [h, m] = reminder.time.split(':').map(Number);
  return now.getHours() * 60 + now.getMinutes() >= h * 60 + m;
}

export function reminderSupported() {
  return typeof Notification !== 'undefined';
}

export async function requestReminderPermission() {
  if (!reminderSupported()) return 'unsupported';
  if (Notification.permission !== 'default') return Notification.permission;
  try { return await Notification.requestPermission(); } catch { return 'denied'; }
}

export function readLastSent() {
  try { return window.localStorage.getItem(LAST_KEY); } catch { return null; }
}
export function writeLastSent(day) {
  try { window.localStorage.setItem(LAST_KEY, day); } catch { /* privat/voll */ }
}

export async function showReminder(title, body) {
  const options = { body, icon: '/icon-192.png', tag: 'sixpack-reminder' };
  try {
    const reg = await navigator.serviceWorker?.ready;
    if (reg?.showNotification) return reg.showNotification(title, options);
  } catch { /* Fallback unten */ }
  new Notification(title, options);
}
