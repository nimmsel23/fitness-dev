# HOT — fitness-dev Tech Arsenal

Open Source Repos, Datensätze und npm Module die der fitness-agent in Tickets verwenden kann.
Kein Aktionsplan — Referenz für den Agenten.

---

## Exercise Datenbanken

### wrkout/exercises.json
2500+ Übungen, 10.000+ Bilder, 3500+ Videos — Public Domain JSON.
Deutlich umfangreicher als yuhonas. Primär für Medien (Bilder/Videos) wo wger nichts hat.
https://github.com/wrkout/exercises.json

### yuhonas/free-exercise-db ✅ (bereits bekannt)
800+ Übungen, Public Domain JSON, Bilder, alternative Namen.
https://github.com/yuhonas/free-exercise-db

### bootstrapping-lab/exercisedb-api
Self-hosted REST API, 1500+ Übungen mit GIFs. Läuft lokal via Docker, MIT-Lizenz.
Interessant wenn Animations-GIFs pro Übung gewünscht werden.
https://github.com/bootstrapping-lab/exercisedb-api

### hasaneyldrm/exercises-dataset
433 Übungen, Thumbnail + Animations-Video pro Eintrag, kompaktes JSON-Array.
Schneller Medienkatalog-Import.
https://github.com/hasaneyldrm/exercises-dataset

### exercemus/exercises
Mix aus wger + exercises.json + eigenen Daten. Hat `muscle_groups`-Mapping
das direkt für Coverage-Analyse nutzbar wäre.
https://github.com/exercemus/exercises

---

## npm — Charts

### recharts
React-nativ, SVG-basiert. RadarChart für Muskelabdeckung, LineChart für Belastungsverläufe.
Passt gut zu TailwindCSS.
`npm install recharts`
https://github.com/recharts/recharts

### react-chartjs-2
Chart.js-Wrapper, mehr Chart-Typen, etwas schwerer. Doughnut für Coverage sieht gut aus.
`npm install react-chartjs-2 chart.js`

---

## npm — Body/Anatomie Visualisierung

### react-body-highlighter ✅ (bereits eingebunden)
https://github.com/dex-gov/react-body-highlighter

### react-muscle-highlighter ✅ (integriert in Muscles Tab)
Interaktive Auswahl, klickbare Muskelregionen, front/back/side Ansichten.
`npm install react-muscle-highlighter`
https://github.com/soroojshehryar/react-muscle-highlighter

### body-muscles
Framework-agnostisch, 70+ anatomische Regionen, reines TypeScript/DOM.
https://vulovix.github.io/body-muscles/

---

## Open Source Apps — Referenz + Ideen

### cfilipov/MuscleBook.net
Offline-WebApp, IndexedDB, AGPL. Fokus auf Datenanalyse.
ExerciseYAMLFormat ist gut dokumentiert — relevant weil fitness-dev auch YAML-Katalog nutzt.
https://github.com/cfilipov/MuscleBook.net

---

## Konzepte die den Tempel interessant machen

**GIFs/Animationen pro Übung**
wger hat wenig Medien. bootstrapping-lab/exercisedb-api oder wrkout/exercises.json
könnten das füllen — besonders für den Anatomy Teaching Layer.

---

## Training Tab (Session) — Next Steps / Ideen
*Gedankensammlung für zukünftige Iterationen des Trainingstabs nach dem Fokus auf Recovery/HIT.*

* **Plan-Integration vertiefen**: Es gibt aktuell einen kleinen "Hint" (Blitz-Icon), wenn ein Plan vorliegt. Nächster Schritt: Ein 1-Klick-Button "Plan für heute laden", der die Übungen aus dem Plan sofort als leere Übungskarten in die Session schießt.
* **Quick-Input für HIT optimieren**: Die Quick-Eingabe (z.B. `bench 3x8@80`) könnte so erweitert werden, dass `bench H@80` sofort als HIT-Satz geparst und gespeichert wird.
* **Warm-Ups & Drop-Sets**: Falls doch mal mehr Differenzierung beim Logging im HIT-Kontext (z.B. Aufwärmsätze, Back-off Sätze) nötig ist, das UI leichtgewichtig um Set-Typen erweitern.
* **Multi-Session pro Tag**: Aktuell überschreibt eine Session am selben Tag (`sessions/${date}.json`) die vorherige. Die Architektur auf `sessions/${sessionId}` umbauen, falls mal morgens und abends trainiert wird (steht auch in der MEMORY.md).
* **Inline Habit/Journal**: Den "Wie war der Fokus?" (Notes) Bereich noch tiefer mit dem Journaling/Habit-System verknüpfen.
