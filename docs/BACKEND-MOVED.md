# Backend-Auslagerung

Stand: 2026-11-09.

## Node → `~/dev/backend` (Root)

Hono/`server.mjs`, Cloud Functions: SOT in `~/dev/backend`.
`package.json`/`dev-runner` zeigen auf `../backend/server.mjs`.

## Python → `~/dev/backend/fitness/backend`

Kein `backend/` mehr in diesem Repo.

```bash
cd ~/dev/backend/fitness && python3 -m backend serve
```

**Coach übernimmt den Mount:** `coach-api.service` lädt dasselbe Paket unter
`/fitness-api` (`COACH_FITNESS_BACKEND_ROOT=~/dev/backend/fitness`). Inbox/Catalog
bleiben `coach-dev/fitness.api` — anderer Router-Stack im selben Prozess.

`deploy.sh` synct das Paket aus `FITNESS_PY_BACKEND` nach Staging/`DEST/backend`.
