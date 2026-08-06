/**
 * firestore/sessions.js — Session and Plan CRUD for Firestore.
 * Inbox-CRUD lebt in ./inbox.js.
 */

import {
  collection, doc, setDoc, getDoc, getDocs, deleteDoc,
  query, where, orderBy, limit, serverTimestamp,
} from "firebase/firestore";

import { db } from "../../../firebase.js";
import { todayISO } from "../shared/utils.js";
import { getUid, pingBridge } from "./core.js";
import { getAllExercises } from "./kb.js";
import { updateAnalyticsDoc } from "./analysis.js";

// ── Sessions ──────────────────────────────────────────────────────────────────

function hasTrainingSignal(ex) {
  if (!ex || typeof ex !== "object") return false;
  if (ex.done) return true;
  if (Number(ex.sets) > 0 || Number(ex.reps) > 0 || Number(ex.weight) > 0) return true;
  if (Array.isArray(ex.setsArray)) {
    return ex.setsArray.some(s => Number(s?.reps) > 0 || Number(s?.weight) > 0);
  }
  return false;
}

function isActivityOnly(sessionData) {
  const exercises = Array.isArray(sessionData?.exercises) ? sessionData.exercises : [];
  return !!sessionData?.activity && !exercises.some(hasTrainingSignal);
}

function sameActivity(a, b) {
  return String(a?.type || "") === String(b?.type || "")
    && String(a?.duration || "") === String(b?.duration || "")
    && String(a?.notes || "") === String(b?.notes || "")
    && String(a?.swimStyle || "") === String(b?.swimStyle || "")
    && String(a?.muscleTarget || "") === String(b?.muscleTarget || "");
}

function mergeActivityAddon(base, incoming, sourceId = null) {
  const activity = incoming?.activity;
  if (!activity) return base || {};
  const merged = { ...(base || {}) };
  const entry = { ...activity };
  if (sourceId) entry._source_id = sourceId;

  const addons = Array.isArray(merged.activityAddons)
    ? merged.activityAddons.filter(Boolean).map(a => ({ ...a }))
    : [];
  if (merged.activity && !addons.some(a => sameActivity(a, merged.activity))) {
    addons.unshift({ ...merged.activity });
  }
  if (!addons.some(a => sameActivity(a, entry))) addons.push(entry);

  merged.activityAddons = addons;
  if (!merged.activity) merged.activity = addons[0];
  const exercises = Array.isArray(merged.exercises) ? merged.exercises : [];
  if (!exercises.some(hasTrainingSignal)) {
    merged.sessionMode = "cardio";
    merged.exercises = exercises;
    merged.activity = addons[0];
  }
  return merged;
}

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
  if (isActivityOnly(sessionData)) {
    const canonicalRef = doc(db, "fitness", getUid(), "sessions", date);
    const canonicalSnap = await getDoc(canonicalRef);
    const base = canonicalSnap.exists()
      ? canonicalSnap.data() || {}
      : { ...sessionData, exercises: [] };
    const merged = mergeActivityAddon(base, sessionData, id);
    await setDoc(canonicalRef, {
      ...merged,
      date,
      session_id: null,
      saved_at: serverTimestamp(),
    });
    if (id) {
      await deleteDoc(doc(db, "fitness", getUid(), "sessions", `${date}__${id}`));
    }
    pingBridge();
    updateAnalyticsDoc();
    return { ok: true, id: null, merged: true };
  }

  const targetId = id ? `${date}__${id}` : date;
  await setDoc(doc(db, "fitness", getUid(), "sessions", targetId), {
    ...sessionData,
    date,
    session_id: id || null,
    saved_at: serverTimestamp(),
  });
  pingBridge();
  updateAnalyticsDoc(); // fire-and-forget
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
      saved_at: data.saved_at?.toDate?.()?.toISOString() || data.saved_at || null,
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

export async function getSessionHistory(days = 90) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffISO = cutoff.toISOString().slice(0, 10);

  const q = query(
    collection(db, "fitness", getUid(), "sessions"),
    where("date", ">=", cutoffISO),
    orderBy("date", "desc"),
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

// Stub — Fuel/Nutrition lives in a separate repo/Firestore layer.
export async function getMealsHistory(_limit) { return []; }

// ── Plan ──────────────────────────────────────────────────────────────────────

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
      { name: "main_chest_press",        choose_from: ["041","104"] },
      { name: "secondary_press",         choose_from: ["045","023"] },
      { name: "shoulder_press_or_raise", choose_from: ["022","301"] },
      { name: "chest_isolation",         choose_from: ["103","pec_deck"] },
      { name: "triceps_isolation",       choose_from: ["502","503"] },
    ]},
    pull_day: { slots: [
      { name: "vertical_pull",              choose_from: ["020","021","201"] },
      { name: "horizontal_pull",            choose_from: ["042","043","044"] },
      { name: "secondary_row_or_pulldown",  choose_from: ["201","043","044"] },
      { name: "rear_delt_or_face_pull",     choose_from: ["302","303"] },
      { name: "biceps_movement",            choose_from: ["504","505","506","507"] },
    ]},
    legs_day: { slots: [
      { name: "main_squat",         choose_from: ["061","060","062"] },
      { name: "main_hinge",         choose_from: ["081","080","082"] },
      { name: "unilateral_or_machine", choose_from: ["063","064","062"] },
      { name: "hamstring_isolation", choose_from: ["402","082"] },
      { name: "calves",             choose_from: ["701"] },
      { name: "core_optional",      choose_from: ["601","602","603","604","605","606"] },
    ]},
  },
};

