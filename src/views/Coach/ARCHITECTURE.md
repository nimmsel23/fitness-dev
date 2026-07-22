# View Architecture: Coach

Command Center für Coach-seitige Exercise-Freigabe, Klienten-Journal-Feed und Katalog-Enhancer. Erreichbar im Coach-Tab oder per `#coach` für den Coach Superuser (`isCoach()`).

## Komponenten

- **`index.jsx`**: Haupt-View mit Sub-Tab Navigation:
  1. `Übungsanfragen` (`InboxCard` / `useInbox`)
  2. `Klienten-Workouts` (Global Feed aller Workouts, Journals und Habit-Journals mit Coach-Feedback; clientseitiger Filter nach Klient + Typ, seit 2026-07-22)
  3. `Katalog Browser` (`CatalogBrowser.jsx`)
- **`CatalogBrowser.jsx`**: Interaktiver Katalog-Enhancer zum Suchen, Analysieren (Anatomie-Cues, Biomechanik, Muskelgruppen) und Bearbeiten/Speichern von Übungen in Firestore (`fitness/kb/exercises`).

## Datenfluss (Firebase / Firestore)

- **Inbox**: `getGlobalInbox()` (in `firestore/sessions.js`) fragt `collectionGroup(db, "inbox")` ab und lädt alle ausstehenden Übungsanfragen (`pending_review`, `ai_enriched`), filtert `approved`/`rejected` raus.
- **Klienten-Feed**: `getGlobalJournalFeed()` (in `firestore/utils.js`) lädt per `collectionGroup` Daten aus `sessions`, `journal` und `habitJournals`. `getAllUserProfiles()` löst Namen/Metadaten über `profile` und `settings` Subcollections auf.
- **Feedback**: `saveCoachFeedback()` speichert Kommentare direkt in der entsprechenden Klienten-Dokument-Referenz.
- **Katalog**: `searchExercises()`, `getAnatomy()`, `saveExercise()` arbeiten direkt mit `fitness/kb/exercises` und `fitness/kb/anatomy`.
