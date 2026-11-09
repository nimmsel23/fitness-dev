# Backend-Auslagerung

Stand: 2026-11-09.

## Node → `~/dev/backend` (Root)

Hono/`server.mjs`, Cloud Functions: SOT in `~/dev/backend`.
`package.json`/`dev-runner` zeigen auf `../backend/server.mjs`.

## Python → `~/dev/backend/fitness/backend`

Ehemals nested hier. Kein Symlink mehr in diesem Repo.

```bash
cd ~/dev/backend/fitness && python3 -m backend serve
```

`deploy.sh` synct das Paket aus `FITNESS_PY_BACKEND` (Default
`../backend/fitness/backend`) nach Staging/`DEST/backend`.

Coach-:9150 / `coach-dev` bleibt ein **anderer** Stack.
