#!/usr/bin/env node
/* eslint-env node */
// Erzeugt src/lib/api/schema.d.ts aus der OpenAPI-Spec des Python-Backends.
//   pnpm run gen:api                      → http://127.0.0.1:9150/openapi.json
//   FITNESS_BACKEND=http://127.0.0.1:9951 pnpm run gen:api
//   pnpm run gen:api -- ./openapi.json    → aus lokaler Datei
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = process.env.FITNESS_BACKEND || 'http://127.0.0.1:9150';
const source = process.argv[2] || `${base}/openapi.json`;
const out = join(root, 'src/lib/api/schema.d.ts');

const bin = join(root, 'node_modules/.bin/openapi-typescript');
const res = spawnSync(bin, [source, '-o', out], { stdio: 'inherit' });
if (res.status !== 0) {
  console.error(`gen-api: fehlgeschlagen für ${source} — läuft das Backend (python3 -m backend serve)?`);
  process.exit(res.status ?? 1);
}
console.log(`gen-api: ${out} aus ${source} geschrieben.`);
