import process from "node:process";

process.env.TZ = "Europe/Vienna";

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calendarDayDelta,
  shiftTimestampByCalendarDays,
  overlayEditorFields,
  prepareMovedSession,
  commitSessionMove,
} from "./moveSessionDate.js";

function localParts(iso) {
  const d = new Date(iso);
  return [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()];
}

function memoryStore(seed = []) {
  const docs = new Map(seed.map((row) => [row.docId, structuredClone(row.data)]));
  const calls = { writes: 0, deletes: 0 };
  return {
    docs,
    calls,
    async readTarget(date, id) {
      const key = id ? `${date}__${id}` : date;
      return docs.has(key) ? docs.get(key) : null;
    },
    async writeSession(date, data, id) {
      calls.writes += 1;
      const key = id ? `${date}__${id}` : date;
      docs.set(key, structuredClone(data));
    },
    async deleteSession(date, id) {
      calls.deletes += 1;
      const key = id ? `${date}__${id}` : date;
      if (!docs.has(key)) throw new Error("missing");
      docs.delete(key);
    },
  };
}

const sixpack = {
  date: "2026-11-01",
  id: "sixpack-ab12",
  source: { app: "sixpack" },
  schema: 2,
  modality: "core",
  block: "6Pack",
  sessionMode: "strength",
  exercises: [{ id: "sixpack-plank", name: "Plank", source: "sixpack", duration: 40, setsArray: [] }],
  activity: { type: "hiit", duration: "5", muscleTarget: "core" },
  sessionGate: {
    status: "completed",
    startedAt: "2026-11-01T17:30:00.000Z",
    endedAt: "2026-11-01T17:35:00.000Z",
    gps: { lat: 48.2, lng: 16.3, capturedAt: "2026-11-01T17:30:00.000Z", source: "device" },
  },
  notes: "Core",
  _origin: "cloud",
  _runtime: { syncState: "local" },
  saved_at: "2026-11-01T18:00:00.000Z",
};

test("Kalendertage über den Zeitumstellungstermin, Uhrzeit lokal gleich", () => {
  assert.equal(calendarDayDelta("2026-03-28", "2026-03-30"), 2);
  assert.equal(calendarDayDelta("2026-10-24", "2026-10-26"), 2);
  const winter = shiftTimestampByCalendarDays("2026-10-24T21:30:00.000Z", 2);
  assert.deepEqual(localParts(winter), [2026, 10, 26, 23, 30]);
  const summer = shiftTimestampByCalendarDays("2026-03-28T21:30:00.000Z", 2);
  assert.deepEqual(localParts(summer), [2026, 3, 30, 22, 30]);
  const localMidnight = new Date(2026, 10, 1, 0, 30);
  assert.equal(localMidnight.toISOString().slice(0, 10), "2026-10-31");
  const midnight = shiftTimestampByCalendarDays(localMidnight.toISOString(), 1);
  assert.deepEqual(localParts(midnight), [2026, 11, 2, 0, 30]);
});

test("prepare: Kennung, Quelle und Übungen bleiben, Anzeige-Felder fallen weg", () => {
  const moved = prepareMovedSession(sixpack, "2026-11-03");
  assert.equal(moved.id, "sixpack-ab12");
  assert.equal(moved.docFrom, "2026-11-01__sixpack-ab12");
  assert.equal(moved.docTo, "2026-11-03__sixpack-ab12");
  assert.equal(moved.data.session_id, "sixpack-ab12");
  assert.equal(moved.data.date, "2026-11-03");
  assert.deepEqual(moved.data.source, { app: "sixpack" });
  assert.equal(moved.data.schema, 2);
  assert.equal(moved.data.exercises[0].duration, 40);
  assert.equal(moved.data.exercises[0].source, "sixpack");
  assert.equal(moved.data._origin, undefined);
  assert.equal(moved.data._runtime, undefined);
  assert.equal(moved.data.id, undefined);
  assert.equal(moved.data.saved_at, undefined);
  assert.deepEqual(localParts(moved.data.sessionGate.startedAt), [2026, 11, 3, 18, 30]);
  assert.deepEqual(localParts(moved.data.sessionGate.endedAt), [2026, 11, 3, 18, 35]);
  assert.deepEqual(localParts(moved.data.sessionGate.gps.capturedAt), [2026, 11, 3, 18, 30]);
  assert.equal(moved.data.sessionGate.gps.source, "device");
  assert.equal(sixpack.sessionGate.startedAt, "2026-11-01T17:30:00.000Z");
});

