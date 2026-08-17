import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import Database from "better-sqlite3";
import pino from "pino";
import { buildPlan, exportSessionMarkdown, exportWithPython, fitnessData, getWeeklySummary, obsidianTargetPath, searchExercises } from "./fitness-runtime.mjs";
import { mirrorSession, mirrorSessionDelete, mirrorJournal, getFirestoreStatus, readJournalFull, listJournals, pullAllSessions } from "./firestore-mirror.mjs";

// pino-pretty IMMER aktiv, auch unter systemd/journalctl — das ist der
// tatsächliche Haupt-Log-Weg hier (nicht nur `npm run dev` im Terminal).
// Rohes JSON war unter journalctl deutlich unlesbarer als die alten
// console.log-Zeilen. Farbe bleibt an (journalctl rendert ANSI im Terminal
// sauber), kein translateTime — journalctl stempelt eh schon, ein zweiter
// Timestamp war nur Redundanz ohne Mehrwert.
const log = pino({
  transport: {
    target: "pino-pretty",
    options: { colorize: true, ignore: "pid,hostname,time" },
  },
});

// firebase-admin/undici haben beim Boot ein bekanntes, nicht-deterministisches
// Stream-Close-Race (ERR_INVALID_STATE), das den ganzen Prozess mitreißt, weil
// es außerhalb jedes try/catch als uncaughtException landet (siehe
// notifyPythonSync + Firestore-Watcher-Kommentare unten für dieselbe Bug-Klasse,
// dort zeitbasiert umschifft — das reicht nicht immer, siehe 2026-08-15 Rückfall).
// Statt zu raten wie lange "warm genug" ist: diese spezifische, bekannt harmlose
// Race gezielt abfangen statt den Prozess sterben zu lassen. Alles andere crasht
// weiterhin normal.
process.on("uncaughtException", (err) => {
  if (err?.code === "ERR_INVALID_STATE" && /ReadableStream is already closed/.test(err?.message || "")) {
    log.warn(`[undici-race] bekanntes Boot-Race abgefangen, Prozess läuft weiter: ${err.message}`);
    return;
  }
  log.error({ err }, "[uncaughtException] unbekannt, Prozess beendet sich");
  process.exit(1);
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveUid() {
  if (process.env.FITNESS_UID) return process.env.FITNESS_UID;
  const uidFile = path.join(os.homedir(), ".aos", "users", ".active-uid");
  try { return fs.readFileSync(uidFile, "utf-8").trim(); } catch {}
  return "59ole36uNpNwml5H6VDYCXyCME92";
}

const FITNESS_UID = resolveUid();
const DATA_DIR   = path.join(os.homedir(), ".aos", "users", FITNESS_UID, "fitness");
const PUBLIC_DIR = path.join(__dirname, "public");
const DIST_DIR   = path.join(__dirname, "dist");
const STATIC_DIR = process.env.FITNESS_STATIC_DIR ? path.resolve(process.env.FITNESS_STATIC_DIR) : (fs.existsSync(DIST_DIR) ? DIST_DIR : PUBLIC_DIR);
const PORT       = Number(process.env.PORT || (process.env.NODE_ENV === 'production' ? 6100 : 9100));
const HOST       = process.env.HOST || "127.0.0.1";
const PYTHON_PORT = Number(process.env.FITNESS_PYTHON_PORT || 9150);
const PYTHON_BASE = `http://127.0.0.1:${PYTHON_PORT}`;
const BODY_DIR = path.join(DATA_DIR, "body");

for (const d of ["sessions", "journal"]) fs.mkdirSync(path.join(DATA_DIR, d), { recursive: true });

// ── SQLite dual-write ─────────────────────────────────────────────────────────
const DB_PATH = path.join(DATA_DIR, "sessions", "training_history.sqlite");
const db = new Database(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS training_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    session_id TEXT,
    workout_id TEXT NOT NULL,
    exercise_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    sets INTEGER NOT NULL DEFAULT 0,
    reps INTEGER NOT NULL DEFAULT 0,
    weight REAL NOT NULL DEFAULT 0,
    rpe INTEGER NOT NULL DEFAULT 0,
    done INTEGER NOT NULL DEFAULT 0,
    notes TEXT NOT NULL DEFAULT '',
    pain TEXT NOT NULL DEFAULT '',
    completion_status TEXT NOT NULL DEFAULT 'completed'
  );
  CREATE INDEX IF NOT EXISTS idx_th_exercise_date
    ON training_history(exercise_id, date DESC, id DESC);
`);

try {
  db.exec("ALTER TABLE training_history ADD COLUMN session_id TEXT");
} catch (e) {
  // Column already exists or table was just created with the column
}

const stmtInsertEntry = db.prepare(`
  INSERT INTO training_history
    (date, session_id, workout_id, exercise_id, display_name, sets, reps, weight, rpe, done, notes, completion_status)
  VALUES
    (@date, @session_id, @workout_id, @exercise_id, @display_name, @sets, @reps, @weight, @rpe, @done, @notes, @completion_status)
`);

function deleteSessionFromDb(date, sessionId = null) {
  if (sessionId) {
    db.prepare("DELETE FROM training_history WHERE date = ? AND session_id = ?").run(date, sessionId);
  } else {
    db.prepare("DELETE FROM training_history WHERE date = ? AND (session_id IS NULL OR session_id = '')").run(date);
  }
}

function syncSessionToDb(date, session) {
  const block = session.block || "";
  const sessionId = session.session_id || null;
  db.transaction(() => {
    if (sessionId) {
      db.prepare("DELETE FROM training_history WHERE date = ? AND session_id = ?").run(date, sessionId);
    } else {
      db.prepare("DELETE FROM training_history WHERE date = ? AND (session_id IS NULL OR session_id = '')").run(date);
    }
    for (const ex of (session.exercises || [])) {
      stmtInsertEntry.run({
        date,
        session_id:        sessionId,
        workout_id:        block,
        exercise_id:       ex.exercise_id || ex.id || "",
        display_name:      ex.name || ex.exercise_id || ex.id || "",
        sets:              Number(ex.sets)   || 0,
        reps:              Number(ex.reps)   || 0,
        weight:            Number(ex.weight) || 0,
        rpe:               Number(ex.rpe)    || 0,
        done:              ex.done ? 1 : 0,
        notes:             ex.note || "",
        completion_status: ex.done ? "completed" : "pending",
      });
    }
  })();
}

// ── Python sync_gateway — fire-and-forget nach Session-Write ─────────────────
async function notifyPythonSync(date, session, uid = FITNESS_UID, sessionId = null) {
  try {
    const res = await fetch(`${PYTHON_BASE}/internal/sync/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, session, uid, session_id: sessionId }),
      signal: AbortSignal.timeout(3000),
    });
    // Body IMMER konsumieren, sonst race zwischen AbortSignal.timeout()-Cleanup
    // und undicis interner Stream-Close-Logik → ERR_INVALID_STATE crashed den
    // ganzen Prozess (unhandled, außerhalb dieses try/catch). Body-Inhalt hier
    // irrelevant, nur das Draining zählt.
    await res.text().catch(() => {});
  } catch {
    // fire-and-forget — Python-Backend nicht zwingend erreichbar
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function readJson(p, fallback = null) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return fallback; }
}
function writeJson(p, data) { fs.writeFileSync(p, JSON.stringify(data, null, 2)); }

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function lastDates(days) {
  const out = [];
  const base = new Date(localToday() + "T12:00:00");
  for (let i = 0; i < days; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }
  return out;
}

