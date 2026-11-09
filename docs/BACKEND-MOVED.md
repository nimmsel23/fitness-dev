# Backend: was ausgelagert ist — und was nicht

Stand: 2026-11-09.

## Node → `~/dev/backend` (ausgelagert)

Hono/`server.mjs`, Cloud Functions: SOT in `~/dev/backend`.
Nach Extraktion gehört der Node-Prefix **nicht** mehr in dieses Repo
(idealerweise per `git subtree split`, danach Prefix im Parent löschen — nicht nur kopieren).

## Python `backend/` → **noch hier** (nicht sauber extrahiert)

`fitness-dev/backend/` (FastAPI-Paket, sync/notifier/pusher, …) wurde **nicht**
zuverlässig per Subtree in ein eigenes Repo gezogen. Coach-:9150 /
`coach-dev/fitness/api` ist ein **anderer** Stack — nicht bytegleich mit diesem
Baum (u. a. notifier/pusher/sync fehlen dort).

Solange kein Subtree-Split + Remote existiert: **dieses `backend/` ist die
Arbeitskopie** — nicht löschen, nicht als „tote Kopie vom Node-Backend“ behandeln.

Archiv-Spiegel (forensisch):  
`~/dev/_archive/2026-11-09-nested-backend-copies/fitness-dev-backend`
