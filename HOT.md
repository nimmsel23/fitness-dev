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
React-nativ, SVG-basiert. RadarChart für Muskelabdeckung, LineChart für Progression,
BarChart für wöchentliches Volumen. Passt gut zu TailwindCSS.
`npm install recharts`
https://github.com/recharts/recharts

### react-chartjs-2
Chart.js-Wrapper, mehr Chart-Typen, etwas schwerer. Doughnut für Coverage sieht gut aus.
`npm install react-chartjs-2 chart.js`

---

## npm — Body/Anatomie Visualisierung

### react-body-highlighter ✅ (bereits eingebunden)
https://github.com/dex-gov/react-body-highlighter

### react-muscle-highlighter
Direkte Alternative — klickbare Muskelregionen, TypeScript, Male/Female, Front/Back,
Intensitätsstufen. Interessant wenn interaktive Auswahl (Klick = Filter) gebraucht wird.
https://github.com/soroojshehryar/react-muscle-highlighter

### body-muscles
Framework-agnostisch, 70+ anatomische Regionen, reines TypeScript/DOM.
https://vulovix.github.io/body-muscles/

---

## Open Source Apps — Referenz + Ideen

### Liftosaur (wichtigste Referenz)
Preact/TypeScript, AGPL. Hat:
- Wöchentliches Volumen pro Muskelgruppe (prescribed vs. completed)
- Alle Standard-Programme als lesbarer Code (PPL, 5/3/1, GZCLP etc.)
- Mesozyklen-Konzept vollständig implementiert
- Progressionslogik-Struktur als Vorbild nutzbar
https://github.com/astashov/liftosaur

### WhyAsh5114/MyFit
SvelteKit, RP Hypertrophy inspiriert. Hat Volume Landmarks implementiert:
MV / MEV / MAV / MRV pro Muskelgruppe — Konzept direkt in Coverage-Analyse übernehmen.
https://github.com/WhyAsh5114/MyFit

### cfilipov/MuscleBook.net
Offline-WebApp, IndexedDB, AGPL. Fokus auf Datenanalyse.
ExerciseYAMLFormat ist gut dokumentiert — relevant weil fitness-dev auch YAML-Katalog nutzt.
https://github.com/cfilipov/MuscleBook.net

### GitMazzone/workout-tracker
React Native + Expo, RP Hypertrophy Clone. Gute Set-Logging-Komponenten + Mesozyklus-UI.
https://github.com/GitMazzone/workout-tracker

---

## Konzepte die den Tempel interessant machen

**Volume Landmarks (aus MyFit/Liftosaur)**
MV (Maintenance Volume) / MEV (Minimum Effective) / MAV (Maximum Adaptive) / MRV (Maximum Recoverable)
pro Muskelgruppe — zeigt ob eine Muskelgruppe unter- oder übertrainiert ist. Wäre eine
starke Erweiterung der Coverage-Analyse.

**Liftoscript-Idee (aus Liftosaur)**
Progressionsregeln als deklarativer Code/YAML statt hart verdrahtet.
fitness-dev hat bereits `program_rules.yaml` — Konzept ist kompatibel.

**GIFs/Animationen pro Übung**
wger hat wenig Medien. bootstrapping-lab/exercisedb-api oder wrkout/exercises.json
könnten das füllen — besonders für den Anatomy Teaching Layer.
