import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { buildPlan, exportSessionMarkdown, exportWithPython, fitnessData, getWeeklySummary, obsidianTargetPath, searchExercises, resolveExerciseQuery } from "./fitness-runtime.mjs";

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
const HS_AUTH = "Basic Y29hY2g6Y29hY2gxMjM="; // coach:coach123
const BODY_DIR = path.join(os.homedir(), ".aos", "fitness", "body");

for (const d of ["sessions","journal"]) fs.mkdirSync(path.join(DATA_DIR, d), { recursive: true });

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

// ── Helpers ──────────────────────────────────────────────────────────────────
const MIME = { ".html":"text/html;charset=utf-8", ".js":"application/javascript;charset=utf-8",
  ".css":"text/css;charset=utf-8", ".json":"application/json;charset=utf-8",
  ".svg":"image/svg+xml", ".png":"image/png", ".ico":"image/x-icon",
  ".woff2":"font/woff2", ".woff":"font/woff", ".webmanifest":"application/manifest+json" };

function mime(p) { return MIME[path.extname(p)] || "application/octet-stream"; }

function json(res, code, data) {
  const body = JSON.stringify(data);
  res.writeHead(code, { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) });
  res.end(body);
}

function readJson(p, fallback = null) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return fallback; }
}
function writeJson(p, data) { fs.writeFileSync(p, JSON.stringify(data, null, 2)); }


function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function lastDates(days) {
  const out = [];
  const base = new Date(localToday() + "T12:00:00");
  for (let i = 0; i < days; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    out.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`);
  }
  return out;
}

function escapeCsvValue(v) {
  return String(v ?? "").replaceAll('"', '""');
}

async function fetchWger(path, qs = "") {
  return new Promise((resolve) => {
    const url = `${WGER_BASE}${path}?format=json${qs ? "&" + qs : ""}`;
    const req = http.get(url, { headers: { Authorization: `Token ${WGER_TOKEN}` } }, (r) => {
      let raw = "";
      r.on("data", c => raw += c);
      r.on("end", () => { try { resolve(JSON.parse(raw)); } catch { resolve({}); } });
    });
    req.on("error", () => resolve({}));
    req.setTimeout(4000, () => { req.destroy(); resolve({}); });
  });
}

function localExerciseGroupMatches(group) {
  const g = String(group || "").trim().toLowerCase();
  if (!g) return [];
  const normalized = g.replace(/\s+/g, "_");
  return fitnessData.exercises.filter(ex => {
    const primary = (ex.primary_muscles || []).map(x => String(x || "").trim().toLowerCase());
    const secondary = (ex.secondary_muscles || []).map(x => String(x || "").trim().toLowerCase());
    const tags = (ex.tags || []).map(x => String(x || "").trim().toLowerCase());
    const haystack = [...primary, ...secondary, ...tags, String(ex.category || "").toLowerCase()];
    return haystack.includes(g) || haystack.includes(normalized) || haystack.some(v => v.includes(g) || v.includes(normalized));
  }).map(ex => ({
    id: ex.exercise_id,
    name_en: ex.display_name || ex.name || ex.exercise_id,
    relevance: "primary",
  }));
}

// ── Week dates (Mo–So) ────────────────────────────────────────────────────────
function weekDates(anchor) {
  const d = new Date(anchor + "T12:00:00");
  const off = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - off);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d); x.setDate(d.getDate() + i);
    return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`;
  });
}

