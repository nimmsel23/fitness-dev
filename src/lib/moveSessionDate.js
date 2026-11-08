/**
 * Kalendertag einer bestehenden Session korrigieren.
 *
 * Die Speicher-ID bleibt die Session-Kennung (`session_id` / Suffix). Nur der
 * eingebettete Tag im Dokumentnamen wechselt (`YYYY-MM-DD` bzw.
 * `YYYY-MM-DD__<id>`). Beginn/Ende behalten die lokale Uhrzeit; der
 * Kalendertag wandert um dieselbe Tagesdifferenz wie das Session-Datum.
 * `_origin` und `_runtime` sind Anzeige-Metadaten und werden nicht mitgeschrieben.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function assertIsoDate(value, code) {
  const iso = String(value || "");
  const match = ISO_DATE.exec(iso);
  const year = match ? Number(iso.slice(0, 4)) : NaN;
  const month = match ? Number(iso.slice(5, 7)) : NaN;
  const day = match ? Number(iso.slice(8, 10)) : NaN;
  const parsed = new Date(year, month - 1, day);
  const real = parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day;
  if (!match || !real) {
    const err = new Error(code);
    err.code = code;
    throw err;
  }
}

function atLocalNoon(iso) {
  return new Date(`${iso}T12:00:00`);
}

/** Differenz in Kalendertagen (Ziel minus Quelle). Sommerzeit ändert das nicht. */
export function calendarDayDelta(fromDate, toDate) {
  assertIsoDate(fromDate, "bad-date");
  assertIsoDate(toDate, "bad-date");
  const ms = atLocalNoon(toDate) - atLocalNoon(fromDate);
  return Math.round(ms / 86400000);
}

/** Lokale Uhrzeit beibehalten, Kalender um `dayDelta` Tage verschieben. */
export function shiftTimestampByCalendarDays(iso, dayDelta) {
  if (!iso || !dayDelta) return iso || null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  d.setDate(d.getDate() + dayDelta);
  return d.toISOString();
}

function shiftGate(gate, dayDelta) {
  if (!gate || typeof gate !== "object" || !dayDelta) return gate || null;
  const next = {
    ...gate,
    startedAt: shiftTimestampByCalendarDays(gate.startedAt, dayDelta),
    endedAt: shiftTimestampByCalendarDays(gate.endedAt, dayDelta),
  };
  if (gate.gps && typeof gate.gps === "object" && gate.gps.capturedAt) {
    next.gps = {
      ...gate.gps,
      capturedAt: shiftTimestampByCalendarDays(gate.gps.capturedAt, dayDelta),
    };
  }
  return next;
}

/**
 * Editor-Felder über den gespeicherten Datensatz legen.
 * `source` und andere nicht gelistete Felder bleiben am Speicherstand.
 * Eine leere Kraft-Session überschreibt keine vorhandene Activity mit dem
 * Formular-Default.
 */
export function overlayEditorFields(stored, editor = {}) {
  const next = { ...(stored || {}) };
  for (const key of ["block", "exercises", "effort", "location", "duration", "notes", "trainingsart", "sessionMode", "slots", "coachFeedback"]) {
    if (editor[key] !== undefined) next[key] = editor[key];
  }
  if (Array.isArray(editor.activityAddons)) next.activityAddons = editor.activityAddons;
  if (editor.sessionMode === "cardio" || editor.hasActivity) {
    if (editor.activity !== undefined) next.activity = editor.activity;
  }
  if (editor.sessionGate && (editor.sessionGate.startedAt || editor.sessionGate.endedAt)) {
    next.sessionGate = editor.sessionGate;
  }
  next.id = editor.id ?? stored?.id ?? stored?.session_id ?? null;
  next.date = stored?.date || editor.date || next.date;
  return next;
}

/** Schreibpayload. Wirft `bad-date`, bevor irgendetwas gespeichert wird. */
export function prepareMovedSession(session, newDate) {
  assertIsoDate(session?.date, "bad-date");
  assertIsoDate(newDate, "bad-date");
  const delta = calendarDayDelta(session.date, newDate);
  const id = session.id ?? session.session_id ?? null;
  const data = { ...session };
  delete data._origin;
  delete data._runtime;
  delete data.id;
  delete data.saved_at;
  data.date = newDate;
  data.session_id = id || null;
  if (data.sessionGate) data.sessionGate = shiftGate(data.sessionGate, delta);
  if (data.activity && typeof data.activity === "object" && data.activity.date) {
    data.activity = { ...data.activity, date: newDate };
  }
  return {
    id,
    fromDate: session.date,
    docFrom: id ? `${session.date}__${id}` : session.date,
    docTo: id ? `${newDate}__${id}` : newDate,
    data,
  };
}

function fail(code, extra) {
  const err = new Error(code);
  err.code = code;
  if (extra) Object.assign(err, extra);
  return err;
}

/**
 * Erst schreiben, dann löschen. Schlägt das Schreiben fehl, bleibt die Quelle
 * unangetastet. Schlägt nur das Löschen fehl, existieren beide Fassungen
 * (`copied-not-deleted`) — kein Datenverlust. Dieselbe Kennung am Zieltag
 * blockiert den Schreibvorgang (`target-occupied`).
 */
export async function commitSessionMove({ session, newDate, readTarget, writeSession, deleteSession }) {
  const prepared = prepareMovedSession(session, newDate);
  if (prepared.docFrom === prepared.docTo) {
    return { ok: true, moved: false, id: prepared.id, session: prepared.data };
  }
  const occupied = await readTarget(newDate, prepared.id);
  if (occupied) throw fail("target-occupied");
  await writeSession(newDate, prepared.data, prepared.id);
  try {
    await deleteSession(prepared.fromDate, prepared.id);
  } catch (cause) {
    throw fail("copied-not-deleted", { cause, copied: prepared.data, id: prepared.id });
  }
  return { ok: true, moved: true, id: prepared.id, session: prepared.data };
}
