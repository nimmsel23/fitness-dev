# Audit: Coach

## Zweck
Versteckte Admin-Ansicht ("Hidden Chamber") für Coach-seitige Verwaltung — nicht in der Nav, erreichbar per `#coach` (fitness-dev) bzw. eigener Sidebar-Button (vitalos, Sichtbarkeit per UID/Local-Mode-Gate).

## Komponenten
| Datei | Zweck | Zeilen |
|-------|-------|--------|
| `index.jsx` | 3 Sub-Tabs (Übungsanfragen/Klienten-Workouts/Katalog Browser), lädt Journal-Feed + User-Profiles | 353 |
| `CatalogBrowser.jsx` | Vierter faktischer Bereich, eingebettet als 3. Sub-Tab: Übungssuche + Enhancer-Editor | 278 |

## Sub-Tabs
1. **Übungsanfragen** (`activeSubTab === 'exercises'`) — nutzt `useInbox({ global: true })` (Hook aus `../Inbox/useInbox`, geteilt mit `Inbox.jsx`) + `InboxCard`-Komponente. Approve/Delete direkt aus dem Hook, keine eigene Logik hier.
2. **Klienten-Workouts** (`activeSubTab === 'journals'`) — `getGlobalJournalFeed()` (collectionGroup über sessions/journal/habitJournals, max. 50 Items) + `getAllUserProfiles()` für Klarnamen. Seit 2026-07-22: Filter-Leiste (Dropdown nach Klient, Toggle nach Typ Workout/Habit, Reset-Button) — vorher ungefiltert und bei vielen Klienten unübersichtlich.
3. **Katalog Browser** (`activeSubTab === 'catalog'`) — eigene Komponente `CatalogBrowser.jsx`, nutzt `searchExercises()` (liefert bei leerem Query bewusst `[]` — "erst tippen, dann suchen" ist Absicht, kein Bug), `getAnatomy()`, `saveExercise()`.

## Datenfluss
- Inbox: `useInbox({ global: true })` → `getGlobalInbox()`/`getInbox()` (Firestore `collectionGroup(db, "inbox")`, siehe `firestore/sessions.js`) → State im Hook, nicht hier
- Journals: `getGlobalJournalFeed()` + `getAllUserProfiles()` (beide `firestore/utils.js`, `collectionGroup`-Queries auf `sessions`/`journal`/`habitJournals`/`profile`/`settings`) → lokaler State `journals`/`userProfiles`
- `filteredJournals` (Memo-freies `.filter()` bei jedem Render) — abgeleitet aus `journals` + `filterUserId` + `filterType`, kein eigener Fetch
- `saveCoachFeedback(userId, sessionId, type, text, habitId, date)` — Kommentar-Funktion, schreibt Feedback + Push-Notify (laut UI-Toast-Text)
- Catalog: eigenständiger State/Datenfluss komplett in `CatalogBrowser.jsx`, siehe dort

## Kernfeatures (müssen nach jedem Refactoring erhalten bleiben)
- Journal-Feed: `coachFeedback` wird beim Laden in `commentsText` vorbefüllt, damit bestehende Kommentare beim erneuten Öffnen sichtbar sind
- Filter-Leiste (Klient-Dropdown + Typ-Toggle) ist rein clientseitig, kein Re-Fetch bei Filterwechsel — `journalClients` wird aus den bereits geladenen `userProfiles` + tatsächlich vorkommenden `userId`s in `journals` abgeleitet, nicht aus der vollen Profil-Liste (sonst tauchen Klienten ohne Aktivität im Filter auf)
- Header-Zähler zeigt `gefiltert/gesamt` im Journals-Tab, reine Zahl in den anderen Tabs
- `onInspectExercise` wird an `InboxCard` (Übungsanfragen) und `CatalogBrowser` (Detail Inspector Button) durchgereicht — optional, beide Views funktionieren ohne

## Auffälligkeiten
- Kein eigener Loading-/Error-State für die Filter-Leiste selbst (rein synchron, unkritisch)
- `CatalogBrowser.jsx` und `index.jsx` haben keinen gemeinsamen State — Auswahl einer Übung im Katalog-Browser wirkt sich nicht auf die anderen Tabs aus (z.B. kein "diese Übung wurde gerade in der Inbox freigegeben, jetzt im Katalog bearbeiten"-Fluss)
- `journals`-Feed ist auf 50 Items gedeckelt (`getGlobalJournalFeed(limitCount = 50)`) — bei aktiven Klienten mit vielen Sessions könnten ältere Einträge rausfallen, ohne dass das in der UI sichtbar wäre (kein "mehr laden")

## Bekannte, in dieser Session gefixte Bugs (nicht mehr aktuell, zur Historie)
- `.reference` statt `.ref` in `getGlobalInbox()`/`getGlobalJournalFeed()`/`getAllUserProfiles()` (Firestore v8-vs-v9-API-Verwechslung) — verursachte einen stillen Crash, alle drei Sub-Tabs zeigten nichts an. Fix: Commit `c46c713`.
- Inbox-Writes von Nicht-Coach-Usern schlugen an `firestore.rules` fehl (fehlendes `userId`-Feld) — Klienten-Einträge kamen nie an. Fix: Commit `4647717`.

## Status
Funktioniert (Stand 2026-07-22, nach den o.g. Fixes live verifiziert: Übungsanfragen zeigen Daten). Katalog-Browser- und Klienten-Workouts-Sub-Tab in derselben Session ebenfalls verifiziert bzw. um Filter ergänzt.
