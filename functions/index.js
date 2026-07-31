const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const TIME_ZONE = "Europe/Berlin";
const REMINDER_WINDOW_MINUTES = 5;
const REMINDER_TYPES = {
  workout: true,
  habit: true,
  coverage: true,
  restday: true,
};

function getLocalDateParts(date = new Date(), timeZone = TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    date: `${byType.year}-${byType.month}-${byType.day}`,
    time: `${byType.hour}:${byType.minute}`,
    minutes: Number(byType.hour) * 60 + Number(byType.minute),
  };
}

function parseReminderMinutes(reminderTime) {
  if (typeof reminderTime !== "string" || !/^\d{2}:\d{2}$/.test(reminderTime)) return null;
  const [hour, minute] = reminderTime.split(":").map(Number);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  return hour * 60 + minute;
}

function isReminderDue(reminderTime, currentMinutes) {
  const targetMinutes = parseReminderMinutes(reminderTime);
  if (targetMinutes == null) return false;
  const delta = currentMinutes - targetMinutes;
  return delta >= 0 && delta < REMINDER_WINDOW_MINUTES;
}

function getEnabledTypes(data = {}) {
  return { ...REMINDER_TYPES, ...(data.types || {}) };
}

function normalizeTokens(data = {}) {
  return Array.from(new Set([
    ...(Array.isArray(data.tokens) ? data.tokens : []),
    ...(data.token ? [data.token] : []),
  ].filter(Boolean)));
}

function exerciseHasTrainingSignal(exercise = {}) {
  if (!exercise || typeof exercise !== "object") return false;
  if (exercise.done === true) return true;

  const noteFields = [exercise.notes, exercise.comment, exercise.feedback]
    .filter((value) => typeof value === "string")
    .join(" ")
    .toLowerCase();
  if (/(done|completed|train|trained|workout|session|sent|yes|ja)/.test(noteFields)) return true;

  const numericFields = [exercise.sets, exercise.reps, exercise.weight, exercise.rpe, exercise.duration];
  if (numericFields.some((value) => Number(value) > 0)) return true;

  const setsArray = Array.isArray(exercise.setsArray) ? exercise.setsArray : [];
  return setsArray.some((set) => Number(set?.reps) > 0 || Number(set?.weight) > 0 || Number(set?.rpe) > 0);
}

async function getSessionsForDate(userRef, date) {
  const snap = await userRef.collection("sessions").where("date", "==", date).get();
  return snap.docs.map((doc) => doc.data() || {});
}

async function hasCompletedTrainingToday(userRef, date) {
  const sessions = await getSessionsForDate(userRef, date);
  return sessions.some((session) =>
    Array.isArray(session.exercises) && session.exercises.some((exercise) => exerciseHasTrainingSignal(exercise))
  );
}

async function getDaysSinceLastCompletedTraining(userRef, todayDate) {
  const snap = await userRef.collection("sessions").orderBy("date", "desc").limit(120).get();
  const today = new Date(`${todayDate}T12:00:00`);
  for (const doc of snap.docs) {
    const session = doc.data() || {};
    const date = session.date;
    if (!date) continue;
    const exercises = Array.isArray(session.exercises) ? session.exercises : [];
    if (!exercises.some((exercise) => exerciseHasTrainingSignal(exercise))) continue;
    const last = new Date(`${date}T12:00:00`);
    return Math.floor((today - last) / 86400000);
  }
  return null;
}

async function sendReminder(uid, tokens, title, body, link) {
  if (!tokens || tokens.length === 0) return { sentCount: 0, failureCount: 0 };

  try {
    const message = {
      data: {
        title,
        body,
        link: link || "/?tab=session",
        tag: "fitness-reminder",
      },
      tokens,
    };
    const response = await admin.messaging().sendEachForMulticast(message);
    return {
      sentCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error(`Error sending reminders to ${uid}:`, error);
    return { sentCount: 0, failureCount: tokens.length, error: error.message };
  }
}

exports.scheduledPushReminders = functions
  .region("us-central1")
  .pubsub.schedule("every 5 minutes")
  .timeZone(TIME_ZONE)
  .onRun(async (context) => {
    const { date, minutes } = getLocalDateParts();
    const db = admin.firestore();
    let sentCount = 0;
    let failureCount = 0;

    try {
      const usersSnap = await db.collectionGroup("push").get();

      for (const doc of usersSnap.docs) {
        const data = doc.data() || {};
        if (!data.enabled) continue;

        const tokens = normalizeTokens(data);
        if (tokens.length === 0) continue;

        if (isReminderDue(data.reminderTime, minutes)) {
          const uid = doc.ref.parent.parent.id;
          const userRef = db.collection("fitness").doc(uid);
          const trained = await hasCompletedTrainingToday(userRef, date);

          if (!trained) {
            const result = await sendReminder(
              uid,
              tokens,
              "Workout Reminder",
              "Zeit für dein Training!",
              "/?tab=session"
            );
            sentCount += result.sentCount || 0;
            failureCount += result.failureCount || 0;
          }
        }
      }

      console.log(`Push reminders: ${sentCount} sent, ${failureCount} failed`);
      return { sentCount, failureCount };
    } catch (error) {
      console.error("Error in scheduledPushReminders:", error);
      return { error: error.message };
    }
  });

exports.onCoachFeedback = functions
  .region("us-central1")
  .firestore.document("fitness/{uid}/sessions/{sid}")
  .onWrite(async (change, context) => {
    const { uid } = context.params;
    const newData = change.after.data() || {};
    const oldData = change.before.data() || {};

    if (!newData.coachFeedback || newData.coachFeedback === oldData.coachFeedback) {
      return null;
    }

    const db = admin.firestore();
    const pushDoc = await db.collection("fitness").doc(uid).collection("settings").doc("push").get();
    const pushData = pushDoc.data() || {};

    if (!pushData.enabled) return null;

    const tokens = normalizeTokens(pushData);
    if (tokens.length === 0) return null;

    return sendReminder(
      uid,
      tokens,
      "Coach Feedback",
      newData.coachFeedback.substring(0, 100),
      "/?tab=session"
    );
  });
