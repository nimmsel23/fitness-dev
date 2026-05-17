/**
 * Seed exercises from yuhonas/free-exercise-db
 * https://github.com/yuhonas/free-exercise-db
 *
 * Usage: node seed/exercises.js
 * Or with local file: EXERCISES_FILE=./exercises.json node seed/exercises.js
 */

import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "../db/workoutforge.sqlite");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

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
`);

const LOCAL_FILE = process.env.EXERCISES_FILE;
const REMOTE_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";

async function load() {
  if (LOCAL_FILE) {
    console.log(`Loading from ${LOCAL_FILE}`);
    return JSON.parse(fs.readFileSync(LOCAL_FILE, "utf8"));
  }
  console.log("Fetching from yuhonas/free-exercise-db...");
  const res = await fetch(REMOTE_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const exercises = await load();
console.log(`Loaded ${exercises.length} exercises`);

const insert = db.prepare(`
  INSERT OR REPLACE INTO exercises (id, name, force, level, mechanic, equipment, primaryMuscles, secondaryMuscles, instructions, category, images)
  VALUES (@id, @name, @force, @level, @mechanic, @equipment, @primaryMuscles, @secondaryMuscles, @instructions, @category, @images)
`);

let count = 0;
db.transaction(() => {
  for (const ex of exercises) {
    insert.run({
      id:               ex.id,
      name:             ex.name,
      force:            ex.force ?? null,
      level:            ex.level ?? null,
      mechanic:         ex.mechanic ?? null,
      equipment:        ex.equipment ?? null,
      primaryMuscles:   JSON.stringify(ex.primaryMuscles ?? []),
      secondaryMuscles: JSON.stringify(ex.secondaryMuscles ?? []),
      instructions:     JSON.stringify(ex.instructions ?? []),
      category:         ex.category ?? null,
      images:           JSON.stringify(ex.images ?? []),
    });
    count++;
  }
})();

console.log(`✓ Seeded ${count} exercises into ${DB_PATH}`);
db.close();
