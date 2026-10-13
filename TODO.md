
# [x] 6Pack-Integration (2026-10-11)
- Doppelten Ordner entfernen: echtes Submodule unter `6pack/`, direkte Imports,
  Fitness-KB-Generator unter `scripts/`; VitalOS-Branch-Zuordnung prüfen.
- Submodule auf `fitness` führen; lokalen `dev`-Stand mit `npm run sync:6pack`
  übernehmen, Fitness bauen und Pointer plus Laufzeitdateien committen.

# [NEW] Coach Office 
Beispielfeature: Trainingsplanbesprechung zwischen Klient und Coach. Social Media Style. Comment-feed per Exercise

# [ ] Coach-Tab stabilisieren / Inbox als verlässlichen Review-Workflow fertigstellen
- Coach-Tab war wiederholt Problemfläche: Firestore-Inbox, lokale Catalog-Inbox,
  Runtime-Watcher und Expert-Approve liefen nicht als ein klarer, durchgehender
  Workflow.
- Stand 2026-09-06: Source-Merge im Coach-Tab ist als expliziter
  `Verbinden`-Flow umgesetzt. Firebase kann bei laufendem lokalem
  FastAPI-Prod-Server wger-/yuhonas-Kandidaten an Inbox-Drafts hängen, sodass
  der spätere Expert-Datensatz beide IDs kennt. Desktop nutzt
  `http://127.0.0.1:6100/fitness`; Firebase Hosting nutzt per Default den
  Funnel `https://ideapad.tail7a15d6.ts.net/fitness/fitness`.
- Stand 2026-09-06: Reenrich ist als Rebuild alter Inbox-Drafts zu verstehen,
  nicht als reines Umformulieren von AI-Coach-Text. Bestätigte Provenance-Felder
  (`wger_id`, `yuhonas_id`, `external_ids`, `origin`, `source_snapshot`) müssen
  beim Rebuild erhalten bleiben und dürfen nicht vom Modell "vergessen" werden.
- Offen als Makro-Ziel: Coach-Tab Ende-zu-Ende zuverlässig machen:
  Source-Kandidaten anzeigen, Quelle verbinden, optional reenrichen,
  approve/reject, lokale YAML-KB und Firestore-Expert-KB synchron halten,
  UI-Zustände/Fehler sichtbar machen und mit Browser-Durchklick gegen Firebase
  plus lokalem `:6100` verifizieren.
- Stand 2026-09-06: Firebase-Inbox ist local-first umgestellt. Firestore ist
  fuer Inbox nur noch Cache/Fallback/Offline-Warteschlange; `approveInbox()` und
  `reenrichInbox()` sollen ohne lokalen `:6100` nicht mehr final cloud-only
  schreiben.
- Offen: Browser-Durchklick gegen `fitness-aos.web.app/#coach` mit laufendem
  Funnel/`:6100`: lokale Drafts sichtbar, Source verbinden, Reenrich, Approve,
  lokale Expert-YAML und Firestore-Mirror pruefen.
- Architekturgrenze: Fitness importiert Fuel nicht direkt. Ernährung/Fuel bleibt
  ein eigener Surface; keine `@fuel/*`-Imports im Fitness-Frontend einführen.



# [ ] Session Gate / ("Skills") Thenics-Runner Ausbau (Calisthenics)
- **Bug/UX-Lücke entdeckt (2026-10-12):** Sessions werden faktisch nie
  bewusst beendet — `sessionGate.endedAt` bleibt `null`/`status: "active"`
  auch nach abgeschlossenem Workout (Beispiel: `2026-10-11.json`, Operator-
  UID). Dadurch greift die Auto-Done-Verknüpfung zu Core4-Fitness nicht
  (kein Event-Ordner unter `~/.core4/events/<datum>/`), obwohl trainiert
  wurde. Kein Einzelfall — niemand denkt am Ende des Workouts aktiv daran,
  die Session explizit zu beenden. `stopSessionGate()`
  (`useSessionGateController.js`) selbst setzt `endedAt` korrekt — das Problem
  ist rein, dass der Button nie gedrückt wird.
  - [x] (2026-10-12) 1-Stunden-Reminder ergänzt: `SessionGateCard.jsx` prüft
    ab 1h aktiver Session (sofort bei App-Open + alle 30s) und schickt über
    den Service Worker (`SHOW_WORKOUT_HOUR_REMINDER` in `public/sw.js`) eine
    eigene, nicht-stille Benachrichtigung (Vibration, `requireInteraction`) —
    bewusst anders als die bereits bestehende, laufend aktualisierte
    Stoppuhr-Notification (`fitness-workout-session`), die `silent: true`
    ist. Persistiert in `localStorage` (`fitness-workout-hour-reminder-sent-
    for`) gegen Doppel-Feuern bei Reload. **Nicht verifiziert:** echtes
    Verhalten bei komplett geschlossener PWA (Browser-/OS-abhängig, siehe
    Plattformgrenze oben) — nur im geöffneten Tab/laufender PWA getestet
    (Build grün, kein Browser-Durchklick in dieser Session möglich).
  - Offen: harter Fallback, der eine >N-Stunden-alte offene Session beim
    nächsten App-Open automatisch schließt/danach fragt (statt nur zu
    erinnern) — bisher nur die Erinnerung, kein Auto-Close.
