# cloud_chamber/ — AGENTS

Staging-Bereich für VOS Micro-Apps (Journal, Learn, Federation-Prototypen).
Liegt physisch in `fitness-dev/cloud_chamber/` — ist aber **kein** Teil von fitness-dev.

---

## Sub-Apps und Zuständigkeiten

| Ordner | Was | Vite-Watcher | Agent |
|--------|-----|--------------|-------|
| `journal-dev/` | Journal + Habits Micro-App | ✅ eingebunden (Alias in vite.config.js) | fitness-dev-coding-agent |
| `learn-dev/` | Anatomie/Lern-App | ✅ eingebunden | fitness-dev-coding-agent |
| `federation/` | Vite Module Federation Staging | ✅ eingebunden | fitness-dev-coding-agent |
| `vitalos/` | VitalOS Shell (separates Projekt) | ❌ ignoriert (`server.watch.ignored`) | **nicht hier** — eigenes Repo |
| `fitness-dev/` | Federation Remote Deploy-Kontext (nur `dist-federation/` + `firebase.json`) | ❌ ignoriert (`server.watch.ignored`) | **nicht hier — nur Deploy, kein Source** |

---

## Grenzen

**Gehört hier rein:**
- VOS Micro-App Prototypen die später in eigene Repos wandern
- Federation-Staging (Vite Module Federation Configs)
- Firestore Rules + Watcher-Skripte

**Gehört NICHT hier rein:**
- `vitalos/` — eigenständiges Firebase-Projekt, nichts mit fitness-aos zu tun
- AlphaOS-Komponenten (Core4, Bridge, Door, Game)
- Alles mit eigenem Firebase-Projekt (eigenes Repo, eigene Pipeline)

**Kritische Agent-Regel — `cloud_chamber/fitness-dev/`:**
Dieser Ordner enthält **keinen Source-Code** und ist **kein Ersatz** für `~/fitness-dev/src/`
oder das Root-Repo. Er ist ausschließlich Deploy-Kontext für den Federation Remote
(`dist-federation/` → Firebase Site `fitness-vos`).
Kein Agent darf hier Komponenten, Logik oder Konfiguration ablegen die zum
Root-fitness-dev-Repo gehören. Source-Änderungen immer im Root, nie hier.

---

## Vite-Konfiguration (vite.config.js)

Aliases die auf cloud_chamber zeigen:
```js
'./views/Journal' → cloud_chamber/journal-dev/src/views/Journal
'./views/Habits'  → cloud_chamber/journal-dev/src/views/Habits
'journal/JournalApp' → cloud_chamber/federation/JournalApp.jsx
'learn/LearnApp'     → cloud_chamber/federation/LearnApp.jsx
```

Explizit ignoriert im File-Watcher:
```js
'**/cloud_chamber/vitalos/**'
'**/cloud_chamber/fitness-dev/**'
```

Neue Sub-Apps die **nicht** von Vite erfasst werden sollen → in `server.watch.ignored` eintragen.

---

## Neue Micro-App anlegen

1. Ordner `cloud_chamber/<name>-dev/` anlegen
2. Eigenes `package.json` + `vite.config.js` (Port 917x)
3. `@db`-Adapter aus fitness-dev übernehmen
4. Alias in `fitness-dev/vite.config.js` eintragen wenn nötig
5. Wenn reif → eigenes Repo unter `~/<name>-dev/`

---

## Arbeitsregeln

- Nichts außerhalb von `cloud_chamber/` verändern (außer `vite.config.js` für Aliases)
- `vitalos/` nicht anfassen — gehört zu einem anderen Deployment-Kontext
- `dist-*` Ordner nicht committen (`.gitignore` + Vite-Watcher ignoriert sie)
- Jede Architektur-Entscheidung → `federation/DECISIONS.md` (ADR)
