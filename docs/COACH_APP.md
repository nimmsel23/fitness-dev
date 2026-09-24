# Coach App - Zielarchitektur

Stand: 2026-09-23

Diese Datei beschreibt die geplante Trennung der Coach-Funktionen von der
Klienten-PWA. Der aktuelle Firebase-Split ist nur der erste Schritt: langfristig
soll die Coach-App eine eigene Arbeitsoberflaeche fuer Fitness- und spaeter auch
Fuel-Daten werden.

## Aktueller Stand

- `fitness-aos.web.app` ist die Klienten-PWA.
- `vos-coach.web.app` ist als eigenes Firebase-Hosting-Ziel vorbereitet.
- `src/coach-main.jsx` und `coach.html` bilden aktuell den Coach-Webapp-Entry.
- `~/coach-dev` existiert als sauberer lokaler Clone des Split-Commits
  `ad44f33`.
- `fitness/coach/` existiert bereits als Python-Domain-Package fuer
  Coach/Client-CLI-Funktionen. Dieser Pfad soll deshalb nicht fuer die
  Coach-Webapp wiederverwendet werden.

## Zielbild

Die Coach-App ist eine Admin-/Workbench-App. Sie sollte fachlich auf dem
lokalen Fitness-Prod-Server und der lokalen Katalog-Pipeline beruhen, nicht auf
einem halb-authoritativen Firestore-Zwischenstand.

Firestore bleibt wichtig, aber fuer andere Dinge:

| Bereich | Authoritative Ebene |
|---------|---------------------|
| Sessions, Journal, Profile | Firestore / Runtime User Data |
| Coach-Feedback an Klienten | Firestore |
| Katalog-Inbox, Enrichment, Approve | lokaler Fitness-Prod-Server + YAML-KB |
| Expert Exercises im Client | generierte Build-Artefakte |
| Fuel-Runtime-Daten | Firestore, spaeter ueber Coach-App einsehbar |

Der Coach approved also nicht direkt "in den Client hinein". Er approved lokal
gegen die KB. Beim naechsten Build werden die daraus generierten statischen
Client-Daten in die PWA eingebaut und deployed.

## Gewuenschter Flow fuer Exercise Approval

1. Ein Klient erzeugt eine unbekannte Uebung oder Anfrage.
2. Die Anfrage landet in der lokalen Coach/Katalog-Inbox.
3. Der Coach arbeitet lokal gegen den Fitness-Prod-Server:
   - Source-Kandidaten pruefen
   - `wger` / `yuhonas` verknuepfen
   - Enrichment/Reenrichment ausloesen
   - final approven
4. Approval schreibt bzw. aktualisiert lokale KB/YAML-Artefakte.
5. Der Firebase-Client-Build generiert daraus statische Katalogdaten.
6. Nach Deploy sieht die Klienten-PWA die neue approved Exercise.

Das macht Approval zu einem Release-Schritt statt zu einem blossen
Firestore-Write. Der Nachteil ist, dass neue Uebungen erst nach Build/Deploy
sichtbar werden. Der Vorteil ist, dass Provenance, Review und Client-Bundle
sauber zusammenbleiben.

## Zwischenwelt reduzieren

Der aktuelle Mischzustand ist absichtlich nur ein Uebergang:

```text
lokale YAML-KB  <->  Firestore Cache  <->  clientseitig verbaute JS-Daten
```

Diese Zwischenwelt soll kleiner werden. Firestore darf fuer Katalogdaten
anzeigen, puffern oder Runtime-Signale transportieren, aber nicht die
fachliche Wahrheit der Expert Exercises sein. Die fachliche Wahrheit entsteht
im Coach-/Backend-Pfad und wird danach als Client-Artefakt gebaut.

Ziel:

```text
kb/        -> YAML, Python-Backend, Coach-Review, Provenance
catalog/   -> generierter Client-Katalog, JS/JSON-Artefakte, PWA-Verbrauch
firestore  -> Runtime-Daten, User-Daten, optionaler Cache/Index
```

Damit gibt es eine klare Richtung:

1. `kb/` wird gepflegt.
2. Build-Skripte erzeugen daraus `catalog/` bzw. clientseitige Artefakte.
3. Die PWA importiert nur diese generierten Artefakte.
4. Firestore bleibt fuer Runtime- und User-Zustand zustaendig.

## KB vs Catalog

Aktuell ist unter `fitness/catalog/` noch zu viel gemischt:

- Python-Code fuer Loader, Resolver, Enrichment, Audit und Inbox
- YAML-Daten unter `fitness/catalog/kb/`
- generierte clientseitige Daten unter `src/lib/db/firestore/*.generated.js`
- Firestore-Sync-/Cache-Pfade

