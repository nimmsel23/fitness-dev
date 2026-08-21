// Persistenter Cache für den 28-Tage-Monatsreport (WeeklyReview). Vorher nur
// ein In-Memory-Modul-Var in WeeklyReview/index.jsx — überlebte Tab-Wechsel,
// aber jeder Reload/Neustart der App verlor ihn, und computeReport() läuft
// pro Ladevorgang 5x (Gesamt + 4 Wochen-Chunks) über die ganze Historie, was
// beim Firestore-Build zusätzlich 28 Einzel-Queries kostet — spürbar langsam
// bei jedem Neuladen. localStorage übersteht Reloads; Invalidierung passiert
// gezielt bei saveSession/deleteSession (lokal + Firestore), nicht per TTL.
const KEY = "fitness.monthlyReport.v1";

export function readMonthlyReportCache() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.data ?? null;
  } catch {
    return null;
  }
}

export function writeMonthlyReportCache(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ data, savedAt: Date.now() }));
  } catch {
    // localStorage voll/deaktiviert — Cache bleibt einfach leer, kein Fehlerfall
  }
}

export function clearMonthlyReportCache() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // no-op
  }
}
