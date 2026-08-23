# Firebase — AlphaOS Fitness

Stand: 2026-08-23

Firebase-Projekt: **fitness-aos**
PWA: **https://fitness-aos.web.app**

Diese Datei beschreibt den tatsächlich genutzten Firebase- und Deploy-Pfad.

## 1. Reale Trennung der Linien

Es gibt bei Fitness drei verschiedene Linien, die man nicht vermischen darf:

### `~/fitness-dev`

- aktiver Dev-Checkout
- Branch `dev`
- hier passieren Implementierung, lokale Builds und lokale Desktop-Deploys
- hier startet auch die Preview-/CI-Linie

### `/home/alpha/vitalos/fitness-app`

- Release-Vessel für Firebase
- Branch `master` bzw. `vitalos` je nach Repo-Stand
- von `fitness-dev` wird hierhin weitergereicht
- von hier läuft der eigentliche Firebase-Live-Deploy
- der Top-Level-Wrapper dafür ist `fitness-release`

### `/home/alpha/vitalos`

- Parent-Repo
- bekommt am Ende den Submodule-Pointer-Bump
- relevant für Shell-/Meta-Repo-CI

Kurz:
- `fitness-dev` = Dev + lokale Deploys + CI-Ausgangspunkt
- `vitalos/fitness-app` = Firebase-Live-Release
- `vitalos` = Parent/Submodule-Pointer + Shell-CI

Der bequeme Top-Level-Wrapper für den Release-Pfad ist:

```bash
fitness-release
```

## 2. Lokaler Desktop-Deploy

Der localhost-Deploy ist bei Fitness dieselbe Grundidee wie bei Fuel:

1. **Dev -> Staging**
   - Quelle: `~/fitness-dev`
   - Ziel: `~/.local/fitness`
   - Mechanik: `./deploy.sh staging`
   - Wrapper: `fitness-devctl deploy` bzw. `fitnessctl dev deploy`

2. **Staging -> Localhost-Prod**
   - Quelle: `~/.local/fitness`
   - Ziel: `/opt/fitness`
   - Mechanik: `./deploy.sh prod`
   - Wrapper: `fitness-prodctl deploy` bzw. `fitnessctl prod deploy`

Wichtig:
- `~/.local/fitness` ist Staging, nicht Prod
- `/opt/fitness` ist der echte localhost-Prod-Stand
- `deploy.sh prod` liest aus `~/.local/fitness`, nicht direkt aus `~/fitness-dev`

Relevante Controller:
- `deploy.sh` = eigentliche Deploy-Logik
- `fitness-devctl` = Dev-/Staging-Controller
- `fitness-prodctl` = Prod-/systemd-Controller
- `fitnessctl` = Top-Level-Dispatcher
- `fitness-release` = Top-Level-Release-Wrapper für die Weitergabe Richtung
  `vitalos/fitness-app`

Lokale Ports:
- Dev Backend: `:9100`
- Dev Frontend: `:5902`
- Localhost-Prod: `fitness.service` auf `:6100` aus `/opt/fitness`

## 3. Firebase-Live-Release

Der Firebase-Live-Release passiert nicht aus einem historischen `~/fitness`
Vessel, sondern über den tatsächlichen Release-Pfad:

1. Änderungen in `~/fitness-dev` auf `dev`
2. weiter nach `/home/alpha/vitalos/fitness-app`
3. dort Live-Build + Firebase-Deploy
4. danach Parent-Pointer-Update in `/home/alpha/vitalos`

Wenn man also fragt "wo deployt Fitness wirklich nach Firebase?", ist die
praktische Antwort:

- **nicht** aus einem separaten alten `~/fitness`-Vessel
- **sondern** aus `vitalos/fitness-app`

## 4. Build-Abhängigkeiten

Vor Dev-/Prod-/Firebase-Builds laufen bei Fitness KB-Generierungen:

```bash
npm run build:kb-data
```

Das hängt bereits an:
- `predev`
- `prebuild`
- `prebuild:firebase`

Es umfasst:
- `build:sixpack-data`
- `build:bulk-data`
- `build:coaching-notes`

Wenn Generated-Dateien fehlen, ist zuerst zu prüfen, ob `build:kb-data`
wirklich vor dem eigentlichen Build lief.

## 5. GitHub Actions / CI

Für die CI gilt dieselbe Meta-Repo-Logik wie bei Fuel:

- Builds sind oft nur im `vitalos`-Kontext korrekt
- Cross-App-Importe und Workspace-Aliase hängen am Meta-Repo
- `fitness-dev` allein ist nicht automatisch die vollständige Build-Umgebung

Für Fitness ist deshalb immer zu unterscheiden:
- **lokaler Desktop-Deploy** über `deploy.sh` / `fitnessctl`
- **Firebase-Live-Release** über `vitalos/fitness-app`
- **Meta-Repo-/Shell-CI** über `vitalos`

## 6. Datenmodell (Firestore)

```text
fitness/
├── default/
│   ├── sessions/{date}
│   ├── journal/{auto-id}
│   ├── plan
│   └── body/{date}
└── kb/
    ├── exercises/{exercise_id}
    └── anatomy/{exercise_id}
```

## 7. Credentials

| Datei | Zweck |
|-------|-------|
| `~/.env/firebase-fitness.json` | Service Account für lokale Mirror-/Python-Pfade |
| `firebase.config.js` | Web-App Config (gitignored) |
| GitHub Secrets | `FIREBASE_CONFIG`, `FIREBASE_SERVICE_ACCOUNT` |

## 8. What Could Possibly Go Wrong

- `~/fitness-dev` und `vitalos/fitness-app` werden gedanklich vermischt
- `deploy.sh prod` wird direkt gegen `~/fitness-dev` gedacht, obwohl es aus
  `~/.local/fitness` liest
- ein historisches `~/fitness`-Release-Vessel wird noch als echte Quelle
  angenommen
- Meta-Repo-Builds brechen, wenn Cross-App-Aliase oder Workspace-Kontexte
  stillschweigend verändert werden

## 9. Nicht Verändern

- die Trennung `fitness-dev` = Dev/localhost und `vitalos/fitness-app` = Firebase-Live-Release
- die lokale Kette `~/fitness-dev -> ~/.local/fitness -> /opt/fitness`
- `fitness-release` als Top-Level-Release-Wrapper
- `@vos/cross-app-aliases` als SSOT für Cross-Repo-Aliase
- `build:kb-data` als feste Vorbedingung der Build-Pfade
