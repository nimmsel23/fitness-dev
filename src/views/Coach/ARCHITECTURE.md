# View Architecture: Coach

Command Center für Coach-seitige Exercise-Freigabe, Klienten-Journal-Feed und Katalog-Enhancer. Erreichbar im Coach-Tab oder per `#coach` für den Coach Superuser (`isCoach()`).

## Komponenten

- **`index.jsx`**: Haupt-View mit Sub-Tab Navigation:
  1. `Übungsanfragen` (`InboxCard` / `useInbox`)
  2. `Klienten-Workouts` (Global Feed aller Workouts, Journals und Habit-Journals mit Coach-Feedback; clientseitiger Filter nach Klient + Typ, seit 2026-07-22)
  3. `Katalog Browser` (`CatalogBrowser.jsx`)
  4. `Plan-Zuweisung` (`AssignPlan.jsx`, seit 2026-08-01 mit echter Backend-Anbindung statt Stub)
  5. `Klienten` (`ClientManagement.jsx`, seit 2026-08-06) — Status pro User (Klient/Freund·Test)
- **`CatalogBrowser.jsx`**: Interaktiver Katalog-Enhancer zum Suchen, Analysieren (Anatomie-Cues, Biomechanik, Muskelgruppen) und Bearbeiten/Speichern von Übungen in Firestore (`fitness/kb/exercises`).
- **`AssignPlan.jsx`**: Coach wählt einen Klienten (Dropdown aus `getAllUserProfiles()`), baut einen Plan (`getPlanSuggestion()`, Template-Auswahl) und pusht ihn direkt an den Klienten (`assignPlanToClient()`). Zeigt darunter bereits zugewiesene Pläne dieses Coaches an diesen Klienten inkl. Tages-Fortschritt (`getClientPlanProgress()`).
- **`ClientManagement.jsx`**: Listet alle User aus `getAllUserProfiles()`, pro User ein Klient/Freund-Toggle. Status landet in `fitness/{uid}/profile/metadata` via `updateUserProfile()` (Firestore) bzw. `localStorage` (lokal) — rein informativ, keine Firestore-Rule/Filter hängt daran.

## Datenfluss (Firebase / Firestore)

- **Inbox**: `getGlobalInbox()` (in `firestore/sessions.js`) fragt `collectionGroup(db, "inbox")` ab und lädt alle ausstehenden Übungsanfragen (`pending_review`, `ai_enriched`), filtert `approved`/`rejected` raus.
- **Klienten-Feed**: `getGlobalJournalFeed()` (in `firestore/utils.js`) lädt per `collectionGroup` Daten aus `sessions`, `journal` und `habitJournals`. `getAllUserProfiles()` löst Namen/Metadaten über `profile` und `settings` Subcollections auf.
- **Feedback**: `saveCoachFeedback()` speichert Kommentare direkt in der entsprechenden Klienten-Dokument-Referenz.
- **Katalog**: `searchExercises()`, `getAnatomy()`, `saveExercise()` arbeiten direkt mit `fitness/kb/exercises` und `fitness/kb/anatomy`.
- **Plan-Zuweisung**: `assignPlanToClient(coachUid, clientUid, plan)` — Firestore schreibt per `setDoc` (merge) auf `fitness/{clientUid}/wf_workouts/{planId}` (neue ID via `doc(collection(...)).id` falls `plan.id` fehlt); Local-Build ruft `POST /fitness/coach/plans/:clientUid` (`server.mjs`) auf, das nach `~/.aos/fitness/users/<clientUid>/plans/<planId>.json` schreibt. Beide Backends teilen sich dieselbe Funktionssignatur (`src/lib/db/{firestore,local}/assignedPlans.js`). Klienten-seitiges Abarbeiten des zugewiesenen Plans läuft außerhalb dieses View-Ordners in `src/views/Plan/AssignedPlans.jsx` (Training-Tab, kein eigener Coach-Unterpunkt).
