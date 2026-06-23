import {
  collection, doc, getDoc, getDocs,
  query, orderBy, limit, serverTimestamp, setDoc,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithPopup, getRedirectResult,
  signOut as fbSignOut,
} from "firebase/auth";
import { db, auth, googleProvider } from "./firebase.js";

export { db, auth };

export function isLocalMode() { return false; }

export function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getUid() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Nicht eingeloggt");
  return uid;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

let _lastProfileKey = null;

export function watchAuth(callback) {
  getRedirectResult(auth).catch(() => {});
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const profileKey = `${user.uid}:${user.email}:${user.displayName}`;
      if (profileKey !== _lastProfileKey) {
        _lastProfileKey = profileKey;
        try {
          await setDoc(doc(db, "fitness", user.uid, "profile", "metadata"), {
            email: user.email || "",
            displayName: user.displayName || "",
            updated_at: serverTimestamp(),
          }, { merge: true });
        } catch (e) {
          console.error("Profile sync error:", e);
        }
      }
    }
    callback?.(user);
  });
}

export async function signIn() {
  await signInWithPopup(auth, googleProvider);
}

export async function signOut() { await fbSignOut(auth); }

// ── Sessions (nur Latest für Learn-Kontext) ───────────────────────────────────

export async function getLatestSession() {
  const q = query(
    collection(db, "fitness", getUid(), "sessions"),
    orderBy("date", "desc"),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const data = snap.docs[0].data() || {};
  return {
    ...data,
    exercises: Array.isArray(data.exercises) ? data.exercises : [],
  };
}

// ── Knowledge Base ────────────────────────────────────────────────────────────

export async function getAllExercises() {
  const snap = await getDocs(collection(db, "fitness", "kb", "exercises"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
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

export async function getConfig() { return { ok: true, source: "firestore" }; }

export async function exportFitnessData() { return null; }

// ── Plan Suggestion (für PlanBuilder-Komponente) ──────────────────────────────

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
      { name: "vertical_pull",           choose_from: ["020","021","201"] },
      { name: "horizontal_pull",         choose_from: ["042","043","044"] },
      { name: "secondary_row_or_pulldown", choose_from: ["201","043","044"] },
      { name: "rear_delt_or_face_pull",  choose_from: ["302","303"] },
      { name: "biceps_movement",         choose_from: ["504","505","506","507"] },
    ]},
    legs_day: { slots: [
      { name: "main_squat",              choose_from: ["061","060","062"] },
      { name: "main_hinge",              choose_from: ["081","080","082"] },
      { name: "unilateral_or_machine",   choose_from: ["063","064","062"] },
      { name: "hamstring_isolation",     choose_from: ["402","082"] },
      { name: "calves",                  choose_from: ["701"] },
      { name: "core_optional",           choose_from: ["601","602","603","604","605","606"] },
    ]},
  },
};

function buildCoverageSummary(exercises) {
  const muscle_scores = {};
  const body_region_scores = {};
  const ROLE_WEIGHTS = { primary: 1.0, secondary: 0.5, stabilizer: 0.2 };
  for (const ex of exercises) {
    const addScore = (muscles, weight) => {
      for (const m of muscles) {
        const key = m.toLowerCase().replace(/\s+/g, '_');
        muscle_scores[key] = (muscle_scores[key] || 0) + weight;
        body_region_scores[key] = (body_region_scores[key] || 0) + weight;
      }
    };
    addScore(ex.primaryMuscles || [], ROLE_WEIGHTS.primary);
    addScore(ex.secondaryMuscles || [], ROLE_WEIGHTS.secondary);
    addScore(ex.stabilizers || [], ROLE_WEIGHTS.stabilizer);
  }
  const round2 = v => Math.round(v * 100) / 100;
  return {
    sets: 1, rpe: 8,
    selected_exercises: exercises.map(ex => ({ exercise: ex.exercise_id || ex.id, sets: 1, rpe: 8 })),
    muscle_scores: Object.fromEntries(Object.entries(muscle_scores).sort().map(([k, v]) => [k, round2(v)])),
    body_region_scores: Object.fromEntries(Object.entries(body_region_scores).sort().map(([k, v]) => [k, round2(v)])),
  };
}

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
      stabilizers: ex.stabilizers || [],
    };
  }).filter(Boolean);

  return { ok: true, template: templateName, goal: goal || null, slots, exercises: resolvedExercises, coverage_summary: buildCoverageSummary(resolvedExercises) };
}

export async function queueForEnrichment(ex) {
  if (!ex || ex.source === 'expert') return;
  try {
    await fetch('http://localhost:9120/inbox/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exercise_id: ex.id || ex.exercise_id, name: ex.name || ex.display_name }),
    });
  } catch {}
}
