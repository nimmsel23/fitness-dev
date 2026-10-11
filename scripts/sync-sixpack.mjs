#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const submodule = resolve(root, '6pack-dev');
const source = resolve(root, '../6pack-dev');
const files = ['SixPackPromiseCard.jsx', 'sixpack.css', 'sixpackData.js'];
const git = (cwd, ...args) => execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8' }).trim();
const run = (cwd, command, args) => execFileSync(command, args, { cwd, stdio: 'inherit' });

try {
  if (process.argv.length > 2) throw new Error('Aufruf: npm run sync:6pack (Quelle: benachbartes 6pack-dev, Branch dev).');
  if (git(source, 'branch', '--show-current') !== 'dev') throw new Error('Quellrepo muss auf dev stehen.');
  if (git(source, 'status', '--porcelain', '--untracked-files=no')) throw new Error('Getrackte Änderungen im Quellrepo zuerst committen.');
  if (git(submodule, 'rev-parse', '--show-toplevel') !== submodule) throw new Error('Submodule zuerst initialisieren: git submodule update --init 6pack-dev');
  if (git(submodule, 'status', '--porcelain')) throw new Error('Submodule hat lokale Änderungen.');
  if (git(root, 'config', '-f', '.gitmodules', '--get', 'submodule.6pack-dev.branch') !== 'fitness') throw new Error('.gitmodules muss branch = fitness festlegen.');
  if (git(root, 'status', '--porcelain', '--', '6pack-dev', ...files.map(name => `6pack/${name}`))) {
    throw new Error('Vorherige Pointer- oder Laufzeitdatei-Änderungen zuerst prüfen und committen.');
  }
  const branch = git(submodule, 'branch', '--show-current');
  if (branch && branch !== 'fitness') throw new Error('Submodule muss auf fitness stehen (nicht dev).');
  const commit = git(source, 'rev-parse', 'refs/heads/dev');
  run(submodule, 'git', ['fetch', '--no-tags', source, 'refs/heads/dev']);
  // Refuse divergent histories before changing the checkout.
  git(submodule, 'merge-base', '--is-ancestor', 'HEAD', commit);
  if (!branch) {
    const existing = git(submodule, 'branch', '--list', 'fitness');
    if (existing && git(submodule, 'rev-parse', 'fitness') !== git(submodule, 'rev-parse', 'HEAD')) {
      throw new Error('Lokaler fitness-Branch weicht vom gepinnten Checkout ab; zuerst manuell prüfen.');
    }
    run(submodule, 'git', existing ? ['switch', 'fitness'] : ['switch', '-c', 'fitness']);
  }
  run(submodule, 'git', ['merge', '--ff-only', commit]);
  run(submodule, process.execPath, ['publish-fitness.mjs', resolve(root, '6pack')]);
  run(root, 'npm', ['run', 'build']);
  console.log(`\n6Pack dev → fitness geprüft: ${commit}\nJetzt Diff prüfen und 6pack-dev sowie die geänderten Dateien unter 6pack/ committen. Kein Push oder Deploy ausgeführt.`);
} catch (error) {
  console.error(`6Pack-Sync abgebrochen: ${error.message}\nBereits ausgeführte Schritte bleiben zur Prüfung erhalten; kein automatischer Reset.`);
  process.exitCode = 1;
}
