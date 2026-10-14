# Audit: Inbox

## Zweck
Staging-Bereich für neue Übungsanfragen — KI-angereicherte Einträge warten auf Coach-Freigabe. Nicht in der Nav verlinkt, exklusiv für die lokale Coach-Umgebung.

## Komponenten
| Datei | Zweck | Zeilen |
|-------|-------|--------|
| `Inbox.jsx` | Hauptkomponente: Liste ausstehender Übungen mit Approve/Delete | 167 |
| `index.js` | Re-Export (Barrel) | 0 (leere Datei) |

## Datenfluss
- `getInbox()` aus `@db` → `GET /fitness/inbox` → `data?.exercises || []` → State `exercises`
  - Inbox.jsx normalisiert zusätzlich: `Array.isArray(data) ? data : data.exercises || []` — doppelte Normalisierung (kb.js macht bereits `data?.exercises || []`)
- `approveInbox(fileId)` aus `@db` → `POST /fitness/inbox/:id/approve`
- `deleteInbox(fileId)` aus `@db` → `DELETE /fitness/inbox/:id`
- State in `Inbox.jsx`: `exercises`, `loading`, `actioning`
- Einzige Prop: `onInspectExercise` (Callback für `ExerciseInsightModal` im Parent)

## Inline-Code (Extraktionskandidaten)
- Die Card-Render-Logik (Zeilen 74–148) ist vollständig inline — identische Struktur wie in `Coach/index.jsx`. Sollte als gemeinsame `InboxExerciseCard`-Komponente extrahiert werden.
- `fetchInbox()` + `handleApprove()` + `handleDelete()` könnten in Custom Hook `useInbox()`.
- Biomechanical-Warnings-Block (Zeilen 106–115) ist ein Kandidat für eigene `BiomechanicalWarnings`-Komponente.

## Kernfeatures (müssen nach jedem Refactoring erhalten bleiben)
- `isProactive`-Badge: `ex.description?.toLowerCase().includes("proactively")` → zeigt "Proaktiv" (blau) oder "Klient" (grün) Badge — unterscheidet KI-initiierte von Klienten-initiierten Anfragen
- Biomechanische Warnungen: `data.biomechanical_warnings || []` — werden als rote Warning-Badges gerendert, Zeile 106–115; komplett unsichtbar wenn Array leer
- `actioning`-Guard: beide Buttons (Approve + Delete) werden disabled solange eine Aktion läuft
- Optimistic UI: nach Approve/Delete wird Item per `.filter()` sofort aus State entfernt, kein Re-Fetch
- `ex.exercises?.[0] || {}` — Daten-Shape geht davon aus, dass `ex.exercises` ein Array ist; erstes Element wird als Übungsdaten verwendet
- Empty-State: eigener Block wenn `exercises.length === 0` (CheckCircle-Icon + Text), `Coach/index.jsx` hat das nicht
- Workflow-Info-Box am Ende (Zeilen 152–164) — erklärt den Approve-Prozess für den Coach
- `confirm()` vor Delete — einzige Bestätigungs-UX im System

## Auffälligkeiten
- `index.js` ist eine leere Datei (0 Bytes) — kein Re-Export. Imports die auf `views/Inbox` zielen würden ins Leere laufen; der Parent importiert vermutlich direkt `Inbox.jsx`
- Doppelte Normalisierung: `kb.js getInbox()` gibt bereits `data?.exercises || []` zurück (also immer ein Array), aber `Inbox.jsx` Zeile 18 prüft nochmals `Array.isArray(data) ? data : data.exercises || []` — der `data.exercises`-Zweig kann nie erreicht werden
- `ExternalLink` wird aus lucide-react importiert (Zeile 2), aber nie verwendet — toter Import
- `Trash2` wird importiert und genutzt — ok. `AlertTriangle` ebenfalls genutzt — ok.
- Fehlermeldungen via `alert()` (Zeilen 32, 47) — kein UI-Feedback-Pattern
- `approveInbox` in `Coach/index.jsx` übergibt `userId` als zweiten Parameter, hier nicht — API-Signatur ist inkonsistent zwischen den beiden Views
- Daten-Shape-Annahme (`ex.exercises?.[0]`) ist fragil: wenn das Backend ein flaches Objekt statt `{ exercises: [...] }` liefert, ist `data` ein leeres Objekt und alle Felder zeigen leer

## Status
okay — der Kernflow (fetch → list → approve/delete) funktioniert. Hauptprobleme: leere `index.js`, doppelte Normalisierung, toter `ExternalLink`-Import und die strukturelle Doppelung mit `Coach/index.jsx`.
