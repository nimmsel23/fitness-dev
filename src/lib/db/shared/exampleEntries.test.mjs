import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, sep } from "node:path";
import * as yaml from "js-yaml";
import { buildKbMap, findKbExercise } from "./kbLookup.js";

// Echte Katalog-Einträge, keine Test-Attrappen. Einträge wandern im KB-Leben
// von inbox/inbox_<id>.yml nach exercises/<id>.yml (Review/Approval) — der Test
// löst beide Orte auf, statt auf einen fixen Pfad zu bestehen.
const here = dirname(fileURLToPath(import.meta.url));
const KB = join(here, "../../../../fitness/catalog/kb");
const IDS = ["back_squat", "machine_chest_press", "incline_chest_press_machine", "samurai_extension"];
const kb = IDS.map((id) => {
  const candidates = [join(KB, `inbox/inbox_${id}.yml`), join(KB, `exercises/${id}.yml`)];
  const file = candidates.find((c) => existsSync(c));
  assert.ok(file, `KB-Eintrag fehlt: ${candidates.join(" oder ")}`);
  return {
    approved: file.includes(`${sep}exercises${sep}`),
    exercise: yaml.load(readFileSync(file, "utf8")).exercises[0],
  };
});
const map = buildKbMap(kb.map((e) => e.exercise));

test("die vier Session-Namen lösen auf ihren Katalogeintrag auf", () => {
  const cases = [
    ["Back Squat", "back_squat"],
    ["Brustmaschine", "machine_chest_press"],
    ["Schrägbrustpresse (Maschine)", "incline_chest_press_machine"],
    ["Samurai Extension", "samurai_extension"],
  ];
  for (const [name, id] of cases) {
    const hit = findKbExercise(map, { name });
    assert.equal(hit?.exercise_id, id, name);
    assert.ok(hit.primary_muscles.length > 0, `${name}: Muskeln für die Coverage`);
  }
});

test("Schreibvarianten und alte Session-IDs lösen ebenfalls auf", () => {
  assert.equal(findKbExercise(map, { name: "schrägbrustpresse maschine" })?.exercise_id, "incline_chest_press_machine");
  assert.equal(findKbExercise(map, { name: "x", id: "inbox_back_squat" })?.exercise_id, "back_squat");
  assert.equal(findKbExercise(map, { name: "x", exercise_id: "manual_samurai_extension" })?.exercise_id, "samurai_extension");
});

test("ID 'inbox_brustmaschine' aus Sessions greift bewusst nicht (Name entscheidet)", () => {
  const hit = findKbExercise(map, { name: "Schrägbrustpresse (Maschine)", id: "inbox_brustmaschine" });
  assert.equal(hit?.exercise_id, "incline_chest_press_machine");
});

test("Review-Status ist ehrlich: Inbox = Entwurf, exercises/ = approved", () => {
  for (const { approved, exercise: ex } of kb) {
    assert.equal(ex.review_state.status, approved ? "approved" : "draft");
    if (approved) assert.ok(ex.approved_at, "approved-Eintrag trägt approved_at");
    else assert.ok(!(ex.tags || []).includes("expert"));
  }
});