// ── Muscle coverage from sessions ─────────────────────────────────────────────
function normMuscleKey(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[\u2019']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function muscleToGroupId(muscleName) {
  const k = normMuscleKey(muscleName);
  if (!k) return null;

  // wger returns a mix of anatomical names ("Pectoralis major") and
  // sometimes broad groups ("Chest"). Normalize both to our internal IDs.
  const MAP = {
    chest: [
      "chest", "pec", "pecs", "pectoralis", "pectoralis major", "pectoralis minor",
    ],
    back: [
      "back", "lat", "lats", "lats", "latissimus", "latissimus dorsi",
      "trapezius", "traps", "rhomboids", "rhomboid", "lower back", "erector spinae", "erector",
    ],
    shoulders: [
      "shoulder", "shoulders", "delt", "delts", "deltoid", "deltoids",
      "anterior deltoid", "posterior deltoid", "lateral deltoid", "rotator cuff",
    ],
    arms: [
      "arm", "arms", "biceps", "biceps brachii", "triceps", "triceps brachii",
      "forearms", "forearm", "brachialis",
    ],
    core: [
      "core", "abs", "abdominals", "rectus abdominis",
      "obliques", "obliquus externus abdominis", "oblique", "transverse abdominis",
    ],
    glutes: [
      "glutes", "glute", "gluteus maximus", "gluteus medius", "gluteus minimus",
    ],
    quads: [
      "quads", "quad", "quadriceps", "quadriceps femoris", "vastus lateralis",
      "vastus medialis", "rectus femoris",
    ],
    hamstrings: [
      "hamstrings", "hamstring", "biceps femoris", "semitendinosus", "semimembranosus",
    ],
    calves: [
      "calves", "calf", "gastrocnemius", "soleus",
    ],
  };

  for (const [id, keys] of Object.entries(MAP)) {
    if (keys.includes(k)) return id;
  }
  return null;
}

function displayMuscleName(s) {
  const t = String(s || "").trim();
  if (!t) return "";
  // Preserve common wger/session capitalization like "Chest", but collapse weird whitespace.
  return t.replace(/\s+/g, " ");
}

function defaultBlocks() {
  return [
    { id:"push",  label:"Push",  muscle_groups:["chest","shoulders","arms"] },
    { id:"pull",  label:"Pull",  muscle_groups:["back","arms"] },
    { id:"legs",  label:"Legs",  muscle_groups:["quads","hamstrings","glutes","calves"] },
    { id:"upper", label:"Upper", muscle_groups:["chest","back","shoulders","arms"] },
    { id:"lower", label:"Lower", muscle_groups:["quads","hamstrings","glutes","calves"] },
  ];
}

function computeCoverage(days) {
  const dates = weekDates(localToday()).slice(0, days);
  const allDates = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(localToday() + "T12:00:00");
    d.setDate(d.getDate() - i);
    allDates.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`);
  }
  const hits = {};
  for (const date of allDates) {
    const sess = readJson(path.join(DATA_DIR, "sessions", `${date}.json`));
    for (const ex of (sess?.exercises || [])) {
      for (const m of (ex.primaryMuscles || [])) {
        const id = muscleToGroupId(m) || normMuscleKey(m);
        if (!id) continue;
        hits[id] = (hits[id] || 0) + 1;
      }
      for (const m of (ex.secondaryMuscles || [])) {
        const id = muscleToGroupId(m) || normMuscleKey(m);
        if (!id) continue;
        hits[id] = (hits[id] || 0) + 0.5;
      }
    }
  }
  return hits;
}

function computeCoverageAnatomy(days) {
  const allDates = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(localToday() + "T12:00:00");
    d.setDate(d.getDate() - i);
    allDates.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`);
  }

  const map = new Map(); // normKey -> { name_en, primaryHits, secondaryHits, totalScore }

  function hit(name, w, kind) {
    const key = normMuscleKey(name);
    if (!key) return;
    const cur = map.get(key) || {
      name_en: displayMuscleName(name),
      primaryHits: 0,
      secondaryHits: 0,
      totalScore: 0,
    };
    if (kind === "primary") cur.primaryHits += w;
    if (kind === "secondary") cur.secondaryHits += w;
    cur.totalScore += w;
    // Keep the longest-seen label as display name to prefer "Pectoralis major" over "pec".
    const label = displayMuscleName(name);
    if (label.length > (cur.name_en || "").length) cur.name_en = label;
    map.set(key, cur);
  }

  for (const date of allDates) {
    const sess = readJson(path.join(DATA_DIR, "sessions", `${date}.json`));
    for (const ex of (sess?.exercises || [])) {
      for (const m of (ex.primaryMuscles || [])) hit(m, 1, "primary");
      for (const m of (ex.secondaryMuscles || [])) hit(m, 0.5, "secondary");
    }
  }

  return Array.from(map.values()).sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
}

