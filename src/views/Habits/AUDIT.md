# Audit: Habits

## Zweck
Friktionsloses Tracking von Non-Workout-Gewohnheiten (Hydration, Schlaf, Supplements etc.) mit Datum-Navigation, 28-Tage-Konsistenzansicht, Habit-Journal und Coach-Habit-Unterstützung.

## Komponenten
| Datei | Zweck | Zeilen |
|-------|-------|--------|
| `index.jsx` | Root-Controller: State, Datenladen, Callbacks, Layout | 293 |
| `HabitItem.jsx` | Einzelne Habit-Karte: Toggle, Inline-Edit, Icon-Auswahl, Coach-Badge | 93 |
| `HabitForm.jsx` | Formular für neuen Habit (Name + Icon) | 37 |
| `HabitSidebar.jsx` | Slide-in Panel: 28-Tage-Heatmap, Tages-Status, Journal-Preview, History | 150 |
| `HabitJournalModal.jsx` | Vollbild-Modal für Habit-Reflexion (Textarea + Auto-Save) | 91 |
| `HabitStats.jsx` | Tages-Completion-Progressbar + statisches Motivationszitat | 33 |
| `utils.js` | `ICON_OPTIONS`, `ICON_COMPONENTS_MAP`, `getRollingDays()`, `DAY_LABELS` | 22 |

## Datenfluss

### @db-Funktionen (alle aus `@db` importiert in index.jsx)
- `getHabits()` — lädt alle Habits (inkl. `records[]` pro Habit)
- `getHabitRecordsForDate(date)` — liefert Array von UUIDs die an `date` als DONE markiert sind
- `recordHabit(uuid, date)` — Habit-Completion setzen
- `unrecordHabit(uuid, date)` — Habit-Completion aufheben
- `addHabit(name, icon)` — neuen Habit anlegen
- `deleteHabit(uuid)` — Habit soft-delete
- `updateHabit(uuid, name, icon)` — Name + Icon aktualisieren
- `getHabitJournal(habitId, date)` — einzelnen Journal-Eintrag laden
- `saveHabitJournal(habitId, date, text)` — Journal-Eintrag speichern
- `getHabitJournalHistory(habitId)` — alle Journal-Einträge eines Habits (für History-Panel)
- `isLocalMode()` — HabitItem: bestimmt ob Coach-Habits editierbar sind

### State in index.jsx
| State | Typ | Zweck |
|-------|-----|-------|
| `habits` | Array | Alle Habits + `isDoneForSelectedDate` injiziert |
| `loading` | bool | Lade-Indikator (aktuell kein Spinner gerendert) |
| `newHabit` | string | Eingabefeld für neuen Habit |
| `selectedIcon` | string | Icon-Auswahl für neuen Habit |
| `saving` | bool | Disabled-State des Add-Buttons |
| `selectedDate` | string `YYYY-MM-DD` | Aktiv gewähltes Datum im 10-Tage-Picker |
| `editingHabitId` | uuid\|null | Welcher Habit gerade inline editiert wird |
| `editingIcon` | string\|null | Icon-Auswahl während Edit |
| `selectedHabitId` | uuid\|null | Welcher Habit die Sidebar öffnet |
| `selectedSidebarDate` | string | Datum im Sidebar-Heatmap (synced mit selectedDate) |
| `journalText` | string | Aktueller Journal-Text (für Modal + Sidebar-Preview) |
| `journalHistory` | Array | Alle Journal-Einträge des selectedHabit |
| `isJournalSaving` | bool | Speicher-Indikator (Puls-Icon) |
| `journalModalOpen` | bool | HabitJournalModal öffnen/schließen |

### Props-Weitergabe
- `HabitForm` bekommt: `newHabit`, `setNewHabit`, `selectedIcon`, `setSelectedIcon`, `onAdd`, `saving`
- `HabitItem` bekommt: vollständiges Habit-Objekt `h`, Selection/Edit/Toggle-Callbacks + `selectedDate` (für Subtitle)
- `HabitSidebar` bekommt: `selectedHabitId`, `setSelectedHabitId`, `habits[]`, `rollingDates`, `selectedSidebarDate`, `setSelectedSidebarDate`, `journalText`, `isJournalSaving`, `onToggleSidebarDone`, `journalHistory`, `onOpenJournalModal`
- `HabitJournalModal` bekommt: `open`, `onClose`, `habit`-Objekt, `date`, `journalText`, `setJournalText`, `isJournalSaving`, `onSaveJournal`
- `HabitStats` bekommt: `todayCompletionPercentage`, `getMotivationalMessage` (Funktion)

## Inline-Code (Extraktionskandidaten)

- **10-Tage-Datumspicker** (index.jsx Z. 181–217): Horizontaler Scroller mit Wochentag/Tag-Buttons. Eigenständige UI-Logik, könnte `HabitDatePicker.jsx` sein.
- **`overallConsistency`-Berechnung** (index.jsx Z. 132–135): Aggregiert über alle Habits × 28 Tage. Könnte in `utils.js` als `calcOverallConsistency(habits, rollingDates)` extrahiert werden.
- **`getMotivationalMessage()`** (index.jsx Z. 140–145): Reine Pure Function, lebt in index.jsx, wird als Prop zu `HabitStats` weitergereicht. Besser in `utils.js`.
- **`selectedHabitConsistency`-Berechnung** (HabitSidebar.jsx Z. 21–22): Identische Konsistenz-Logik wie in index.jsx, aber für ein einzelnes Habit. Dopplung.
- **`getRollingDays(28)` direkter Call** (HabitSidebar.jsx Z. 51): Erzeugt einen zweiten Array von 28 Daten innerhalb der Render-Funktion — der gleiche Array kommt als Prop `rollingDates` rein, wird aber nicht verwendet für die Grid-Generierung. Konkretes redundantes Recalculate.

