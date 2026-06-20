/**
 * Firestore Data Layer — Fitness PWA (Multi-User)
 *
 * Mechanically bundled from pwa.bak/src/lib/db/*.js (last working
 * Firestore state at git 5d9086c, before pwa/ was dissolved in v3.1).
 *
 * Counterpart to src/db.js (Local-Hybrid). Selected at build time via
 * `vite build --mode firebase` through the @db alias in vite.config.js.
 *
 * Public-API parity with src/db.js — views import either from "@db"
 * or relative "../../db.js" and must get the same names back.
 */

import {
  collection, doc, addDoc, setDoc, getDoc, getDocs, deleteDoc,
  query, where, orderBy, limit, serverTimestamp, writeBatch, collectionGroup
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut as fbSignOut, updateProfile,
} from "firebase/auth";

import { db, auth, googleProvider } from "./firebase.js";

export { db, auth, googleProvider };

// ── Helpers (inlined from pwa.bak/src/lib/utils.js) ──────────────────────────

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function localToday() { return todayISO(); }

// Pure helpers that current src views may import via @db — keep parity.
export function getWeekDates() {
  const today = todayISO();
  const d = new Date(today + 'T12:00:00');
  const off = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - off);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;
  });
}

export function downloadText(filename, text, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

export const num = (v) => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim().replace(',', '.');
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

// ── Mode flag — distinguishes from Local-Hybrid db.js ────────────────────────

export function isLocalMode() { return false; }

// ── api compat shim — Views that bypass @db and call api directly will
//    hit this no-op in firebase builds. Console warning helps track them.
const noopApi = (verb) => async () => {
  console.warn(`[db.firestore] api.${verb}() called — view bypasses @db contract`);
  return null;
};
export const api = { get: noopApi("get"), post: noopApi("post"), delete: noopApi("delete") };

// ── Auth (from pwa.bak/src/lib/db/core.js) ───────────────────────────────────

let currentUid = null;

export function watchAuth(callback) {
  return onAuthStateChanged(auth, (user) => {
    currentUid = user ? user.uid : null;
    callback?.(user);
  });
}

export async function signIn() {
  await signInWithPopup(auth, googleProvider);
}

export async function signInEmail(email, password) {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function signUpEmail(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) await updateProfile(cred.user, { displayName });
}

export async function signOut() { await fbSignOut(auth); }

export function getUid() {
  if (!currentUid) throw new Error("Nicht eingeloggt");
  return currentUid;
}

const BRIDGE_NOTIFY = "https://ideapad.tail7a15d6.ts.net/api/fitness/notify";
export function pingBridge() {
  fetch(BRIDGE_NOTIFY, { method: "POST" }).catch(() => {});
}

// ── Sessions (from pwa.bak/src/lib/db/sessions.js) ───────────────────────────

export async function getSession(date = todayISO(), id = null) {
  const targetId = id ? `${date}__${id}` : date;
  const snap = await getDoc(doc(db, "fitness", getUid(), "sessions", targetId));
  if (!snap.exists()) return { date, block: "", exercises: [], effort: null, mood: "", notes: "" };
  const data = snap.data() || {};
  return {
    date: data.date || date,
    block: "",
    effort: null,
    mood: "",
    notes: "",
    ...data,
    id: id || null,
    exercises: Array.isArray(data.exercises) ? data.exercises : [],
  };
}

export async function saveSession(date = todayISO(), sessionData, id = null) {
  const targetId = id ? `${date}__${id}` : date;
  await setDoc(doc(db, "fitness", getUid(), "sessions", targetId), {
    ...sessionData,
    date,
    session_id: id || null,
    saved_at: serverTimestamp(),
  });
  pingBridge();
  return { ok: true, id };
}

export async function deleteSession(date = todayISO(), id = null) {
  const targetId = id ? `${date}__${id}` : date;
  await deleteDoc(doc(db, "fitness", getUid(), "sessions", targetId));
  pingBridge();
  return { ok: true };
}

export async function listSessionsForDate(date = todayISO()) {
  const q = query(
    collection(db, "fitness", getUid(), "sessions"),
    where("date", "==", date)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() || {};
    const suffix = d.id.includes("__") ? d.id.split("__")[1] : null;
    return {
      id: suffix,
      date: data.date || date,
      block: data.block || null,
      saved_at: data.saved_at ? data.saved_at.toDate().toISOString() : null,
      ...data,
      exercises: Array.isArray(data.exercises) ? data.exercises : [],
    };
  }).sort((a, b) => String(a.saved_at).localeCompare(String(b.saved_at)));
}