function escapeCsvValue(v) {
  return String(v ?? "").replaceAll('"', '""');
}
// wger-client.mjs wird erst per dynamic import() geladen, wenn der erste
// echte Fallback-Aufruf nötig ist (lokaler Katalog liefert nichts) — kein
// Boot-Ping, kein Token im Hauptmodul. wger ist meist offline, das Modul
// hat dafür einen eigenen Cooldown (siehe wger-client.mjs).
let _wgerClient = null;
async function wgerClient() {
  if (!_wgerClient) _wgerClient = await import("./wger-client.mjs");
  return _wgerClient;
}
async function fetchWger(wgerPath, qs = "") {
  return (await wgerClient()).fetchWger(wgerPath, qs);
}
async function postWger(wgerPath, body) {
  return (await wgerClient()).postWger(wgerPath, body);
}

function normMuscleKey(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function muscleToGroupId(muscleName) {
  const k = normMuscleKey(muscleName);
  if (!k) return null;
  const MAP = {
    chest:      ["chest","pec","pecs","pectoralis","pectoralis major","pectoralis minor","100_chest","101_pectoralis","102_pectoralis","103_pectoralis"],
    back:       ["back","lat","lats","latissimus","latissimus dorsi","trapezius","traps","rhomboids","rhomboid","lower back","erector spinae","erector","200_back","201_latissimus","202_trapezius","203_trapezius","204_trapezius","205_rhomboids","206_erector_spinae","206_erector","207_teres","208_quadratus"],
    shoulders:  ["shoulder","shoulders","delt","delts","deltoid","deltoids","anterior deltoid","posterior deltoid","lateral deltoid","rotator cuff","300_shoulders","301_anterior_deltoid","302_lateral_deltoid","303_posterior_deltoid","304_rotator"],
    arms:       ["arm","arms","biceps","biceps brachii","triceps","triceps brachii","forearms","forearm","brachialis","400_arms","401_biceps","402_brachialis","403_triceps","404_brachioradialis","405_forearm","406_anconeus"],
    core:       ["core","abs","abdominals","rectus abdominis","obliques","obliquus externus abdominis","oblique","transverse abdominis","500_core","501_rectus","502_obliques","503_transverse"],
    glutes:     ["glutes","glute","gluteus maximus","gluteus medius","gluteus minimus","601_gluteus_maximus","601_gluteus","602_gluteus_medius","602_gluteus"],
    quads:      ["quads","quad","quadriceps","quadriceps femoris","vastus lateralis","vastus medialis","rectus femoris","603_quadriceps"],
    hamstrings: ["hamstrings","hamstring","biceps femoris","semitendinosus","semimembranosus","604_hamstrings"],
    calves:     ["calves","calf","gastrocnemius","soleus","700_calves","701_gastrocnemius","702_soleus","triceps surae"],
  };
  for (const [id, keys] of Object.entries(MAP)) {
    if (keys.some(x => k.includes(x))) return id;
  }
  return null;
}

function displayMuscleName(s) {
  return String(s || "").trim().replace(/\s+/g, " ");
}

function defaultBlocks() {
  return [
    { id: "push",  label: "Push",  muscle_groups: ["chest", "shoulders", "arms"] },
    { id: "pull",  label: "Pull",  muscle_groups: ["back", "arms"] },
    { id: "legs",  label: "Legs",  muscle_groups: ["quads", "hamstrings", "glutes", "calves"] },
    { id: "upper", label: "Upper", muscle_groups: ["chest", "back", "shoulders", "arms"] },
    { id: "lower", label: "Lower", muscle_groups: ["quads", "hamstrings", "glutes", "calves"] },
  ];
}

function computeCoverage(days) {
  const allDates = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(localToday() + "T12:00:00");
    d.setDate(d.getDate() - i);
    allDates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }
  const hits = {};
  for (const date of allDates) {
    const sess = readJson(path.join(DATA_DIR, "sessions", `${date}.json`));
    for (const ex of (sess?.exercises || [])) {
      const pm = ex.primary_muscles || ex.primaryMuscles || [];
      const sm = ex.secondary_muscles || ex.secondaryMuscles || [];
      const st = ex.stabilizers || [];
      for (const m of pm) { const id = muscleToGroupId(m) || normMuscleKey(m); if (id) hits[id] = (hits[id] || 0) + 1; }
      for (const m of sm) { const id = muscleToGroupId(m) || normMuscleKey(m); if (id) hits[id] = (hits[id] || 0) + 0.5; }
      for (const m of st) { const id = muscleToGroupId(m) || normMuscleKey(m); if (id) hits[id] = (hits[id] || 0) + 0.2; }
    }
    // Activity addon: muscles bereits beim Speichern aufgelöst (activity.muscles[])
    for (const m of (sess?.activity?.muscles || [])) {
      hits[m] = (hits[m] || 0) + 0.5;
    }
  }
  return hits;
}

function computeCoverageAnatomy(days) {
  const allDates = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(localToday() + "T12:00:00");
    d.setDate(d.getDate() - i);
    allDates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }
  const map = new Map();
  function hit(name, w, kind) {
    const key = normMuscleKey(name);
    if (!key) return;
    const cur = map.get(key) || { name_en: displayMuscleName(name), primaryHits: 0, secondaryHits: 0, totalScore: 0 };
    if (kind === "primary")   cur.primaryHits   += w;
    if (kind === "secondary") cur.secondaryHits += w;
    cur.totalScore += w;
    const label = displayMuscleName(name);
    if (label.length > (cur.name_en || "").length) cur.name_en = label;
    map.set(key, cur);
  }
  for (const date of allDates) {
    const sess = readJson(path.join(DATA_DIR, "sessions", `${date}.json`));
    for (const ex of (sess?.exercises || [])) {
      const pm = ex.primary_muscles || ex.primaryMuscles || [];
      const sm = ex.secondary_muscles || ex.secondaryMuscles || [];
      const st = ex.stabilizers || [];
      for (const m of pm) hit(m, 1,   "primary");
      for (const m of sm) hit(m, 0.5, "secondary");
      for (const m of st) hit(m, 0.2, "secondary");
    }
    for (const m of (sess?.activity?.muscles || [])) hit(m, 0.5, "secondary");
  }
  return Array.from(map.values()).sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
}

// ═════════════════════════════════════════════════════════════════════════════
const app = new Hono();

app.use("*", async (c, next) => {
  c.res.headers.set("Access-Control-Allow-Origin", "*");
  await next();
});

app.options("*", (c) => c.body(null, 204));

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/health", (c) =>
  c.json({ ok: true, port: PORT, uptime: Math.floor(process.uptime()) })
);

// ── Exercise search ───────────────────────────────────────────────────────────
app.get("/exercises/search", async (c) => {
  const q     = c.req.query("q")     || "";
  const limit = Math.min(Number(c.req.query("limit") || 12), 50);
  if (q.length < 1) return c.json({ ok: true, results: [] });
  const local = await searchExercises(q, limit);
  if (local?.results?.length) return c.json(local);
  if (q.length < 2) return c.json({ ok: true, results: [] });
  const data = await fetchWger("/exerciseinfo/", `limit=${limit}&name__search=${encodeURIComponent(q)}&language=2`);
  const results = (data.results || []).map(e => {
    const trans = (e.translations || []).find(t => t.language === 2) || (e.translations || [])[0] || {};
    return {
      id:               `wger_${e.id}`, // Präfix + numerische ID, muss zu importer.py (safe_id = f"wger_{item.id}") passen
      name:             trans.name || "",
      category:         e.category?.name || "",
      primaryMuscles:   (e.muscles           || []).map(m => m.name_en || m.name).filter(Boolean),
      secondaryMuscles: (e.muscles_secondary || []).map(m => m.name_en || m.name).filter(Boolean),
      wger_muscle_ids: {
        primary:   (e.muscles           || []).map(m => m.id),
        secondary: (e.muscles_secondary || []).map(m => m.id),
      },
      source: "wger",
    };
  }).filter(e => e.name);
  return c.json({ ok: true, source: "wger", results });
});

