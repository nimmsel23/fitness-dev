// Firestore build barrel — re-exports all modular firestore/* + shared/* symbols.
// Vite alias: '@db' → this file when building with --mode firebase.

export * from "./firestore/core.js";
export * from "./firestore/sessions.js";
export * from "./firestore/journal.js";
export * from "./firestore/habits.js";
export * from "./firestore/kb.js";
export * from "./firestore/analysis.js";
export * from "./firestore/user.js";
export * from "./firestore/utils.js";

// Shared utilities always available in both modes
export * from "./shared/utils.js";
export * from "./shared/muscle.js";
export * from "./shared/parse.js";
export * from "./shared/favourites.js";

// Fuel Stub/Proxy - fitness-dev has no direct fuel implementation in its db layer
export { getMealsHistory } from "@fuel/lib/db/firestore/index.js";
