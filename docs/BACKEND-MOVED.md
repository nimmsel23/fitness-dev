# Backend- / Python-Auslagerung

Stand: 2026-11-09.

## Node → `~/dev/backend`

Hono/`server.mjs`, Cloud Functions.

## `fitness.*` Package → `~/dev/coach-dev/fitness`

Keine Kopie mehr in diesem Repo (war fast bytegleich). `deploy.sh` setzt
`FITNESS_PY_PKG` (Default Coach).

## Sessions-Python → `~/dev/backend/fitness/backend`

Coach mountet unter `/fitness-api`. `deploy.sh` synct nach Staging/`DEST/backend`.

## Plan

`plan-dev` hat kein Python-`fitness`-Paket mehr.
