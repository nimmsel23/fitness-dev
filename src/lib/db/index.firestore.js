// Firestore build barrel — re-exports all modular firestore/* + shared/* symbols.
// Vite alias: '@db' → this file when building with --mode firebase.

export * from "./firestore/core.js";
export * from "./firestore/sessions.js";
export * from "./firestore/journal.js";
export * from "./firestore/kb.js";
export * from "./firestore/inbox.js";
export * from "./firestore/coach.js";
export * from "./firestore/assignedPlans.js";
export * from "./firestore/macrocycles.js";
export * from "./firestore/analysis.js";
export * from "./firestore/user.js";
export * from "./firestore/utils.js";

// Shared utilities always available in both modes
export * from "./shared/utils.js";
export * from "./shared/muscle.js";
export * from "./shared/exercise.js";
export * from "./shared/parse.js";
export * from "./shared/favourites.js";

// Kein Fuel-Proxy hier: dieser Barrel wird auch von Repos importiert, die
// keine @fuel-Abhängigkeit haben (learn-dev). Konsumenten, die den
// eingebetteten Journal-Tab rendern und daher Fuel-Daten brauchen
// (fitness-devs eigener App-Build, habits-dev, journal-dev), holen sich
// getMealsHistory/getNutritionNotesHistory/getSupplementsHistory explizit
// selbst aus @fuel — siehe index.firestore.app.js.
