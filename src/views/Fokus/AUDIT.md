# Audit: Fokus

## Zweck
Verdichtete Fokus-Ansicht, die die befüllten `Hit`-Blöcke aus der Anamnese als eigentliche Focus Map darstellt.

## Komponenten

| Datei | Zweck | Zeilen |
|-------|-------|--------|
| `index.jsx` | Liest Hit-State aus `useUser()`, filtert leere Hits und rendert die Focus Map plus Reflection-Block | 1 |
| `ARCHITECTURE.md` | Kurzüberblick über Datenquelle und View-Zweck | 1 |
| `AUDIT.md` | Audit-Notiz für den View | 1 |

## Datenfluss

- `useUser()` liefert Hit- und Reflection-Inhalte.
- `hits` wird lokal in `index.jsx` aus `hit1..hit4` gefiltert.
- Keine eigenen Side Effects, keine Schreiboperationen.

## Auffälligkeiten

- `Fokus` ist weiterhin komplett abgeleitet; Bearbeitung passiert weiterhin in `Anamnese`.
- Die View nimmt bewusst keine gesamte `REAL / RAW / RELEVANT / RESULTS`-Spiegelung mehr vor.