const DOW_FALLBACK = {
  Mo: { block: "Push",      exercises: ["Incline Dumbbell Press","Dips","Lateral Raise","Cable Fly","Triceps Extension"] },
  Di: { block: "Pull",      exercises: ["Pull-Up","Row","Lat Pulldown","Face Pull","Biceps Curl"] },
  Mi: { block: "Legs",      exercises: ["Squat","Romanian Deadlift","Lunge","Leg Curl","Calf Raise"] },
  Do: { block: "Upper",     exercises: ["Bench Press","Row","Overhead Press","Pulldown","Curl"] },
  Fr: { block: "Lower",     exercises: ["Deadlift","Split Squat","Hip Thrust","Leg Curl","Calf Raise"] },
  Sa: { block: "Full Body", exercises: ["Squat","Press","Row","Hinge","Carry"] },
  So: { block: "Recovery",  exercises: ["Mobility","Walk","Core Breathing"] },
};

function dowSuggestionForDate(dateStr) {
  const safe = (typeof dateStr === "string" && /^\d{4}-\d{2}-\d{2}/.test(dateStr))
    ? dateStr
    : new Date().toISOString().slice(0, 10);
  const dow = ["So","Mo","Di","Mi","Do","Fr","Sa"][new Date(safe + "T12:00:00").getDay()];
  const f = DOW_FALLBACK[dow] || DOW_FALLBACK.So;
  return { day: dow, block: f.block, exercises: f.exercises };
}

export async function getPlanSuggestion(arg) {
  if (typeof arg === "string" || arg == null) {
    return dowSuggestionForDate(arg);
  }
  const { template, goal, day } = arg;
  const templateName = template?.trim() || (day ? `${day.trim()}_day` : "") || PROGRAM_RULES.default_split;
  const templateDef = PROGRAM_RULES.templates[templateName];
  if (!templateDef) return null;

  const exercises = await getAllExercises();
  const byId = Object.fromEntries(exercises.map((e) => [e.exercise_id || e.id, e]));
  const exerciseIds = new Set(Object.keys(byId));

  const selected = new Set();
  const slots = templateDef.slots.map((slot) => {
    const available = slot.choose_from.filter((id) => exerciseIds.has(id) && !selected.has(id));
    const pick = available[0] || null;
    if (pick) selected.add(pick);
    return { name: slot.name, choose_from: slot.choose_from, selected_exercise: pick };
  });

  const ROLE_WEIGHTS = { primary: 1.0, secondary: 0.5, stabilizer: 0.2 };
  const DEFAULT_SETS = 1;
  const DEFAULT_RPE = 8;

  const resolvedExercises = [...selected].map((id) => {
    const ex = byId[id];
    if (!ex) return null;
    return {
      ...ex,
      id: ex.exercise_id || ex.id,
      name: ex.display_name || ex.german || ex.name || id,
      primaryMuscles:   ex.primary_muscles   || ex.primaryMuscles   || [],
      secondaryMuscles: ex.secondary_muscles || ex.secondaryMuscles || [],
      stabilizers: ex.stabilizers || [],
    };
  }).filter(Boolean);

  const muscle_scores = {};
  const body_region_scores = {};
  for (const ex of resolvedExercises) {
    const addScore = (muscles, weight) => {
      for (const m of muscles) {
        const key = m.toLowerCase().replace(/\s+/g, "_");
        muscle_scores[key] = (muscle_scores[key] || 0) + DEFAULT_SETS * weight;
        body_region_scores[key] = (body_region_scores[key] || 0) + DEFAULT_SETS * weight;
      }
    };
    addScore(ex.primaryMuscles || [], ROLE_WEIGHTS.primary);
    addScore(ex.secondaryMuscles || [], ROLE_WEIGHTS.secondary);
    addScore(ex.stabilizers || [], ROLE_WEIGHTS.stabilizer);
  }

  const round2 = (v) => Math.round(v * 100) / 100;
  const coverage_summary = {
    sets: DEFAULT_SETS, rpe: DEFAULT_RPE,
    selected_exercises: resolvedExercises.map((ex) => ({ exercise: ex.exercise_id || ex.id, sets: DEFAULT_SETS, rpe: DEFAULT_RPE })),
    muscle_scores: Object.fromEntries(Object.entries(muscle_scores).sort().map(([k, v]) => [k, round2(v)])),
    body_region_scores: Object.fromEntries(Object.entries(body_region_scores).sort().map(([k, v]) => [k, round2(v)])),
    unmapped_muscles: [],
  };

  return { ok: true, template: templateName, goal: goal || null, slots, exercises: resolvedExercises, coverage_summary };
}

// Inbox-Funktionen (getInbox, getGlobalInbox, approveInbox, reenrichInbox,
// deleteInbox, sendToInbox, queueForEnrichment) leben jetzt in ./inbox.js.

// ── Misc ──────────────────────────────────────────────────────────────────────

export async function exportFitnessData(_payload) { return null; }
export async function getConfig() { return { ok: true, source: "firestore" }; }
