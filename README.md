# fitness-dev (Standalone)

Fitness Centre als **Standalone**-App (React/Vite UI + Node HTTP API).

## Dev

- Install: `npm install`
- Start (UI + API): `npm run dev`
- UI only: `npm run ui:dev`
- API only: `npm run start`

Ports (Default):
- UI (Vite): `http://127.0.0.1:5902`
- API (Node): `http://127.0.0.1:9002`

## WGER (Exercise Search)

`/exercises/search` nutzt `wger` über das lokale API:
- Base: `http://127.0.0.1:8000/api/v2`
- Token ist default **hardcoded** in `fitness-dev/server.mjs`, kann aber via `WGER_TOKEN`/`WGER_API_TOKEN` überschrieben werden (optional auch `WGER_BASE`).

## Daten (lokal)

Alle Daten liegen im Repo unter `data/`:
- `data/sessions/YYYY-MM-DD.json`
- `data/journal/YYYY-MM-DD.md`
- `data/theme.json`

## Export

Dashboard hat Buttons für CSV-Export:
- `GET /export/csv?days=7`
- `GET /export/csv?days=14`

Response: `{ ok:true, filename, csv }` (CSV wird clientseitig als Download gespeichert).

## Production/Static

`node server.mjs` serviert:
- `dist/` wenn vorhanden (Vite Build)
- sonst fallback `public/`

Override: `FITNESS_STATIC_DIR=/path/to/static`.
