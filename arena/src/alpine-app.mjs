/**
 * alpine-app.mjs
 * Alpine.js reactive component for MUSCLE ARENA sidebar
 * Handles Quick Log form + Muscle Info + Today's Logs
 */

import { normalizeLogEntry } from "./log-form.mjs";
import { saveTodayLogsToServer } from "./log-form.mjs";

/**
 * Creates Alpine.js app instance for sidebar
 * @param {Object} deps - Dependencies injected from main.mjs
 * @returns {Object} Alpine.js component data & methods
 */
export function createArenaApp({
  state,
  resolveExercise,
  inferGroup,
  apiUrl,
  todayIso,
  writeLogs,
  onLogAdded,
  fillExerciseDatalist,
}) {
  return {
    // Reactive state
    syncMode: state.syncMode,
    syncStatus: "Sync: initialisiere...",
    syncWarning: false,
    logCount: state.logs.length, // Track log count for reactivity trigger

    formData: {
      exercise: "",
      group: "",
      sets: 3,
      reps: 8,
      weight: 0,
    },

    muscleInfo: {
      title: "Muskel-Info",
      meta: "Tippe auf einen Muskel im Skeleton.",
      topExercises: [],
    },

    // Computed properties (getters)
    get muscleGroups() {
      return (state.anatomy?.muscle_groups || []).map((group) => ({
        id: group.id,
        name: group.names?.de || group.names?.en || group.id,
      }));
    },

    get todayLogs() {
      // Reference logCount to make this reactive to log additions
      const _ = this.logCount;
      const today = todayIso();
      return state.logs
        .filter((log) => log.date === today)
        .reverse()
        .map((log) => {
          const groupLabel =
            (state.anatomy?.muscle_groups || []).find((g) => g.id === log.group)?.names?.de ||
            log.group ||
            "n/a";
          return { ...log, groupLabel };
        });
    },

    get exerciseOptions() {
      const items = state.exerciseDb?.exercise_index || [];
      const selectedGroup = this.formData.group;

      // Filter exercises by selected muscle group if one is selected
      let filtered = items;
      if (selectedGroup) {
        filtered = items.filter((ex) => {
          // Check if exercise targets the selected muscle group
          const exerciseMuscles = state.mappingsByExercise.get(ex.id) || [];
          return exerciseMuscles.some((mapping) => {
            const muscle = state.muscleById.get(mapping.muscle_id);
            return muscle?.group === selectedGroup;
          });
        });
      }

      return filtered
        .slice(0, 100) // Reduced to 100 for better performance when filtered
        .map(
          (ex) =>
            `<option value="${ex.name_en || ex.id}" label="${ex.name_de || ex.name_en || ex.id}"></option>`
        )
        .join("");
    },

    // Methods
    init() {
      // Listen for custom events from skeleton
      this.$el.addEventListener("focus-exercise", () => {
        const input = this.$el.querySelector('input[x-model="formData.exercise"]');
        if (input) input.focus();
      });

      // Set initial sync status
      this.updateSyncStatus();
    },

    updateSyncStatus() {
      this.syncMode = state.syncMode;
      if (this.syncMode === "server") {
        this.syncStatus = "Sync: server aktiv";
        this.syncWarning = false;
      } else {
        this.syncStatus = "Sync: lokaler Fallback";
        this.syncWarning = true;
      }
    },

    onGroupChange() {
      // When group changes, find best muscle and show info
      const groupId = this.formData.group;
      const candidates = state.groupToMuscles.get(groupId) || [];
      if (!candidates.length) return;

      const bestMuscle = candidates
        .slice()
        .sort((a, b) => (state.muscleCoverage[b.id] || 0) - (state.muscleCoverage[a.id] || 0))[0];

      if (bestMuscle) this.showMuscleInfo(bestMuscle.id);

      // Update exercise suggestions datalist with filtered exercises
      const datalist = this.$refs.exerciseSuggestions;
      if (datalist) datalist.innerHTML = this.exerciseOptions;
    },

    showMuscleInfo(muscleId) {
      const muscle = state.muscleById.get(muscleId);
      if (!muscle) return;

      const group = (state.anatomy?.muscle_groups || []).find((g) => g.id === muscle.group);
      const groupLabel = group?.names?.de || group?.names?.en || muscle.group;
      const latin = muscle?.names?.la || "n/a";
      const deName = muscle?.names?.de || muscle?.names?.en || muscleId;
      const score = Math.round((state.muscleCoverage[muscleId] || 0) * 100);

      this.muscleInfo = {
        title: deName,
        meta: `${latin} | ${groupLabel} | Coverage heute: ${score}%`,
        topExercises: (state.muscleExerciseRank.get(muscleId) || []).slice(0, 3),
      };

      // Update form group select
      if (muscle.group) this.formData.group = muscle.group;
    },

    async submitLog() {
      const exerciseText = String(this.formData.exercise || "").trim();
      if (!exerciseText) return;

      const match = resolveExercise(exerciseText);
      let group = String(this.formData.group || "").trim();
      if (!group && match?.id) group = inferGroup(match.id);

      // If exercise not found in DB, add to to-add list
      if (!match) {
        try {
          await fetch(apiUrl("exercises/to-add"), {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              exercise: exerciseText,
              context: {
                group,
                sets: this.formData.sets,
                reps: this.formData.reps,
                weight: this.formData.weight,
              },
            }),
          });
        } catch (err) {
          console.warn("[arena] failed to add to to-add list:", err);
        }
      }

      const newLog = normalizeLogEntry(
        {
          date: todayIso(),
          ts: new Date().toISOString(),
          exercise: match?.name_en || exerciseText,
          exercise_id: match?.id || "",
          group,
          sets: this.formData.sets,
          reps: this.formData.reps,
          weight: this.formData.weight,
        },
        todayIso()
      );

      state.logs.push(newLog);
      writeLogs(state.logs);

      // Trigger Alpine reactivity for todayLogs computed property
      this.logCount = state.logs.length;

      // Server sync
      if (state.syncMode === "server") {
        try {
          await saveTodayLogsToServer(state.logs, todayIso(), apiUrl);
          this.syncStatus = "Sync: server aktiv";
          this.syncWarning = false;
        } catch (error) {
          state.syncMode = "local";
          this.syncMode = "local";
          this.syncStatus = "Sync: lokaler Fallback (Server nicht erreichbar)";
          this.syncWarning = true;
          console.warn("[muscle-arena] server sync failed, switched to local mode", error);
        }
      }

      // Clear form (keep sets/reps/weight defaults)
      this.formData.exercise = "";

      // Trigger re-render callback (updates skeleton + coverage)
      if (onLogAdded) onLogAdded(newLog);

      // After coverage is recalculated, refresh muscle info display
      // Use setTimeout to let renderScene() complete first
      setTimeout(() => {
        if (group) {
          const candidates = state.groupToMuscles.get(group) || [];
          if (candidates.length) {
            const best = candidates
              .slice()
              .sort((a, b) => (state.muscleCoverage[b.id] || 0) - (state.muscleCoverage[a.id] || 0))[0];
            if (best) this.showMuscleInfo(best.id);
          }
        }
      }, 50);
    },
  };
}
