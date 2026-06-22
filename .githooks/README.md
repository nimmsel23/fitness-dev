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
Deployed fitness-dev automatisch zu Firebase wenn relevante Dateien geändert wurden.

- Trigger nur auf `master`
- `cloud_chamber/` und Doku-Dateien werden ignoriert
- Ruft `npm run deploy-firebase` auf wenn `src/`, `public/`, `index.html`,
  `vite.config.js`, `package.json`, `firebase.json` oder Firestore-Configs geändert wurden
