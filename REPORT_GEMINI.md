# Frontend Cleanup Report → Gemini

**Datum:** 2026-06-17
**Repo:** `~/fitness-dev`
**Branch:** `master`

## Ziel

Frontend-Fehleranalyse (React/Vite) plus Cleanup: typische Fehlerquellen in den
zuletzt geänderten Dateien identifizieren und fixen. Anschließend Build-Pipeline
aufräumen.

## Erledigt

### Kritisch
| Commit | Datei | Problem |
|---|---|---|
| `a7682a1` | `src/views/Muscles/index.jsx:76` | Invertierter Ternary in `.finally()` → Loading-Spinner blieb hängen |
| `4c4bc4b` | `src/views/Muscles/index.jsx:91` | `.toLowerCase()` auf möglich `undefined` (display_name + name beide leer) → Effect-Crash |

### Mittel
| Commit | Datei | Problem |
|---|---|---|
| `1524353` | `src/views/Settings/index.jsx:70` | Drei parallele Fetches in `useEffect` ohne Cleanup → setState-after-unmount möglich. Fix: `alive`-Flag |
| `38a4a3d` | `src/lib/db/core.js:9` | `res.json()` konnte still werfen; Offline-Header-Check ungeschützt. Fix: try/catch, Offline → `null`, sonst klare Fehlermeldung mit `cause` |

### Lint-Blocker (Build kaputt vor Fix)
| Commit | Datei | Problem |
|---|---|---|
| `49249a9` | `src/App.jsx:301`, `src/views/Session/ExerciseItem.jsx:171` | `planMode` / `setPlanMode` Referenzen — Reste aus `16e14ca` (Smart Plan Mode Removal). Entfernt inkl. toter Button-Sektion + ungenutzter `isFuture` |
| `49249a9` | `src/views/WeeklyReview/ReviewInsights.jsx:22` | `Trophy` ohne Import. Fix: zu `lucide-react`-Import hinzugefügt |
| `49249a9` | `src/lib/db/core.js` | `preserve-caught-error`: `cause` an wrapped Error angehängt |

### Build-Optimierung
| Commit | Datei | Änderung |
|---|---|---|
| `5eaebe1` | `src/lib/db/utils.js` | `core.js` jetzt statisch importiert (war dynamic+static gemischt → Rollup-Warnung) |
| `5eaebe1` | `vite.config.js` | `manualChunks` für react, recharts, lucide-react, react-body-highlighter |

**Bundle-Effekt:**
- Vorher: `index.js` 947 kB (290 kB gzip), 1 Warnung wegen >500 kB
- Nachher: `index.js` 411 kB (130 kB gzip) + getrennte Vendor-Chunks (charts 487 kB, icons 35 kB, bodymap 14 kB). Keine Warnings.

## Verworfen (nach Re-Check)
- `ReviewSessionList.jsx:37` `key={m}` — Muskelnamen sind innerhalb der pro-Session-Map eindeutig, kein echter Bug.

## Offen — Entscheidung gesucht

**Inkonsistente Error-Strategien zwischen Local-DB und Firestore-Layer.**

- `src/lib/db/analysis.js` (`getDashboardAnalytics`, `getWeeklyReport`):
  - try/catch + Fallback auf lokale Berechnung (`getMuscleCoverage`)
  - `.catch(() => ({ exercises: [] }))` pro Sub-Request → Teilergebnisse möglich
- `src/db.firestore.js:546–558` (gleiche Funktionen):
  - Bei Fehler → `return null`
  - Kein graceful Degradation

**Konsequenz:** UI-State unterscheidet sich je nach Build-Mode (local vs. Firebase PWA).
Bei Mode-Switch oder Inkonsistenz: Views sehen mal `null`, mal Stub-Daten.

**Optionen:**
1. **Refactor:** Gemeinsamen Result-Contract definieren (`{ ok, data, error }`).
   Beide Implementierungen liefern strukturell gleich. Views vereinheitlichen.
2. **Skip:** Lokaler Build ist Single-User-Coach-Mode, PWA ist Read-Only —
   die Pfade kreuzen sich nie zur Laufzeit. Inkonsistenz ist theoretisch.
3. **Minimal:** Nur `db.firestore.js` an Local-Verhalten angleichen (Fallback statt
   `null`), Views unverändert lassen.

**Empfehlung:** Option 3, weil günstig und der Local-Pfad ist bereits das robuste
Vorbild. Option 1 wäre korrekt, aber lohnt sich erst wenn ein dritter Backend-Layer
dazukommt.

## Stand der Working Tree

Noch uncommitted (vom Cleanup unberührt, älter):
- `RECHAMBER.md`, `SMART_HYBRID.md`
- `cloud_chamber/analytics_watcher.py`, `firestore_watcher.py`
- `fitness-runtime.mjs`, `src/api.js`, `src/db.firestore.js`
- `src/lib/db/{analysis,sessions}.js`, `src/lib/exerciseInsights.js`
- diverse Views (Learn, Muscles/*, WeeklyReview/*, Session/ARCHITECTURE.md)
- Unbekannt: `cloud_chamber/rules/`, `firestore.rules.live`

Diese gehören nicht zum aktuellen Cleanup-Scope.
