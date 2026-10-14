// Rest-Timer-Persistenz (localStorage) + Service-Worker-Notification für
// WorkoutSession.jsx — überlebt Tab-Wechsel/Reload, solange der Browser
// offen bleibt (kein Server-Zustand nötig für sowas Kurzlebiges).
export const REST_TIMER_TAG = "fitness-plan-rest-timer";

function restTimerStorageKey(workoutId) {
  return `fitness-plan-rest-timer:${workoutId}`;
}

export function readStoredRestTimer(workoutId) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(restTimerStorageKey(workoutId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeStoredRestTimer(workoutId, timer) {
  if (typeof window === "undefined") return;
  try {
    if (!timer) window.localStorage.removeItem(restTimerStorageKey(workoutId));
    else window.localStorage.setItem(restTimerStorageKey(workoutId), JSON.stringify(timer));
  } catch {}
}

export async function sendRestTimerNotification(timer) {
  if (typeof window === "undefined" || typeof navigator === "undefined") return;
  if (!("serviceWorker" in navigator) || typeof Notification === "undefined") return;

  const registration = window.__swRegistration || await navigator.serviceWorker.getRegistration();
  if (!registration?.active) return;

  if (!timer) {
    registration.active.postMessage({ type: "CLEAR_WORKOUT_TIMER_NOTIFICATION", tag: REST_TIMER_TAG });
    return;
  }

  if (Notification.permission !== "granted") return;

  const remainingSeconds = Math.max(0, Math.ceil((timer.targetTime - Date.now()) / 1000));
  registration.active.postMessage({
    type: "SHOW_WORKOUT_TIMER_NOTIFICATION",
    tag: REST_TIMER_TAG,
    title: "Satzpause läuft",
    body: `${timer.exerciseName || "Übung"} · noch ${remainingSeconds}s`,
    active: true,
  });
}