// ── Exercises by muscle group ─────────────────────────────────────────────────
app.get("/exercises/by-group", async (c) => {
  const group = c.req.query("group") || "";
  // Delegating search logic to agent if possible, but keeping local filter for now
  const normalized = group.toLowerCase().replace(/\s+/g, "_");
  const local = (fitnessData.exercises || []).filter(ex => {
    const primary   = (ex.primary_muscles   || []).map(x => String(x || "").toLowerCase());
    const secondary = (ex.secondary_muscles || []).map(x => String(x || "").toLowerCase());
    const tags      = (ex.tags              || []).map(x => String(x || "").toLowerCase());
    const haystack  = [...primary, ...secondary, ...tags, String(ex.category || "").toLowerCase()];
    return haystack.includes(group.toLowerCase()) || haystack.includes(normalized);
  }).map(ex => ({
    id:       ex.exercise_id,
    name_en:  ex.display_name || ex.name || ex.exercise_id,
    relevance:"primary",
  }));

  if (local.length) return c.json({ ok: true, exercises: local });

  const mappings = fitnessData.wgerMapping?.mappings || {};
  const wgerIds  = Object.entries(mappings).filter(([, id]) => id === group).map(([wId]) => wId);

  let data;
  if (wgerIds.length) {
    data = await fetchWger("/exerciseinfo/", `limit=20&language=2&${wgerIds.map(id => `muscles=${id}`).join("&")}`);
  } else {
    data = await fetchWger("/exerciseinfo/", `limit=20&muscles__name_en__icontains=${encodeURIComponent(group)}&language=2`);
  }
  const exercises = (data.results || []).map(e => {
    const trans = (e.translations || []).find(t => t.language === 2) || (e.translations || [])[0] || {};
    return { id: `wger_${e.id}`, name_en: trans.name || "", relevance: "primary", source: "wger" };
  }).filter(e => e.name_en);
  return c.json({ ok: true, exercises });
});

// ── Exercise teaching (anatomy-kb → catalog/kb/anatomy_teaching) ─────────────
app.get("/exercise/:id/teaching", async (c) => {
  const id = c.req.param("id");
  try {
    const res = await fetch(`${PYTHON_BASE}/exercise/${id}`);
    const data = await res.json();
    if (!data || !data.lesson) return c.json({ ok: false, error: "no_lesson" }, 404);
    return c.json({ ok: true, lesson: data.lesson });
  } catch (err) {
    return c.json({ ok: false, error: "agent_unreachable" }, 502);
  }
});

// ── Inbox Management ─────────────────────────────────────────────────────────
app.get("/fitness/clients", (c) => {
  const usersDir = path.join(os.homedir(), ".aos", "fitness", "users");
  const klienten = loadKlientenRegistry();
  const clients = Object.entries(klienten).map(([uid, meta]) => ({ uid, name: meta.name, slug: meta.slug }));
  const knownUids = new Set(clients.map(c => c.uid));

  if (!fs.existsSync(usersDir)) return c.json({ ok: true, clients });

  const uids = fs.readdirSync(usersDir).filter(d =>
    fs.statSync(path.join(usersDir, d)).isDirectory() && !["default", "kb"].includes(d) && !knownUids.has(d)
  );

  for (const uid of uids) {
    let name = uid.slice(0, 8);
    const sessDir = path.join(usersDir, uid, "sessions");
    if (fs.existsSync(sessDir)) {
      const files = fs.readdirSync(sessDir).filter(f => f.endsWith(".json")).sort().reverse();
      if (files.length) {
        const lastSess = readJson(path.join(sessDir, files[0]));
        if (lastSess?.user_name) name = lastSess.user_name;
      }
    }
    clients.push({ uid, name });
  }

  return c.json({ ok: true, clients });
});

app.get("/fitness/inbox", async (c) => {
  try {
    const res = await fetch(`${PYTHON_BASE}/fitness/inbox`);
    const data = await res.json();
    return c.json(data);
  } catch (err) {
    return c.json({ ok: false, error: "python_unreachable" }, 502);
  }
});

