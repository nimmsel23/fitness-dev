# Audit: Coach

## Zweck
Versteckte Admin-Ansicht ("Hidden Chamber") für Coach-seitige Verwaltung — nicht in der Nav, erreichbar per `#coach` (fitness-dev) bzw. eigener Sidebar-Button (vitalos, Sichtbarkeit per UID/Local-Mode-Gate).

## Komponenten
| Datei | Zweck | Zeilen |
|-------|-------|--------|
| `index.jsx` | 4 Sub-Tabs (Übungsanfragen/Klienten-Workouts/Katalog Browser/Plan-Zuweisung), lädt Journal-Feed + User-Profiles | 365 |
| `CatalogBrowser.jsx` | Vierter faktischer Bereich, eingebettet als 3. Sub-Tab: Übungssuche + Enhancer-Editor | 278 |
| `AssignPlan.jsx` | 4. Sub-Tab: Klient wählen, Plan bauen + an Klient pushen, zugewiesene Pläne + Fortschritt anzeigen | 235 |

## Sub-Tabs
1. **Übungsanfragen** (`activeSubTab === 'exercises'`) — nutzt `useInbox({ global: true })` (Hook aus `../Inbox/useInbox`, geteilt mit `Inbox.jsx`) + `InboxCard`-Komponente. Approve/Delete direkt aus dem Hook, keine eigene Logik hier.
2. **Klienten-Workouts** (`activeSubTab === 'journals'`) — `getGlobalJournalFeed()` (collectionGroup über sessions/journal/habitJournals, max. 50 Items) + `getAllUserProfiles()` für Klarnamen. Seit 2026-07-22: Filter-Leiste (Dropdown nach Klient, Toggle nach Typ Workout/Habit, Reset-Button) — vorher ungefiltert und bei vielen Klienten unübersichtlich.
3. **Katalog Browser** (`activeSubTab === 'catalog'`) — eigene Komponente `CatalogBrowser.jsx`, nutzt `searchExercises()` (liefert bei leerem Query bewusst `[]` — "erst tippen, dann suchen" ist Absicht, kein Bug), `getAnatomy()`, `saveExercise()`.
4. **Plan-Zuweisung** (`activeSubTab === 'plans'`) — eigene Komponente `AssignPlan.jsx`. Bis 2026-08-01 reine Stub-Funktionen (`getCoachAssignedPlans`/`assignPlanToClient`/`getClientPlanProgress` in `src/lib/db/index.js` gaben immer `[]`/`false`/`null` zurück, ohne Backend-Anbindung); jetzt echte Implementierung in `src/lib/db/{local,firestore}/assignedPlans.js`. Klienten-Auswahl per Dropdown aus `getAllUserProfiles()` (vorher: manuelle UID-Texteingabe).

## Datenfluss
- Inbox: `useInbox({ global: true })` → `getGlobalInbox()`/`getInbox()` (Firestore `collectionGroup(db, "inbox")`, siehe `firestore/sessions.js`) → State im Hook, nicht hier
- Journals: `getGlobalJournalFeed()` + `getAllUserProfiles()` (beide `firestore/utils.js`, `collectionGroup`-Queries auf `sessions`/`journal`/`habitJournals`/`profile`/`settings`) → lokaler State `journals`/`userProfiles`
- `filteredJournals` (Memo-freies `.filter()` bei jedem Render) — abgeleitet aus `journals` + `filterUserId` + `filterType`, kein eigener Fetch
- `saveCoachFeedback(userId, sessionId, type, text, habitId, date)` — Kommentar-Funktion, schreibt Feedback + Push-Notify (laut UI-Toast-Text)
- Catalog: eigenständiger State/Datenfluss komplett in `CatalogBrowser.jsx`, siehe dort
- Plan-Zuweisung: `getPlanSuggestion()` baut einen Plan (Template-Auswahl, ruft `/fitness/plan` bzw. Firestore-Pendant), `assignPlanToClient(coachUid, clientUid, plan)` schreibt ihn direkt in den Klienten-Datenraum (Firestore `wf_workouts` oder lokal `~/.aos/fitness/users/<uid>/plans/`), `getCoachAssignedPlans()` + `getClientPlanProgress()` laden die Liste + Tages-Fortschritt zurück. Eigenständiger State/Datenfluss komplett in `AssignPlan.jsx`.

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
Funktioniert (Stand 2026-07-22, nach den o.g. Fixes live verifiziert: Übungsanfragen zeigen Daten). Katalog-Browser- und Klienten-Workouts-Sub-Tab in derselben Session ebenfalls verifiziert bzw. um Filter ergänzt. Plan-Zuweisung (2026-08-01) per Build-Check verifiziert (Lint + `npm run build` sauber), nicht live gegen Prod-Firestore getestet — siehe `~/.claude/projects/-home-alpha-vitalos--git-modules-fitness-dev/memory/project_coach_assigned_plans_vs_klienten_dev.md` für den vollen Architektur-Kontext (klienten-dev/klienten-python als älteres Parallelsystem, VitalOS als geplante Coach-Shell).

## Update 2026-08-15: Struktur-Split + 5. Sub-Tab nachgetragen
- `index.jsx` ist jetzt 5 Sub-Tabs (diese Tabelle/Auflistung oben nannte nur 4 —
  `Klienten` (`ClientManagement.jsx`, seit 2026-08-06) fehlte hier schlicht).
- `index.jsx` selbst: 374 → ~90 Zeilen, reiner Tab-Router. Der komplette
  "Klienten-Workouts"-Block (Zeile 15 oben, Filter-Leiste + Feed-Rendering)
  lebt jetzt in eigener `ClientWorkoutsFeed.jsx` — gleiches Verhalten, nur
  eigene Datei, Muster jetzt konsistent mit `CatalogBrowser.jsx`/`AssignPlan.jsx`/
  `ClientManagement.jsx`. Build grün, keine funktionale Änderung.
- Der unter "Auffälligkeiten" genannte Punkt (kein gemeinsamer State zwischen
  Tabs) besteht unverändert fort — reiner Struktur-Split, keine State-Arbeit.