export async function getRecentSessions(n = 10) {
  const q = query(
    collection(db, "fitness", getUid(), "sessions"),
    orderBy("date", "desc"),
    limit(n),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => {
      const data = d.data() || {};
      const suffix = d.id.includes("__") ? d.id.split("__")[1] : null;
      return {
        id: suffix,
        ...data,
        exercises: Array.isArray(data.exercises) ? data.exercises : [],
      };
    })
    .filter(Boolean);
}

export async function getLatestSession() {
  const sessions = await getRecentSessions(1);
  return sessions.length > 0 ? sessions[0] : null;
}

export async function getSessionHistory(n = 60) { return getRecentSessions(n); }

export async function getPlan() {
  const snap = await getDoc(doc(db, "fitness", getUid(), "plan"));
  if (!snap.exists()) return null;
  return snap.data();
}

export async function savePlan(plan) {
  await setDoc(doc(db, "fitness", getUid(), "plan"), {
    ...plan,
    updated_at: serverTimestamp(),
  });
  return { ok: true };
}

// Mirrors catalog/kb/rules/program_rules.yml — update both when rules change.
const PROGRAM_RULES = {
  default_split: "full_body",
  templates: {
    push_day: { slots: [
      { name: "main_chest_press",       choose_from: ["041","104"] },
      { name: "secondary_press",        choose_from: ["045","023"] },
      { name: "shoulder_press_or_raise",choose_from: ["022","301"] },
      { name: "chest_isolation",        choose_from: ["103","pec_deck"] },
      { name: "triceps_isolation",      choose_from: ["502","503"] },
    ]},
    pull_day: { slots: [
      { name: "vertical_pull",          choose_from: ["020","021","201"] },
      { name: "horizontal_pull",        choose_from: ["042","043","044"] },
      { name: "secondary_row_or_pulldown", choose_from: ["201","043","044"] },
      { name: "rear_delt_or_face_pull", choose_from: ["302","303"] },
      { name: "biceps_movement",        choose_from: ["504","505","506","507"] },
    ]},
    legs_day: { slots: [
      { name: "main_squat",             choose_from: ["061","060","062"] },
      { name: "main_hinge",             choose_from: ["081","080","082"] },
      { name: "unilateral_or_machine",  choose_from: ["063","064","062"] },
      { name: "hamstring_isolation",    choose_from: ["402","082"] },
      { name: "calves",                 choose_from: ["701"] },
      { name: "core_optional",          choose_from: ["601","602","603","604","605","606"] },
    ]},
  },
};

export async function getPlanSuggestion({ template, goal, day } = {}) {
  const templateName = template?.trim() || (day ? `${day.trim()}_day` : '') || PROGRAM_RULES.default_split;
  const templateDef = PROGRAM_RULES.templates[templateName];
  if (!templateDef) return null;

  const exercises = await getAllExercises();
  const byId = Object.fromEntries(exercises.map(e => [e.exercise_id || e.id, e]));
  const exerciseIds = new Set(Object.keys(byId));

  const selected = new Set();
  const slots = templateDef.slots.map(slot => {
    const available = slot.choose_from.filter(id => exerciseIds.has(id) && !selected.has(id));
    const pick = available[0] || null;
    if (pick) selected.add(pick);
    return { name: slot.name, choose_from: slot.choose_from, selected_exercise: pick };
  });

  const resolvedExercises = [...selected].map(id => {
    const ex = byId[id];
    if (!ex) return null;
    return {
      ...ex,
      id: ex.exercise_id || ex.id,
      name: ex.display_name || ex.german || ex.name || id,
      primaryMuscles: ex.primary_muscles || ex.primaryMuscles || [],
      secondaryMuscles: ex.secondary_muscles || ex.secondaryMuscles || [],
    };
  }).filter(Boolean);

  return { ok: true, template: templateName, goal: goal || null, slots, exercises: resolvedExercises };
}

export async function exportFitnessData(_payload) { return null; }

