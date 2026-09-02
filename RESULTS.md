# Merge-Kandidaten-Hinweise in Coach-Inbox-UI (Task #3 abgeschlossen) (2026-09-02)

Fortsetzung der Vortags-Session: Task #3 ("Audit-Flags/Merge-Hinweise auch
in der Coach-Inbox-UI zeigen, nicht nur im CLI-Coach-Sheet") war offen
geblieben. Zusätzlich wurde in dieser Session live präzisiert, worum es dem
User eigentlich ging (nicht Feld-Verschmelzung, sondern unsichere
wger-/yuhonas-Fuzzy-Treffer sichtbar machen, damit der Coach manuell
entscheiden kann) — die vorherige `origin.wger`/`origin.yuhonas`-Struktur
aus 161bfd0 blieb dabei unverändert korrekt.

* **`fitness/catalog/core/merge_candidates.py`** (neu): `list_inbox_merge_candidates()`
  liefert für jeden Inbox-Draft ohne bereits verlinkten wger-/yuhonas-Treffer
  einen Fuzzy-Kandidaten mit Score, ohne etwas zu schreiben (reine Anzeige).
* **`fitness/api/routers/exercises_inbox.py`**: neuer Endpoint
  `GET /fitness/inbox/merge-candidates`.
* **`server.mjs`**: Node-Proxy für den neuen Endpoint.
* **`src/lib/db/local/inbox.js`** + **`src/lib/db/firestore/inbox.js`**:
  `getInboxMergeCandidates()` in beiden DB-Layern ergänzt (Firestore-Variante
  liefert bei Nichterreichbarkeit des lokalen Rechners einfach leer, statt
  zu werfen — Kandidaten sind optionaler Hinweis, kein Pflichtfeld).
* **`src/views/Inbox/useInbox.js`**, **`src/views/Coach/index.jsx`**: laden
  und reichen `mergeCandidates` durch.
* **`src/views/Inbox/InboxCard.jsx`**: neuer oranger Hinweis-Block
  ("Möglicher Merge-Kandidat (wger/yuhonas): Name — Score X") pro Draft mit
  unsicherem Treffer; ersetzt/verlinkt nichts automatisch. Dabei nebenbei
  einen Bug gefixt: die Komponente las noch das alte, umbenannte Feld
  `source_snapshot` statt `origin.wger`/`origin.yuhonas`.
* Volle Pytest-Suite (`test_source_merge.py`, `test_inbox_actions.py`) für
  die `origin.wger`/`origin.yuhonas`-Struktur aus der Vortags-Session
  nachträglich bestätigt (10/10 grün) — war nach dem letzten Rename dort
  noch offen. `npm run build` grün.
* Committet als `ef3c247`, gepusht nach `origin/dev` (Staging-Deploy `:8100`
  automatisch via Post-Push-Hook). **Noch nicht nach `vitalos` gemergt.**

---

# Inbox-Drafts zeigen rohe wger-/yuhonas-Quellen getrennt, neuer Source-Consistency-Audit (2026-09-01)

