# Audit: Journal

## Zweck
Unified Activity Timeline — kombiniert freie Journal-Einträge, Habit-Journals, Habit-Completions und Workout-Sessions in einer chronologischen, nach Datum gruppierten Ansicht mit Inline-Editor.

## Komponenten
| Datei | Zweck | Zeilen |
|-------|-------|--------|
| `index.jsx` | Root-Komponente: State, Data-Fetching, Timeline-Aggregation, Submit-Logik | 257 |
| `JournalEntry.jsx` | Einzelner Timeline-Eintrag — rendert 4 Entry-Typen (regular / habit / habit-completion / workout) | 135 |
| `JournalForm.jsx` | Sticky Textarea-Form mit Edit-Modus-Indikator und Submit-Button | 51 |
| `JournalHeader.jsx` | Datum-Navigation (Prev/Next/DatePicker) + H1 mit relativeDate | 42 |
| `JournalModal.jsx` | Fullscreen-Modal für Detailansicht eines gewählten Timeline-Eintrags | 127 |
| `ARCHITECTURE.md` | Veraltete Kurzdokumentation (4 Zeilen, deckt aktuelle Komplexität nicht ab) | 15 |

## Datenfluss

### @db-Aufrufe (alle in index.jsx, `useEffect` auf `[limitCount, date]`)
- `getJournalHistory(limitCount)` — reguläre Journal-Einträge
- `getAllHabitJournalsHistory(limitCount)` — Habit-Journal-Einträge (mit `coachFeedback`)
- `getSessionHistory(limitCount)` — Workout-Sessions (gefiltert auf `done: true` exercises)
- `getHabits()` — alle Habits inkl. `.records[]` für Habit-Completion-Einträge
- `saveJournal(date, text)` — neuer Eintrag
- `updateJournal(editingEntry.id, text)` — bestehenden Eintrag updaten

### State in index.jsx
| State | Typ | Bedeutung |
|-------|-----|-----------|
| `date` | string | Aktives Datum für neuen Eintrag (Formular-Kontext) |
| `text` | string | Textarea-Inhalt |
| `timeline` | Array | Aggregierte, nach Datum gruppierte Entries |
| `habits` | Array | Alle Habits (für Icon/Name-Lookup in JournalEntry) |
| `saving` | bool | Ladezustand des Submit-Buttons |
| `toast` | string | Temporäre Feedback-Nachricht (2s Timeout) |
| `selectedEntry` | object\|null | Entry der im Modal gezeigt wird |
| `editingEntry` | object\|null | Entry der gerade bearbeitet wird (Edit-Modus) |
| `limitCount` | number | Pagination-Cursor, initial 30, +1 beim Save-Trigger, +30 beim "Ältere laden" |

### Props-Weitergabe
- `JournalHeader` ← `date`, `setDate`, `localToday()`, `formatRelativeDate`
- `JournalForm` ← `text`, `setText`, `onSubmit`, `saving`, `editingEntry`, `onCancelEdit`
- `JournalEntry` ← `e` (entry), `i` (index), `habits`, `setSelectedEntry`, `onEdit`
- `JournalModal` ← `selectedEntry`, `setSelectedEntry`, `habits`, `formatRelativeDate`

## Inline-Code (Extraktionskandidaten)

- **`formatRelativeDate(dateStr)`** (index.jsx Z.12–22) — Rein-funktionaler Datumsformatter, in `@utils` gehört
- **Timeline-Aggregationslogik** (index.jsx Z.46–108) — `combined`-Build + `grouped`-Reduce + Sort: ~60 Zeilen direkt in `load()`, eigenständige Funktion `buildTimeline(regularHistory, habitHistory, sessions, allHabits, limitCount)` wäre testbar
- **`EFFORT_LABELS`-Array** — identisch in `JournalEntry.jsx` (Z.3) und `JournalModal.jsx` (Z.3) definiert — gehört in eine shared Konstante (z.B. `src/constants/` oder `src/lib/fitness.js`)
- **`timeStr(e)`** (JournalEntry.jsx Z.5–9) — Zeitformatierung aus entry, äquivalente Logik nochmal inline in JournalModal.jsx Z.13–17 — Duplikat

