import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DATA_ORIGIN_CLOUD,
  DATA_ORIGIN_LOCAL,
  withDataOrigin,
  tagListDataOrigin,
  withoutDataOrigin,
} from "./origin.js";

test("withDataOrigin: additive, ueberschreibt keine bestehenden Felder", () => {
  const session = { date: "2026-11-08", source: "catalog", exercises: [] };
  const tagged = withDataOrigin(session, DATA_ORIGIN_CLOUD);
  assert.equal(tagged._origin, "cloud");
  assert.equal(tagged.source, "catalog");
  assert.equal(tagged.date, "2026-11-08");
  assert.notEqual(tagged, session); // Kopie, Original unangetastet
  assert.equal(session._origin, undefined);
});

test("withDataOrigin: null/Array/Primitive unveraendert", () => {
  assert.equal(withDataOrigin(null, DATA_ORIGIN_CLOUD), null);
  assert.equal(withDataOrigin("x", DATA_ORIGIN_CLOUD), "x");
  assert.deepEqual(withDataOrigin([1, 2], DATA_ORIGIN_CLOUD), [1, 2]);
});

test("tagListDataOrigin: kennzeichnet Listenelemente", () => {
  const list = [{ date: "a" }, { date: "b" }];
  const tagged = tagListDataOrigin(list, DATA_ORIGIN_LOCAL);
  assert.deepEqual(tagged.map((s) => s._origin), ["local", "local"]);
  assert.deepEqual(tagListDataOrigin(null, DATA_ORIGIN_LOCAL), null);
});

test("withoutDataOrigin: entfernt _origin aus Schreib-Payloads", () => {
  const loaded = withDataOrigin({ date: "2026-11-08", effort: 7 }, DATA_ORIGIN_CLOUD);
  const cleaned = withoutDataOrigin(loaded);
  assert.equal(cleaned._origin, undefined);
  assert.equal(cleaned.effort, 7);
  // Ohne _origin: identisches Objekt zurueck (kein unnoetiges Kopieren)
  const clean = { date: "2026-11-08" };
  assert.equal(withoutDataOrigin(clean), clean);
});
