// App-Barrel für fitness-devs EIGENEN Firebase-Build (@db-Ziel in vite.config.js).
// Erweitert den reinen index.firestore.js-Barrel um die Fuel-Funktionen,
// die der eingebettete Journal-Tab (JournalTimeline.jsx) braucht.
//
// Andere Repos, die index.firestore.js direkt importieren (learn-dev, oder
// via @fitness-db wie vitalos/habits-dev), sollen KEINE @fuel-Abhängigkeit
// erzwungen bekommen — deshalb liegt der Fuel-Proxy hier, nicht dort.

export * from "./index.firestore.js";
export { getMealsHistory, getNutritionNotesHistory, getSupplementsHistory } from "@fuel/lib/db/firestore/index.js";
export { getRelaxSessionHistory } from "@relax/lib/db/firestore/sessions.js";