Die Zieltrennung sollte nach Zustaendigkeit passieren:

| Bereich | Aufgabe | Darf schreiben? |
|---------|---------|-----------------|
| `kb/` | YAML-SSOT fuer Exercises, Anatomy, Muscles, Inbox-Drafts, Provenance | Coach/Python-Backend |
| `catalog/` | clientseitig verbaute Katalog-Ausgabe, JS/JSON, Suchindex, PWA-Bundle | Build-Skripte |
| `fitness/catalog/` Python | Tools/Pipeline, die aus `kb/` liest und `catalog/` erzeugt | Code, keine Runtime-Wahrheit |
| Firestore `fitness/kb/*` | optionaler Cache/Index fuer Cloud-Sichten | Mirror/Sync, nicht SSOT |

Langfristig waere also sinnvoll:

```text
fitness-dev/
  kb/                         # YAML fuer Python/Coach, reviewed + inbox
  catalog/                    # generierte Client-Katalogdaten
  fitness/catalog/            # Python-Pipeline / CLI / API
  src/lib/db/firestore/       # konsumiert generierte Catalog-Artefakte
```

Falls ein harter Move zu gross ist, kann der erste Schritt kleiner sein:

- `fitness/catalog/kb/` bleibt physisch noch liegen.
- Docs und Code behandeln es aber bereits als `kb`-SSOT.
- Neue generierte Client-Dateien werden konsequent als `catalog` benannt,
  nicht als `kb`.
- Firestore-Felder bekommen klare Namen wie `cache_source`, `generated_from`,
  `kb_revision` oder `catalog_build`, statt implizit Wahrheit zu behaupten.

## Repo-Topologie

Kurzfristig:

```text
/home/alpha/fitness-dev
  coach.html
  src/coach-main.jsx
  src/views/Coach/

/home/alpha/coach-dev
  sauberer Clone / spaeter eigenstaendige Coach-App
```

Mittelfristig sollte `coach-dev` der fuehrende Arbeitsbereich fuer die
Coach-Webapp werden. Im Fitness-Repo kann die Coach-App dann als Subtree liegen,
zum Beispiel:

```text
fitness-dev/
  coach/          # Webapp-Subtree aus ~/coach-dev, nicht Python-Package
```

Da aber `fitness/coach/` bereits ein Python-Package ist, muss die Benennung
bewusst sein. Gute Kandidaten:

| Pfad | Bewertung |
|------|-----------|
| `coach/` | knapp, gut als Repo-Root-Subtree |
| `apps/coach/` | eindeutiger, falls spaeter weitere Apps dazukommen |
| `fitness/coach/` | vermeiden, kollidiert mit Python-Domain-Package |

Empfehlung: `coach/` oder `apps/coach/`, nicht `fitness/coach/`.

## Subtree-Richtung

Wenn `coach-dev` fuehrend wird:

- Entwicklung passiert in `~/coach-dev`.
- Fitness kann die Coach-App per Git subtree einbetten.
- Pulls vom Coach-Repo/Subtree aktualisieren den eingebetteten Stand.
- Pushes aus `fitness-dev` zurueck in `coach-dev` sollten nur bewusst und
  selten passieren.

Beispielhafte Richtung:

```text
~/coach-dev  ->  fitness-dev/coach/
```

Das ist besser als ein Symlink, weil Releases und Builds dann einen konkreten
Source-Stand enthalten. Es ist auch besser als Copy/Paste, weil die Herkunft
und Updates nachvollziehbar bleiben.

## Firebase Hosting

Aktuelle Ziele:

| Target | Site | Public dir |
|--------|------|------------|
| `client` in `fitness-dev` | `fitness-aos` | `dist-firebase` |
| `coach` in `coach-dev` | `vos-coach` | `dist-coach` |

`fitness-release` baut und deployt nur `hosting:client` aus dem Fitness-Repo.
Der Coach-Build und `hosting:coach` kommen ausschliesslich aus `~/coach-dev`.
Beide Sites nutzen das Firebase-Projekt `fitness-aos`; Firestore-Rules werden
weiterhin als gemeinsames Set aus `~/vitalos` deployed.

## Nicht-Ziele

- Kein Cloud-only Approve ohne lokale KB/Pipeline.
- Kein Firestore als alleinige Wahrheit fuer Expert Exercises.
- Keine Vermischung von `fitness/coach/` Python-CLI und Coach-Webapp.
- Keine Vermischung von `kb`-YAML-SSOT und generiertem `catalog`-Clientbundle.
- Keine automatischen Writes in Runtime-Daten ohne klare User-/Klienten-Grenze.
