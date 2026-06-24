import { cpSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const src = resolve(root, process.argv[2]);
const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const dest = resolve(root, 'dist-versions', `${process.argv[2]}_${ts}`);

mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
console.log(`snapshot → dist-versions/${process.argv[2]}_${ts}`);