app.post("/fitness/inbox/queue", async (c) => {
  try {
    const body = await c.req.json();
    const res = await fetch(`${PYTHON_BASE}/fitness/inbox/queue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return c.json(data, res.status);
  } catch (err) {
    return c.json({ ok: false, error: "python_unreachable" }, 502);
  }
});

app.post("/fitness/inbox/:id/approve", async (c) => {
  const id = c.req.param("id");
  try {
    const res = await fetch(`${PYTHON_BASE}/fitness/inbox/${id}/approve`, { method: "POST" });
    const data = await res.json();
    return c.json(data, res.status);
  } catch (err) {
    return c.json({ ok: false, error: "python_unreachable" }, 502);
  }
});

app.delete("/fitness/inbox/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const res = await fetch(`${PYTHON_BASE}/fitness/inbox/${id}`, { method: "DELETE" });
    const data = await res.json();
    return c.json(data, res.status);
  } catch (err) {
    return c.json({ ok: false, error: "python_unreachable" }, 502);
  }
});

// ── Coach Feed (alle Klienten-Workouts) ──────────────────────────────────────
app.get("/fitness/coach/feed", (c) => {
  const usersDir = path.join(os.homedir(), ".aos", "fitness", "users");
  const limit = Number(c.req.query("limit") || 100);
  if (!fs.existsSync(usersDir)) return c.json({ ok: true, feed: [] });

  const uids = fs.readdirSync(usersDir).filter(d =>
    fs.statSync(path.join(usersDir, d)).isDirectory() && !["default", "kb"].includes(d)
  );

  const feed = [];
  for (const uid of uids) {
    const sessDir = path.join(os.homedir(), ".aos", "fitness", "users", uid, "sessions");
    if (!fs.existsSync(sessDir)) continue;
    const files = fs.readdirSync(sessDir).filter(f => f.endsWith(".json") && !f.includes("history"));
    for (const f of files) {
      const data = readJson(path.join(sessDir, f));
      if (!data) continue;
      const date = f.replace(".json", "");
      feed.push({
        id: `${uid}__${date}`,
        userId: uid,
        date: data.date || date,
        exercises: data.exercises || [],
        effort: data.effort ?? null,
        mood: data.mood || "",
        notes: data.notes || "",
        coachFeedback: data.coachFeedback || "",
        type: "workout",
      });
    }
  }

  feed.sort((a, b) => b.date.localeCompare(a.date));
  return c.json({ ok: true, feed: feed.slice(0, limit) });
});

// uid -> { name, slug } aus ~/Klienten/*/client.json (firebase_uid / firebase_uids).
// Das ist die eigentliche SOT für Klientennamen (siehe fitness-sync add-client) —
// vorher riet /fitness/coach/profiles nur aus der letzten Session oder zeigte
// die rohe UID an, obwohl der Klient hier längst mit echtem Namen registriert ist.
function loadKlientenRegistry() {
  const dir = path.join(os.homedir(), "Klienten");
  const registry = {};
  if (!fs.existsSync(dir)) return registry;
  for (const slug of fs.readdirSync(dir)) {
    const cfgPath = path.join(dir, slug, "client.json");
    if (!fs.existsSync(cfgPath)) continue;
    const cfg = readJson(cfgPath);
    if (!cfg) continue;
    const uids = new Set(cfg.firebase_uids || []);
    if (cfg.firebase_uid) uids.add(cfg.firebase_uid);
    for (const uid of uids) {
      if (uid) registry[uid] = { name: cfg.name, slug };
    }
  }
  return registry;
}

app.get("/fitness/coach/profiles", (c) => {
  const usersDir = path.join(os.homedir(), ".aos", "fitness", "users");
  const klienten = loadKlientenRegistry();
  const profiles = {};

  for (const [uid, meta] of Object.entries(klienten)) {
    profiles[uid] = { displayName: meta.name, uid, slug: meta.slug };
  }

  if (!fs.existsSync(usersDir)) return c.json({ ok: true, profiles });

  const uids = fs.readdirSync(usersDir).filter(d =>
    fs.statSync(path.join(usersDir, d)).isDirectory() && !["default", "kb"].includes(d)
  );

  for (const uid of uids) {
    if (profiles[uid]) continue; // Klienten-Registry hat Vorrang
    const sessDir = path.join(os.homedir(), ".aos", "fitness", "users", uid, "sessions");
    let displayName = uid.slice(0, 8);
    if (fs.existsSync(sessDir)) {
      const files = fs.readdirSync(sessDir).filter(f => f.endsWith(".json")).sort().reverse();
      if (files.length) {
        const lastSess = readJson(path.join(sessDir, files[0]));
        if (lastSess?.user_name) displayName = lastSess.user_name;
        else if (lastSess?.user_email) displayName = lastSess.user_email;
      }
    }
    profiles[uid] = { displayName, uid };
  }
  return c.json({ ok: true, profiles });
});

app.post("/fitness/coach/feedback", async (c) => {
  const { userId, sessionId, text } = await c.req.json().catch(() => ({}));
  if (!userId || !sessionId || !text) return c.json({ ok: false, error: "missing fields" }, 400);

  const sessFile = path.join(os.homedir(), ".aos", "fitness", "users", userId, "sessions", `${sessionId.replace(`${userId}__`, "")}.json`);
  if (!fs.existsSync(sessFile)) return c.json({ ok: false, error: "session not found" }, 404);

  const data = readJson(sessFile, {});
  writeJson(sessFile, { ...data, coachFeedback: text, feedbackAt: new Date().toISOString() });
  return c.json({ ok: true });
});

// ── Coach-AssignedPlans (lokal, ~/.aos/fitness/users/<uid>/plans/) ───────────
// Kein Firestore-Only-Stub mehr: Coach baut lokal einen Plan (z.B. via
// /fitness/plan) und pusht ihn hier direkt in den User-Ordner des Klienten.
function clientPlansDir(uid) {
  return path.join(os.homedir(), ".aos", "fitness", "users", uid, "plans");
}

app.get("/fitness/coach/plans/:clientUid", (c) => {
  const clientUid = c.req.param("clientUid");
  const coachUid  = c.req.query("coachUid") || "";
  const dir = clientPlansDir(clientUid);
  if (!fs.existsSync(dir)) return c.json({ ok: true, plans: [] });
  const plans = fs.readdirSync(dir)
    .filter(f => f.endsWith(".json"))
    .map(f => readJson(path.join(dir, f)))
    .filter(p => p && (!coachUid || p.createdBy === coachUid));
  return c.json({ ok: true, plans });
});

app.post("/fitness/coach/plans/:clientUid", async (c) => {
  const clientUid = c.req.param("clientUid");
  const body = await c.req.json().catch(() => ({}));
  const { coachUid, plan } = body;
  if (!coachUid || !plan) return c.json({ ok: false, error: "missing fields" }, 400);

  const dir = clientPlansDir(clientUid);
  fs.mkdirSync(dir, { recursive: true });
  const id = plan.id || `plan_${Date.now()}`;
  const record = {
    ...plan,
    id,
    createdBy: coachUid,
    assignedTo: clientUid,
    assignedAt: new Date().toISOString(),
  };
  writeJson(path.join(dir, `${id}.json`), record);
  return c.json({ ok: true, plan: record });
});

app.get("/fitness/coach/plans/:clientUid/:planId/progress", (c) => {
  const clientUid = c.req.param("clientUid");
  const planId    = c.req.param("planId");
  const plan = readJson(path.join(clientPlansDir(clientUid), `${planId}.json`));
  if (!plan) return c.json({ ok: true, progress: null });

  const today = c.req.query("date") || localToday();
  const completion = readJson(path.join(clientPlansDir(clientUid), planId, "completions", `${today}.json`));
  const exercises  = plan.exercises || [];
  const doneCount  = completion?.doneExerciseIds?.length || 0;

  return c.json({
    ok: true,
    progress: {
      planId,
      planName: plan.name || "Unnamed Plan",
      totalExercises: exercises.length,
      doneExercises: doneCount,
      completionPercentage: exercises.length > 0 ? Math.round((doneCount / exercises.length) * 100) : 0,
      lastUpdate: completion?.completedAt || null,
    },
  });
});

// Klienten-Seite: eigene zugewiesene Pläne lesen + Completions togglen.
app.get("/fitness/plans/assigned", (c) => {
  const uid = c.req.query("uid") || c.req.header("X-User-UID") || FITNESS_UID;
  const dir = clientPlansDir(uid);
  if (!fs.existsSync(dir)) return c.json({ ok: true, plans: [] });
  const plans = fs.readdirSync(dir)
    .filter(f => f.endsWith(".json"))
    .map(f => readJson(path.join(dir, f)))
    .filter(Boolean);
  return c.json({ ok: true, plans });
});

app.post("/fitness/plans/:planId/completions", async (c) => {
  const planId = c.req.param("planId");
  const uid    = c.req.query("uid") || c.req.header("X-User-UID") || FITNESS_UID;
  const body   = await c.req.json().catch(() => ({}));
  const date   = body.date || localToday();

  const dir  = path.join(clientPlansDir(uid), planId, "completions");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${date}.json`);
  const current = readJson(file) || { date, doneExerciseIds: [] };
  const doneSet = new Set(current.doneExerciseIds || []);

  if (Array.isArray(body.doneExerciseIds)) {
    doneSet.clear();
    body.doneExerciseIds.forEach(id => doneSet.add(id));
  } else if (body.exerciseId) {
    if (doneSet.has(body.exerciseId)) doneSet.delete(body.exerciseId);
    else doneSet.add(body.exerciseId);
  }

  const record = { date, doneExerciseIds: [...doneSet], completedAt: new Date().toISOString() };
  writeJson(file, record);
  return c.json({ ok: true, completion: record });
});

// ── Fitness config / search / plan / weekly / export ─────────────────────────
app.get("/fitness/config", (c) =>
  c.json({
    ok:         true,
    config:     fitnessData.config,
    exportPath: obsidianTargetPath(),
    root:       fitnessData.config?.paths?.root || "~/.fitness-agent",
    source:     "local_yaml",
  })
);

app.get("/fitness/search", async (c) => {
  const q       = c.req.query("q")       || "";
  const limit   = Math.min(Number(c.req.query("limit") || 12), 50);
  const sources = c.req.query("sources") || "wger,yuhonas";
  return c.json(await searchExercises(q, limit, sources));
});

app.get("/fitness/exercises/all", (c) => {
  return c.json({ ok: true, exercises: fitnessData.exercises || [] });
});

app.get("/fitness/muscles", async (c) => {
  try {
    const res = await fetch(`${PYTHON_BASE}/fitness/muscles`);
    return c.json(await res.json());
  } catch (err) {
    return c.json({ ok: false, error: "agent_unreachable" }, 502);
  }
});

app.get("/fitness/muscles/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const res = await fetch(`${PYTHON_BASE}/fitness/muscles`);
    const data = await res.json();
    const muscle = data.muscles?.[id];
    if (!muscle) return c.json({ ok: false, error: "not_found" }, 404);
    return c.json(muscle);
  } catch (err) {
    return c.json({ ok: false, error: "agent_unreachable" }, 502);
  }
});

app.get("/fitness/plan", async (c) => {
  const template = c.req.query("template") || "";
  const split    = c.req.query("split")    || "";
  const day      = c.req.query("day")      || "";
  const goal     = c.req.query("goal")     || "";
  return c.json(await buildPlan({ template, split, day, goal }));
});

