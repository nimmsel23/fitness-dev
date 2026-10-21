const test = require("node:test");
const assert = require("node:assert/strict");
const { sixpackReminderDecision, weekOf, dayInWeek } = require("./sixpackReminder.js");

const base = {
  program: { currentDay: 4, lastCompletedOn: "2026-10-20", settings: { reminder: { enabled: true, time: "18:00" } } },
  push: { tokens: ["t"] },
  local: { date: "2026-10-21", minutes: 18 * 60 + 2 },
};
const decide = (patch = {}) => sixpackReminderDecision({ ...base, ...patch });

test("sendet im 5-Minuten-Fenster mit Woche/Tag", () => {
  const r = decide();
  assert.equal(r.send, true);
  assert.deepEqual(r.vars, { week: 1, day: 4 });
  assert.equal(decide({ program: { ...base.program, currentDay: 9 } }).vars.day, 2);
  assert.equal(weekOf(9), 2);
  assert.equal(dayInWeek(14), 7);
});

test("Fenster: vor und nach der Zeit nicht", () => {
  assert.equal(decide({ local: { date: "2026-10-21", minutes: 17 * 60 + 59 } }).why, "nicht-faellig");
  assert.equal(decide({ local: { date: "2026-10-21", minutes: 18 * 60 + 5 } }).why, "nicht-faellig");
  assert.equal(decide({ local: { date: "2026-10-21", minutes: 18 * 60 } }).send, true);
});

test("aus / keine Geräte / ungültige Zeit", () => {
  const off = { ...base.program, settings: { reminder: { enabled: false, time: "18:00" } } };
  assert.equal(decide({ program: off }).why, "aus");
  assert.equal(decide({ program: undefined }).why, "aus");
  assert.equal(decide({ push: undefined }).why, "keine-geraete");
  assert.equal(decide({ push: { tokens: [] } }).why, "keine-geraete");
  const bad = { ...base.program, settings: { reminder: { enabled: true, time: "kaputt" } } };
  assert.equal(decide({ program: bad }).why, "zeit-ungueltig");
});

test("nicht bei heute trainiert, Ruhetag, schon gesendet", () => {
  assert.equal(decide({ program: { ...base.program, lastCompletedOn: "2026-10-21" } }).why, "heute-trainiert");
  assert.equal(decide({ program: { ...base.program, currentDay: 3 } }).why, "ruhetag");
  assert.equal(decide({ program: { ...base.program, currentDay: 14 } }).why, "ruhetag");
  assert.equal(decide({ push: { tokens: ["t"], lastReminderDate: "2026-10-21" } }).why, "schon-gesendet");
});
