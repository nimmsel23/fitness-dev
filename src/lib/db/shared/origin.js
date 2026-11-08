// Additive Datenherkunfts-Kennzeichnung (HOTLIST 2026-11-07 „Fitness Dashboard:
// Cloud vs. local unterscheiden", task 115 / Org-Task 20). Lese-Rueckgaben des
// @db-Barrels tragen ein `_origin: 'cloud' | 'local'`. Rein additiv: kein
// bestehendes Feld wird umbenannt oder ueberschrieben (insb. `source` im
// Katalog-Kontext bleibt unberuehrt). Beim Schreiben wird `_origin` entfernt,
// damit es nie in Firestore-Dokumente oder lokale Speicher persistiert.

export const DATA_ORIGIN_CLOUD = "cloud";
export const DATA_ORIGIN_LOCAL = "local";

// Einzelobjekt kennzeichnen. Null/Array/Primitive unverändert zurück.
export function withDataOrigin(record, origin) {
  if (record === null || typeof record !== "object" || Array.isArray(record)) return record;
  return { ...record, _origin: origin };
}

// Liste von Lese-Rückgaben kennzeichnen.
export function tagListDataOrigin(list, origin) {
  if (!Array.isArray(list)) return list;
  return list.map((entry) => withDataOrigin(entry, origin));
}

// `_origin` aus einem zu schreibenden Payload entfernen (Guard gegen
// Persistierung des rein clientseitigen Kennzeichners).
export function withoutDataOrigin(record) {
  if (record === null || typeof record !== "object" || Array.isArray(record)) return record;
  if (!("_origin" in record)) return record;
  const copy = { ...record };
  delete copy._origin;
  return copy;
}
