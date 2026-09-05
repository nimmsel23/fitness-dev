# Session-Tab Rebuild — Phase 1: Klein & isoliert (zuerst)

Quelle: Haiku-Doppel-Audit 2026-09-05 (DB-Layer + UI-Reihenfolge), siehe
`AUDIT.md` für den Gesamtkontext. Ziel dieser Phase: risikoarme, kleine
Stücke sauber ziehen, ohne den Rest anzufassen.

## Stücke

- [ ] **SplitPicker.jsx** (~65 Z.) — sauber isoliert (nur `block`/`setBlock`
      Props). Prüfen: `SPLITS`-Konstante evtl. mit Coach/Plan-Tabellen
      dupliziert, ggf. auf eine gemeinsame Quelle ziehen.
- [ ] **EffortPicker.jsx** (~50 Z.) — sauber isoliert (nur `effort`/`setEffort`
      Props). Hardcodierte Farben (`#22c55e`, `#ef4444` etc.) auf
      System-Tokens (`--green`, `--red`) umstellen.
- [ ] **Toast** (inline in `SessionEditor.jsx`) — kein Auto-Clear/Timer
      vorhanden. Eigene Komponente extrahieren + Timer/explizites Clear
      ergänzen.
- [ ] **Speichern-FAB (Mobile)** (inline in `SessionEditor.jsx`) —
      `bottom-24` ist hart codiert, kein `safe-area-inset-bottom` für
      Notch-Phones. Eigene Komponente extrahieren + Safe-Area-Fix.
- [ ] **Activity-Addon-Historie** (inline in `SessionEditor.jsx`, Zeile
      ~249-286) — reines read-only Display bereits gespeicherter Finisher.
      Sauber als eigene Komponente extrahieren (aktuell nur inline JSX).
      Naming-Klarstellung: `activityAddons` (Historie, gespeichert) vs.
      `activity` (aktuell in Bearbeitung) im Code/Kommentar festhalten,
      war beim Audit verwirrend.

## Definition of Done pro Stück

1. In eigene Datei extrahiert (falls noch inline).
2. Props-Interface klar dokumentiert (JSDoc-Kommentar reicht).
3. Kein Verhaltensunterschied zum Ist-Zustand (reines Refactoring, keine
   Feature-Änderung in dieser Phase).
4. Kurzer manueller Test im Browser (Session anlegen, Feld ändern, speichern).

## Nicht in dieser Phase

ExerciseCard/ExerciseList/SessionSlots/ActivityAddon+ActivitySection-Merge/
useSession.js — siehe [[PHASE2_TODO]] / [[PHASE3_TODO]].