app.get("/fitness/weekly", async (c) => {
  const week = c.req.query("week") || "current";
  try { return c.json(await getWeeklySummary(week)); }
  catch (e) { return c.json({ ok: false, error: e.message }, 500); }
});

app.post("/fitness/export", async (c) => {
  const data = await c.req.json().catch(() => ({}));
  const kind = String(data.kind || "").trim();
  try {
    if (kind === "session") {
      const result = exportSessionMarkdown(data.session || data);
      return c.json({ ok: true, kind, ...result });
    }
    if (kind === "exercise_sheet") {
      const query = String(data.query || data.exercise_id || "").trim();
      if (!query) return c.json({ ok: false, error: "missing_query" }, 400);
      return c.json({ ok: true, kind, ...await exportWithPython("exercise_sheet", { query, force: !!data.force }) });
    }
    if (kind === "exercise_lesson") {
      const exercise_id = String(data.exercise_id || "").trim();
      if (!exercise_id) return c.json({ ok: false, error: "missing_exercise_id" }, 400);
      return c.json({ ok: true, kind, ...await exportWithPython("exercise_lesson", { exercise_id, mode: data.mode || "trainer", force: !!data.force }) });
    }
    if (kind === "plan") {
      const plan   = data.plan || await buildPlan(data.plan_options || data);
      return c.json({ ok: true, kind, ...await exportWithPython("plan", { plan, force: !!data.force }) });
    }
    if (kind === "weekly") {
      return c.json({ ok: true, kind, ...await exportWithPython("weekly", { week_selector: data.week_selector || "current", force: !!data.force }) });
    }
    return c.json({ ok: false, error: "unknown_export_kind" }, 400);
  } catch (error) {
    return c.json({ ok: false, error: "export_failed", details: String(error?.message || error) }, 500);
  }
});

app.get("/plan/today", (c) => {
  const date = c.req.query("date") || localToday();
  const plan = readJson(path.join(DATA_DIR, "plan.json"));
  const einheiten = (plan && plan.einheiten) || [];

  // Letztes geloggtes Workout ermitteln (block-Feld), unabhängig vom Wochentag.
  const sessionsDir = path.join(DATA_DIR, "sessions");
  const files = fs.existsSync(sessionsDir)
    ? fs.readdirSync(sessionsDir).filter((name) => name.endsWith(".json")).sort().reverse()
    : [];
  let lastBlock = null, lastLoggedAt = null;
  for (const name of files) {
    const sess = readJson(path.join(sessionsDir, name), {});
    if (sess?.block) {
      lastBlock = sess.block;
      lastLoggedAt = sess.date || name.replace(".json", "").split("__")[0];
      break;
    }
  }

  // Rotation statt Wochentag-Matching: nächste Einheit nach der zuletzt geloggten.
  if (einheiten.length) {
    const lastIdx = einheiten.findIndex((e) => e.name === lastBlock);
    const next = einheiten[lastIdx === -1 ? 0 : (lastIdx + 1) % einheiten.length];
    const exercises = (next.abschnitte || []).flatMap((a) => (a.übungen || a.uebungen || []).map((u) => u.name));
    return c.json({ ok: true, suggestion: { block: next.name, exercises, lastBlock, lastLoggedAt } });
  }

  const dow  = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][new Date(date + "T12:00:00").getDay()];
  const fallback = {
    Mo: { block: "Push",      exercises: ["Incline Dumbbell Press", "Dips", "Lateral Raise", "Cable Fly", "Triceps Extension"] },
    Di: { block: "Pull",      exercises: ["Pull-Up", "Row", "Lat Pulldown", "Face Pull", "Biceps Curl"] },
    Mi: { block: "Legs",      exercises: ["Squat", "Romanian Deadlift", "Lunge", "Leg Curl", "Calf Raise"] },
    Do: { block: "Upper",     exercises: ["Bench Press", "Row", "Overhead Press", "Pulldown", "Curl"] },
    Fr: { block: "Lower",     exercises: ["Deadlift", "Split Squat", "Hip Thrust", "Leg Curl", "Calf Raise"] },
    Sa: { block: "Full Body", exercises: ["Squat", "Press", "Row", "Hinge", "Carry"] },
    So: { block: "Recovery",  exercises: ["Mobility", "Walk", "Core Breathing"] },
  }[dow] || { block: "Full Body", exercises: ["Squat", "Press", "Row"] };
  return c.json({ ok: true, suggestion: { day: dow, block: fallback.block, exercises: fallback.exercises, lastBlock, lastLoggedAt } });
});

// ── Blocks ────────────────────────────────────────────────────────────────────
app.get("/blocks", (c) => {
  const plan   = readJson(path.join(DATA_DIR, "plan.json"));
  const blocks = defaultBlocks();
  for (const unit of (plan?.einheiten || [])) {
    const id = String(unit.name || "").trim().toLowerCase().replace(/\s+/g, "_");
    if (!id) continue;
    const label         = String(unit.name || "").trim() || id;
    const muscle_groups = Array.isArray(unit.muscle_groups) ? unit.muscle_groups : [];
    const existing      = blocks.find(b => b.id === id);
    if (existing) {
      existing.label         = label || existing.label;
      existing.muscle_groups = [...new Set([...(existing.muscle_groups || []), ...muscle_groups])];
    } else {
      blocks.push({ id, label, muscle_groups });
    }
  }
  return c.json({ ok: true, blocks });
});

// ── Routines / Workouts ───────────────────────────────────────────────────────
// Reine Proxies zu fitness-api (Python, :9150) — Node hält hier absichtlich
// keine eigene Logik/keinen eigenen Datenschreiber mehr (war vorher
// routines.json/workouts.json direkt in Node gelesen/geschrieben, parallel
// zum späteren Python-Äquivalent möglich → zwei unabhängige Writer auf
// dieselbe Datei). Alles Neue kommt nur noch in fitness/api/routers/*.py.
async function proxyToPython(c, pythonPath) {
  const qs = c.req.query();
  const search = new URLSearchParams(qs).toString();
  const url = `${PYTHON_BASE}${pythonPath}${search ? `?${search}` : ""}`;
  const init = { method: c.req.method, headers: {} };
  const uid = c.req.header("X-User-UID");
  if (uid) init.headers["X-User-UID"] = uid;
  if (!["GET", "HEAD"].includes(c.req.method)) {
    init.headers["Content-Type"] = "application/json";
    init.body = await c.req.text();
  }
  try {
    const res = await fetch(url, init);
    const text = await res.text();
    return c.body(text, res.status, { "Content-Type": res.headers.get("content-type") || "application/json" });
  } catch (err) {
    return c.json({ ok: false, error: "fitness_api_unreachable", details: String(err?.message || err) }, 502);
  }
}

app.get("/routines", (c) => proxyToPython(c, "/routines"));
app.post("/routines", (c) => proxyToPython(c, "/routines"));
app.get("/routines/:id", (c) => proxyToPython(c, `/routines/${c.req.param("id")}`));
app.patch("/routines/:id", (c) => proxyToPython(c, `/routines/${c.req.param("id")}`));
app.delete("/routines/:id", (c) => proxyToPython(c, `/routines/${c.req.param("id")}`));
app.post("/routines/:id/exercises", (c) => proxyToPython(c, `/routines/${c.req.param("id")}/exercises`));
app.put("/routines/:id/exercises/order", (c) => proxyToPython(c, `/routines/${c.req.param("id")}/exercises/order`));
app.patch("/routines/:id/exercises/:eid", (c) => proxyToPython(c, `/routines/${c.req.param("id")}/exercises/${c.req.param("eid")}`));
app.delete("/routines/:id/exercises/:eid", (c) => proxyToPython(c, `/routines/${c.req.param("id")}/exercises/${c.req.param("eid")}`));