- Today-Session zuerst als `Gym Session Gate`: großer Start-/Stop-Button, Trainingstag sofort loggen, manuelles Nachtragen bleibt darunter offen.
- Während aktiver Session Thenics-artigen Guided Runner bauen:
  - Quelle: im `Plan`-Tab gepflegtes Workout oder Coach-Zuweisung, aber nicht erzwungen.
  - Fokus: `jetzt`-Übung groß, `als Nächstes` klein, klare Reihenfolge statt Formularwand.
  - nicht verhandelbar: Reps-Schieberegler während Rest, Rest-Timer, Finished-Screen.
- Session-Notification über App-Service-Worker:
  - während aktiver Session laufende Status-Benachrichtigung mit Stoppuhr,
  - beim Stop statischer Abschlussstatus,
  - Plattformgrenze sauber beachten: echtes sekundengenaues Weiterlaufen bei komplett geschlossener PWA ist browser-/OS-abhängig.

## [ ] ("Timer") 6Pack-Runner Ausbau (Tabata-like HIIT Core-Workouts) heavily inspired by ATHLEAN-X 6Pack App
wird so ähnlich erfolgen wie der Skills-Runner
- **6Pack Selfies / Progress Photos - Google Drive Sync**:
  - Bisher verbleiben Progress-Selfies ggf. nur im LocalStorage/lokalen Client-Speicher.
  - User-spezifische Google Drive (GDrive) Synchronisation einbauen, damit Fotos sicher, persistent und geräteübergreifend in der Cloud gesichert werden (ohne den LocalStorage zu überlasten).
- **Audio / Voice Cues**:
  - [x] (2026-10-12, `6pack-dev` branch `fitness` @921f42f) Wenn eine Übung nur noch 10 Sekunden dauert, sagt die Audio-Stimme das jetzt an ("Noch 10 Sekunden") — `RunnerScreen` in `SixPackPromiseCard.jsx`.
  - **Einseitige Übungen (Seitenwechsel / Richtungswechsel)**:
    - [x] (2026-10-12, selber Commit) Bei direkt aufeinanderfolgenden Items mit identischem Namen (z. B. zweimal "Side Plank Lifts" in Folge, siehe `SIXPACK_VERIFIED_WORKOUTS`) sagt die Ansage jetzt vorab "Seitenwechsel" an (`isSideSwitch()`).

  - **Stimmqualität verbessern**: Aktuelle Standard-WebSpeech-Stimme klingt blechern/unnatürlich ("Sound nicht ganz super"):
    - *Ansatz 1 (Sofort via WebSpeech API)*:
      - [x] (2026-10-12, selber Commit) `bestVoice()` filtert `getVoices()` jetzt gezielt nach Natural/Enhanced/Premium- bzw. Google-Stimmen statt der ersten verfügbaren Default-Stimme. Nicht verifiziert: tatsächliche Klangqualität auf dem Zielgerät (Browser-/OS-abhängige Stimmliste, kein Audio-Playback-Test in dieser Session möglich) — beim nächsten Gym-Test gegenhören.
      - Pitch/Rate bleiben auf Standard (1/1) — noch kein Feintuning, falls nach dem Hörtest nötig.
    - *Ansatz 2 (Studio-Qualität via Audio-Files)*:
      - Feste Ansagen ("Noch 10 Sekunden", "Pause, 30 Sekunden", "Halbzeit", "Letzte Wiederholung", Übungsnamen) vorab mit einer professionellen KI-Stimme (ElevenLabs, Edge-TTS oder OpenAI TTS) rendern und als gecachte Web-Audio/MP3-Snippets abspielen.
      - Klingt 1:1 wie ein echter menschlicher Personal Coach im Studio ohne Browser-Abhängigkeiten.





# [Push Messages] 
tägliche Push benachrichtigungen bei fehlenden Logs - direkt im Benachrichtigungscenter interaktiv? 
weiteführende Idee: falls in Settings PPL-Split eingestellt dann könnte täglich eine zB Pull=done? Message aufs handy kommen bis das jeweils nächste Workout done ist.
Impuls hierzu: Klient:Matthias fehlende Ambition zum kontinuierlichen Loggen von Workouts.

- [x] 2026-10-13: Antigravity-Worktree: lokalen 6Pack-Foto-Sync mit UID-Anbindung, Proxy, nutzergebundener Offline-Queue und Runtime-Speicher abschließen.

- [x] **6Pack Selfies: Fotoauswahl zusätzlich zur Kamera**: getrennte Aktionen
  „Foto aufnehmen“ und „Fotos auswählen“ (Galerie/Dateien, ohne `capture`),
  optional Mehrfachauswahl; Dateiformat/Größe prüfen und pro Foto Upload- bzw.
  Offline-Status zeigen. Gemeinsames Selfies-Modul für lokale UI und PWA nutzen;
  Auswahl und Warteschlange immer an die aktive UID binden.