Ausgangspunkt war die Beobachtung, dass Gemini-generierte Inbox-Drafts
(z.B. `inbox_081`, `inbox_wger_206`) teils unbelegte/falsche Muskel-
Zuordnungen fälschlich als "expert" durchgewunken hatten. Ziel laut User:
kein automatisches Verschmelzen von wger- und yuhonas-Daten ("nicht zu
yuwogerhona zusammenkleben"), sondern beide Rohquellen sichtbar getrennt
im Coach-Sheet ("wger sagt X, yuhonas sagt Y") plus ein Check, der KI-
Behauptungen gegen echte Rohdaten prüft.

* **`fitness/catalog/core/source_merge.py`**: neue Funktion
  `find_source_entries()` (Refactoring aus `build_external_seed()`) findet
  rohe wger-/yuhonas-Einzeltreffer getrennt, ohne sie zu mergen. Gestaffeltes
  Fuzzy-Matching ergänzt: sichere Treffer (Score ≥86) wie bisher, unsichere
  Kandidaten darunter (z.B. "Walking Lunges" vs. "Barbell Walking Lunge",
  Score 74) werden jetzt als Kandidat mit Score sichtbar statt komplett zu
  verschwinden. Optionale `record`/`wger_entries`/`yuhonas_entries`-Parameter
  vermeiden teuren `build_exercise_index()`-Rebuild bei Batch-Aufrufen.
* **`fitness/catalog/agent/inbox_actions.py`**: neue Funktion
  `attach_source_snapshot()` + CLI-Befehl `fitness-catalog inbox
  attach-sources [file_id] [--apply]` (dry-run per Default) — verlinkt bei
  sicherem Treffer `wger_id`/`yuhonas_id`/`external_ids` auf oberster Ebene
  und hängt den jeweils rohen, unveränderten Treffer unter `origin.wger`/
  `origin.yuhonas` an (nach zwei Namensrunden mit dem User: erst
  `source_snapshot.*`, dann `origin.snapshots.*`, am Ende direkt
  `origin.wger`/`origin.yuhonas` ohne Zwischenebene).
* **Bulk-Lauf über alle ~44 Inbox-Drafts** (`--apply`, zwei Durchgänge):
  29 Drafts erhielten neu geschriebene Rohdaten-Verweise, 6 hatten sie
  schon, 5 bleiben ohne externe Quelle (u.a. `inbox_jefferson_curl`,
  `inbox_scapula_priming`, `inbox_skin_the_cat`, 2× Yoga-Headstand-Duplikat).
* **`fitness/catalog/coach_sheet.py`**: neuer Abschnitt "## Quellen
  (unverändert, getrennt)" — zeigt `origin.wger`/`origin.yuhonas` als
  eigene, unvermischte Blöcke im Coach-Sheet.
* **`fitness/catalog/core/audit/source_consistency.py`** (neu): Audit-Topic
  `fitness-catalog audit source-consistency` — prüft primary_muscles/
  secondary_muscles unreviewter Inbox-Drafts gegen die rohen wger-/yuhonas-
  Quellen (Source-of-Truth) auf Körperregion-Ebene, meldet unbelegte
  Muskel-Zuordnungen als Verdacht auf KI-Fehlklassifizierung. Performance-
  Fix: `find_source_entries()` bekam einen `record`-Parameter statt eines
  ursprünglich geplanten globalen `lru_cache` (der hätte in `fitness-api.service`
  veraltete Daten geliefert und die Test-Isolation gebrochen) — Laufzeit von
  timeout(>120s) auf ~8-10s für 36 geprüfte Records gesenkt.
* **`fitness/catalog/kb/muscle_index.yml`**: `string_aliases` um fehlende
  yuhonas-Vokabeln ergänzt (`forearms`, `glutes`, `hamstrings`, `lower_back`,
  `middle_back`, `traps`) — reduzierte Audit-Rauschen von 133 auf 18 echte
  Flags. Ein testbrechender Alias (`shoulders → 302_lateral_deltoid`) wurde
  wieder entfernt, da er die bestehende kontextsensitive Zuordnung
  (`refine_generic_region_labels`) kurzgeschlossen hatte.
* **`fitness/catalog/core/resolver.py`**: `ExerciseRecord` um `origin`-Feld
  erweitert, damit `coach_sheet.py` die Rohdaten-Snapshots konsumieren kann.
* **`fitness/catalog/CLAUDE.md`**: Sektion zum neuen `attach-sources`-
  Befehl, der Fuzzy-Match-Falle und der bewussten Nicht-Verschmelzung
  ergänzt.
* Committet als `4157fe3` (erster Teil) und `161bfd0` (46 Dateien,
  Feinschliff + Audit + Coach-Sheet), gepusht nach `origin/dev` — Post-Push-
  Hook baute Frontend + Staging-Deploy erfolgreich.
* Offen geblieben: Task #3 aus der User-Taskliste ("Audit-Flags in
  Coach-Inbox-UI anzeigen") wurde nicht begonnen.

---

# Session-Handoff-Hooks nach fuel-dev portiert (2026-09-01)

Auf Wunsch ("fuel-dev brauch auch noch so ein system") wurde das in
fitness-dev gebaute Handoff-System (PreCompact füllt TODO/RESULTS/NEXT.md,
PostToolUse committet sie automatisch) 1:1 nach `~/fuel-dev` portiert.
Betrifft nur `~/fuel-dev`, keine Datei in diesem Repo.

* **`~/fuel-dev/.claude/hooks/pre-compact-fill-docs.sh`** (neu): identischer
  Mechanismus wie in fitness-dev — `claude -p --dangerously-skip-permissions`
  (nach expliziter User-Freigabe), `flock`-gesichert, überspringt Sessions
  ohne Git-Änderungen. Pfade auf `~/fuel-dev` umgeschrieben; dort gibt es
  kein `docs/`-Unterverzeichnis, `CLAUDE.md` liegt direkt im Root (kein
  Symlink wie in fitness-dev).
* **`~/fuel-dev/.claude/hooks/post-edit-commit-docs.sh`** (neu): committet
  automatisch `TODO.md`/`RESULTS.md`/`NEXT.md`/`CLAUDE.md` bei Edit/Write,
  `flock`-gesichert, kein `git add -A`, kein Push.
* **`~/fuel-dev/.claude/settings.json`**: beide Hooks registriert
  (PreCompact + PostToolUse Edit|Write), JSON-Validität geprüft.
* Beide Hooks funktional getestet (irrelevante Datei → No-op, relevante
  Datei ohne Diff → No-op, gehaltener Lock → kein Commit) — eigene
  Testzeile in `~/fuel-dev/NEXT.md` danach wieder entfernt.
* Committet in `~/fuel-dev` als `eaed175`. Zusätzlich als Nebeneffekt
  fremde, bereits vorhandene unstaged Änderungen einer anderen Session
  (`ARCHITECTURE.md`, `bin/fuelctl` — Status-Refactor auf Prod-Runtime-
  Health, Catalog-Server-Anzeige entfernt) mitcommittet (`188ac51`), da sie
  inhaltlich konsistent und vollständig waren.

---

# Session-Handoff-Automatisierung: PreCompact-Hook + Doku-Learnings + Auto-Commit (2026-08-31)

Nach der Swagger/Zod-Arbeit wurde die Handoff-Kette zwischen Claude-Code-
Sessions in diesem Repo automatisiert: TODO.md (Makro) → Arbeit →
RESULTS.md (was tatsächlich gemacht wurde) → NEXT.md (was offen blieb),
plus die konkreten Learnings dieser Session dauerhaft in `docs/CLAUDE.md`
verankert.

* **`docs/BACKEND.md`** (neu): eigenständiges Backend-Doku-Dokument für
  `server.mjs` (Swagger/Zod-Autodoc, Node↔Python-Routen-Parität) — bewusst
  offen als allgemeines Dokument angelegt, nicht exklusiv auf ein Thema
  beschränkt formuliert.
* **`NEXT.md`** (neu, repo-lokal): aktive Arbeitsliste für fitness-dev
  (Gegenstück zur globalen `~/NEXT.md`) — hält fest, was konkret als
  Nächstes ansteht, im Unterschied zu `TODO.md` (Makro-Backlog ohne Limit).
* **`.claude/hooks/pre-compact-fill-docs.sh`** (neu) + **`.claude/settings.json`**:
  PreCompact-Hook, der bei jedem Compact via `claude -p
  --dangerously-skip-permissions` (nach expliziter User-Freigabe,
  eingeschränkt auf `Read,Edit`) automatisch `TODO.md`/`RESULTS.md`/
  `NEXT.md` aus dem Transkript nachpflegt — hinter `flock`
  (`.claude/hooks/.fill-docs.lock`) gegen die in diesem Repo üblichen
  parallelen Sessions abgesichert, überspringt reine Recherche-Sessions
  ohne Git-Änderungen.
* **`.claude/hooks/post-edit-commit-docs.sh`** (neu): PostToolUse-Hook
  (Edit|Write), committet automatisch und einzeln (kein `git add -A`, kein
  Push), sobald `TODO.md`, `RESULTS.md`, `NEXT.md`, `docs/CLAUDE.md` oder
  `docs/BACKEND.md` geändert werden — ebenfalls `flock`-gesichert, leere
  Diffs erzeugen keinen Commit.
* **`docs/CLAUDE.md`**: vier Learnings aus dieser Session ergänzt —
  `fitness-dev.service` läuft im Normalfall nicht (nicht annehmen, dass ein
  laufender Node-Prozess automatisch der fitness-Server ist), Prozessname
  `server.mjs` ist über Sibling-Repos mehrdeutig (`readlink -f
  /proc/<pid>/cwd` statt Namen prüfen), `git stash push -- <datei>` als
  Symlink-sicherer Spezialfall von `git stash`, sowie die neue Session-
  Handoff-Konvention (`NEXT.md` bei unklarem Sessionstart zuerst lesen).

---

# Inbox: Rohdaten-Snapshots von wger/yuhonas getrennt anfügen (2026-08-31)

Ausgangspunkt war der Wunsch, Inbox-Drafts live zu verbessern (Fallbeispiel:
`inbox_wger_206`, Walking Lunges). Ursprünglicher Ansatz war ein Feld-Merge
(`merge_inbox_sources`), der aber Muskel-Rollen verfälschte
(`gluteus_maximus` landete gleichzeitig in `primary_` und
`secondary_muscles`) und vom User explizit gestoppt wurde ("keine Automatik
ohne Anstoß", "mit mergen meine ich nicht wger und yuhona zu yuwogerhona
zusammenzukleben"). Die tatsächlich gebaute Lösung zeigt beide Quellen
stattdessen unverändert nebeneinander.

* **`fitness/catalog/core/source_merge.py`**: neue Funktion
  `find_source_entries(display_name, exercise_id)` — findet rohen wger- und
  yuhonas-Eintrag getrennt (kein Feld-Merge); `build_external_seed()` nutzt
  sie jetzt intern, Verhalten dort unverändert.
* **`fitness/catalog/agent/inbox_actions.py`**: neue Funktion
  `attach_source_snapshot(f, ex, apply=False)` — legt gefundene Rohdaten
  unverändert unter `source_snapshot.wger`/`source_snapshot.yuhonas` ab,
  überschreibt nie einen bereits vorhandenen Snapshot, **Dry-run per
  Default** (Repo-Konvention, analog `fitness user-data`).
* **`fitness/catalog/cli.py`**: neuer Befehl
  `fitness-catalog inbox attach-sources [file_id] [--apply]`.
* Bulk-`--apply`-Lauf über alle 44 Inbox-Drafts ausgeführt: 29 Dateien neu
  mit `source_snapshot` versehen (u.a. `inbox_020`, `inbox_061`,
  `inbox_081`, `inbox_cable_*`, `inbox_dips_chest`, `inbox_face_pull`,
  `inbox_french_press`, `inbox_leg_press`, `inbox_plank`,
  `inbox_pullover_machine`, `inbox_wger_129/659/926`, u.a.), 6 hatten
  Snapshots schon vorher (unverändert), 5 ohne Treffer in keiner
  Fremdquelle (`inbox_cable_row_close_grip`, `inbox_jefferson_curl`,
  `inbox_scapula_priming`, `inbox_skin_the_cat`, 2× Yoga-Headstand-Skelette).
* Root-Cause dafür geklärt, warum praktisch keine Inbox-Übung vorher beide
  Quellen trug: `_best_match()`s `min_score=86`-Schwelle in
  `source_merge.py` ist zu streng für wger-generische vs.
  yuhonas-equipment-präfigierte Namen (z.B. "Walking Lunges" vs. "Barbell
  Walking Lunge" scort nur 68–74) — kein Bugfix daran vorgenommen, nur
  diagnostiziert.
* Root-Cause für die beiden leeren Yoga-Headstand-Inbox-Drafts geklärt:
  `POST /fitness/inbox/queue` (GUI-Queue-Endpoint) baut nur das nackte
  Skelett (`build_inbox_draft_seed`) und ruft nie Gemini auf — anders als
  `process_inbox_file_virtual()` (CLI/Session-Save-Pfad). Keine Code-
  Änderung, nur Befund.

---

# Coach-Tab Redesign "Hidden Chamber" (2026-08-31)

Kompletter Layout-/CSS-Umbau des Coach-Tabs nach einem zuvor als Artifact
durchgespielten Prototyp (dunkles, taktisches "Command-Center"-Thema).

* **`src/styles/coach-console.css`** (neu): scoped CSS-Variablen-Kaskade
  (`.coach-console`) mit den 1:1 aus dem Prototyp übernommenen Farb-/Radius-
  /Spacing-Werten — überschreibt dieselben Custom Properties, die alle
  bestehenden `fit-*`-Tailwind-Utilities schon nutzen, kein Rewrite jeder
  einzelnen Komponente nötig.
* **`src/App.jsx`**: Theme-Klasse auf den `app-shell`-Container gehoben
  (nur wenn `tab === 'coach'`), nicht nur den Content-Bereich — sonst blieb
  die Sidebar im alten Theme hängen und sah wie eine zweite, fremde App aus.
* **`src/views/Coach/index.jsx`**, **`InboxCard.jsx`**, **`ClientsPanel.jsx`**,
  **`CatalogBrowser.jsx`**: Exercise-Requests laufen jetzt als kompaktes
  Karten-Grid (`cc-card-grid`) mit farbcodierten Ghost-Action-Buttons statt
  voller Listenzeilen mit kaum sichtbaren Icon-Quadraten. Katalog-Browser +
  Klienten-Panel haben Eckklammer-Rahmen (`cc-panel`/`cc-dossier`),
  Terminal-Prompt-Suchfeld und eine Avatar-Initialen-Box bekommen.
* Gemerged `dev` → `vitalos` (`~/vitalos/bin/fitness-release`), Firebase-
  Deploy nach `fitness-aos.web.app` verifiziert.

---

# Swagger/OpenAPI-Autodoc + Zod-Validierung in server.mjs (2026-08-31)

`GET /docs` (Swagger UI) + `GET /openapi.json` laufen jetzt mit — Details
+ Muster für weitere Routen: `docs/BACKEND.md`.

* **Basis-Ebene (alle ~60 Routen):** `buildOpenApiSpec()` introspektiert
  zur Laufzeit Honos eigene Routing-Tabelle (`app.routes`) — kein
  Handschrift-Dokument, das hinter dem Code zurückfallen kann.
* **Zod-Ebene (praktisch kompletter API-Surface):** Fast alle JSON-
  Endpoints in `server.mjs` laufen jetzt über `OpenAPIHono` +
  `createRoute()`. Zusätzlich zu den drei zuerst gebauten Kernrouten
  (`GET /exercises/search`, `GET /fitness/plan`, `POST /session`) wurden
  die restlichen lokalen und Proxy-API-Routen auf `app.openapi(...)`
  gehoben. Plain-Hono geblieben sind nur `GET /openapi.json`, `GET /docs`
  und der SPA-Fallback `GET *`. Für die breite Umstellung gibt es jetzt
  den Helfer `defineJsonRoute()` plus `looseObjectSchema`, damit Query-,
  Path- und Body-Validierung einheitlich bleiben, ohne gewachsene
  Payloads künstlich zu verhärten.
* **Backend-Paritäts-Audit** (Node-Routen gegen `fitness/api/routers/*.py`
  abgeglichen): von ~60 Routen hat genau eine kein Python-Gegenstück —
  `GET/POST /fitness/coach/habit-cycle/:clientUid`. Alle anderen
  `proxyToPython`- und nativen Node-Routen hatten ein verifiziertes
  1:1-Pendant. Festgehalten in Claude-Memory
  `project_server_mjs_frontend_only_migration`, noch nicht gefixt.
* Nebenbei zwei `~/vitalos/bin/vos-release`-Nervereien behoben: `node_modules`
  im `fitness-app`-Worktree war ein echtes Verzeichnis statt Symlink (einmalig
  gefixt), und `require_clean_repo` blockierte auf reinem Katalog-Inbox-/
  Python-Code-Churn paralleler Sessions (Noise-Pattern erweitert).

---

# Session-Tab: Hauptsession löschbar (Klienten-Request Matthias-Mayer, 2026-07-13)

Klient WM4bg (Matthias-Mayer) fragte, ob man eine Session löschen kann — im UI war der
Papierkorb-Button auf Suffix-Sessions beschränkt (`sessionId !== null`), die Hauptsession
des Tages (der Normalfall bei Klienten) war nicht löschbar.

* **`SessionSwitcher.jsx`**: Lösch-Button erscheint jetzt für jede Session der Tagesliste
  (`daySessions.some(s => s.id === sessionId)`) — auch die Hauptsession. Backend/DB-Layer
  konnten das immer schon (`deleteSession(date, null)`).
* **`useSession.js` `handleDeleteSession`**: `setDirty(false)` nach dem Löschen — sonst hätte
  der neue Dirty-Flush (Tab-/Datumswechsel) die gelöschte Session als leere Datei wieder
  angelegt. Plus `recentSessions`-Refresh, damit der ✓-Haken im DateStrip verschwindet.
* Beide Builds verifiziert (dist_2026-07-13T00-04-53, dist-firebase_2026-07-13T00-05-02).
  Firebase-Deploy für Matthias steht aus (`npm run firebase` bzw. deploy:firebase).

---

# Session-Tab: Datenverlust-Bug gefixt (2026-07-12)

**Root Cause:** `GET /sessions` lieferte seit der Multi-Session-Einführung (7e08bed, 2026-06-20) nur Metadaten (`id, date, block, saved_at`) — `useSession` lädt daraus aber den kompletten Editor-State. Im lokalen Build (dev + /opt-Prod) wurden gespeicherte Sessions dadurch **leer geladen** und beim nächsten Save/Auto-Flush **leer überschrieben** (Beleg: `2026-06-12.json` Strength-Session mit 0 Exercises). Nur der Firebase-Build war korrekt, weil dessen `listSessionsForDate` volle Firestore-Dokumente liefert.

* **`server.mjs` `/sessions`**: Gibt jetzt volle Session-Objekte zurück (`{...data, id, date, exercises: []-normalisiert}`) — Contract angeglichen an `src/lib/db/firestore/sessions.js`. Live verifiziert (Wegwerf-Instanz :9177): `sessionMode`, `activity`, `effort`, `exercises` sind dabei.
* **`fitness/catalog/api/api.py` `/sessions`**: Identischer Fix im Python-Backend.
* **`useSession.js` Dirty-Flush**: `flushDirty()` sichert ungespeicherte Änderungen jetzt VOR Datumswechsel (`changeDate` ersetzt `setDate` im Hook-Return), Session-Pill-Wechsel (`selectSession`), neuem Workout (`handleNewSession`) und beim Unmount (Haupt-Tab-Wechsel). Vorher gingen dirty Edits dabei kommentarlos verloren. Zusätzlich Race-Guard: der `listSessionsForDate`-Nachlauf in `save()` schreibt `daySessions` nur noch, wenn das Datum noch aktuell ist (`dateRef`).
* **`src/lib/db/local/habits.js`**: Cross-Repo-Import `@habits/lib/db/habits.js` war tot (habits-dev hat den DB-Layer nach `src/.archive/` verschoben → fitness-dev-Build komplett kaputt). Inhalt der archivierten Datei direkt übernommen — fitness-dev besitzt seinen lokalen Habits-DB-Layer jetzt selbst, keine Cross-Repo-DB-Abhängigkeit mehr.

**Offen:** `moveSessionToDate` (Verlauf-Drag&Drop) kann weiterhin die Hauptsession des Zieldatums überschreiben und lässt bei Multi-Session-Tagen Suffix-Sessions als Waisen zurück. Doku (`AUDIT.md`/`ARCHITECTURE.md`) beschreibt noch DateHeader/ExerciseSection/2500ms-Debounce — veraltet. Prod-Deploy nach /opt noch nicht gemacht (User-Bestätigung nötig).

---

# AlphaOS Fitness Ecosystem — Multi-Session Schema (2026-06-20)

We have successfully migrated the training session storage and UI to support multiple workouts per day (using unique session suffixes, e.g., `sessions/{date}__{id}`).

* **SQLite Schema Migration**: Added the `session_id TEXT` column to the local SQLite database in `server.mjs` with an automated `ALTER TABLE` try-catch block for clean backward compatibility.
* **Local Node API Updates**: Adjusted `syncSessionToDb` to clear and write entries using the specific `session_id`, preventing workouts on the same day from overwriting each other.
* **Firestore Dual-Write Updates**: Updated `mirrorSession` inside `firestore-mirror.mjs` to target suffixed document paths (`date__id`).
* **Python Sync Logic**: Refactored `firestore/sync.py` to correctly parse suffixes in `pull()` and `push()` to isolate JSON log files, while keeping daily markdown notes grouped under the main date log (e.g. `2026-06-20.md`).
* **Frontend UI Switcher**: Integrated `sessionId` and `daySessions` states in `src/views/Session/index.jsx`. Added a sleek session switcher card under the calendar bar, letting users toggle between workouts, start a new workout (`+ Neues Workout`), or delete additional workouts.

---

# AlphaOS Fitness Ecosystem — Theme & Settings Restructuring

We have successfully completed the modular refactoring of the Settings Tab and the cleanup/expansion of the theme system.

## 1. Theme Updates (in `src/constants/Themes.js` and `src/styles/themes/`)
* **Removed (11 obsolete/generic themes):** `sweet`, `sweet-purple`, `sweet-mars`, `sweet-amber-blue`, `slate`, `zinc`, `snow`, `mint`, `rose`, `gold`, `cyan`
* **Added (4 premium, custom themes):**
  * **Kanagawa:** Warm Japanese dark theme with sakura pink accent (`#e46876`)
  * **Everforest:** Moss green accented hard dark theme (`#a7c080`)
  * **Oxocarbon:** Precision IBM carbon dark with technical blue accent (`#78a9ff`)
  * **Paper:** Warm, readable cream writing light theme with warm brown accent (`#7c5c3a`)
* **Adjusted / Fixed Themes:**
  * **Gruvbox:** Corrected background hierarchy and true cream/yellow text colors.
  * **Solarized & Solarized Dark:** Precise Ethan Schoonover bases applied to optimize contrast and element layers.
  * **Homunculus:** Shifted to deep earthy tones and blood red accent.
  * **Nothing:** Reines Monochrom-Void (pure black background and clean white text/accents).
  * **Midnight:** Deep midnight blue with personalized indicator shades.

## 2. Modular Settings View (`src/views/Settings/`)
The settings panel has been split into dedicated, self-contained sub-sections:
* **AppearanceSection:** Handles themes (dark/light lists), Circadian settings, layout scaling, and gender selection.
* **TrainingSection:** Allows setting split preferences, cycle lengths, location defaults, and dashboard highlighter mode (`body` vs. `react-muscle-highlighter`).
* **LocalDevSection:** Exposes local server endpoints and sync configurations for advanced debugging.

---

# AlphaOS Fitness Ecosystem — Bugfix: Touch-Stepper Weight Precedence (2026-07-11)

Fixed a precedence bug in `ExerciseCard.jsx` where clicking on step buttons (`+2.5` / `-2.5`) for weights did not register when the weight field already had a value. Added parentheses around `parseFloat(raw) || 0` so `delta` is correctly added.
