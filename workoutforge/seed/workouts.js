import Database from "better-sqlite3";
import { readFileSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "../db/workoutforge.sqlite");
const WORKOUTS_DIR = path.join(__dirname, "../workouts");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Fuzzy exercise lookup: finds best match by name
function findExercise(searchName) {
  const clean = searchName.trim();
  // Exact match first
  let row = db.prepare("SELECT id, name FROM exercises WHERE name = ? COLLATE NOCASE").get(clean);
  if (row) return row;
  // LIKE match
  row = db.prepare("SELECT id, name FROM exercises WHERE name LIKE ? COLLATE NOCASE ORDER BY length(name) LIMIT 1")
    .get(`%${clean}%`);
  if (row) return row;
  // Word-by-word: try each word as search term
  const words = clean.split(/\s+/).filter(w => w.length > 3);
  for (const word of words) {
    row = db.prepare("SELECT id, name FROM exercises WHERE name LIKE ? COLLATE NOCASE ORDER BY length(name) LIMIT 1")
      .get(`%${word}%`);
    if (row) return row;
  }
  return null;
}

function seedWorkout(file) {
  const raw = readFileSync(path.join(WORKOUTS_DIR, file), "utf-8");
  const data = yaml.load(raw);

  const workoutId = data.id;
  const exists = db.prepare("SELECT id FROM workouts WHERE id = ?").get(workoutId);
  if (exists) {
    console.log(`  ⏭  Skipping "${data.name}" (already exists)`);
    return;
  }

  db.prepare("INSERT INTO workouts (id, name, goal, description) VALUES (?, ?, ?, ?)")
    .run(workoutId, data.name, data.goal ?? null, data.notes ?? null);

  let inserted = 0;
  let skipped = 0;

  for (const ex of data.exercises ?? []) {
    const found = findExercise(ex.name);
    if (!found) {
      console.log(`    ⚠  No match for "${ex.name}" — skipped`);
      skipped++;
      continue;
    }

    // Ensure new columns exist (run migration inline if needed)
    const cols = db.prepare("PRAGMA table_info(workout_exercises)").all().map(r => r.name);
    const addCol = (col, type) => { if (!cols.includes(col)) db.exec(`ALTER TABLE workout_exercises ADD COLUMN ${col} ${type}`); };
    addCol("rir", "INTEGER");
    addCol("rpe", "REAL");
    addCol("tempo", "TEXT");
    addCol("effort", "TEXT DEFAULT 'normal'");
    addCol("drop_set", "BOOLEAN DEFAULT 0");

    db.prepare(`
      INSERT INTO workout_exercises
        (workout_id, exercise_id, "order", sets, reps, rest_seconds, notes,
         rir, rpe, tempo, effort, drop_set, superset_group)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      workoutId,
      found.id,
      ex.order ?? 0,
      ex.sets ?? 3,
      ex.reps ?? "8-12",
      ex.rest_seconds ?? 90,
      ex.notes ?? null,
      ex.rir ?? null,
      ex.rpe ?? null,
      ex.tempo ?? null,
      ex.effort ?? "normal",
      ex.drop_set ? 1 : 0,
      ex.superset_group ?? null,
    );

    console.log(`    ✓  "${ex.name}" → "${found.name}"`);
    inserted++;
  }

  console.log(`  ✅ "${data.name}" — ${inserted} exercises inserted, ${skipped} skipped`);
}

const files = readdirSync(WORKOUTS_DIR).filter(f => f.endsWith(".yaml") || f.endsWith(".yml"));
console.log(`\nSeeding ${files.length} workout(s)...\n`);
for (const file of files) {
  console.log(`📋 ${file}`);
  seedWorkout(file);
}
console.log("\nDone.\n");
