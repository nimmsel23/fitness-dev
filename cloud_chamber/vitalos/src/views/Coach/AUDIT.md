# Audit: Coach

## Zweck
Versteckte Admin-Ansicht ("Hidden Chamber") für Coach-seitige Genehmigung von global eingereichten Übungen — nicht in der Nav, erreichbar per `#coach`.

## Komponenten
| Datei | Zweck | Zeilen |
|-------|-------|--------|
| `index.jsx` | Einzige Datei: lädt globale Inbox, rendert Approve-Liste | 108 |

## Datenfluss
- `getGlobalInbox()` aus `@db` → ruft intern `getInbox()` auf → `GET /fitness/inbox` → State `exercises`
- `approveInbox(fileId, userId)` aus `@db` → `POST /fitness/inbox/:id/approve` — userId wird übergeben, aber die `@db`-Implementierung ignoriert ihn (Signatur: `approveInbox(id)`, nur ein Parameter)
- `deleteInbox` wird importiert aber nie aufgerufen
- State in `index.jsx`: `exercises`, `loading`, `actioning`
- Kein Props-Drilling; einzige Prop: `onInspectExercise` (Callback zu `ExerciseInsightModal`)

## Inline-Code (Extraktionskandidaten)
- Die komplette Card-Render-Logik (Zeilen 54–104) ist direkt im JSX-Return inline. Bei einer zweiten Ansicht (Inbox) fast identisch — könnte als `InboxCard`-Komponente extrahiert werden.
- `fetchInbox()` + Approve/Delete-Handler könnten in einen Custom Hook `useGlobalInbox()`.

## Kernfeatures (müssen nach jedem Refactoring erhalten bleiben)
- `actioning`-Guard: Button wird disabled und zeigt "Wait..." während eine Aktion läuft (verhindert Doppelklick)
- Nach erfolgreichem Approve: optimistic UI — Item wird per `.filter()` sofort aus der Liste entfernt, kein Re-Fetch
- `ex.enriched || ex` Fallback: unterstützt zwei Daten-Shapes (enriched-Wrapper oder flaches Objekt)
- `userId` wird aus `ex.userId || "unknown"` gelesen und im Header jeder Card angezeigt — Mehrmandanten-Hinweis
- `onInspectExercise?.(data)` ist optional-chained — View funktioniert auch ohne den Callback

## Auffälligkeiten
- `deleteInbox` wird aus `@db` importiert (Zeile 3), aber nie verwendet — toter Import
- `approveInbox(fileId, userId)` übergibt `userId` an `@db`, aber `kb.js` definiert `approveInbox(id)` mit nur einem Parameter — userId geht still verloren, der Backend-Endpoint bekommt sie nicht
- `getGlobalInbox()` in `kb.js` ist ein Alias auf `getInbox()` ohne Unterschied — der "Global"-Begriff ist bedeutungslos solange es kein Mehrmandanten-Backend gibt
- Fehlermeldung bei Approve nur via `alert()` (Zeile 32) — kein UI-Feedback-Pattern
- Kein leerer Zustand: wenn `exercises.length === 0`, wird eine leere `<div className="grid">` gerendert (kein Empty-State wie in `Inbox.jsx`)
- Der Name der Komponente ist `Coach`, exportiert als `default` — aber das File liegt in `views/Coach/`, was suggeriert es ist eine eigenständige Coach-Ansicht, inhaltlich ist es aber nur eine zweite Inbox-Variante

## Status
okay — funktioniert, aber ist strukturell fast identisch mit `Inbox.jsx` und könnte konsolidiert werden. Toter Import + userId-Parameter-Bug sind bekannte Schwachstellen.
