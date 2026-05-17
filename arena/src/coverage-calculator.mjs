/**
 * coverage-calculator.mjs
 * Coverage calculation logic extracted from main.mjs
 * Implements volume-based muscle & group coverage computation
 */

/**
 * Clamps value to [0, 1] range
 * @param {number} value - Value to clamp
 * @returns {number} Clamped value
 */
export function clamp01(value) {
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

/**
 * Computes daily muscle and group coverage from logs
 * @param {Object} params - Parameters
 * @param {Array} params.logs - All log entries
 * @param {Object} params.anatomy - Anatomy data (muscles, muscle_groups)
 * @param {Map} params.mappingsByExercise - Exercise ID → muscle mappings
 * @param {Map} params.groupToMuscles - Group ID → muscles
 * @param {string} params.dateFilter - ISO date to filter logs (e.g. "2026-03-09")
 * @returns {{muscleCoverage: Object, groupCoverage: Object}}
 */
export function computeDailyCoverage({ logs, anatomy, mappingsByExercise, groupToMuscles, dateFilter }) {
  const muscles = anatomy?.muscles || [];
  const groups = anatomy?.muscle_groups || [];
  const dayLogs = logs.filter((entry) => entry.date === dateFilter);
  const rawMuscleScores = new Map(muscles.map((muscle) => [muscle.id, 0]));

  // Accumulate muscle scores from logs
  dayLogs.forEach((entry) => {
    const exerciseId = String(entry.exercise_id || "");
    const mappings = exerciseId ? mappingsByExercise.get(exerciseId) || [] : [];

    // Primary: Use exercise-muscle mappings if available
    if (mappings.length) {
      mappings.forEach((item) => {
        const muscleId = item?.muscle_id;
        if (!rawMuscleScores.has(muscleId)) return;
        rawMuscleScores.set(muscleId, rawMuscleScores.get(muscleId) + Number(item.weight || 0));
      });
      return;
    }

    // Fallback: Use muscle group assignment (less precise)
    const fallbackGroup = entry.group;
    const fallbackMuscles = groupToMuscles.get(fallbackGroup) || [];
    fallbackMuscles.forEach((muscle) => {
      rawMuscleScores.set(muscle.id, rawMuscleScores.get(muscle.id) + 0.35);
    });
  });

  // Normalize muscle scores to [0, 1] range
  const muscleCoverage = {};
  for (const [muscleId, score] of rawMuscleScores.entries()) {
    muscleCoverage[muscleId] = clamp01(score / 2);
  }

  // Compute group coverage as average of muscle coverage
  const groupCoverage = {};
  groups.forEach((group) => {
    const groupMuscles = groupToMuscles.get(group.id) || [];
    if (!groupMuscles.length) {
      groupCoverage[group.id] = 0;
      return;
    }
    const avg = groupMuscles.reduce((acc, muscle) => acc + (muscleCoverage[muscle.id] || 0), 0) / groupMuscles.length;
    groupCoverage[group.id] = clamp01(avg);
  });

  return { muscleCoverage, groupCoverage };
}

/**
 * Updates the SVG coverage ring based on group coverage
 * @param {Object} groupCoverage - Group coverage percentages
 * @param {Array} muscleGroups - Muscle groups from anatomy
 * @param {Object} domElements - { ring, scoreText } DOM elements
 */
export function renderCoverageRing(groupCoverage, muscleGroups, { ring, scoreText }) {
  const values = (muscleGroups || []).map((group) => groupCoverage[group.id] || 0);
  const avg = values.length ? values.reduce((acc, value) => acc + value, 0) / values.length : 0;
  const scorePct = Math.round(avg * 100);

  const circumference = 326.73;
  if (ring) ring.style.strokeDashoffset = (circumference * (1 - avg)).toFixed(2);
  if (scoreText) scoreText.textContent = `${scorePct}%`;
}
