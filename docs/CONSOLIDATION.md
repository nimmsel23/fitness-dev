# Quellzuständigkeit seit 2026-11-06

`learn` gehört zu `fitness-dev`. Die eigenständig installierbare PWA bleibt unter `apps/learn` erhalten; Einstieg: `npm run build:learn`. Die Hosting-Zuordnung ist im Firebase-Manifest dieses Repos hinterlegt. Kein Deploy wurde ausgeführt.

Der Node-Backend-Quellstand liegt in `~/dev/backend/`: Hono-Server am Repo-Root, Cloud Functions unter `functions/fitness` und `functions/journal`, TaskChampion-CORS-Proxy unter `scripts/`. Der bisherige Hono-Startpfad bleibt bis zum gemeinsamen Backend-Release kompatibel. Functions-Quellen und Paket-Manifeste liegen ausschließlich im Backend; die alten Frontend-Ordner behalten nur unbearbeitete Konfigurations-/Lockfile-Reste. Neue Node-/Functions-Änderungen ausschließlich dort. Die Functions-Deployment-Blöcke wurden aus den Frontend-Manifesten entfernt.

Das nested Python-`backend/` in diesem Repo (sync/notifier/pusher, …) wurde **nicht**
per Subtree ausgelagert und bleibt hier — siehe `docs/BACKEND-MOVED.md`. Coach-:9150
ist ein anderer Stack.

Lockfiles werden auf ausdrücklichen Nutzerwunsch in diesem Schritt nicht bearbeitet. Workspace-Installationen in den angepassten Standalone-Workflows verwenden deshalb vorerst `--no-frozen-lockfile`. Backend-Tests werden in diesem Schritt nicht ausgeführt. Die Frontend-CI führt nur Frontend-Tests aus; Functions-Testdateien gehören zum gemeinsamen Backend. Backend-CI folgt mit dessen Release.

Alte Learn-/Habits-Repos und Shell-Gitlinks bleiben bis zum expliziten Release erhalten. Die Entwicklung erfolgt nur noch im jeweiligen neuen Owner. Keine Services neu starten oder Produktionscheckouts direkt bearbeiten.

## Dependency-Entkopplung

`nodemon` gehört ausschließlich zum gemeinsamen Backend. Fitness delegiert den API-Dev-Start an dessen eigenes npm-Script. Die drei Journal-Functions-Testdateien liegen unter `~/dev/backend/tests/journal`; die Frontend-CI installiert keine Functions-Abhängigkeiten mehr. Die alten Functions-Verzeichnisse enthalten keine ausführbaren Quellen oder Paket-Manifeste mehr und sind nicht Teil der Frontend-Workspace-Installation oder Dependabot-Konfiguration. Lockfiles bleiben unverändert.
