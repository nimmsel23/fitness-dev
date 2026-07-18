// Local (API) build barrel — re-exports all modular local/* + shared/* symbols.
// Vite alias: '@db' → this file in default (non-firebase) builds.

export * from "./local/core.js";
export * from "./local/sessions.js";
export * from "./local/journal.js";
export * from "./local/habits.js";
export * from "./local/kb.js";
export * from "./local/analysis.js";
export * from "./local/user.js";
export * from "./local/utils.js";

// Shared utilities always available in both modes
export * from "./shared/utils.js";
export * from "./shared/muscle.js";
export * from "./shared/parse.js";
export * from "./shared/favourites.js";

// Fuel Stub - local mode has no direct access to fuel server db
export async function getMealsHistory(_limit) { return []; }
export async function getSupplementsHistory(_limit) { return []; }
