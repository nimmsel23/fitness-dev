/**
 * log-form.mjs
 * Log form event handling and server sync logic
 * Extracted from main.mjs for modularity
 */

/**
 * Normalizes a log entry to standard format
 * @param {Object} entry - Raw log entry
 * @param {string} todayIso - Today's date in ISO format
 * @returns {Object} Normalized log entry
 */
export function normalizeLogEntry(entry, todayIso) {
  return {
    date: String(entry?.date || todayIso),
    ts: String(entry?.ts || new Date().toISOString()),
    exercise: String(entry?.exercise || entry?.name || entry?.id || "").trim(),
    exercise_id: String(entry?.exercise_id || entry?.id || ""),
    group: String(entry?.group || ""),
    sets: Number.isFinite(Number(entry?.sets)) ? Number(entry?.sets) : 0,
    reps: Number.isFinite(Number(entry?.reps)) ? Number(entry?.reps) : 0,
    weight: Number.isFinite(Number(entry?.weight)) ? Number(entry?.weight) : 0,
  };
}

/**
 * Converts log entry to session exercise format for server
 * @param {Object} entry - Log entry
 * @returns {Object} Session exercise object
 */
export function toSessionExercise(entry) {
  return {
    id: entry.exercise_id || undefined,
    name: entry.exercise || "",
    group: entry.group || "",
    sets: Number.isFinite(Number(entry.sets)) ? Number(entry.sets) : 0,
    reps: Number.isFinite(Number(entry.reps)) ? Number(entry.reps) : 0,
    weight: Number.isFinite(Number(entry.weight)) ? Number(entry.weight) : 0,
    rpe: null,
    note: "",
  };
}

/**
 * Saves logs to server (session endpoint)
 * @param {Array} logs - All logs for today
 * @param {string} date - ISO date
 * @param {Function} apiUrl - API URL builder function
 * @returns {Promise<void>}
 */
export async function saveTodayLogsToServer(logs, date, apiUrl) {
  const body = {
    date,
    block: "",
    exercises: logs.map(toSessionExercise),
    notes: "",
    effort: null,
    mood: "",
  };

  const response = await fetch(apiUrl("session"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`session save failed: ${response.status}`);
  const payload = await response.json();
  if (!payload?.ok) throw new Error(String(payload?.error || "session save failed"));
}

/**
 * Binds log form submit handler
 * @param {Object} params - Parameters
 * @param {HTMLFormElement} params.form - Form element
 * @param {Object} params.inputs - { exercise, group, sets, reps, weight } input elements
 * @param {Function} params.resolveExercise - Exercise lookup function
 * @param {Function} params.inferGroup - Group inference function
 * @param {Function} params.onLogAdded - Callback after log is added (receives new log)
 * @param {Object} params.state - App state reference
 * @param {Function} params.writeLogs - localStorage write function
 * @param {Function} params.setSyncStatus - Sync status update function
 * @param {string} params.todayIso - Today's date
 * @param {Function} params.apiUrl - API URL builder
 */
export function bindLogForm({
  form,
  inputs,
  resolveExercise,
  inferGroup,
  onLogAdded,
  state,
  writeLogs,
  setSyncStatus,
  todayIso,
  apiUrl,
}) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const exerciseText = String(inputs.exercise.value || "").trim();
    if (!exerciseText) return;

    const match = resolveExercise(exerciseText);
    let group = String(inputs.group.value || "").trim();
    if (!group && match?.id) group = inferGroup(match.id);

    const sets = Number(inputs.sets.value || 0);
    const reps = Number(inputs.reps.value || 0);
    const weight = Number(inputs.weight.value || 0);

    const newLog = normalizeLogEntry(
      {
        date: todayIso,
        ts: new Date().toISOString(),
        exercise: match?.name_en || exerciseText,
        exercise_id: match?.id || "",
        group,
        sets: Number.isFinite(sets) ? sets : 0,
        reps: Number.isFinite(reps) ? reps : 0,
        weight: Number.isFinite(weight) ? weight : 0,
      },
      todayIso
    );

    state.logs.push(newLog);
    writeLogs(state.logs);

    // Server sync (if enabled)
    if (state.syncMode === "server") {
      try {
        await saveTodayLogsToServer(state.logs, todayIso, apiUrl);
        setSyncStatus("Sync: server aktiv");
      } catch (error) {
        state.syncMode = "local";
        setSyncStatus("Sync: lokaler Fallback (Server nicht erreichbar)", true);
        console.warn("[muscle-arena] server sync failed, switched to local mode", error);
      }
    }

    // Clear form
    inputs.exercise.value = "";

    // Callback to re-render
    if (onLogAdded) onLogAdded(newLog);
  });
}
