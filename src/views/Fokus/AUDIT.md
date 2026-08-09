# Audit: Fokus

## Zweck
Verdichtete Fokus-Ansicht, die vorhandene Anamnese-Eingaben ohne neue Persistenz als Map darstellt.

## Komponenten

| Datei | Zweck | Zeilen |
|-------|-------|--------|
| `index.jsx` | Liest Anamnese-State aus `useUser()`, gruppiert ihn in vier Bereiche und rendert gefüllte Hit-Karten | 1 |
| `ARCHITECTURE.md` | Kurzüberblick über Datenquelle und View-Zweck | 1 |
| `AUDIT.md` | Audit-Notiz für den View | 1 |

## Datenfluss

- `useUser()` liefert alle Inhalte.
- `hits` wird lokal in `index.jsx` aus `hit1..hit4` gefiltert.
- Keine eigenen Side Effects, keine Schreiboperationen.

## Auffälligkeiten

- `Fokus` ist aktuell komplett abgeleitet; Änderungen passieren weiterhin in `Anamnese`.
- Wenn künftig Fokus-spezifische Bearbeitung gewünscht ist, braucht der View eigenen State oder eine klarere Ableitungslogik.