export async function getConfig() { return { ok: true, source: "firestore" }; }

// ... (existing imports and helpers)

export async function getInbox() {
  const q = query(
    collection(db, "fitness", getUid(), "inbox"),
    orderBy("received_at", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ file_id: d.id, ...d.data() }));
}

export async function getGlobalInbox() {
  // requires a collectionGroup index for 'inbox' if filtered/ordered
  const q = query(collectionGroup(db, "inbox"), where("status", "==", "ai_enriched"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ 
    file_id: d.id, 
    userId: d.reference.parent.parent.id, 
    ...d.data() 
  }));
}

export async function approveInbox(id, userId) {
  const targetUid = userId || getUid();
  const inboxRef = doc(db, "fitness", targetUid, "inbox", id);
  const snap = await getDoc(inboxRef);
  if (!snap.exists()) return { ok: false, error: "not_found" };

  const data = snap.data();
  const exercise = data.enriched || data;
  const exId = exercise.exercise_id || exercise.id || id;

  const batch = writeBatch(db);
  batch.set(doc(db, "fitness", "kb", "exercises", exId), {
    ...exercise,
    source: "approved",
    approved_at: serverTimestamp(),
  });
  batch.delete(inboxRef);
  await batch.commit();

  return { ok: true, id: exId };
}

export async function deleteInbox(id) {
  await deleteDoc(doc(db, "fitness", getUid(), "inbox", id));
  return { ok: true };
}

// ── Journal (from pwa.bak/src/lib/db/journal.js) ─────────────────────────────

export async function getJournal(date = todayISO()) {
  try {
    const q = query(
      collection(db, "fitness", getUid(), "journal"),
      where("date", "==", date),
      orderBy("time", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    const q = query(collection(db, "fitness", getUid(), "journal"), where("date", "==", date));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.time || "").localeCompare(a.time || ""));
  }
}