## Kernfeatures (müssen nach jedem Refactoring erhalten bleiben)

- **4-Typ-Timeline**: `regular`, `habit`, `habit-completion`, `workout` werden zu einer einzigen chronologischen Liste gemergt — kein Typ darf verloren gehen
- **Auto-Load-Edit**: Wenn heute genau 1 regulärer Eintrag existiert, wird er beim Load automatisch in den Edit-Modus geladen (index.jsx Z.113–119) — subtil, leicht zu brechen
- **Sticky-Header pro Datum-Gruppe**: Zeigt `standaloneCompletions` (Habit-Icons) nur wenn kein Habit-Journal-Eintrag für dasselbe Habit an diesem Tag existiert — `habitJournalIds`-Set-Logik (Z.181–182)
- **Edit-Modus mit Datums-Wechsel**: `handleEdit` wechselt `date` auf den Eintrag-Kontext, `onCancelEdit` setzt es auf heute zurück
- **Pagination-Trick**: `saveJournal` triggert `setLimitCount(p => p + 1)` statt explizitem Reload — funktioniert weil `limitCount` in der `useEffect`-Dependency steht
- **Optimistic Update** bei `updateJournal`: Timeline wird sofort im State mutiert, kein Reload
- **`saved_at` Normalisierung**: Workout-Entries haben `saved_at` entweder als Firestore-Timestamp (`{ seconds }`) oder ISO-String — beide Fälle werden in Z.52–54 behandelt
- **`CalendarDays`-Import in JournalHeader** — importiert aber nicht gerendert (toter Import)

## Auffälligkeiten

- **`CalendarDays` toter Import** (JournalHeader.jsx Z.1) — importiert, nirgends genutzt
- **`EFFORT_LABELS` doppelt definiert** — identisch in JournalEntry.jsx und JournalModal.jsx, Sync-Risiko
- **`timeStr()`-Logik doppelt** — JournalEntry.jsx Z.5–9 vs. JournalModal.jsx Z.13–17, minimal unterschiedlich (Modal hat kein Fallback auf `''` bei fehlendem `time`)
- **`date`-State steuert zwei verschiedene Dinge**: Formular-Datum für neue Einträge + wird bei Edit auf das Eintrag-Datum gesetzt — nach Cancel-Edit zurückgesetzt, aber kein Tracking ob der User das Datum manuell geändert hat; Race Condition wenn User Datum ändert während Edit läuft
- **`useEffect`-Dependency `date`** — jede Datum-Navigation triggert kompletten Reload aller 4 Endpoints, auch wenn nur der Formular-Kontext wechselt; `date` wird in `load()` nur für den Auto-Load-Check genutzt (Z.113)
- **`editingEntry` nicht in `useEffect`-Deps** — `editingEntry` wird in `load()` geprüft (Z.117) aber nicht in den Deps, könnte stale closure sein
- **`habit-completion` Entries immer mit `time: T12:00:00`** — fiktive Mittagszeit, da `records` kein Timestamp hat; im Modal unsauber (zeigt "12:00 Uhr" als wären das echte Daten)
- **`i`-Prop in JournalEntry** — als `key`-Fallback genutzt, aber `i` selbst wird nicht gerendert oder anderweitig verwendet
- **`localToday` wird doppelt berechnet**: als Prop an `JournalHeader` übergeben (`localToday={localToday()}`) und intern im Header nicht gecacht — zur Render-Zeit zweimal aufgerufen
- **Kein Delete-Feature** — kein Button zum Löschen regulärer Einträge, nur Edit
- **`ARCHITECTURE.md` veraltet** — beschreibt nicht die tatsächliche 4-Typ-Timeline-Architektur

## Status
**okay** — Kern-Features funktionieren, Architektur ist verständlich. Zwei echte Risiken: doppeltes `EFFORT_LABELS` (Sync-Fehler beim Editieren) und der `useEffect`-Reload bei jedem Datum-Klick (Performance). Kein kritischer Bug.
