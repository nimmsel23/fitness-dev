// 6Pack-Training-Erinnerung (Push) — rein, ohne Firebase.
// Quellen:
//   users/{uid}/meta/sixpack          → Programm-Fortschritt + settings.reminder {enabled, time}
//   fitness/{uid}/settings/push       → apps.fitness {enabled, tokens, types, quietHours}
// Gleiche Regeln wie die lokale Erinnerung in der App (6pack-dev/reminder.js).

const { isQuietNow } = require("./pushPrefs.js");

const REST_DAYS_IN_WEEK = [3, 7];
const DAYS_PER_WEEK = 7;
const WINDOW_MINUTES = 5;

const dayInWeek = (day) => ((day - 1) % DAYS_PER_WEEK) + 1;
const weekOf = (day) => Math.floor((day - 1) / DAYS_PER_WEEK) + 1;

function toMinutes(text) {
  const match = /^(\d{2}):(\d{2})$/.exec(String(text || ""));
  if (!match) return null;
  const minutes = Number(match[1]) * 60 + Number(match[2]);
  return minutes < 24 * 60 ? minutes : null;
}

// Entscheidet, ob jetzt eine 6Pack-Erinnerung rausgehen soll.
// `local` = { date: "YYYY-MM-DD", minutes } in Berliner Zeit (getLocalDateParts).
function sixpackReminderDecision({ program, pushData, local, now = new Date() }) {
  const no = (why) => ({ send: false, why });
  const reminder = program?.settings?.reminder;
  if (!reminder?.enabled) return no("aus");
  if (!pushData?.enabled) return no("push-aus");
  if (pushData.types?.sixpack === false) return no("typ-aus");
  if (isQuietNow(pushData.quietHours, now)) return no("ruhezeit");

  const target = toMinutes(reminder.time);
  if (target == null) return no("zeit-ungueltig");
  const delta = local.minutes - target;
  if (delta < 0 || delta >= WINDOW_MINUTES) return no("nicht-faellig");

  if (pushData.sixpackReminderLastDate === local.date) return no("schon-gesendet");
  if (program.lastCompletedOn === local.date) return no("heute-trainiert");

  const currentDay = Number(program.currentDay) || 1;
  if (REST_DAYS_IN_WEEK.includes(dayInWeek(currentDay))) return no("ruhetag");

  return { send: true, why: "ok", vars: { week: weekOf(currentDay), day: dayInWeek(currentDay) } };
}

module.exports = { sixpackReminderDecision, weekOf, dayInWeek, WINDOW_MINUTES };