test("prepare: Radtour behält Importquelle", () => {
  const tour = {
    date: "2026-06-02",
    id: "tour_1",
    block: "Radtour",
    sessionMode: "cardio",
    exercises: [],
    activity: { type: "cycling", duration: "90", distanceKm: "40", _importSource: "gpx", date: "2026-06-02" },
  };
  const moved = prepareMovedSession(tour, "2026-06-04");
  assert.equal(moved.data.activity._importSource, "gpx");
  assert.equal(moved.data.activity.type, "cycling");
  assert.equal(moved.data.activity.date, "2026-06-04");
  assert.equal(moved.data.session_id, "tour_1");
});

test("overlay lässt source stehen und ersetzt keine Activity durch den Kraft-Default", () => {
  const editor = {
    id: "sixpack-ab12",
    date: "2026-11-01",
    block: "6Pack",
    exercises: sixpack.exercises,
    notes: "korrigiert",
    sessionMode: "strength",
    hasActivity: false,
    activity: { type: "hiit", duration: "", muscleTarget: "core" },
    sessionGate: { startedAt: null, endedAt: null },
  };
  const merged = overlayEditorFields(sixpack, editor);
  assert.deepEqual(merged.source, { app: "sixpack" });
  assert.equal(merged.activity.type, "hiit");
  assert.equal(merged.activity.duration, "5");
  assert.equal(merged.notes, "korrigiert");
  assert.equal(merged.sessionGate.startedAt, sixpack.sessionGate.startedAt);
});

test("mehrere Einheiten: nur die gewählte wandert, die andere bleibt", async () => {
  const store = memoryStore([
    { docId: "2026-11-01", data: { date: "2026-11-01", session_id: null, block: "Push", exercises: [{ name: "Bank" }] } },
    { docId: "2026-11-01__sixpack-ab12", data: { ...sixpack, session_id: "sixpack-ab12" } },
    { docId: "2026-11-03__other", data: { date: "2026-11-03", session_id: "other", block: "Pull" } },
  ]);
  const result = await commitSessionMove({
    session: sixpack,
    newDate: "2026-11-03",
    readTarget: store.readTarget,
    writeSession: store.writeSession,
    deleteSession: store.deleteSession,
  });
  assert.equal(result.moved, true);
  assert.equal(result.id, "sixpack-ab12");
  assert.equal(store.docs.has("2026-11-01__sixpack-ab12"), false);
  assert.equal(store.docs.has("2026-11-01"), true);
  assert.equal(store.docs.get("2026-11-01").block, "Push");
  assert.equal(store.docs.get("2026-11-03__other").block, "Pull");
  const copy = store.docs.get("2026-11-03__sixpack-ab12");
  assert.equal(copy.session_id, "sixpack-ab12");
  assert.deepEqual(copy.source, { app: "sixpack" });
  assert.equal(copy.exercises[0].name, "Plank");
});

test("belegte Zielkennung schreibt und löscht nichts", async () => {
  const store = memoryStore([
    { docId: "2026-11-01__sixpack-ab12", data: { ...sixpack, session_id: "sixpack-ab12" } },
    { docId: "2026-11-03__sixpack-ab12", data: { date: "2026-11-03", session_id: "sixpack-ab12", block: "liegt schon" } },
  ]);
  await assert.rejects(
    () => commitSessionMove({
      session: sixpack,
      newDate: "2026-11-03",
      readTarget: store.readTarget,
      writeSession: store.writeSession,
      deleteSession: store.deleteSession,
    }),
    (err) => err.code === "target-occupied",
  );
  assert.equal(store.calls.writes, 0);
  assert.equal(store.calls.deletes, 0);
  assert.equal(store.docs.get("2026-11-01__sixpack-ab12").block, "6Pack");
  assert.equal(store.docs.get("2026-11-03__sixpack-ab12").block, "liegt schon");
});