// ═════════════════════════════════════════════════════════════════════════════
const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const p   = url.pathname.replace(/\/$/, "") || "/";

  let body = "";
  if (req.method !== "GET") {
    await new Promise(r => { req.on("data", c => body += c); req.on("end", r); });
  }
  const B = () => { try { return JSON.parse(body); } catch { return {}; } };

  // ── Health ──
  if (p === "/health") return json(res, 200, { ok: true, port: PORT, uptime: Math.floor(process.uptime()) });

  // ── Exercise search (wger) ──
  if (p === "/exercises/search") {
    const q     = url.searchParams.get("q") || "";
    const limit = Math.min(Number(url.searchParams.get("limit") || 12), 50);
    if (q.length < 1) return json(res, 200, { ok: true, results: [] });
    const local = searchExercises(q, limit);
    if (local?.results?.length) return json(res, 200, local);
    if (q.length < 2) return json(res, 200, { ok: true, results: [] });
    const data = await fetchWger("/exerciseinfo/", `limit=${limit}&name__search=${encodeURIComponent(q)}&language=2`);
    const results = (data.results || []).map(e => {
      const trans = (e.translations || []).find(t => t.language === 2) || (e.translations || [])[0] || {};
      return {
        id:               e.uuid || String(e.id),
        name:             trans.name || "",
        category:         e.category?.name || "",
        primaryMuscles:   (e.muscles || []).map(m => m.name_en || m.name).filter(Boolean),
        secondaryMuscles: (e.muscles_secondary || []).map(m => m.name_en || m.name).filter(Boolean),
        wger_muscle_ids: {
          primary:   (e.muscles || []).map(m => m.id),
          secondary: (e.muscles_secondary || []).map(m => m.id),
        },
        source:           "wger",
      };
    }).filter(e => e.name);
    return json(res, 200, { ok: true, source: "wger", results });
  }

  // ── Exercises by muscle group ──
  if (p === "/exercises/by-group") {
    const group = url.searchParams.get("group") || "";
    const results = localExerciseGroupMatches(group);
    if (results.length) return json(res, 200, { ok: true, exercises: results });

    // wger_mapping.yml: { mappings: { "1": "upper_arm_front", ... } }
    const mappings = fitnessData.wgerMapping?.mappings || {};
    const wgerIds = Object.entries(mappings)
      .filter(([, catalogId]) => catalogId === group)
      .map(([wgerId]) => wgerId);

    let data;
    if (wgerIds.length) {
      // ID-basierte Abfrage — sauber und stabil
      const params = wgerIds.map(id => `muscles=${id}`).join("&");
      data = await fetchWger("/exerciseinfo/", `limit=20&language=2&${params}`);
    } else {
      // Fallback: Textsuche wenn kein Mapping vorhanden
      data = await fetchWger("/exerciseinfo/", `limit=20&muscles__name_en__icontains=${encodeURIComponent(group)}&language=2`);
    }

    const exercises = (data.results || []).map(e => {
      const trans = (e.translations || []).find(t => t.language === 2) || (e.translations || [])[0] || {};
      return { id: e.uuid || String(e.id), name_en: trans.name || "", relevance: "primary", source: "wger" };
    }).filter(e => e.name_en);
    return json(res, 200, { ok: true, exercises });
  }

  if (p === "/fitness/config") {
    return json(res, 200, {
      ok: true,
      config: fitnessData.config,
      exportPath: obsidianTargetPath(),
      root: fitnessData.config?.paths?.root || "~/.fitness-agent",
      source: "local_yaml",
    });
  }

  if (p === "/fitness/search") {
    const q = url.searchParams.get("q") || "";
    const limit = Math.min(Number(url.searchParams.get("limit") || 12), 50);
    return json(res, 200, searchExercises(q, limit));
  }

  if (p === "/fitness/plan") {
    const template = url.searchParams.get("template") || "";
    const split = url.searchParams.get("split") || "";
    const day = url.searchParams.get("day") || "";
    const goal = url.searchParams.get("goal") || "";
    return json(res, 200, buildPlan({ template, split, day, goal }));
  }

  if (p === "/fitness/weekly") {
    const week = url.searchParams.get("week") || "current";
    try {
      return json(res, 200, getWeeklySummary(week));
    } catch (e) {
      return json(res, 500, { ok: false, error: e.message });
    }
  }

  if (p === "/fitness/export") {
    if (req.method !== "POST") return json(res, 405, { ok: false, error: "method_not_allowed" });
    const data = B();
    const kind = String(data.kind || "").trim();
    try {
      if (kind === "session") {
        const result = exportSessionMarkdown(data.session || data);
        return json(res, 200, { ok: true, kind, ...result });
      }
      if (kind === "exercise_sheet") {
        const query = String(data.query || data.exercise_id || "").trim();
        if (!query) return json(res, 400, { ok: false, error: "missing_query" });
        const result = exportWithPython("exercise_sheet", { query, force: !!data.force });
        return json(res, 200, { ok: true, kind, ...result });
      }
      if (kind === "exercise_lesson") {
        const exercise_id = String(data.exercise_id || "").trim();
        if (!exercise_id) return json(res, 400, { ok: false, error: "missing_exercise_id" });
        const result = exportWithPython("exercise_lesson", { exercise_id, mode: data.mode || "trainer", force: !!data.force });
        return json(res, 200, { ok: true, kind, ...result });
      }
      if (kind === "plan") {
        const plan = data.plan || buildPlan(data.plan_options || data);
        const result = exportWithPython("plan", { plan, force: !!data.force });
        return json(res, 200, { ok: true, kind, ...result });
      }
      if (kind === "weekly") {
        const result = exportWithPython("weekly", { week_selector: data.week_selector || "current", force: !!data.force });
        return json(res, 200, { ok: true, kind, ...result });
      }
      return json(res, 400, { ok: false, error: "unknown_export_kind" });
    } catch (error) {
      return json(res, 500, { ok: false, error: "export_failed", details: String(error?.message || error) });
    }
  }

  // ── HabitSync proxy (avoid CORS + keep credentials server-side) ──
  if (p === "/habitsync/habits") {
    if (req.method !== "GET") return json(res, 405, { ok: false, error: "method_not_allowed" });
    try {
      const r = await fetch(`${HABITSYNC_BASE}/api/habit/list`, {
        headers: { Authorization: HS_AUTH },
      });
      const text = await r.text();
      res.writeHead(r.ok ? 200 : 502, { "Content-Type": "application/json;charset=utf-8" });
      res.end(text);
      return;
    } catch {
      return json(res, 502, { ok: false, error: "habitsync_unreachable" });
    }
  }

  if (p.startsWith("/habitsync/record/")) {
    if (req.method !== "POST") return json(res, 405, { ok: false, error: "method_not_allowed" });
    const uuid = decodeURIComponent(p.slice("/habitsync/record/".length));
    if (!uuid) return json(res, 400, { ok: false, error: "missing_uuid" });
    try {
      const r = await fetch(`${HABITSYNC_BASE}/api/record/${encodeURIComponent(uuid)}`, {
        method: "POST",
        headers: { Authorization: HS_AUTH, "Content-Type": "application/json" },
      });
      if (!r.ok) return json(res, 502, { ok: false, error: "habitsync_error", status: r.status });
      // HabitSync may return empty body; keep a stable local response.
      return json(res, 200, { ok: true });
    } catch {
      return json(res, 502, { ok: false, error: "habitsync_unreachable" });
    }
  }

  // ── Plan hint (reads plan.json if it exists) ──
  if (p === "/plan/today") {
    const date = url.searchParams.get("date") || localToday();
    const plan = readJson(path.join(DATA_DIR, "plan.json"));
    const dow  = ["So","Mo","Di","Mi","Do","Fr","Sa"][new Date(date + "T12:00:00").getDay()];
    if (plan) {
      const match = (plan.einheiten || []).find(e => (e.days || []).includes(dow));
      if (match) {
        const exercises = (match.abschnitte || []).flatMap(a => (a.übungen || a.uebungen || []).map(u => u.name));
        return json(res, 200, { ok: true, suggestion: { day: dow, block: match.name, exercises } });
      }
    }

    const fallback = {
      Mo: { block: "Push", exercises: ["Incline Dumbbell Press", "Dips", "Lateral Raise", "Cable Fly", "Triceps Extension"] },
      Di: { block: "Pull", exercises: ["Pull-Up", "Row", "Lat Pulldown", "Face Pull", "Biceps Curl"] },
      Mi: { block: "Legs", exercises: ["Squat", "Romanian Deadlift", "Lunge", "Leg Curl", "Calf Raise"] },
      Do: { block: "Upper", exercises: ["Bench Press", "Row", "Overhead Press", "Pulldown", "Curl"] },
      Fr: { block: "Lower", exercises: ["Deadlift", "Split Squat", "Hip Thrust", "Leg Curl", "Calf Raise"] },
      Sa: { block: "Full Body", exercises: ["Squat", "Press", "Row", "Hinge", "Carry"] },
      So: { block: "Recovery", exercises: ["Mobility", "Walk", "Core Breathing"] },
    }[dow] || { block: "Full Body", exercises: ["Squat", "Press", "Row"] };

    return json(res, 200, { ok: true, suggestion: { day: dow, block: fallback.block, exercises: fallback.exercises } });
  }

  // ── Blocks (from plan or defaults) ──
  if (p === "/blocks") {
    const plan   = readJson(path.join(DATA_DIR, "plan.json"));
    const blocks = defaultBlocks();
    for (const unit of (plan?.einheiten || [])) {
      const id = String(unit.name || "").trim().toLowerCase().replace(/\s+/g,"_");
      if (!id) continue;
      const label = String(unit.name || "").trim() || id;
      const muscle_groups = Array.isArray(unit.muscle_groups) ? unit.muscle_groups : [];
      const existing = blocks.find(block => block.id === id);
      if (existing) {
        existing.label = label || existing.label;
        existing.muscle_groups = [...new Set([...(existing.muscle_groups || []), ...muscle_groups])];
      } else {
        blocks.push({ id, label, muscle_groups });
      }
    }
    return json(res, 200, { ok: true, blocks });
  }

  // ── Session ──
  if (p === "/session") {
    const date = url.searchParams.get("date") || localToday();
    const file = path.join(DATA_DIR, "sessions", `${date}.json`);
    if (req.method === "GET") {
      const data = readJson(file);
      return data ? json(res, 200, { ok: true, data }) : json(res, 404, { ok: false });
    }
    if (req.method === "POST") {
      const data = B();
      const session = { ...data, date, saved_at: new Date().toISOString() };
      writeJson(file, session);
      syncSessionToDb(date, session);
      return json(res, 200, { ok: true });
    }
  }

  // ── Session history ──
  if (p === "/session/history") {
    const limit = Number(url.searchParams.get("limit") || 10);
    const dir   = path.join(DATA_DIR, "sessions");
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".json")).sort().reverse().slice(0, limit);
    const sessions = files.map(f => { const d = readJson(path.join(dir, f)); return { date: f.replace(".json",""), ...d }; });
    return json(res, 200, { ok: true, sessions });
  }

  // ── Session latest ──
  if (p === "/session/latest") {
    const dir   = path.join(DATA_DIR, "sessions");
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".json")).sort().reverse();
    if (!files.length) return json(res, 404, { ok: false });
    const data = readJson(path.join(dir, files[0]));
    return json(res, 200, { ok: true, session: { date: files[0].replace(".json",""), data } });
  }

  // ── Journal ──
  if (p === "/journal") {
    const date = url.searchParams.get("date") || localToday();
    const file = path.join(DATA_DIR, "journal", `${date}.md`);
    if (req.method === "GET") {
      if (!fs.existsSync(file)) return json(res, 404, { ok: false });
      const content = fs.readFileSync(file, "utf8");
      const mtime   = fs.statSync(file).mtime.toISOString().slice(0, 10);
      return json(res, 200, { ok: true, content, mtime });
    }
    if (req.method === "POST") {
      const { content } = B();
      fs.writeFileSync(file, content || "");
      return json(res, 200, { ok: true });
    }
  }

  // ── Journal list ──
  if (p === "/journal/list") {
    const dir   = path.join(DATA_DIR, "journal");
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".md")).sort().reverse().slice(0, 50);
    const entries = files.map(f => {
      const date  = f.replace(".md","");
      const mtime = fs.statSync(path.join(dir, f)).mtime.toISOString();
      return { date, mtime };
    });
    return json(res, 200, { ok: true, entries });
  }

  // ── Coverage ──
  if (p === "/coverage/detailed") {
    const days = Number(url.searchParams.get("days") || 7);
    const hits = computeCoverage(days);
    const GROUPS = {
      // Keep "muscles" as display labels; scoring is driven by normalized group IDs.
      chest: ["Chest"],
      back:  ["Back"],
      shoulders: ["Shoulders"],
      arms:  ["Arms"],
      core:  ["Core"],
      glutes: ["Glutes"],
      quads: ["Quads"],
      hamstrings: ["Hamstrings"],
      calves: ["Calves"],
    };
    const groups = Object.entries(GROUPS).map(([id, muscleNames]) => ({
      id,
      muscles: muscleNames.map(name => ({
        name_en:       name,
        primaryHits:   Math.round((hits[id] || 0)),
        secondaryHits: 0,
        totalScore:    hits[id] || 0,
      })),
    }));
    const muscles = groups.flatMap(g => g.muscles);
    return json(res, 200, { ok: true, groups, muscles });
  }

  if (p === "/coverage/anatomy") {
    const days = Number(url.searchParams.get("days") || 7);
    const muscles = computeCoverageAnatomy(days);
    return json(res, 200, { ok: true, days, muscles });
  }

  if (p === "/coverage/gaps") {
    const days = Number(url.searchParams.get("days") || 7);
    const hits = computeCoverage(days);
    const all  = ["chest","back","shoulders","arms","core","glutes","quads","hamstrings","calves"];
    const gaps = all
      .filter(g => (hits[g] || 0) < 1)
      .map(g => ({ name: g, hits: hits[g] || 0, exercises: [] }));
    return json(res, 200, { ok: true, gaps });
  }

  // ── Export (CSV) ──
  if (p === "/export/csv") {
    const days = Math.min(365, Math.max(1, Number(url.searchParams.get("days") || 14)));
    const dates = lastDates(days).reverse();
    const rows = [["date","block","location","duration_min","exercise","hit","sets","reps","weight","note","effort"]];
    for (const date of dates) {
      const sess = readJson(path.join(DATA_DIR, "sessions", `${date}.json`));
      const block = sess?.block || "";
      const effort = sess?.effort ?? "";
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
          ex.isHIT ? "" : String(ex.sets ?? ""),
          ex.isHIT ? "" : String(ex.reps ?? ""),
          String(ex.weight ?? ""),
          escapeCsvValue(ex.note || ""),
          String(effort),
        ]);
      }
    }
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n") + "\n";
    const filename = `fitness-${days}d-${localToday()}.csv`;
    return json(res, 200, { ok: true, filename, csv });
  }

  if (p === "/export/pflichtaufgabe") {
    const dir = path.join(DATA_DIR, "sessions");
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
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n") + "\n";
    const filename = `trainingsprotokoll-pflichtaufgabe-${localToday()}.csv`;
    return json(res, 200, { ok: true, filename, csv, count: nr - 1 });
  }

  // ── Body Metrics (Fitbit via fitness-mail) ──
  if (p === "/fitness/body") {
    const days = Math.min(365, Math.max(1, Number(url.searchParams.get("days") || 30)));
    fs.mkdirSync(BODY_DIR, { recursive: true });
    const files = fs.existsSync(BODY_DIR)
      ? fs.readdirSync(BODY_DIR).filter(f => f.match(/^\d{4}-\d{2}-\d{2}\.json$/)).sort().reverse().slice(0, days)
      : [];
    const entries = files.map(f => readJson(path.join(BODY_DIR, f))).filter(Boolean);
    if (req.method === "GET") return json(res, 200, { ok: true, entries });
    if (req.method === "POST") {
      const body = await new Promise(r => { let b=""; req.on("data",c=>b+=c); req.on("end",()=>r(b)); });
      const payload = JSON.parse(body);
      const day = payload.date || localToday();
      const file = path.join(BODY_DIR, `${day}.json`);
      const existing = readJson(file, { date: day });
      writeJson(file, { ...existing, ...payload, updated_at: new Date().toISOString() });
      return json(res, 200, { ok: true, day });
    }
  }

  // ── Theme ──
  const themeFile = path.join(DATA_DIR, "theme.json");
  if (p === "/theme") {
    if (req.method === "GET") return json(res, 200, readJson(themeFile, { theme: "mocha" }));
    if (req.method === "POST") {
      writeJson(themeFile, B());
      return json(res, 200, { ok: true });
    }
  }

  // ── Static ──
  let file = p === "/" ? "/index.html" : p;
  const abs = path.join(STATIC_DIR, file);
  if (!abs.startsWith(STATIC_DIR)) { res.writeHead(403); res.end(); return; }
  if (!fs.existsSync(abs)) {
    // SPA fallback
    const idx = path.join(STATIC_DIR, "index.html");
    if (fs.existsSync(idx)) { res.writeHead(200, { "Content-Type": "text/html;charset=utf-8" }); fs.createReadStream(idx).pipe(res); return; }
    res.writeHead(404); res.end("Not Found"); return;
  }
  res.writeHead(200, { "Content-Type": mime(abs) });
  fs.createReadStream(abs).pipe(res);
});

server.listen(PORT, HOST, () => console.log(`💪 fitness-dev on http://${HOST}:${PORT}`));