app.get("/workouts", (c) => proxyToPython(c, "/workouts"));
app.post("/workouts", (c) => proxyToPython(c, "/workouts"));
app.get("/workouts/:id", (c) => proxyToPython(c, `/workouts/${c.req.param("id")}`));
app.patch("/workouts/:id", (c) => proxyToPython(c, `/workouts/${c.req.param("id")}`));
app.delete("/workouts/:id", (c) => proxyToPython(c, `/workouts/${c.req.param("id")}`));
app.post("/workouts/:id/exercises", (c) => proxyToPython(c, `/workouts/${c.req.param("id")}/exercises`));
app.put("/workouts/:id/exercises/order", (c) => proxyToPython(c, `/workouts/${c.req.param("id")}/exercises/order`));
app.delete("/workouts/:id/exercises/:eid", (c) => proxyToPython(c, `/workouts/${c.req.param("id")}/exercises/${c.req.param("eid")}`));
app.post("/workouts/:id/exercises/:eid/sets", (c) => proxyToPython(c, `/workouts/${c.req.param("id")}/exercises/${c.req.param("eid")}/sets`));
app.patch("/workouts/:id/exercises/:eid/sets/:sid", (c) => proxyToPython(c, `/workouts/${c.req.param("id")}/exercises/${c.req.param("eid")}/sets/${c.req.param("sid")}`));
app.delete("/workouts/:id/exercises/:eid/sets/:sid", (c) => proxyToPython(c, `/workouts/${c.req.param("id")}/exercises/${c.req.param("eid")}/sets/${c.req.param("sid")}`));

// Einzelnen Finisher aus activityAddons löschen — Node selbst kennt kein
// Addon-Merging (siehe /session oben, reiner 1:1-Dateischreiber), die
// Löschlogik lebt nur in Python (fitness/api/routers/sessions.py).
app.delete("/session/activity", (c) => proxyToPython(c, "/session/activity"));

// ── Session ───────────────────────────────────────────────────────────────────
// Multi-Session Schema:
//   Filename: YYYY-MM-DD.json (legacy / Default-Session des Tages)
//             YYYY-MM-DD__<sessionId>.json (zusätzliche Sessions am gleichen Tag)
//   Query  ?id=<sessionId> wählt eine spezifische Session, sonst Default.
function sessionFileName(date, id) {
  return id ? `${date}__${id}.json` : `${date}.json`;
}
function parseSessionFile(fname) {
  const base = fname.replace(/\.json$/, "");
  const [date, id] = base.split("__");
  return { date, id: id || null };
}

app.get("/session", (c) => {
  const uid  = c.req.query("uid") || c.req.header("X-User-UID") || FITNESS_UID;
  const date = c.req.query("date") || localToday();
  const id   = c.req.query("id") || null;
  const file = path.join(os.homedir(), ".aos", "fitness", "users", uid, "sessions", sessionFileName(date, id));
  const data = readJson(file);
  return c.json({ ok: true, data: data || null });
});

app.get("/sessions", (c) => {
  const uid  = c.req.query("uid") || c.req.header("X-User-UID") || FITNESS_UID;
  const date = c.req.query("date") || localToday();
  const dir  = path.join(os.homedir(), ".aos", "fitness", "users", uid, "sessions");
  if (!fs.existsSync(dir)) return c.json({ ok: true, sessions: [] });
  const sessions = fs.readdirSync(dir)
    .filter(f => f.endsWith(".json") && f.startsWith(date))
    .map(f => {
      const meta = parseSessionFile(f);
      const data = readJson(path.join(dir, f)) || {};
      // Volle Session zurückgeben — Contract wie firestore/sessions.js listSessionsForDate.
      // useSession lädt daraus den Editor-State; meta-only führte dazu, dass gespeicherte
      // Sessions leer geladen und beim nächsten Save leer überschrieben wurden.
      return {
        ...data,
        id: meta.id,
        date: meta.date,
        block: data.block || null,
        saved_at: data.saved_at || null,
        exercises: Array.isArray(data.exercises) ? data.exercises : [],
      };
    })
    .sort((a, b) => String(a.saved_at).localeCompare(String(b.saved_at)));
  return c.json({ ok: true, sessions });
});

app.post("/session", async (c) => {
  const uid     = c.req.header("X-User-UID") || FITNESS_UID;
  const date    = c.req.query("date") || localToday();
  const id      = c.req.query("id") || null;
  const userDir = path.join(os.homedir(), ".aos", "fitness", "users", uid, "sessions");
  fs.mkdirSync(userDir, { recursive: true });
  const file    = path.join(userDir, sessionFileName(date, id));
  const data    = await c.req.json().catch(() => ({}));
  const session = freezeSnapshot({ ...data, date, session_id: id, saved_at: new Date().toISOString() });
  writeJson(file, session);
  syncSessionToDb(date, session);          // better-sqlite3 (lokal, synchron)
  notifyPythonSync(date, session, uid, id); // SQLAlchemy via Python (async, fire-and-forget)
  mirrorSession(date, session, uid);
  return c.json({ ok: true, id });
});

/**
 * Snapshot-Härtung: stellt sicher dass jede Session self-contained ist.
 * Inline-Felder (name, primaryMuscles, secondaryMuscles, exercise_id_at_log) sind
 * der "frozen" Ground Truth — Analyse-Code soll diese bevorzugen und KB nur
 * als Fallback nutzen. Diese Funktion markiert die Session explizit als
 * snapshot_version 1 und warnt wenn Exercise-Slots fehlen.
 */
function freezeSnapshot(session) {
  const exercises = (session.exercises || []).map(ex => ({
    ...ex,
    name: ex.name || ex.exercise_id || ex.id || "Unknown",
    exercise_id_at_log: ex.exercise_id || ex.id || null,
    primaryMuscles: Array.isArray(ex.primaryMuscles) ? ex.primaryMuscles : [],
    secondaryMuscles: Array.isArray(ex.secondaryMuscles) ? ex.secondaryMuscles : [],
  }));
  for (const ex of exercises) {
    if (!ex.primaryMuscles.length && !ex.secondaryMuscles.length) {
      log.warn(`[snapshot] ${session.date} ${ex.name}: keine Muskel-Daten — Coverage wird fehlen`);
    }
  }
  return { ...session, exercises, snapshot_version: 1 };
}

app.delete("/session", (c) => {
  const uid  = c.req.header("X-User-UID") || FITNESS_UID;
  const date = c.req.query("date") || localToday();
  const id   = c.req.query("id") || null;
  const file = path.join(os.homedir(), ".aos", "fitness", "users", uid, "sessions", sessionFileName(date, id));
  if (fs.existsSync(file)) fs.unlinkSync(file);
  deleteSessionFromDb(date, id);
  mirrorSessionDelete(date, uid, id);
  return c.json({ ok: true });
});

app.get("/session/history", (c) => {
  const uid     = c.req.query("uid") || c.req.header("X-User-UID") || FITNESS_UID;
  const limit   = Number(c.req.query("limit") || 10);
  const dir     = path.join(os.homedir(), ".aos", "fitness", "users", uid, "sessions");
  if (!fs.existsSync(dir)) return c.json({ ok: true, sessions: [] });
  const files   = fs.readdirSync(dir).filter(f => f.endsWith(".json")).sort().reverse().slice(0, limit);
  const sessions = files.map(f => {
    const meta = parseSessionFile(f);
    return { date: meta.date, id: meta.id, ...readJson(path.join(dir, f)) };
  });
  return c.json({ ok: true, sessions });
});

app.get("/session/latest", (c) => {
  const uid   = c.req.query("uid") || c.req.header("X-User-UID") || FITNESS_UID;
  const dir   = path.join(os.homedir(), ".aos", "fitness", "users", uid, "sessions");
  if (!fs.existsSync(dir)) return c.json({ ok: false }, 404);
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".json")).sort().reverse();
  if (!files.length) return c.json({ ok: false }, 404);
  const data  = readJson(path.join(dir, files[0]));
  return c.json({ ok: true, session: { date: files[0].replace(".json", ""), data } });
});

