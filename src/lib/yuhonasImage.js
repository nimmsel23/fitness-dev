// jsDelivr GitHub-CDN statt lokalem Bild-Spiegel — Repo ist public,
// kein Storage-/Deploy-Aufwand für ~200MB Bilder nötig (siehe fitness/catalog/CLAUDE.md).
const CDN_BASE = "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises";

export function yuhonasImageUrl(ex, frame = 0) {
  const ref = ex?.yuhonas_id || ex?.external_ids?.yuhonas?.[0];
  if (!ref) return null;
  return `${CDN_BASE}/${encodeURIComponent(ref)}/${frame}.jpg`;
}
