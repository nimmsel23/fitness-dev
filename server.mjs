import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import yaml from "js-yaml";
import Database from "better-sqlite3";
import { buildPlan, exportSessionMarkdown, exportWithPython, fitnessData, getWeeklySummary, obsidianTargetPath, searchExercises } from "./fitness-runtime.mjs";
import { mirrorSession, mirrorJournal } from "./firestore-mirror.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR   = path.join(os.homedir(), ".aos", "fitness");
const PUBLIC_DIR = path.join(__dirname, "public");
const DIST_DIR   = path.join(__dirname, "dist");
const STATIC_DIR = process.env.FITNESS_STATIC_DIR ? path.resolve(process.env.FITNESS_STATIC_DIR) : (fs.existsSync(DIST_DIR) ? DIST_DIR : PUBLIC_DIR);
const PORT = Number(process.env.PORT || 9100);
const HOST = process.env.HOST || "127.0.0.1";
const WGER_TOKEN = process.env.WGER_API_TOKEN || process.env.WGER_TOKEN || "92d9ea44fc0ac065e336e9ec443a196c40c68afe";
const WGER_BASE  = process.env.WGER_BASE || "http://127.0.0.1:8000/api/v2";
const HABITSYNC_BASE = "http://localhost:6842";
const HS_AUTH = "Basic Y29hY2g6Y29hY2gxMjM=";
const BODY_DIR = path.join(os.homedir(), ".aos", "fitness", "body");

for (const d of ["sessions", "journal"]) fs.mkdirSync(path.join(DATA_DIR, d), { recursive: true });

