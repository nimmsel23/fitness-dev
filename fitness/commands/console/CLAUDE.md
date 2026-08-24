# CLAUDE.md — fitness/commands/console/ (Live-Coach-TUI)

Sub-Package von `fitness/commands/log.py` (Typer-App `fitness-log`). Übergeordneter
Kontext: `../../../CLAUDE.md` (Repo-Root), `../../CLAUDE.md` (Python-Backend).

Startet über `fitness-log console` (bzw. `python -m fitness.commands.log console`).
Beobachtet alle Klienten-Sessions/Journal-Einträge in Echtzeit und lässt eine
Zwei-KI-Analyse (`fitness/catalog/agent/coach_ai.py`) darüberlaufen:
Trainingslücken-Kontext-Check + Auto-Feedback-Entwürfe zu geloggten Workouts.

---

## Module

```
console/
├── __init__.py    — public run(), Modul-Übersicht
├── core.py         — verdrahtet Watcher + Gap-Loop + Freigabe + Rich-Live-Rendering
├── watcher.py       — watchdog FileSystemEventHandler (Session-/Journal-Änderungen)
├── gap_check.py      — periodischer Trainingslücken-Check über alle (aktiven) Klienten
├── drafts.py          — Persistenz der KI-Ausgaben (~/.aos/fitness/console/drafts/)
├── approval.py         — interaktive Freigabe von Feedback-Entwürfen (a/d/s)
└── keys.py              — nicht-blockierendes Einzeltasten-Lesen (cbreak-Mode, stdlib)
```

`fitness/commands/log.py::cmd_console` ruft nur `console.run(gap_check_interval)`
auf. `fitness-log drafts [--client NAME]` (separater Befehl in `log.py`, nicht Teil
dieses Sub-Packages) liest die von `drafts.py` persistierten Entwürfe.

---

## Datenflüsse

**Zwei Quellen speisen dieselbe `events`-Queue** (angezeigt im Rich-`Live`-Panel):

1. **Watcher** (`watcher.py`): watchdog beobachtet `runtime_root()/users` rekursiv.
   Neue/geänderte `sessions/*.json` → Event-Zeile + Trigger für `_analyze_session()`
   (Feedback-Entwurf). Neue/geänderte `journal/*.md` → Event-Zeile.
2. **Gap-Loop** (`gap_check.py`): eigener Daemon-Thread, prüft alle
   `gap_check_interval` Sekunden (Default 1800s/30min) jeden aktiven Klienten auf
   unerklärte Trainingslücken (`GAP_THRESHOLD_DAYS = 6`, siehe `coach_ai.py`).

**Feedback-Entwürfe** durchlaufen zusätzlich eine **Freigabe** (`approval.py` +
`keys.py`): landen in einer `review_queue`, werden im Panel prominent mit
Tasten-Hinweis angezeigt, Coach drückt `a`/`d`/`s`. Nur bei echtem TTY aktiv —
bei Pipe/Redirect (Tests, Cron) wird die Freigabe übersprungen, Drafts bleiben
`pending`.

**Persistenz** (`drafts.py`): sowohl Gap-Erklärungen als auch Feedback-Entwürfe
werden nach `~/.aos/fitness/console/drafts/<uid>/<timestamp>_<kind>_<id>.json`
geschrieben — überleben Neustarts, einsehbar via `fitness-log drafts`.
Freigabe-Status wird ins selbe JSON zurückgeschrieben (`mark_status()`), kein
zweiter State-Speicher.

---

## Ausbaustufen (in dieser Reihenfolge gebaut, bauen aufeinander auf)

1. ✅ **Persistenz** (`drafts.py`) — ohne Datensatz pro Entwurf gibt es nichts,
   das man später freigeben oder senden könnte.
2. ✅ **Interaktive Freigabe** (`approval.py`, `keys.py`) — Coach akzeptiert/
   verwirft direkt im Panel statt nur zuzusehen.
