# cloud_chamber/fitness-dev/ — Federation Remote Deploy

> ⚠️ **KEIN SOURCE-CODE. KEIN ERSATZ FÜR DAS ROOT-REPO.**
> Dieser Ordner ist ausschließlich ein Deploy-Kontext. Er ersetzt, ergänzt oder
> überschreibt **nichts** aus `~/fitness-dev/src/` oder dem Root-Repo.
> Agents dürfen hier keine Komponenten, keine API-Logik, keinen Config-Code ablegen.

Dieser Ordner ist **kein fitness-dev Clone** und enthält keinen Source-Code.

Er ist ausschließlich der Deploy-Kontext für das **fitness-dev Federation Remote**
(Vite Module Federation) auf Firebase Hosting Site `fitness-vos`.

## Inhalt

```
dist-federation/    — Build-Output: fitness-dev als Federation Remote (remoteEntry.js)
firebase.json       — Firebase Hosting Config → Site: fitness-vos, Public: dist-federation/
```

## Workflow

```bash
# 1. Federation Remote bauen (aus fitness-dev Root)
VITE_FEDERATION=true vite build --outDir cloud_chamber/fitness-dev/dist-federation

# 2. Remote deployen
cd cloud_chamber/fitness-dev
firebase deploy --only hosting
# → https://fitness-vos.web.app/assets/remoteEntry.js
```

Der `remoteEntry.js` wird von anderen VOS-Apps (z.B. VitalOS Shell) via
Vite Module Federation als Remote eingebunden.

## Was hier NICHT passiert

- Kein Source-Code ändern
- Kein eigenständiger Server
- Nicht vom fitness-dev Vite-Watcher erfasst (in `server.watch.ignored`)