## Kernfeatures (müssen nach jedem Refactoring erhalten bleiben)

- **`isDoneForSelectedDate` auf jedem Habit-Objekt**: Wird in `load()` injiziert via `getHabitRecordsForDate(selectedDate)`. HabitItem rendert Checked-State daraus. Kein eigener `done`-State in HabitItem.
- **`selectedDate` triggert `load()`**: `useEffect([selectedDate])` — Datum wechseln lädt frisch aus DB, kein client-seitiges Filter.
- **`selectedSidebarDate` ist von `selectedDate` entkoppelt**: Sidebar-Datum kann unabhängig vom Hauptdatum navigiert werden (eigener State, wird nur beim Datumswechsel initialisiert).
- **Journal-State gehört zum Paar `(selectedHabitId, selectedSidebarDate)`**: `useEffect([selectedHabitId, selectedSidebarDate])` setzt `journalText` zurück + lädt neu. Text-State lebt in index.jsx und wird sowohl an Sidebar (Preview) als auch Modal weitergereicht.
- **Coach-Habit-Guard in HabitItem**: `canEdit = isLocalMode() || !isCoachHabit` — Habits mit `source: 'coach'` sind im Firebase-Modus read-only (kein Edit/Delete).
- **Backdrop-Overlay schließt Sidebar**: Festes `div.inset-0.z-40` hinter Sidebar, `onClick` setzt `selectedHabitId(null)`. Sidebar selbst liegt auf `z-50`, Modal auf `z-60`.
- **Journal Modal Auto-Save**: `onBlur` des Textareas, `Esc`-Key und `Ctrl+Enter` triggern alle `onSaveJournal()`. Sidebar-Preview zeigt immer den gleichen `journalText`-State.
- **`coachFeedback`-Feld in Journal-History**: Sidebar und History-Panel rendern `item.coachFeedback` wenn vorhanden (AI-Feedback-Pipeline, aktuell optional).
- **Heatmap-Grid nutzt `getRollingDays(28)`**: Feste 28-Tage-Fenster, keine Monatslogik. `rollingDates` als `useMemo` in index.jsx, davon unabhängiger Call in HabitSidebar (Bug, s. Auffälligkeiten).

## Auffälligkeiten

- **`toggleSidebarDone` liest `h?.records` statt `getHabitRecordsForDate`** (index.jsx Z. 91): Prüft `h.records.some(r => r.date === date && r.completion === 'DONE')`. Aber `records` auf dem Habit-Objekt kommt aus `getHabits()` und ist nicht dasselbe Format wie das Ergebnis von `getHabitRecordsForDate()` (das liefert nur UUIDs). Falls `records` nicht mitgeliefert wird, ist `h?.records` undefined → `undefined?.some()` = undefined → isDone = false, Toggle schlägt in falsche Richtung.
- **`HabitSidebar` ruft `getRollingDays(28)` inline auf** (Z. 51) anstatt die als Prop mitgegebene `rollingDates` zu nutzen — erzeugt bei jedem Render einen neuen Array, der identisch zu `rollingDates` wäre. Die prop `rollingDates` wird nur für `selectedHabitConsistency` genutzt, nicht für die Grid-Generierung.
- **`loading`-State ohne Render-Effekt**: `setLoading(true/false)` wird gesetzt, aber in der JSX gibt es keinen Spinner oder Skeleton — nur `habits.length === 0 && !loading` für den Empty State. Für den eigentlichen Ladevorgang hat der User kein Feedback.
- **`DAY_LABELS` in utils.js exportiert aber nirgends importiert**: `["So", "Mo", ...]` ist definiert, taucht in keiner der Komponenten auf. Toter Export.
- **`getMotivationalMessage` als Funktion-Prop zu HabitStats**: Die Funktion wird in index.jsx definiert und als Prop weitergereicht — HabitStats könnte einfach `percentage` bekommen und die Logik selbst halten, oder die Funktion direkt in `utils.js` leben.
- **`editingIcon` und `editingHabitId` als getrennte States**: `useEffect` synct `editingIcon` aus dem Habit wenn `editingHabitId` sich ändert. Wäre einfacher als ein State `editingHabit: { id, icon } | null`.
- **`confirm()` für Delete** (index.jsx Z. 127): Nativer Browser-Dialog, blockierend — nicht konsistent mit dem Rest der UI.
- **Kein Fehler-Handling in `load()`**: `try/finally` ohne `catch` — wenn `getHabits()` oder `getHabitRecordsForDate()` wirft, wird der Fehler still verschluckt, `setLoading(false)` läuft durch, Habits bleibt leer ohne User-Feedback.
- **HabitSidebar-Status-Button liest `records` dreimal via `.some()`** (Z. 75–77): Dreifacher identischer `selectedHabit.records.some(r => r.date === selectedSidebarDate && r.completion === 'DONE')` Aufruf in derselben Render-Funktion. Sollte als lokale Variable gecacht werden.

## Status
**okay** — Struktur ist sauber, Komponenten-Aufteilung logisch, Kernfeatures vollständig. Zwei konkrete Bugs (toggleSidebarDone records-Logik, getRollingDays-Dopplung in Sidebar), kein Error-Handling in load(), ein toter Export. Nichts Kritisches, aber vor Refactoring dokumentieren.