3. ⏳ **Senden an Klient** (Telegram/Firestore) — noch nicht gebaut. Braucht 1+2
   als Voraussetzung: nur *freigegebene* (`status: approved`) Entwürfe sollten
   automatisiert rausgehen, sonst verschickt man ungeprüfte KI-Texte direkt.

---

## Bekannte Fixes (2026-08-24, chronologisch)

Alle drei Symptome sahen von außen gleich aus ("Console hängt bei Schöffy"),
hatten aber **drei unabhängige Ursachen** — Reihenfolge zeigt, wie sich die
Diagnose schrittweise verschärft hat:

1. **Crash-Verdacht (unbestätigt geblieben):** ursprüngliche Annahme war, dass
   eine Exception in `_gap_check_loop` (kein try/except pro Klient) den ganzen
   Daemon-Thread lautlos sterben lässt. Fix vorsorglich eingebaut
   (`gap_check_loop` fängt jetzt pro Klient ab, loggt nach
   `~/.aos/fitness/logs/console.log`), aber **in echten Läufen nie tatsächlich
   als Ursache bestätigt** — kein Traceback im Log gefunden.
2. **Rich/loguru-Terminal-Kollision (echter Bug, bestätigt):** `logger.exception()`
   schrieb auf stderr, während Rich's `Live` denselben Terminal-Stream aktiv
   neu zeichnet — erzeugte sichtbar zerrissene/doppelte Panel-Boxen. Fix:
   `_setup_file_logging()` in `core.py` leitet loguru während der
   Console-Session in eine Datei um, zusätzlich kurze rote Fehlerzeile direkt
   im Panel statt stillem Swallow.
3. **Kein Bug, sondern fehlendes Lebenszeichen (echte Ursache, bestätigt):**
   Klienten ohne Lücke werden in <1s übersprungen (kein Event). Ein Klient MIT
   ungeklärter Lücke löst zwei synchrone KI-Calls aus (Gemini + Haiku-CLI-Review,
   gemessen ~21s für Schöffy) — währenddessen passiert im Panel nichts. Steht so
   ein Klient als letzter in der Registry-Reihenfolge, ist seine Zeile das letzte
   sichtbare Lebenszeichen für die nächsten `interval` Sekunden. Fix: kurze
   "Prüfe Trainingslücke..."-Zeile *vor* den KI-Calls + "Zyklus fertig"-Zeile
   mit Uhrzeit des nächsten Checks danach.
4. **Falscher Alarm, kein technischer Bug (Datenmodell-Fix):** Schöffy hatte die
   App nur **einmalig** ausprobiert (`status: "freund"` in `client.json`, eine
   einzige Session je) — kein aktives Coaching-Verhältnis, trotzdem meldete
   jeder 30-Minuten-Zyklus erneut seine "18-Tage-Lücke". `load_client_registry()`
   (`fitness/data.py`) gibt jetzt zusätzlich `status` durch,
   `gap_check.NON_COACHING_STATUSES = {"freund", "interessent"}` filtert solche
   Klienten vor dem Gap-Check raus (Daniel = `"coach"` und Matthias = kein
   Status, also aktive echte Coaching-Beziehungen, werden weiter geprüft).

**Lehre:** bei "hängt"/"friert ein"-Symptomen erst mit einer Zeitmessung pro
Klient/Schritt nachweisen, WO die Zeit wirklich hingeht, bevor man Crash-Theorien
nachjagt — Schritt 1 (Crash-Vermutung) hat sich am Ende als falsche Fährte
herausgestellt, Schritt 3+4 waren die eigentlichen Ursachen.

---

## Symlink-Gotcha

Watcher beobachtet den **physischen** Pfad `runtime_root()/users`, NICHT
`AOS_USERS` (`~/.aos/users/`): `<uid>/fitness` ist dort nur ein Symlink auf
`~/.aos/fitness/users/<uid>`, und watchdog/inotify folgt bei rekursivem Watch
keinen Symlinks (gleicher Gotcha wie im Enrichment-Watcher,
`fitness/catalog/api/watcher.py`).