test("Schreibfehler lässt die Quelle unverändert", async () => {
  const store = memoryStore([
    { docId: "2026-11-01__sixpack-ab12", data: { ...sixpack, session_id: "sixpack-ab12" } },
  ]);
  store.writeSession = async () => { store.calls.writes += 1; throw new Error("disk"); };
  const before = structuredClone(store.docs.get("2026-11-01__sixpack-ab12"));
  await assert.rejects(
    () => commitSessionMove({
      session: sixpack,
      newDate: "2026-11-04",
      readTarget: store.readTarget,
      writeSession: store.writeSession,
      deleteSession: store.deleteSession,
    }),
    /disk/,
  );
  assert.equal(store.calls.deletes, 0);
  assert.deepEqual(store.docs.get("2026-11-01__sixpack-ab12"), before);
  assert.equal(store.docs.has("2026-11-04__sixpack-ab12"), false);
});

test("Löschfehler behält Quelle und Kopie", async () => {
  const store = memoryStore([
    { docId: "2026-11-01__tour_1", data: { date: "2026-11-01", session_id: "tour_1", block: "Radtour", activity: { type: "cycling", _importSource: "gpx" } } },
  ]);
  store.deleteSession = async () => { store.calls.deletes += 1; throw new Error("locked"); };
  await assert.rejects(
    () => commitSessionMove({
      session: { date: "2026-11-01", id: "tour_1", block: "Radtour", activity: { type: "cycling", _importSource: "gpx" } },
      newDate: "2026-11-02",
      readTarget: store.readTarget,
      writeSession: store.writeSession,
      deleteSession: store.deleteSession,
    }),
    (err) => err.code === "copied-not-deleted" && err.copied.activity._importSource === "gpx",
  );
  assert.equal(store.docs.get("2026-11-01__tour_1").activity._importSource, "gpx");
  assert.equal(store.docs.get("2026-11-02__tour_1").session_id, "tour_1");
  assert.equal(store.docs.get("2026-11-02__tour_1").activity._importSource, "gpx");
});

test("gleiches Datum und ungültiges Datum schreiben nichts", async () => {
  const store = memoryStore([
    { docId: "2026-11-01", data: { date: "2026-11-01", session_id: null, block: "Push" } },
  ]);
  const same = await commitSessionMove({
    session: { date: "2026-11-01", id: null, block: "Push" },
    newDate: "2026-11-01",
    readTarget: store.readTarget,
    writeSession: store.writeSession,
    deleteSession: store.deleteSession,
  });
  assert.equal(same.moved, false);
  assert.equal(store.calls.writes, 0);
  assert.throws(
    () => prepareMovedSession({ date: "2026-11-01", id: null }, "2026-11-31"),
    (err) => err.code === "bad-date",
  );
  await assert.rejects(
    () => commitSessionMove({
      session: { date: "01.11.2026", id: "x" },
      newDate: "2026-11-02",
      readTarget: store.readTarget,
      writeSession: store.writeSession,
      deleteSession: store.deleteSession,
    }),
    (err) => err.code === "bad-date",
  );
  assert.equal(store.calls.writes, 0);
  assert.equal(store.calls.deletes, 0);
});

test("kanonische Einheit ohne Suffix kollidiert nur mit der kanonischen Ziel-Einheit", async () => {
  const store = memoryStore([
    { docId: "2026-11-01", data: { date: "2026-11-01", session_id: null, block: "Push", exercises: [{ name: "Bank" }] } },
    { docId: "2026-11-05__extra", data: { date: "2026-11-05", session_id: "extra", block: "Extra" } },
  ]);
  await commitSessionMove({
    session: { date: "2026-11-01", id: null, block: "Push", exercises: [{ name: "Bank" }] },
    newDate: "2026-11-05",
    readTarget: store.readTarget,
    writeSession: store.writeSession,
    deleteSession: store.deleteSession,
  });
  assert.equal(store.docs.has("2026-11-01"), false);
  assert.equal(store.docs.get("2026-11-05").block, "Push");
  assert.equal(store.docs.get("2026-11-05").session_id, null);
  assert.equal(store.docs.get("2026-11-05__extra").block, "Extra");
});