// ── Journal ───────────────────────────────────────────────────────────────────
app.get("/journal", async (c) => {
  const uid  = c.req.header("X-User-UID") || FITNESS_UID;
  const date = c.req.query("date") || localToday();
  // Firestore-first
  const fsContent = await readJournalFull(uid, date);
  if (fsContent) return c.json({ ok: true, content: fsContent, mtime: date, source: "firestore" });
  // Offline-Fallback: lokale .md Dateien
  const localDirs = [
    { file: path.join(os.homedir(), ".aos", "fitness", "users", uid, "journal", `${date}.md`), label: null },
    { file: path.join(DATA_DIR, "journal", `${date}.md`), label: null },
    { file: path.join(os.homedir(), ".aos", "fuel", "users", uid, "nutrition_journal", `${date}.md`), label: "Fuel" },
  ].filter(({ file }) => fs.existsSync(file));
  if (!localDirs.length) return c.json({ ok: false }, 404);
  const content = localDirs.map(({ file, label }) => {
    const text = fs.readFileSync(file, "utf8");
    return label ? `## ${label} – ${date}\n\n${text}` : text;
  }).join("\n\n---\n\n");
  const mtime = localDirs.map(({ file }) => fs.statSync(file).mtime).reduce((a, b) => a > b ? a : b).toISOString().slice(0, 10);
  return c.json({ ok: true, content, mtime, source: "local" });
});

app.post("/journal", async (c) => {
  const uid           = c.req.header("X-User-UID") || FITNESS_UID;
  const date          = c.req.query("date") || localToday();
  // Pro-uid-Ordner (wie GET oben schon macht) statt fix an den beim Server-
  // Start aufgelösten DATA_DIR (= FITNESS_UID) — sonst landet der Eintrag
  // eines anderen Klienten (X-User-UID-Header) immer im falschen Journal.
  const dir           = path.join(os.homedir(), ".aos", "fitness", "users", uid, "journal");
  fs.mkdirSync(dir, { recursive: true });
  const file          = path.join(dir, `${date}.md`);
  const { content }   = await c.req.json().catch(() => ({}));
  fs.writeFileSync(file, content || "");
  mirrorJournal(date, { text: content || "" }, uid);
  return c.json({ ok: true });
});

app.get("/journal/list", async (c) => {
  const uid = c.req.header("X-User-UID") || FITNESS_UID;
  const limitCount = Number(c.req.query("limit") || 50);
  // Firestore-first
  const fsEntries = await listJournals(uid, limitCount);
  if (fsEntries) return c.json({ ok: true, entries: fsEntries, source: "firestore" });
  // Offline-Fallback
  const dirs = [
    path.join(os.homedir(), ".aos", "fitness", "users", uid, "journal"),
    path.join(DATA_DIR, "journal"),
    path.join(os.homedir(), ".aos", "fuel", "users", uid, "nutrition_journal"),
  ];
  const seen = new Map();
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter(f => f.endsWith(".md"))) {
      const date = f.replace(".md", "");
      const mtime = fs.statSync(path.join(dir, f)).mtime.toISOString();
      if (!seen.has(date) || mtime > seen.get(date)) seen.set(date, mtime);
    }
  }
  const entries = [...seen.entries()]
    .sort((a, b) => b[0].localeCompare(a[0])).slice(0, limitCount)
    .map(([date, mtime]) => ({ date, mtime }));
  return c.json({ ok: true, entries, source: "local" });
});

// ── Coverage ──────────────────────────────────────────────────────────────────
app.get("/coverage/anatomy", (c) => {
  const days    = Number(c.req.query("days") || 7);
  const muscles = computeCoverageAnatomy(days);
  return c.json({ ok: true, days, muscles });
});

app.get("/coverage/gaps", (c) => {
  const days = Number(c.req.query("days") || 7);
  const hits = computeCoverage(days);
  const all  = ["chest","back","shoulders","arms","core","glutes","quads","hamstrings","calves"];
  const gaps = all.filter(g => (hits[g] || 0) < 1).map(g => ({ name: g, hits: hits[g] || 0, exercises: [] }));
  return c.json({ ok: true, gaps });
});

// ── Export CSV ────────────────────────────────────────────────────────────────
app.get("/export/csv", (c) => {
  const uid     = c.req.query("uid") || c.req.header("X-User-UID") || FITNESS_UID;
  const sessDir = path.join(os.homedir(), ".aos", "fitness", "users", uid, "sessions");
  const days    = Math.min(365, Math.max(1, Number(c.req.query("days") || 14)));
  const mode    = c.req.query("mode") || "simple";
  const dates   = lastDates(days).reverse();

  const isDetailed = mode === "detailed";

  const header = isDetailed
    ? ["date","block","location","duration_min","exercise","sets_summary","weight_max_kg","note","effort"]
    : ["date","block","exercise","note","effort"];

  const rows = [header];

  for (const date of dates) {
    const sess     = readJson(path.join(sessDir, `${date}.json`));
    const block    = sess?.block    || "";
    const effort   = sess?.effort   ?? "";
    const location = sess?.location || "";
    const duration = sess?.duration || "";

    for (const ex of (sess?.exercises || [])) {
      const sets = ex.setsArray || [];
      const setsSummary = sets.length
        ? sets.map(s => [s.reps, s.weight ? `${s.weight}kg` : ''].filter(Boolean).join('@')).join(' / ')
        : (ex.sets ? `${ex.sets}×${ex.reps ?? ''}` : '');
      const weightMax = sets.length
        ? Math.max(0, ...sets.map(s => parseFloat(s.weight) || 0)) || ""
        : (ex.weight ?? "");

      rows.push(isDetailed
        ? [date, escapeCsvValue(block), escapeCsvValue(location), String(duration),
           escapeCsvValue(ex.name || ""), escapeCsvValue(setsSummary), String(weightMax),
           escapeCsvValue(ex.note || ""), String(effort)]
        : [date, escapeCsvValue(block), escapeCsvValue(ex.name || ""),
           escapeCsvValue(ex.note || ""), String(effort)]
      );
    }
  }

  const csv      = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n") + "\n";
  const filename = `fitness-${days}d-${mode}-${localToday()}.csv`;
  return c.json({ ok: true, filename, csv });
});

app.get("/export/pflichtaufgabe", (c) => {
  const uid = c.req.query("uid") || c.req.header("X-User-UID") || FITNESS_UID;
  const dir = path.join(os.homedir(), ".aos", "fitness", "users", uid, "sessions");
  const files = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter(f => f.endsWith(".json")).sort()
    : [];
  const rows = [["Nr","Datum","Trainingsart","Ort","Dauer (min)"]];
  let nr = 1;
  for (const file of files) {
    const sess = readJson(path.join(dir, file));
    if (!sess) continue;
    const date = file.replace(".json", "");
    const [y, m, d] = date.split("-");
    rows.push([
      String(nr++),
      `${d}.${m}.${y}`,
      escapeCsvValue(sess.trainingsart || sess.block || ""),
      escapeCsvValue(sess.location || ""),
      String(sess.duration || ""),
    ]);
  }
  const csv      = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n") + "\n";
  const filename = `trainingsprotokoll-pflichtaufgabe-${localToday()}.csv`;
  return c.json({ ok: true, filename, csv, count: nr - 1 });
});

// ── Body metrics ──────────────────────────────────────────────────────────────
// Pro-uid-Ordner (BODY_DIR bleibt Legacy-Fallback für Einträge von vor diesem
// Fix) — vorher war BODY_DIR ein einziger Topf für alle Klienten, Gewicht/
// Schlaf/HF hätten sich pro Datum zwischen Klienten überschrieben.
function bodyDirFor(uid) {
  return path.join(os.homedir(), ".aos", "fitness", "users", uid, "body");
}

