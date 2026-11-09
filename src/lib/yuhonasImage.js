import { YUHONAS_CDN_EXERCISES } from './yuhonas.pin.js';

// jsDelivr at pinned SHA — bump via: node scripts/sync-yuhonas-pin.mjs
const CDN_BASE = YUHONAS_CDN_EXERCISES;

export function yuhonasImageUrl(ex, frame = 0) {
  const ref = ex?.yuhonas_id || ex?.external_ids?.yuhonas?.[0];
  if (!ref) return null;
  return `${CDN_BASE}/${encodeURIComponent(ref)}/${frame}.jpg`;
}

// yuhonas liefert pro Übung genau 2 Frames (Start-/Endposition der Bewegung)
// — als Paar zeigt das die Bewegung, ein einzelnes Bild nur eine Pose.
export function yuhonasImageUrls(ex) {
  const ref = ex?.yuhonas_id || ex?.external_ids?.yuhonas?.[0];
  if (!ref) return [];
  return [0, 1].map((frame) => `${CDN_BASE}/${encodeURIComponent(ref)}/${frame}.jpg`);
}