export async function getJournalHistory(limitCount = 50) {
  const q = query(
    collection(db, "fitness", getUid(), "journal"),
    orderBy("time", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function saveJournal(date = todayISO(), text, tags = []) {
  const ref = await addDoc(collection(db, "fitness", getUid(), "journal"), {
    date,
    text: text.trim(),
    tags,
    time: new Date().toISOString(),
    created_at: serverTimestamp(),
  });
  return { id: ref.id };
}

export async function updateJournal(id, text) {
  const ref = doc(db, "fitness", getUid(), "journal", id);
  await setDoc(ref, { text: text.trim(), updated_at: serverTimestamp() }, { merge: true });
  return { ok: true };
}

export async function getHabitJournal(habitId, date) {
  const snap = await getDoc(doc(db, "fitness", getUid(), "habitJournals", `${habitId}_${date}`));
  return snap.exists() ? snap.data() : null;
}

export async function getHabitJournalHistory(habitId) {
  const q = query(
    collection(db, "fitness", getUid(), "habitJournals"),
    where("habitId", "==", habitId),
    orderBy("date", "desc"),
    limit(20),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

export async function getAllHabitJournalsHistory(limitCount = 50) {
  const q = query(
    collection(db, "fitness", getUid(), "habitJournals"),
    orderBy("date", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data(), type: "habit" }));
}

export async function getAllHabitJournalsForDate(date) {
  const q = query(
    collection(db, "fitness", getUid(), "habitJournals"),
    where("date", "==", date),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data(), type: "habit" }));
}

export async function saveHabitJournal(habitId, date, text) {
  const ref = doc(db, "fitness", getUid(), "habitJournals", `${habitId}_${date}`);
  await setDoc(ref, {
    habitId,
    date,
    text: text.trim(),
    updated_at: serverTimestamp(),
  }, { merge: true });
  return { ok: true };
}

// ── Habits (from pwa.bak/src/lib/db/habits.js) ───────────────────────────────

export async function getHabits(days = 28) {
  const snap = await getDocs(collection(db, "fitness", getUid(), "habits"));
  const habits = snap.docs.map(d => ({ uuid: d.id, ...d.data() }));

  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - (days - 1));

  const q = query(
    collection(db, "fitness", getUid(), "habitRecords"),
    where("date", ">=", startDate.toISOString().slice(0, 10)),
    where("date", "<=", todayISO()),
    orderBy("date", "desc"),
  );
  const recordsSnap = await getDocs(q);
  const allRecords = recordsSnap.docs.map(d => d.data());

  return habits.map(h => {
    const habitRecords = allRecords.filter(r => r.habitId === h.uuid);
    return {
      ...h,
      records: habitRecords,
      hasRecord: (date) => habitRecords.some(r => r.date === date && r.completion === "DONE"),
    };
  });
}

export async function updateHabit(uuid, newName, newIcon) {
  await setDoc(doc(db, "fitness", getUid(), "habits", uuid), {
    name: newName,
    icon: newIcon,
    updated_at: serverTimestamp(),
  }, { merge: true });
}

export async function addHabit(name, icon = "Activity") {
  return await addDoc(collection(db, "fitness", getUid(), "habits"), {
    name,
    created_at: serverTimestamp(),
  });
}

export async function deleteHabit(uuid) {
  await setDoc(doc(db, "fitness", getUid(), "habits", uuid), { deleted: true }, { merge: true });
}

export async function getHabitRecordsForDate(date = todayISO()) {
  const q = query(
    collection(db, "fitness", getUid(), "habitRecords"),
    where("date", "==", date),
    where("completion", "==", "DONE"),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data().habitId);
}

export async function recordHabit(uuid, date = todayISO()) {
  const ref = doc(db, "fitness", getUid(), "habitRecords", `${uuid}_${date}`);
  await setDoc(ref, {
    habitId: uuid,
    date,
    completion: "DONE",
    recorded_at: serverTimestamp(),
  });
  return { ok: true };
}

export async function unrecordHabit(uuid, date = todayISO()) {
  const ref = doc(db, "fitness", getUid(), "habitRecords", `${uuid}_${date}`);
  await setDoc(ref, {
    habitId: uuid,
    date,
    completion: "MISSED",
    recorded_at: serverTimestamp(),
  }, { merge: true });
  return { ok: true };
}

// ── Knowledge Base (from pwa.bak/src/lib/db/kb.js) ───────────────────────────

export async function getExercise(exerciseId) {
  const snap = await getDoc(doc(db, "fitness", "kb", "exercises", exerciseId));
  if (!snap.exists()) return null;
  return snap.data();
}

export async function getAllExercises() {
  const snap = await getDocs(collection(db, "fitness", "kb", "exercises"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Client-side fuzzy search through Firestore exercises collection.
// Firestore has no full-text; load-once-and-cache + score in browser.
let _searchCache = null;
function _normalize(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[-_]/g, " ").replace(/\s+/g, " ").trim();
}
export async function searchExercises(query, limit = 12) {
  const q = String(query || "").trim();
  if (!q) return { ok: true, results: [], query: q, suggestions: [] };
  if (!_searchCache) _searchCache = await getAllExercises();
  const stored = localStorage.getItem('fitness-sessionSources');
  const sources = stored ? JSON.parse(stored) : { wger: true, yuhonas: true, coach: false };
  const pool = _searchCache.filter(ex => {
    const tags = ex.tags || [];
    if (tags.includes('wger') || tags.includes('unreviewed')) return sources.wger !== false;
    if (tags.includes('yuhonas')) return sources.yuhonas !== false;
    return sources.coach === true;
  });
  const qn = _normalize(q);
  const qTokens = qn.split(" ").filter(Boolean);
  const scored = pool.map(ex => {
    const hay = [ex.display_name, ex.german, ex.name, ex.exercise_id, ex.id, ...(ex.aliases || []), ...(ex.tags || [])].map(_normalize);
    let score = 0;
    if (hay.some(h => h === qn))         score = 100;
    else if (hay.some(h => h.startsWith(qn))) score = 80;
    else if (hay.some(h => h.includes(qn)))   score = 60;
    else if (qTokens.length > 1 && qTokens.every(t => hay.some(h => h.includes(t)))) score = 50;
    else if (qTokens.some(t => hay.some(h => h.includes(t)))) score = 20;
    return { ex, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
  const results = scored.map(({ ex }) => ({
    ...ex,
    id:   ex.exercise_id || ex.id,
    name: ex.display_name || ex.german || ex.name || ex.exercise_id || ex.id,
    primaryMuscles:   ex.primary_muscles   || ex.primaryMuscles   || [],
    secondaryMuscles: ex.secondary_muscles || ex.secondaryMuscles || [],
    source: "firestore",
  }));
  return { ok: true, source: "firestore", query: q, results,
           suggestions: results.slice(0, 3).map(r => ({ canonical_id: r.id, display_name: r.name })) };
}

export async function getAnatomy(exerciseId) {
  const snap = await getDoc(doc(db, "fitness", "kb", "anatomy", exerciseId));
  if (!snap.exists()) return null;
  return snap.data();
}

export async function getMuscle(muscleId) {
  const snap = await getDoc(doc(db, "fitness", "kb", "muscles", muscleId));
  if (!snap.exists()) return null;
  return snap.data();
}

export async function sendToInbox(exerciseData) {
  try {
    const ref = await addDoc(collection(db, "fitness", getUid(), "inbox"), {
      ...exerciseData,
      received_at: serverTimestamp(),
    });
    return { ok: true, id: ref.id };
  } catch (e) {
    console.error("Inbox Firestore push failed:", e);
    return { ok: false };
  }
}

// ── Analysis / Coverage / Weekly Report (from pwa.bak/src/lib/db/analysis.js) ─

export async function getDashboardAnalytics(days = 28) {
  try {
    const snap = await getDoc(doc(db, "fitness", getUid(), "analytics", "dashboard"));
    if (snap.exists()) {
      const data = snap.data();
      if (days <= 7 && data.rolling_7_days) return data.rolling_7_days;
      if (days <= 14 && data.rolling_14_days) return data.rolling_14_days;
      return data.rolling_28_days || null;
    }
  } catch (e) {
    console.error("Failed to fetch dashboard analytics", e);
  }
  return null;
}

export const ACTIVITY_MUSCLE_MAPPING = {
  hiking:   { muscles: ["legs", "core", "glutes"],        impact: 1.0 },
  running:  { muscles: ["quads", "hamstrings", "calves"], impact: 1.0 },
  cycling:  { muscles: ["quads", "calves"],               impact: 0.8 },
  swimming: { muscles: ["back", "shoulders", "core"],     impact: 0.7 },
};

const MUSCLE_TAG_TO_GROUP = {
  chest: "chest", pecs: "chest", pectoralis: "chest",
  back: "back", lats: "back", rhomboids: "back",
  shoulders: "shoulders", delts: "shoulders", deltoid: "shoulders",
  biceps: "arms", triceps: "arms", forearms: "arms",
  abs: "core", obliques: "core", core: "core", abdominis: "core",
  glutes: "glutes", gluteus: "glutes",
  quads: "quads", quadriceps: "quads",
  hamstrings: "hamstrings", "biceps femoris": "hamstrings",
  calves: "calves", gastrocnemius: "calves",
  traps: "trapezius", trapezius: "trapezius",
};

export const MUSCLE_GROUPS = {
  chest:      ["pecs", "chest", "pectoralis", "brust"],
  back:       ["lats", "lower back", "back", "latissimus", "rhomboids", "rücken", "pull-up", "klimmzug", "rudern", "row"],
  trapezius:  ["traps", "trapezius", "nacken", "shrugs"],
  shoulders:  ["shoulders", "delts", "deltoid", "schulter", "schultern", "overhead", "press"],
  arms:       ["biceps", "triceps", "forearms", "brachii", "bizeps", "trizeps", "arm", "arme", "curl", "extension"],
  core:       ["abs", "obliques", "core", "abdominis", "bauch"],
  glutes:     ["glutes", "gluteus", "po", "gesäß", "hip thrust", "squat", "kniebeuge"],
  quads:      ["quads", "quadriceps", "oberschenkel", "squat", "kniebeuge"],
  hamstrings: ["hamstrings", "biceps femoris", "beinbeuger", "leg curl", "kreuzheben", "good mornings", "rumänisches kreuzheben", "squat", "kniebeuge"],
  calves:     ["calves", "gastrocnemius", "waden", "calf", "wadenheben", "stehendes wadenheben", "squat", "kniebeuge"],
  legs:       ["legs", "squat", "deadlift", "lunge", "beine", "bein", "leg press", "kniebeuge"],
};

export function muscleToGroupIds(muscle, exerciseName = "") {
  const m = String(muscle || "").toLowerCase().trim();
  const name = String(exerciseName || "").toLowerCase();
  const matches = new Set();
  if (MUSCLE_TAG_TO_GROUP[m]) matches.add(MUSCLE_TAG_TO_GROUP[m]);
  for (const [group, list] of Object.entries(MUSCLE_GROUPS)) {
    if (list.some(x => m.includes(x) || (name && name.includes(x)))) matches.add(group);
  }
  return [...matches];
}

export async function getMuscleCoverage(days = 7) {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  const hits = {};
  for (const date of dates) {
    const session = await getSession(date);
    if (!session) continue;
    for (const ex of (Array.isArray(session.exercises) ? session.exercises : [])) {
      if (!ex.done) continue;
      const primary = ex.primaryMuscles || [];
      const secondary = ex.secondaryMuscles || [];
      const exName = ex.name || ex.exercise_id || "";
      [...primary, ...secondary].forEach(m => {
        muscleToGroupIds(m, exName).forEach(gid => hits[gid] = (hits[gid] || 0) + 1);
      });
    }
  }
  return hits;
}

export async function getCoverageGaps(days = 7, threshold = 1.0) {
  const hits = await getMuscleCoverage(days);
  const all = Object.keys(MUSCLE_GROUPS);
  return all.filter(g => (hits[g] || 0) < threshold).map(g => ({ name: g, hits: hits[g] || 0 }));
}

function getWeekBounds(selector = "current") {
  let d = new Date();
  if (selector === "current") {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const x = new Date();
      x.setDate(d.getDate() - (6 - i));
      dates.push(x.toISOString().slice(0, 10));
    }
    return dates;
  }
  const [year, week] = selector.split("-W");
  d = new Date(Number(year), 0, 1 + (parseInt(week) - 1) * 7);
  const off = (d.getDay() + 6) % 7;
  const start = new Date(d);
  start.setDate(d.getDate() - off);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const x = new Date(start);
    x.setDate(start.getDate() + i);
    dates.push(x.toISOString().slice(0, 10));
  }
  return dates;
}

export async function getWeeklyReport(selector = "current") {
  const dates = getWeekBounds(selector);
  const [kbExercises, history] = await Promise.all([
    getAllExercises(),
    getSessionHistory(120),
  ]);
  const kbMap = new Map();
  kbExercises.forEach(ex => kbMap.set((ex.display_name || ex.name || "").toLowerCase(), ex));

  const safeHistory = Array.isArray(history)
    ? history.filter(Boolean).map(s => ({
        ...s,
        exercises: Array.isArray(s.exercises) ? s.exercises : [],
      }))
    : [];

  const historyWithMuscles = safeHistory.map(s => {
    const groups = new Set();
    for (const ex of (s.exercises || [])) {
      if (!ex.done) continue;
      const primary = ex.primaryMuscles || [];
      const secondary = ex.secondaryMuscles || [];
      const exName = ex.name || ex.exercise_id || "";
      let hasMapped = false;
      [...primary, ...secondary].forEach(m => {
        muscleToGroupIds(m, exName).forEach(gid => { groups.add(gid); hasMapped = true; });
      });
      if (!hasMapped && exName) muscleToGroupIds("", exName).forEach(gid => groups.add(gid));
    }
    if (s.activity && ACTIVITY_MUSCLE_MAPPING[s.activity.type]) {
      ACTIVITY_MUSCLE_MAPPING[s.activity.type].muscles.forEach(gid => groups.add(gid));
    }
    return { date: s.date, groups: [...groups] };
  }).sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  const sessions = [];
  let entriesCount = 0;
  const muscleScores = {}, bodyRegionScores = {}, topExMap = {};

  for (const date of dates) {
    const sess = await getSession(date);
    if (!sess) continue;
    let hasDoneExercises = false;
    const sessGroupsCount = {};

    for (const ex of (Array.isArray(sess.exercises) ? sess.exercises : [])) {
      if (!ex.done) continue;
      const primary = ex.primaryMuscles || [], secondary = ex.secondaryMuscles || [], exName = ex.name || ex.exercise_id || "";
      hasDoneExercises = true; entriesCount++;
      if (exName) topExMap[exName] = (topExMap[exName] || 0) + 1;
      let hasMapped = false;
      [...primary, ...secondary].forEach(m => {
        muscleToGroupIds(m, exName).forEach(gid => { sessGroupsCount[gid] = (sessGroupsCount[gid] || 0) + 1; hasMapped = true; });
      });
      for (const m of primary) {
        muscleToGroupIds(m, exName).forEach(gid => { muscleScores[m] = (muscleScores[m] || 0) + 1; bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 1; hasMapped = true; });
      }
      for (const m of secondary) {
        muscleToGroupIds(m, exName).forEach(gid => { bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 1; hasMapped = true; });
      }
      if (!hasMapped && exName) {
        muscleToGroupIds("", exName).forEach(gid => { sessGroupsCount[gid] = (sessGroupsCount[gid] || 0) + 1; bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 1; });
      }
    }

    if (hasDoneExercises || sess.block || sess.activity) {
      const sortedGroups = Object.entries(sessGroupsCount).sort((a, b) => b[1] - a[1]);
      let autoSplit = sess.block || sess.trainingsart || "Training";
      if (!sess.block && sortedGroups.length > 0) autoSplit = sortedGroups[0][0].charAt(0).toUpperCase() + sortedGroups[0][0].slice(1);
      if (sess.activity && ACTIVITY_MUSCLE_MAPPING[sess.activity.type]) {
        ACTIVITY_MUSCLE_MAPPING[sess.activity.type].muscles.forEach(gid => { sessGroupsCount[gid] = (sessGroupsCount[gid] || 0) + 1; bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 1; });
      }
      const muscleRecovery = {};
      for (const gid of Object.keys(sessGroupsCount)) {
        const lastSessionWithGroup = historyWithMuscles.find(h => h.date < date && h.groups.includes(gid));
        if (lastSessionWithGroup) {
          const d1 = new Date(date), d2 = new Date(lastSessionWithGroup.date);
          muscleRecovery[gid] = Math.round((d1 - d2) / (1000 * 60 * 60));
        }
      }
      sessions.push({ ...sess, block: autoSplit, exercise_count: sess.exercises?.length || 0, muscle_recovery: muscleRecovery });
    }
  }

  const allGroups = ["chest", "back", "shoulders", "arms", "core", "glutes", "quads", "hamstrings", "calves", "legs"];
  const gaps = allGroups.filter(g => (bodyRegionScores[g] || 0) < 1);

  return {
    ok: true, week: selector, session_count: sessions.length, entries_count: entriesCount,
    sessions, muscle_scores: muscleScores, body_region_scores: bodyRegionScores, missing_regions: gaps,
    top_exercises: Object.entries(topExMap).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ display_name: name, count })),
    recommendations: gaps.length > 0 ? [`Fokus auf: ${gaps.join(", ")}`] : ["Woche perfekt abgedeckt!"],
  };
}

export async function getProgressTrend(exerciseName, lastN = 4) {
  const history = await getSessionHistory(lastN * 7);
  const safeHistory = Array.isArray(history)
    ? history.filter(Boolean).map(s => ({
        ...s,
        exercises: Array.isArray(s.exercises) ? s.exercises : [],
      }))
    : [];
  
  const sessions = safeHistory
    .filter(s => s.exercises.some(ex => ex.name === exerciseName))
    .sort((a, b) => b.date.localeCompare(a.date));

  if (sessions.length < 2) return { status: "neutral", message: "Nicht genug Daten" };

  const values = sessions.map(s => {
    const ex = s.exercises.find(e => e.name === exerciseName);
    if (!ex) return null;

    // Trend is now always based on max weight
    if (Array.isArray(ex.setsArray)) {
      const weights = ex.setsArray.map(s => num(s.weight)).filter(w => w !== null);
      return weights.length > 0 ? Math.max(...weights) : null;
    }
    return num(ex.weight);
  }).filter(v => v !== null && v > 0);

  if (values.length < 2) return { status: "neutral", message: "Zu wenig Daten" };
  
  const current = values[0];
  const previous = values.slice(1, lastN);
  const avgPrevious = previous.reduce((a, b) => a + b, 0) / previous.length;
  
  if (avgPrevious === 0) return { status: "neutral" };

  const pctChange = ((current - avgPrevious) / avgPrevious) * 100;
  if (pctChange > 2)  return { status: "up",      change: pctChange.toFixed(1) };
  if (pctChange < -2) return { status: "down",    change: pctChange.toFixed(1) };
  return                   { status: "neutral", change: pctChange.toFixed(1) };
}

// ── Settings / Layout / Body (from pwa.bak/src/lib/db/user.js) ───────────────

export async function getSettings() {
  const snap = await getDoc(doc(db, "fitness", getUid(), "settings", "general"));
  if (!snap.exists()) return { theme: "honey", themeMode: "manual" };
  return snap.data();
}

export async function saveSettings(settings) {
  await setDoc(doc(db, "fitness", getUid(), "settings", "general"), {
    ...settings,
    updated_at: serverTimestamp(),
  });
  return { ok: true };
}

export async function getLayout() {
  const snap = await getDoc(doc(db, "fitness", getUid(), "settings", "layout"));
  if (!snap.exists()) return null;
  return snap.data()?.layout;
}

export async function saveLayout(layout) {
  await setDoc(doc(db, "fitness", getUid(), "settings", "layout"), {
    layout,
    updated_at: serverTimestamp(),
  });
  return { ok: true };
}

export async function getBodyEntry(date) {
  const snap = await getDoc(doc(db, "fitness", getUid(), "body", date));
  if (!snap.exists()) return null;
  return snap.data();
}

export async function saveBodyEntry(date, data) {
  await setDoc(doc(db, "fitness", getUid(), "body", date), {
    ...data,
    date,
    saved_at: serverTimestamp(),
  });
  return { ok: true };
}

export async function getBodyEntries(days = 30) {
  const q = query(
    collection(db, "fitness", getUid(), "body"),
    orderBy("date", "desc"),
    limit(days),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

// ── Export + Quick parser (from pwa.bak/src/lib/db/utils.js) ─────────────────

export async function exportCsv(days = 14) {
  const today = new Date();
  const dates = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  const rows = [["date", "block", "exercise", "sets", "reps", "weight", "note", "effort"]];
  for (const date of dates) {
    const sess = await getSession(date);
    const block = sess?.block || "";
    const effort = sess?.effort ?? "";
    for (const ex of (sess?.exercises || [])) {
      rows.push([date, block, ex.name || "", ex.sets || "", ex.reps || "", ex.weight || "", ex.note || "", effort]);
    }
  }
  const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  downloadText(`fitness-${days}d-${todayISO()}.csv`, csv, "text/csv;charset=utf-8");
}

export function parseQuick(raw) {
  if (!raw?.trim()) return null;
  const name = raw.replace(/[\d@x\s].*/i, "").trim() || raw.trim();
  const setsMatch = raw.match(/(\d+)\s*[xX×]\s*(\d+)/);
  const weightMatch = raw.match(/@(\d+(?:\.\d+)?)/);
  const rpeMatch = raw.match(/rpe\s*(\d+(?:\.\d+)?)/i);
  const count = setsMatch ? parseInt(setsMatch[1]) : 1;
  const reps = setsMatch ? setsMatch[2] : "";
  const weight = weightMatch ? weightMatch[1] : "";
  return {
    name,
    setsArray: Array.from({ length: count }, () => ({ reps, weight })),
    note: rpeMatch ? `RPE ${rpeMatch[1]}` : "",
    primaryMuscles: [], secondaryMuscles: [],
    done: true,
  };
}

export async function queueForEnrichment(ex) {
  // In Firebase mode: Firestore inbox (already handled via sendToInbox for new exercises)
  if (!ex || ex.source === 'expert') return
  // fire-and-forget to local catalog server if available
  try {
    await fetch('http://localhost:9120/inbox/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exercise_id: ex.id || ex.exercise_id, name: ex.name || ex.display_name }),
    })
  } catch {}
}

const FAV_KEY = 'fitness_favourites'
export function getFavourites() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]') } catch { return [] }
}
export function toggleFavourite(exerciseId) {
  const favs = getFavourites()
  const idx = favs.indexOf(exerciseId)
  const next = idx >= 0 ? favs.filter(f => f !== exerciseId) : [...favs, exerciseId]
  localStorage.setItem(FAV_KEY, JSON.stringify(next))
  return next.includes(exerciseId)
}
