# learn-dev

Learn-Tab als Module Federation Remote.

**Kein eigenes Backend** — nutzt fitness-dev Node-Server (:9100) direkt.

## Ports

| Zweck | Port |
|-------|------|
| Federation Dev-Server | :9183 |
| Backend (fitness-dev) | :9100 |

## Build

```bash
# Aus fitness-dev/ ausführen:

# Remote bauen (Output: cloud_chamber/learn-dev/dist-federation/)
npx vite build --config cloud_chamber/federation/learn.remote.vite.config.js

# Dev-Server (fitness-dev Backend muss auf :9100 laufen)
npx vite --config cloud_chamber/federation/learn.remote.vite.config.js
```

## Inhalt

- `dist-federation/` — Build-Output (nicht committen)
- `../federation/LearnApp.jsx` — exposed component
- `../federation/learn.remote.vite.config.js` — Remote-Config
- `../federation/LearnTab.jsx` — Tab-Wrapper im Host
