# frontend/ — Fork von `src/` + `catalog-ui/` gegen das neue Backend

Kopie (kein Verschieben) von `../src`, `../catalog-ui`, `../public`, `../Skills` und dem von `src/` genutzten Teil von `../6pack`.
Die Originale bleiben unverändert. Der **Firebase-Modus bleibt erhalten**; der **lokale Modus** spricht das neue Python-Backend
(`../backend`, `/api/*`, Standard `127.0.0.1:9150`).

```
frontend/
  src/                    App (React 18, Vite 5, Tailwind)
    lib/api/              NEU: typisierter Client (client.js), UID (uid.js), Session-Adapter, schema.d.ts (generiert)
    lib/db/local/         lokaler DB-Layer — sessions/kb/coach/Settings auf /api umgestellt (// → neues Backend)
    lib/db/index.firestore*.js   Firebase-Modus, unverändert
  catalog-ui/             Catalog-UI (React 19, Vite 8, eigenes package.json); src/api.js übersetzt alte Routen → /api
  public/                 PWA: sw.js, offline-queue.js (angepasst, s.u.), manifest
  6pack/ Skills/          von src/ importierte Teile
  scripts/                KB-Datengeneratoren (lesen die KB aus ../fitness/catalog/kb), stamp-sw, gen-api
  tests/                  adapter-smoke.mjs, offline-queue.test.mjs
  docs/                   ROUTE-MAPPING.md (alt→neu), BACKEND-GAPS.md (Wünsche ans Backend)
```

## Befehle (pnpm; eigener Workspace, App + catalog-ui)
| Befehl | Zweck |
|---|---|
| `pnpm install` | Abhängigkeiten (btrfs: Reflinks aus dem pnpm-Store, kaum Zusatzplatz) |
| `pnpm dev` | App auf **127.0.0.1:5911** (Proxy `/api` → Backend) |
| `pnpm dev:catalog` | Catalog-UI auf **127.0.0.1:5912** |
| `pnpm build` · `build:catalog` · `build:all` | Lint + Build → `dist/`, `catalog-ui/dist/` |
| `pnpm build:firebase` | Firebase-Build → `dist-firebase/` (**nur bauen, kein Deploy**) |
| `pnpm build:coach` | Coach-Build → `dist-coach/` |
| `pnpm gen:api` | `src/lib/api/schema.d.ts` aus `/openapi.json` erzeugen (`FITNESS_BACKEND=…`) |
| `pnpm test` | `test:queue` (Offline-Queue) + `test:smoke` (Anbindung, braucht laufendes Backend **auf einer Datenkopie**) |

Umgebung: `FITNESS_BACKEND` (Standard `http://127.0.0.1:9150`), `FITNESS_LEGACY_BACKEND` (alte Routen ohne Pendant, Standard = Backend → 404),
`FITNESS_NODE_PORT` (Strava/6pack, Standard 9100), `FITNESS_KB_DIR`, `FITNESS_FRONTEND_PORT/HOST`, `VITE_API_BASE`, `VITE_FITNESS_UID`.

## Was gegenüber dem Original anders ist
- **UID:** das Backend adressiert Nutzer explizit (`/api/users/{uid}/…`). `getActiveUid()`: localStorage `fitness-active-uid` > `VITE_FITNESS_UID` > Coach aus `/api/clients`.
- **rev-Schutz:** `saveSession` → `PUT` mit Basis-`rev`; bei 409 wirft der Client `RevConflictError`. Der Adapter merkt sich die zuletzt bekannte `rev`
  je Dokument, damit ein zweiter Save nach dem ersten keinen falschen Konflikt auslöst.
- **Service Worker:** `/api/users|clients|plan|catalog` = stale-while-revalidate; alles übrige unter `/api/` (z.B. `/api/sync/*`) geht ans Netz.
  Ohne diese Regel fiele es in die cache-first-Regel für Assets und lieferte dauerhaft Veraltetes.
- **Offline-Queue + SW-Flush:** HTTP 409 beim Abspielen verwirft den Offline-Stand **nicht** mehr (vorher: jede Antwort < 500 löschte den Eintrag),
  sondern markiert ihn `conflict`, spielt ihn nicht erneut ab und sendet `fitness:queue-conflict`. **Offen:** eine Oberfläche, die Konflikte anzeigt/auflöst.
- **Offline-Platzhalter:** `X-Source: offline-stub` (kein Netz, kein Cache) ist im Client ein Fehler und kein „Session"-Objekt.
- **Vite:** `preserveSymlinks` aus (Original: an + 41 Phantom-Deps, Commit d4bc095), `server.fs.allow` aus den aufgelösten Alias-Pfaden, KB via Alias `@kb`.
- **Prebuild-Skripte** lesen die KB aus `../fitness/catalog/kb` (SSOT bleibt dort) statt aus einer Kopie.

## Offen / bekannt
- Viele Routen haben im neuen Backend noch kein Pendant → `docs/BACKEND-GAPS.md`. Betroffene Funktionen laufen weiter über die Legacy-Route (`FITNESS_LEGACY_BACKEND`).
- `getExercise` liefert aus dem neuen Backend weniger Felder als die alte Katalogzeile (Bilder u.a.).
- `sixpackData.generated.js` & Co. werden beim Build erzeugt und nicht eingecheckt.
