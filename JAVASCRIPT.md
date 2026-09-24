# Fitness als JavaScript-Stack

Stand: 2026-09-24. Dieses Dokument wächst mit der Umsetzung. Ziel ist ein
einziger JavaScript-Eigentümer für die Fitness-Fachlogik, mit React als Client,
Node als API und CLI sowie klaren Daten- und Sync-Grenzen. Der bestehende
Python-Code bleibt als Referenz und laufender Pfad erhalten, bis eine Funktion
nachweislich vollständig übernommen ist.

## Tatsächlicher Ausgangspunkt

- Der lokale Vite-Proxy in `vite.config.js` schickt API-Aufrufe derzeit an
  Python/FastAPI auf `:9150`. Staging/Prod starten ebenfalls
  `fitness.api.main:app` über `deploy.sh`.
- `server.mjs` bietet eine parallele Hono-API auf `:9100`. Einige Routen
  arbeiten selbst mit JSON-Dateien, andere leiten an Python weiter.
- Der Firebase-Build verwendet einen eigenen Firestore-`@db`-Adapter.
  Bestimmte Coach-/Inbox-Funktionen sprechen zusätzlich die lokale Python-API.
- Python besitzt derzeit u. a. Routines/Workouts, Session-Sync nach SQLite,
  Katalog/YAML, Inbox/Enrichment und Firestore-Watcher. Die Fitness-CLI ist
  ebenfalls Python.

Ein Umzug ist erst abgeschlossen, wenn UI, API, CLI, Persistenz und Sync für
die Funktion denselben Eigentümer haben. Ein weiterer Proxy zählt nicht als
Migration.

## Leitplanken

1. React ruft einen Datenadapter auf; Fachregeln und dauerhafte Schreibzugriffe
   liegen in Node-Domainmodulen, die API und CLI gemeinsam nutzen.
2. Pro Datensatz gibt es genau einen aktiven Schreiber. Python und Node
   schreiben nicht gleichzeitig in dieselbe Live-Datei.
3. Node liest bestehende Datenformate, validiert Eingaben und schreibt
   atomisch. Unbekannte Felder bleiben bei Änderungen erhalten.
4. Ein Umschalten erfolgt pro Funktion erst nach API-Vertrag, CLI-Bedienung,
   Tests und Vergleich mit dem Python-Verhalten. Danach werden Vite und
   Deployment bewusst umgestellt.
5. Runtime- und Firestore-Daten werden durch diese Codearbeit nicht migriert
   oder bereinigt.

## Reihenfolge

| Bereich | Ist-Eigentümer | JavaScript-Schritt | Status |
|---|---|---|---|
| Routinen | Python `workouts.py`, `routines.json` | Node-Domainmodul, Hono-API, CLI auf isoliertem Datenverzeichnis | Prototyp fertig; Umschaltung offen |
| Workout-Instanzen | Python `workouts.py`, `workouts.json` | danach; Ghost-Sets und Session-Historie mitnehmen | offen |
| Sessions | Python API + Node-Parallelimplementierung | JSON/SQLite/Firestore-Schreibkette vereinheitlichen | offen |
| Katalog/Inbox | Python CLI, YAML, Watcher | Datenformat und Review-Workflow zuerst vermessen | offen |
| Firestore | Python-Watcher + Firebase-Client | UID- und Konfliktregeln festlegen | offen |
| Deploy | Python FastAPI | erst nach vollständigen Fachpfaden auf Node umstellen | offen |

## Erster Schnitt: Routinen

Quelle für den API-Vertrag und das Dateiformat:
`fitness/api/routers/workouts.py`, `src/lib/db/local/coach.js` und
`src/lib/db/local/core.js`. Das Python-Verhalten enthält Liste, Detail,
Anlegen, Patch, Löschen sowie Übungen hinzufügen, ändern, sortieren und
entfernen. Die Node-Version wird diese Operationen auf einem **explizit
konfigurierten Test-Datenverzeichnis** bereitstellen. Die produktiven
`~/.aos/fitness/users/*/routines.json` bleiben Python-eigen, bis der
Umschaltpfad vollständig geprüft ist.

### Umgesetzt

- `server/domain/routines.mjs`: gemeinsamer Store für API und CLI. Er liest
  das vorhandene Listenformat, erhält Zusatzfelder und normalisiert
  Übungs-/Set-Felder.
- Änderungen pro UID werden im Node-Prozess nacheinander verarbeitet und
  durch Schreiben einer temporären Datei mit anschließendem Rename
  abgeschlossen. Fehlerhafte JSON-Dateien werden nicht überschrieben.
- `server/routes/js-routines.mjs`: neun Hono-Operationen für Routine und
  Übungen. Der Mount unter `/js/routines` erscheint nur bei gesetztem
  `FITNESS_JS_ROUTINES_DATA_DIR`.
- `scripts/fitness-routines.mjs`: CLI für Liste, Detail, Erstellen,
  Umbenennen und Löschen. Aufruf über `npm run fitness:routines -- <Befehl>`.
- `server/tests/routines.test.mjs`: API-Ablauf, Reihenfolge, Erhalt von
  Zusatzfeldern, ungültige IDs, parallele Writes und defekte JSON-Dateien.

Beispiel für einen isolierten Durchlauf:

```sh
mkdir -p /tmp/fitness-js-routines
FITNESS_JS_ROUTINES_DATA_DIR=/tmp/fitness-js-routines FITNESS_JS_UID=test-user \
  npm run fitness:routines -- create "Push"
FITNESS_JS_ROUTINES_DATA_DIR=/tmp/fitness-js-routines FITNESS_JS_UID=test-user \
  npm run fitness:routines -- list
node --test server/tests/routines.test.mjs
```

Die UI, Vite-Proxy-Konfiguration und produktiven Python-Routen verwenden
weiterhin Python. Vor der Umschaltung fehlen mindestens ein Vergleich mit
repräsentativen bestehenden Routinen, die Identitätsauflösung wie in
`fitness/api/config.py`, ein Deployment-/Rollback-Pfad und die Entscheidung,
wie Firestore-Routinen mit dem lokalen Eigentümer zusammenlaufen.