app.get("/fitness/body", (c) => {
  const uid  = c.req.query("uid") || c.req.header("X-User-UID") || FITNESS_UID;
  const days = Math.min(365, Math.max(1, Number(c.req.query("days") || 30)));
  const ownDir = bodyDirFor(uid);
  fs.mkdirSync(ownDir, { recursive: true });
  const byDate = new Map();
  for (const dir of [BODY_DIR, ownDir]) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter(f => f.match(/^\d{4}-\d{2}-\d{2}\.json$/))) {
      const entry = readJson(path.join(dir, f));
      if (entry) byDate.set(f.replace(".json", ""), entry); // ownDir überschreibt Legacy-Global (spätere Iteration gewinnt)
    }
  }
  const entries = [...byDate.keys()].sort().reverse().slice(0, days).map(d => byDate.get(d));
  return c.json({ ok: true, entries });
});

app.post("/fitness/body", async (c) => {
  const uid  = c.req.query("uid") || c.req.header("X-User-UID") || FITNESS_UID;
  const dir  = bodyDirFor(uid);
  fs.mkdirSync(dir, { recursive: true });
  const payload  = await c.req.json().catch(() => ({}));
  const day      = payload.date || localToday();
  const file     = path.join(dir, `${day}.json`);
  const existing = readJson(file, { date: day });
  writeJson(file, { ...existing, ...payload, updated_at: new Date().toISOString() });
  if (payload.weight_kg != null) {
    postWger("/weightentry/", { date: day, weight: String(payload.weight_kg) });
  }
  return c.json({ ok: true, day });
});

// ── Theme ─────────────────────────────────────────────────────────────────────
const themeFile = path.join(DATA_DIR, "theme.json");
app.get("/theme",  (c) => c.json(readJson(themeFile, { theme: "mocha" })));
app.post("/theme", async (c) => { writeJson(themeFile, await c.req.json().catch(() => ({}))); return c.json({ ok: true }); });

// ── Firestore ─────────────────────────────────────────────────────────────────
app.get("/firestore/status", async (c) => c.json(await getFirestoreStatus()));

app.post("/firestore/pull", async (c) => {
  const uid = c.req.query("uid") || c.req.header("X-User-UID");
  if (!uid || uid === "default") {
    return c.json({
      ok: false,
      error: "uid Pflicht (kein default). Übergib via ?uid=... oder X-User-UID Header. Verfügbare uids siehe ~/.aos/fitness/users/",
    }, 400);
  }
  const status = await getFirestoreStatus();
  if (!status.ok) return c.json({ ok: false, error: "Firestore nicht verbunden" }, 503);

  const docs = await pullAllSessions(uid);
  if (!docs) return c.json({ ok: false, error: "Pull fehlgeschlagen" }, 500);

  const sessDir = path.join(os.homedir(), ".aos", "fitness", "users", uid, "sessions");
  fs.mkdirSync(sessDir, { recursive: true });

  let pulled = 0, skipped = 0, conflicts = 0;
  const conflictDates = [];

  for (const { date, data } of docs) {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) { skipped++; continue; }
    const localPath = path.join(sessDir, `${date}.json`);
    const local = readJson(localPath);
    const cloudTs = data.saved_at || "";
    const localTs = local?.saved_at || "";

    // Strategie: kein Lokal → schreiben. Sonst nur wenn cloud strikt neuer ist.
    if (local && localTs && cloudTs && localTs >= cloudTs) { skipped++; continue; }
    if (local && (!cloudTs || !localTs)) {
      // Mehrdeutig — überspringen + melden statt blind überschreiben
      conflicts++; conflictDates.push(date); continue;
    }

    writeJson(localPath, data);
    try { syncSessionToDb(date, data); } catch (e) {
      log.warn(`[pull] SQLite-Sync fehler für ${date}: ${e.message}`);
    }
    pulled++;
  }

  return c.json({ ok: true, pulled, skipped, conflicts, conflict_dates: conflictDates });
});

app.post("/firestore/sync", async (c) => {
  const uid = c.req.header("X-User-UID") || FITNESS_UID;
  const status = await getFirestoreStatus();
  if (!status.ok) return c.json({ ok: false, error: "Firestore nicht verbunden" }, 503);
  const sessDir = path.join(DATA_DIR, "sessions");
  let synced = 0;
  if (fs.existsSync(sessDir)) {
    const files = fs.readdirSync(sessDir)
      .filter(f => f.endsWith(".json") && !f.includes("history"))
      .slice(-30);
    for (const f of files) {
      const date = f.replace(".json", "");
      const data = readJson(path.join(sessDir, f));
      if (data) { mirrorSession(date, data, uid); synced++; }
    }
  }
  return c.json({ ok: true, synced });
});

app.get("/v1", (c) => {
  const abs = path.join(STATIC_DIR, "v1.html");
  if (fs.existsSync(abs)) {
    return new Response(fs.createReadStream(abs), {
      headers: { "Content-Type": "text/html;charset=utf-8" },
    });
  }
  return c.text("Not Found", 404);
});

// ── Static / SPA fallback ─────────────────────────────────────────────────────
app.get("*", async (c) => {
  const reqPath = c.req.path === "/" ? "/index.html" : c.req.path;
  const abs     = path.join(STATIC_DIR, reqPath);

  if (!abs.startsWith(STATIC_DIR)) return c.text("Forbidden", 403);

  if (fs.existsSync(abs)) {
    const ext  = path.extname(abs);
    const MIME = {
      ".html": "text/html;charset=utf-8", ".js": "application/javascript;charset=utf-8",
      ".css": "text/css;charset=utf-8",  ".json": "application/json;charset=utf-8",
      ".svg": "image/svg+xml",           ".png": "image/png",
      ".ico": "image/x-icon",            ".woff2": "font/woff2",
      ".woff": "font/woff",              ".webmanifest": "application/manifest+json",
    };
    return new Response(fs.createReadStream(abs), {
      headers: { "Content-Type": MIME[ext] || "application/octet-stream" },
    });
  }

  // SPA fallback
  const idx = path.join(STATIC_DIR, "index.html");
  if (fs.existsSync(idx)) {
    return new Response(fs.createReadStream(idx), {
      headers: { "Content-Type": "text/html;charset=utf-8" },
    });
  }
  return c.text("Not Found", 404);
});

// ═════════════════════════════════════════════════════════════════════════════
serve({ fetch: app.fetch, port: PORT, hostname: HOST }, () =>
  log.info(`💪 fitness-dev on http://${HOST}:${PORT}`)
);

// User-Data-Firestore-Listener (Cloud → lokal) läuft NICHT hier — der lief kurz
// (9c9fb3e, 2026-08-14) eingebettet in server.mjs, war aber ein unbemerktes
// Duplikat: fitness-api.service (fitness/api/main.py) bettet denselben Sync
// bereits seit 2026-08-06 ein (siehe dortiger Kommentar). Zwei Prozesse
// hörten damit parallel auf dieselben Firestore-Collections und schrieben in
// dieselben lokalen Dateien/SQLite-Zeilen (sync_gateway deckt das in Python
// vollständig ab, inkl. Delete). Das war zugleich die Quelle des
// undici-Boot-Race (ERR_INVALID_STATE) — mit dem Listener entfernt entfällt
// der Trigger, nicht nur dessen Symptom (siehe uncaughtException-Guard oben,
// bleibt als genereller Schutz, ist aber jetzt nicht mehr der Normalfall).
// mirrorSession/mirrorSessionDelete/mirrorJournal (Push lokal → Cloud, bei
// jedem Write-Endpoint) bleiben unverändert — kein Duplikat, eigener Zweck.
