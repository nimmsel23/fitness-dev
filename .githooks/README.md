# Git Hooks

Versionierte Git Hooks für dieses Repo. Nach einem frischen Clone aktivieren:

```bash
git config core.hooksPath .githooks
```

## Hooks

### pre-commit
Bumpt automatisch die Service-Worker-Cache-Version (`public/sw.js`) wenn
Frontend-relevante Dateien gestaged sind (`src/`, `public/`, `index.html`,
`vite.config.*`, `package.json`).

- Trigger nur auf `master`
- `cloud_chamber/` und Doku-Dateien (`.md`, `.txt`, `.bak`) werden ignoriert
- Erkennt manuell hochgezählte SW-Versionen und überspringt dann den Auto-Bump

### post-commit
**Retired (2026-07-12), jetzt No-Op.** Deployte früher bei jedem Commit auf
`master` — das war zu früh für mehrstufige lokale Arbeit. Deploy-Trigger ist
jetzt `pre-push` (s.u.). Datei bleibt als Stub liegen statt gelöscht zu werden,
damit ein aktives `core.hooksPath` nicht versehentlich die alte
Doppel-Deploy-Logik reaktiviert.

### pre-push
Baut + deployt zu Firebase (`npm run firebase`) wenn ein Push auf `master`
relevante Dateien enthält (`src/`, `public/`, `index.html`, `vite.config.*`,
`package.json`, `firebase.json`, Firestore-Configs).

- Trigger nur auf `master`, prüft alle gepushten Refs von stdin
- Vergleicht `remote_sha..local_sha` (bzw. den ganzen Branch bei neuem Remote-Ref)
- `cloud_chamber/` und Doku-Dateien werden ignoriert
- `npm run firebase` = `build:firebase` (bumpt `public/sw.js` Cache-Version +
  `public/manifest.json` `version`-Feld via `scripts/bump-sw.mjs`, dann Vite-Build)
  gefolgt von `deploy:firebase` (`firebase deploy --only hosting`)
- Schlägt der Build/Deploy fehl, wird der Push abgebrochen (kein halb-deployter
  Stand) — Override mit `git push --no-verify`
- sw.js/manifest.json-Bump passiert lokal nach dem Push und ist **nicht**
  automatisch Teil des gepushten Commits — separat committen falls gewünscht
