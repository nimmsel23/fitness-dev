/**
 * shared/favourites.js — localStorage-backed exercise favourites.
 * Mode-agnostic: works in both local and firebase builds.
 */

const FAV_KEY = "fitness_favourites";

export function getFavourites() {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
  } catch {
    return [];
  }
}

export function toggleFavourite(exerciseId) {
  const favs = getFavourites();
  const next = favs.includes(exerciseId)
    ? favs.filter((f) => f !== exerciseId)
    : [...favs, exerciseId];
  localStorage.setItem(FAV_KEY, JSON.stringify(next));
  return next.includes(exerciseId);
}
