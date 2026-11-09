# Backend-Auslagerung

Stand: 2026-11-09.

## Node → `~/dev/backend` (Root)

Hono/`server.mjs`, Cloud Functions: SOT in `~/dev/backend`.
`package.json`/`dev-runner` zeigen auf `../backend/server.mjs`.

## Python → `~/dev/backend/fitness/backend`

Das ehemalige nested `fitness-dev/backend/` (FastAPI, sync/notifier/pusher, …)
liegt jetzt unter **`~/dev/backend/fitness/backend`**.

In diesem Repo ist `backend` ein **Symlink** dorthin, damit
`python3 -m backend …` vom Repo-Root weitergeht.

Coach-:9150 / `coach-dev` bleibt ein **anderer** Stack — nicht dasselbe Paket.
