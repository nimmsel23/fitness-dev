#!/usr/bin/env node
/* eslint-env node */
// Kopiert fitness/catalog/kb/registry/bp3d_kb_map.json → src/data/bp3dMap.json.
// SSOT bleibt die KB-Registry (JSON neben bp3d_kb_map.yml); die App-Kopie war
// bisher Hand-Copy. Läuft über build:kb-data (predev/prebuild). Fehlt die KB
// (schlanker Checkout ohne fitness-kb-Link), soft-skip — analog plan/sixpack.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(REPO, 'fitness/catalog/kb/registry/bp3d_kb_map.json')
const OUT = join(REPO, 'src/data/bp3dMap.json')

if (!existsSync(SRC)) {
  console.log(`bp3d-map: Quelle fehlt (${SRC}) — übersprungen`)
  process.exit(0)
}

mkdirSync(dirname(OUT), { recursive: true })
copyFileSync(SRC, OUT)
console.log(`bp3d-map: ${OUT} aus KB-Registry geschrieben`)
