import express from "express";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "../db/workoutforge.sqlite");
const CLIENT_DIST = path.join(__dirname, "../client/dist");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ── Schema ────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS exercises (
    id               TEXT PRIMARY KEY,
    name             TEXT NOT NULL,
    force            TEXT,
    level            TEXT,
    mechanic         TEXT,
    equipment        TEXT,
    primaryMuscles   TEXT,
    secondaryMuscles TEXT,
    instructions     TEXT,
    category         TEXT,
    images           TEXT
  );

  CREATE TABLE IF NOT EXISTS workouts (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    goal        TEXT,
    description TEXT,
    created_at  TEXT DEFAULT (datetime('now')),
    updated_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS workout_exercises (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id    TEXT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id   TEXT NOT NULL REFERENCES exercises(id),
    "order"       INTEGER DEFAULT 0,
    sets          INTEGER DEFAULT 3,
    reps          TEXT DEFAULT '8-12',
    weight_type   TEXT DEFAULT 'kg',
    rest_seconds  INTEGER DEFAULT 90,
    notes         TEXT,
    superset_group INTEGER
  );

  CREATE TABLE IF NOT EXISTS workout_sessions (
    id               TEXT PRIMARY KEY,
    workout_id       TEXT REFERENCES workouts(id),
    started_at       TEXT DEFAULT (datetime('now')),
    finished_at      TEXT,
    duration_seconds INTEGER,
    notes            TEXT
  );

  CREATE TABLE IF NOT EXISTS session_sets (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id          TEXT NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
    workout_exercise_id INTEGER REFERENCES workout_exercises(id),
    set_number          INTEGER,
    reps                INTEGER,
    weight              REAL,
    rir                 INTEGER,
    completed           BOOLEAN DEFAULT 0
  );
`);

// ── DB Migrations ─────────────────────────────────────────

const existingCols = db.prepare("PRAGMA table_info(workout_exercises)").all().map(r => r.name);
const addCol = (col, type) => { if (!existingCols.includes(col)) db.exec(`ALTER TABLE workout_exercises ADD COLUMN ${col} ${type}`); };
addCol("rir", "INTEGER");
addCol("rpe", "REAL");
addCol("tempo", "TEXT");
addCol("effort", "TEXT DEFAULT 'normal'");
addCol("drop_set", "BOOLEAN DEFAULT 0");

const app = express();
const PORT = process.env.PORT || 3333;

app.use(express.json());

// Serve built frontend
app.use(express.static(CLIENT_DIST));

// ── Health ────────────────────────────────────────────────

app.get("/api/health", (req, res) => {
  const count = db.prepare("SELECT COUNT(*) as n FROM exercises").get();
  res.json({ ok: true, exercises: count.n });
});

// ── Exercises ─────────────────────────────────────────────

app.get("/api/exercises", (req, res) => {
  const { q, muscle, equipment, category, limit = 50, offset = 0 } = req.query;
  let sql = "SELECT id, name, force, level, mechanic, equipment, primaryMuscles, secondaryMuscles, category FROM exercises WHERE 1=1";
  const params = [];

  if (q) {
    sql += " AND name LIKE ?";
    params.push(`%${q}%`);
  }
  if (muscle) {
    sql += " AND (primaryMuscles LIKE ? OR secondaryMuscles LIKE ?)";
    params.push(`%${muscle}%`, `%${muscle}%`);
  }
  if (equipment) {
    sql += " AND equipment = ?";
    params.push(equipment);
  }
  if (category) {
    sql += " AND category = ?";
    params.push(category);
  }

  sql += " ORDER BY name LIMIT ? OFFSET ?";
  params.push(Number(limit), Number(offset));

  const rows = db.prepare(sql).all(...params);
  res.json({ ok: true, results: rows.map(r => ({
    ...r,
    primaryMuscles: JSON.parse(r.primaryMuscles || "[]"),
    secondaryMuscles: JSON.parse(r.secondaryMuscles || "[]"),
  }))});
});

app.get("/api/exercises/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM exercises WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ ok: false, error: "not found" });
  res.json({ ok: true, exercise: {
    ...row,
    primaryMuscles: JSON.parse(row.primaryMuscles || "[]"),
    secondaryMuscles: JSON.parse(row.secondaryMuscles || "[]"),
    instructions: JSON.parse(row.instructions || "[]"),
    images: JSON.parse(row.images || "[]"),
  }});
});

app.get("/api/exercises/meta/muscles", (_req, res) => {
  const rows = db.prepare("SELECT primaryMuscles FROM exercises").all();
  const set = new Set();
  rows.forEach(r => JSON.parse(r.primaryMuscles || "[]").forEach(m => set.add(m)));
  res.json({ ok: true, muscles: [...set].sort() });
});

app.get("/api/exercises/meta/equipment", (_req, res) => {
  const rows = db.prepare("SELECT DISTINCT equipment FROM exercises WHERE equipment IS NOT NULL ORDER BY equipment").all();
  res.json({ ok: true, equipment: rows.map(r => r.equipment) });
});

// ── Workouts ──────────────────────────────────────────────

app.get("/api/workouts", (_req, res) => {
  const workouts = db.prepare("SELECT * FROM workouts ORDER BY updated_at DESC").all();
  res.json({ ok: true, workouts });
});

app.post("/api/workouts", (req, res) => {
  const { name, goal, description } = req.body;
  if (!name) return res.status(400).json({ ok: false, error: "name required" });
  const id = `wk-${Date.now()}`;
  db.prepare("INSERT INTO workouts (id, name, goal, description) VALUES (?, ?, ?, ?)").run(id, name, goal || null, description || null);
  res.json({ ok: true, id });
});

app.get("/api/workouts/:id", (req, res) => {
  const workout = db.prepare("SELECT * FROM workouts WHERE id = ?").get(req.params.id);
  if (!workout) return res.status(404).json({ ok: false, error: "not found" });
  const exercises = db.prepare(`
    SELECT we.*, e.name, e.primaryMuscles, e.secondaryMuscles, e.equipment, e.category
    FROM workout_exercises we
    JOIN exercises e ON e.id = we.exercise_id
    WHERE we.workout_id = ?
    ORDER BY we."order"
  `).all(req.params.id).map(r => ({
    ...r,
    primaryMuscles: JSON.parse(r.primaryMuscles || "[]"),
    secondaryMuscles: JSON.parse(r.secondaryMuscles || "[]"),
  }));
  res.json({ ok: true, workout: { ...workout, exercises } });
});

app.patch("/api/workouts/:id", (req, res) => {
  const { name, goal, description } = req.body;
  db.prepare("UPDATE workouts SET name = COALESCE(?, name), goal = COALESCE(?, goal), description = COALESCE(?, description), updated_at = datetime('now') WHERE id = ?")
    .run(name ?? null, goal ?? null, description ?? null, req.params.id);
  res.json({ ok: true });
});

app.delete("/api/workouts/:id", (req, res) => {
  db.prepare("DELETE FROM workouts WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// ── Workout Exercises ─────────────────────────────────────

app.post("/api/workouts/:id/exercises", (req, res) => {
  const { exercise_id, sets, reps, weight_type, rest_seconds, notes, rir, rpe, tempo, effort, drop_set } = req.body;
  if (!exercise_id) return res.status(400).json({ ok: false, error: "exercise_id required" });
  const maxOrder = db.prepare("SELECT MAX(\"order\") as m FROM workout_exercises WHERE workout_id = ?").get(req.params.id);
  const order = (maxOrder.m ?? -1) + 1;
  const { lastInsertRowid } = db.prepare(
    `INSERT INTO workout_exercises (workout_id, exercise_id, "order", sets, reps, weight_type, rest_seconds, notes, rir, rpe, tempo, effort, drop_set)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(req.params.id, exercise_id, order, sets ?? 3, reps ?? "8-12", weight_type ?? "kg", rest_seconds ?? 90, notes ?? null,
        rir ?? null, rpe ?? null, tempo ?? null, effort ?? "normal", drop_set ? 1 : 0);
  res.json({ ok: true, id: lastInsertRowid });
});

