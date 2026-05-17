# Muscle Arena Frontend

Real-time muscle coverage tracking with live skeleton visualization.

**Multi-Tenant:** Works for personal use and individual clients.
See [MULTI_TENANCY.md](./MULTI_TENANCY.md) for architecture details.

## Quick Start

```bash
cd /home/alpha/vital-hub/arena
npm install
npm run dev
```

The dev server opens under `http://localhost:5173/`.

## Production URLs

- **Personal:** `http://localhost:8788/fitness/arena/`
- **Client Example:** `http://localhost:8788/c/matthias/fitness/arena/`

## Deploy to fitnessctx

```bash
cd /home/alpha/vital-hub/arena
npm run deploy:fitnessctx
```

This builds and publishes to `../fitnessctx/public/fitness/arena/`.

The same build works for both personal and client contexts thanks to relative paths.

## Data source sync

`npm run dev` and `npm run build` automatically copy:

- `../data/anatomy.json`
- `../data/exercise-muscle-db.json`

into `public/data/`.

Manual sync:

```bash
npm run sync:data
```

## Features

- ✅ **Sprint 1:** Alpine.js reactive UI + modular architecture
- ✅ **Sprint 2:** Live-update (no reload after logging)
- ✅ **Multi-Tenant:** Personal + per-client contexts
- ✅ Dynamic 2D skeleton from `anatomy.json`
- ✅ Real-time muscle coverage calculation
- ✅ Auto-complete exercise search (bilingual de/en)
- ✅ Server sync with local fallback
- ✅ PWA-ready (manifest + service worker)

## Architecture

See [MULTI_TENANCY.md](./MULTI_TENANCY.md) for detailed architecture documentation.