// ── SQLite dual-write ─────────────────────────────────────────────────────────
const DB_PATH = path.join(DATA_DIR, "sessions", "training_history.sqlite");
const db = new Database(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS training_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
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

const stmtDeleteDate  = db.prepare("DELETE FROM training_history WHERE date = ?");
const stmtInsertEntry = db.prepare(`
  INSERT INTO training_history
    (date, workout_id, exercise_id, display_name, sets, reps, weight, rpe, done, notes, completion_status)
  VALUES
    (@date, @workout_id, @exercise_id, @display_name, @sets, @reps, @weight, @rpe, @done, @notes, @completion_status)
`);

function syncSessionToDb(date, session) {
  const block = session.block || "";
  db.transaction(() => {
    stmtDeleteDate.run(date);
    for (const ex of (session.exercises || [])) {
      stmtInsertEntry.run({
        date,
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

async function fetchWger(wgerPath, qs = "") {
  const url = `${WGER_BASE}${wgerPath}?format=json${qs ? "&" + qs : ""}`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Token ${WGER_TOKEN}` },
      signal: AbortSignal.timeout(4000),
    });
    return res.ok ? res.json() : {};
  } catch {
    return {};
  }
}

function localExerciseGroupMatches(group) {
  const g = String(group || "").trim().toLowerCase();
  if (!g) return [];
  const normalized = g.replace(/\s+/g, "_");
  return fitnessData.exercises.filter(ex => {
    const primary   = (ex.primary_muscles   || []).map(x => String(x || "").trim().toLowerCase());
    const secondary = (ex.secondary_muscles || []).map(x => String(x || "").trim().toLowerCase());
    const tags      = (ex.tags              || []).map(x => String(x || "").trim().toLowerCase());
    const haystack  = [...primary, ...secondary, ...tags, String(ex.category || "").toLowerCase()];
    return haystack.includes(g) || haystack.includes(normalized) || haystack.some(v => v.includes(g) || v.includes(normalized));
  }).map(ex => ({
    id:       ex.exercise_id,
    name_en:  ex.display_name || ex.name || ex.exercise_id,
    relevance:"primary",
  }));
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
    chest:      ["chest","pec","pecs","pectoralis","pectoralis major","pectoralis minor"],
    back:       ["back","lat","lats","latissimus","latissimus dorsi","trapezius","traps","rhomboids","rhomboid","lower back","erector spinae","erector"],
    shoulders:  ["shoulder","shoulders","delt","delts","deltoid","deltoids","anterior deltoid","posterior deltoid","lateral deltoid","rotator cuff"],
    arms:       ["arm","arms","biceps","biceps brachii","triceps","triceps brachii","forearms","forearm","brachialis"],
    core:       ["core","abs","abdominals","rectus abdominis","obliques","obliquus externus abdominis","oblique","transverse abdominis"],
    glutes:     ["glutes","glute","gluteus maximus","gluteus medius","gluteus minimus"],
    quads:      ["quads","quad","quadriceps","quadriceps femoris","vastus lateralis","vastus medialis","rectus femoris"],
    hamstrings: ["hamstrings","hamstring","biceps femoris","semitendinosus","semimembranosus"],
    calves:     ["calves","calf","gastrocnemius","soleus"],
  };
  for (const [id, keys] of Object.entries(MAP)) {
    if (keys.includes(k)) return id;
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
      for (const m of (ex.primaryMuscles   || [])) { const id = muscleToGroupId(m) || normMuscleKey(m); if (id) hits[id] = (hits[id] || 0) + 1; }
      for (const m of (ex.secondaryMuscles || [])) { const id = muscleToGroupId(m) || normMuscleKey(m); if (id) hits[id] = (hits[id] || 0) + 0.5; }
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
      for (const m of (ex.primaryMuscles   || [])) hit(m, 1,   "primary");
      for (const m of (ex.secondaryMuscles || [])) hit(m, 0.5, "secondary");
    }
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
  const local = searchExercises(q, limit);
  if (local?.results?.length) return c.json(local);
  if (q.length < 2) return c.json({ ok: true, results: [] });
  const data = await fetchWger("/exerciseinfo/", `limit=${limit}&name__search=${encodeURIComponent(q)}&language=2`);
  const results = (data.results || []).map(e => {
    const trans = (e.translations || []).find(t => t.language === 2) || (e.translations || [])[0] || {};
    return {
      id:               e.uuid || String(e.id),
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
  const local = localExerciseGroupMatches(group);
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
    return { id: e.uuid || String(e.id), name_en: trans.name || "", relevance: "primary", source: "wger" };
  }).filter(e => e.name_en);
  return c.json({ ok: true, exercises });
});

// ── Exercise teaching (anatomy-kb → catalog/kb/anatomy_teaching) ─────────────
const ANATOMY_DIR = path.join(__dirname, "catalog", "kb", "anatomy_teaching");

function loadLesson(exerciseId) {
  const file = path.join(ANATOMY_DIR, `${exerciseId}.yml`);
  if (fs.existsSync(file)) {
    const doc = yaml.load(fs.readFileSync(file, "utf8"));
    if (doc && typeof doc === "object") {
      const lessons = doc.lessons || (doc.exercise_id ? [doc] : []);
      return lessons.find(l => l.exercise_id === exerciseId) || lessons[0] || null;
    }
  }
  // Fallback: multi-lesson files (chest_lessons.yml etc.)
  if (fs.existsSync(ANATOMY_DIR)) {
    for (const f of fs.readdirSync(ANATOMY_DIR).filter(f => f.endsWith(".yml"))) {
      const doc = yaml.load(fs.readFileSync(path.join(ANATOMY_DIR, f), "utf8"));
      const lessons = doc?.lessons || (doc?.exercise_id ? [doc] : []);
      const match = lessons.find(l => l.exercise_id === exerciseId);
      if (match) return match;
    }
  }
  return null;
}

app.get("/exercise/:id/teaching", (c) => {
  const id     = c.req.param("id");
  const lesson = loadLesson(id);
  if (!lesson) return c.json({ ok: false, error: "no_lesson" }, 404);
  return c.json({ ok: true, lesson });
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

app.get("/fitness/search", (c) => {
  const q     = c.req.query("q")     || "";
  const limit = Math.min(Number(c.req.query("limit") || 12), 50);
  return c.json(searchExercises(q, limit));
});

app.get("/fitness/plan", (c) => {
  const template = c.req.query("template") || "";
  const split    = c.req.query("split")    || "";
  const day      = c.req.query("day")      || "";
  const goal     = c.req.query("goal")     || "";
  return c.json(buildPlan({ template, split, day, goal }));
});

app.get("/fitness/weekly", (c) => {
  const week = c.req.query("week") || "current";
  try { return c.json(getWeeklySummary(week)); }
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
      return c.json({ ok: true, kind, ...exportWithPython("exercise_sheet", { query, force: !!data.force }) });
    }
    if (kind === "exercise_lesson") {
      const exercise_id = String(data.exercise_id || "").trim();
      if (!exercise_id) return c.json({ ok: false, error: "missing_exercise_id" }, 400);
      return c.json({ ok: true, kind, ...exportWithPython("exercise_lesson", { exercise_id, mode: data.mode || "trainer", force: !!data.force }) });
    }
    if (kind === "plan") {
      const plan   = data.plan || buildPlan(data.plan_options || data);
      return c.json({ ok: true, kind, ...exportWithPython("plan", { plan, force: !!data.force }) });
    }
    if (kind === "weekly") {
      return c.json({ ok: true, kind, ...exportWithPython("weekly", { week_selector: data.week_selector || "current", force: !!data.force }) });
    }
    return c.json({ ok: false, error: "unknown_export_kind" }, 400);
  } catch (error) {
    return c.json({ ok: false, error: "export_failed", details: String(error?.message || error) }, 500);
  }
});

// ── HabitSync proxy ───────────────────────────────────────────────────────────
app.get("/habitsync/habits", async (c) => {
  try {
    const r    = await fetch(`${HABITSYNC_BASE}/api/habit/list`, { headers: { Authorization: HS_AUTH } });
    const text = await r.text();
    return new Response(text, { status: r.ok ? 200 : 502, headers: { "Content-Type": "application/json;charset=utf-8" } });
  } catch {
    return c.json({ ok: false, error: "habitsync_unreachable" }, 502);
  }
});

app.post("/habitsync/record/:uuid", async (c) => {
  const uuid = c.req.param("uuid");
  if (!uuid) return c.json({ ok: false, error: "missing_uuid" }, 400);
  try {
    const r = await fetch(`${HABITSYNC_BASE}/api/record/${encodeURIComponent(uuid)}`, {
      method: "POST",
      headers: { Authorization: HS_AUTH, "Content-Type": "application/json" },
    });
    if (!r.ok) return c.json({ ok: false, error: "habitsync_error", status: r.status }, 502);
    return c.json({ ok: true });
  } catch {
    return c.json({ ok: false, error: "habitsync_unreachable" }, 502);
  }
});

// ── Plan today ────────────────────────────────────────────────────────────────
app.get("/plan/today", (c) => {
  const date = c.req.query("date") || localToday();
  const plan = readJson(path.join(DATA_DIR, "plan.json"));
  const dow  = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][new Date(date + "T12:00:00").getDay()];
  if (plan) {
    const match = (plan.einheiten || []).find(e => (e.days || []).includes(dow));
    if (match) {
      const exercises = (match.abschnitte || []).flatMap(a => (a.übungen || a.uebungen || []).map(u => u.name));
      return c.json({ ok: true, suggestion: { day: dow, block: match.name, exercises } });
    }
  }
  const fallback = {
    Mo: { block: "Push",      exercises: ["Incline Dumbbell Press", "Dips", "Lateral Raise", "Cable Fly", "Triceps Extension"] },
    Di: { block: "Pull",      exercises: ["Pull-Up", "Row", "Lat Pulldown", "Face Pull", "Biceps Curl"] },
    Mi: { block: "Legs",      exercises: ["Squat", "Romanian Deadlift", "Lunge", "Leg Curl", "Calf Raise"] },
    Do: { block: "Upper",     exercises: ["Bench Press", "Row", "Overhead Press", "Pulldown", "Curl"] },
    Fr: { block: "Lower",     exercises: ["Deadlift", "Split Squat", "Hip Thrust", "Leg Curl", "Calf Raise"] },
    Sa: { block: "Full Body", exercises: ["Squat", "Press", "Row", "Hinge", "Carry"] },
    So: { block: "Recovery",  exercises: ["Mobility", "Walk", "Core Breathing"] },
  }[dow] || { block: "Full Body", exercises: ["Squat", "Press", "Row"] };
  return c.json({ ok: true, suggestion: { day: dow, block: fallback.block, exercises: fallback.exercises } });
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

// ── Session ───────────────────────────────────────────────────────────────────
app.get("/session", (c) => {
  const date = c.req.query("date") || localToday();
  const data = readJson(path.join(DATA_DIR, "sessions", `${date}.json`));
  return data ? c.json({ ok: true, data }) : c.json({ ok: false }, 404);
});

app.post("/session", async (c) => {
  const date    = c.req.query("date") || localToday();
  const file    = path.join(DATA_DIR, "sessions", `${date}.json`);
  const data    = await c.req.json().catch(() => ({}));
  const session = { ...data, date, saved_at: new Date().toISOString() };
  writeJson(file, session);
  syncSessionToDb(date, session);
  mirrorSession(date, session);
  return c.json({ ok: true });
});

app.get("/session/history", (c) => {
  const limit   = Number(c.req.query("limit") || 10);
  const dir     = path.join(DATA_DIR, "sessions");
  const files   = fs.readdirSync(dir).filter(f => f.endsWith(".json")).sort().reverse().slice(0, limit);
  const sessions = files.map(f => ({ date: f.replace(".json", ""), ...readJson(path.join(dir, f)) }));
  return c.json({ ok: true, sessions });
});

app.get("/session/latest", (c) => {
  const dir   = path.join(DATA_DIR, "sessions");
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".json")).sort().reverse();
  if (!files.length) return c.json({ ok: false }, 404);
  const data  = readJson(path.join(dir, files[0]));
  return c.json({ ok: true, session: { date: files[0].replace(".json", ""), data } });
});

// ── Journal ───────────────────────────────────────────────────────────────────
app.get("/journal", (c) => {
  const date = c.req.query("date") || localToday();
  const file = path.join(DATA_DIR, "journal", `${date}.md`);
  if (!fs.existsSync(file)) return c.json({ ok: false }, 404);
  const content = fs.readFileSync(file, "utf8");
  const mtime   = fs.statSync(file).mtime.toISOString().slice(0, 10);
  return c.json({ ok: true, content, mtime });
});

app.post("/journal", async (c) => {
  const date          = c.req.query("date") || localToday();
  const file          = path.join(DATA_DIR, "journal", `${date}.md`);
  const { content }   = await c.req.json().catch(() => ({}));
  fs.writeFileSync(file, content || "");
  mirrorJournal(date, { text: content || "" });
  return c.json({ ok: true });
});

app.get("/journal/list", (c) => {
  const dir     = path.join(DATA_DIR, "journal");
  const files   = fs.readdirSync(dir).filter(f => f.endsWith(".md")).sort().reverse().slice(0, 50);
  const entries = files.map(f => ({
    date:  f.replace(".md", ""),
    mtime: fs.statSync(path.join(dir, f)).mtime.toISOString(),
  }));
  return c.json({ ok: true, entries });
});

// ── Coverage ──────────────────────────────────────────────────────────────────
app.get("/coverage/detailed", (c) => {
  const days  = Number(c.req.query("days") || 7);
  const hits  = computeCoverage(days);
  const GROUPS = {
    chest: ["Chest"], back: ["Back"], shoulders: ["Shoulders"], arms: ["Arms"],
    core: ["Core"], glutes: ["Glutes"], quads: ["Quads"], hamstrings: ["Hamstrings"], calves: ["Calves"],
  };
  const groups = Object.entries(GROUPS).map(([id, muscleNames]) => ({
    id,
    muscles: muscleNames.map(name => ({
      name_en:      name,
      primaryHits:  Math.round(hits[id] || 0),
      secondaryHits:0,
      totalScore:   hits[id] || 0,
    })),
  }));
  return c.json({ ok: true, groups, muscles: groups.flatMap(g => g.muscles) });
});

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
  const days  = Math.min(365, Math.max(1, Number(c.req.query("days") || 14)));
  const dates = lastDates(days).reverse();
  const rows  = [["date","block","location","duration_min","exercise","hit","sets","reps","weight","note","effort"]];
  for (const date of dates) {
    const sess     = readJson(path.join(DATA_DIR, "sessions", `${date}.json`));
    const block    = sess?.block    || "";
    const effort   = sess?.effort   ?? "";
    const location = sess?.location || "";
    const duration = sess?.duration || "";
    for (const ex of (sess?.exercises || [])) {
      rows.push([
        date,
        escapeCsvValue(block),
        escapeCsvValue(location),
        String(duration),
        escapeCsvValue(ex.name || ""),
        ex.isHIT ? "1" : "",
        ex.isHIT ? "" : String(ex.sets  ?? ""),
        ex.isHIT ? "" : String(ex.reps  ?? ""),
        String(ex.weight ?? ""),
        escapeCsvValue(ex.note || ""),
        String(effort),
      ]);
    }
  }
  const csv      = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n") + "\n";
  const filename = `fitness-${days}d-${localToday()}.csv`;
  return c.json({ ok: true, filename, csv });
});

app.get("/export/pflichtaufgabe", (c) => {
  const dir   = path.join(DATA_DIR, "sessions");
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
app.get("/fitness/body", (c) => {
  const days = Math.min(365, Math.max(1, Number(c.req.query("days") || 30)));
  fs.mkdirSync(BODY_DIR, { recursive: true });
  const files   = fs.existsSync(BODY_DIR)
    ? fs.readdirSync(BODY_DIR).filter(f => f.match(/^\d{4}-\d{2}-\d{2}\.json$/)).sort().reverse().slice(0, days)
    : [];
  const entries = files.map(f => readJson(path.join(BODY_DIR, f))).filter(Boolean);
  return c.json({ ok: true, entries });
});

app.post("/fitness/body", async (c) => {
  fs.mkdirSync(BODY_DIR, { recursive: true });
  const payload  = await c.req.json().catch(() => ({}));
  const day      = payload.date || localToday();
  const file     = path.join(BODY_DIR, `${day}.json`);
  const existing = readJson(file, { date: day });
  writeJson(file, { ...existing, ...payload, updated_at: new Date().toISOString() });
  return c.json({ ok: true, day });
});

// ── Theme ─────────────────────────────────────────────────────────────────────
const themeFile = path.join(DATA_DIR, "theme.json");
app.get("/theme",  (c) => c.json(readJson(themeFile, { theme: "mocha" })));
app.post("/theme", async (c) => { writeJson(themeFile, await c.req.json().catch(() => ({}))); return c.json({ ok: true }); });

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
  console.log(`💪 fitness-dev on http://${HOST}:${PORT}`)
);