app.patch("/api/workouts/:id/exercises/:exId", (req, res) => {
  const { sets, reps, weight_type, rest_seconds, notes, order, rir, rpe, tempo, effort, drop_set } = req.body;
  db.prepare(`UPDATE workout_exercises SET
    sets = COALESCE(?, sets), reps = COALESCE(?, reps),
    weight_type = COALESCE(?, weight_type), rest_seconds = COALESCE(?, rest_seconds),
    notes = COALESCE(?, notes), "order" = COALESCE(?, "order"),
    rir = COALESCE(?, rir), rpe = COALESCE(?, rpe),
    tempo = COALESCE(?, tempo), effort = COALESCE(?, effort),
    drop_set = COALESCE(?, drop_set)
    WHERE id = ? AND workout_id = ?`)
    .run(sets ?? null, reps ?? null, weight_type ?? null, rest_seconds ?? null, notes ?? null, order ?? null,
         rir ?? null, rpe ?? null, tempo ?? null, effort ?? null, drop_set !== undefined ? (drop_set ? 1 : 0) : null,
         req.params.exId, req.params.id);
  res.json({ ok: true });
});

app.delete("/api/workouts/:id/exercises/:exId", (req, res) => {
  db.prepare("DELETE FROM workout_exercises WHERE id = ? AND workout_id = ?").run(req.params.exId, req.params.id);
  res.json({ ok: true });
});

// Reorder (bulk)
app.put("/api/workouts/:id/exercises/order", (req, res) => {
  const { order } = req.body; // [{ id, order }]
  if (!Array.isArray(order)) return res.status(400).json({ ok: false });
  const stmt = db.prepare("UPDATE workout_exercises SET \"order\" = ? WHERE id = ? AND workout_id = ?");
  db.transaction(() => order.forEach(({ id, order: o }) => stmt.run(o, id, req.params.id)))();
  res.json({ ok: true });
});

// ── SPA fallback ──────────────────────────────────────────

app.use((_req, res) => {
  res.sendFile(path.join(CLIENT_DIST, "index.html"));
});

app.listen(PORT, () => console.log(`WorkoutForge on http://localhost:${PORT}`));
