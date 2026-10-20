#!/usr/bin/env node

import { mkdir, rm, writeFile } from 'node:fs/promises';
import { execFileSync, spawnSync } from 'node:child_process';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const fitnessRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const appName = process.argv[2];
const sourceCommit = process.argv[3];
const configs = {
  sixpack: {
    label: '6Pack',
    repo: process.env.SIXPACK_DEV_REPO || join(homedir(), '6pack-dev'),
    sourcePrefix: '',
    target: 'src/views/SixPack',
    selectFiles: (all) => all.filter((file) =>
      (/^[^/]+\.(jsx|js|mjs|css)$/.test(file) && !['build-data.mjs', 'publish-fitness.mjs', 'standaloneSync.js', 'main.jsx', 'styles.css'].includes(file)) ||
      file === 'catalog/exercise-videos.yml'
    ),
  },
  plan: {
    label: 'Plan',
    repo: process.env.PLAN_DEV_REPO || join(homedir(), 'plan-dev'),
    sourcePrefix: 'src/views/Plan/',
    target: 'src/views/Plan',
  },
  skills: {
    label: 'Skills',
    repo: process.env.SKILLS_DEV_REPO || join(homedir(), 'skills-dev'),
    sourcePrefix: '',
    target: 'src/views/Skills',
    selectFiles: (all) => all.filter((file) => /^[^/]+\.(jsx|js|mjs|css|json)$/.test(file) && !['main.jsx', 'styles.css'].includes(file)),
  },
};
const protectedDocs = new Set(['AGENTS.md', 'ARCHITECTURE.md', 'AUDIT.md']);

function git(cwd, ...args) {
  return execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8' }).trim();
}

function run(command, args, cwd, label) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`${label} failed with exit code ${result.status}`);
}

function isAncestor(cwd, ancestor, descendant) {
  const result = spawnSync('git', ['-C', cwd, 'merge-base', '--is-ancestor', ancestor, descendant]);
  if (result.status === 0) return true;
  if (result.status === 1) return false;
  throw new Error(`Could not compare ${ancestor} with ${descendant} in ${cwd}`);
}

function listSourceFiles(config, sha) {
  const all = git(config.repo, 'ls-tree', '-r', '--name-only', sha).split('\n').filter(Boolean);
  const selected = config.selectFiles ? config.selectFiles(all) : all
    .filter((file) => file.startsWith(config.sourcePrefix))
    .map((file) => file.slice(config.sourcePrefix.length))
    .filter((file) => file && !protectedDocs.has(file.split('/').at(-1)));
  if (!selected.length) throw new Error(`${config.label} source commit contains no integrated view files.`);
  return selected;
}

async function copyCommitFiles(config, sha, files) {
  const destination = join(fitnessRoot, config.target);
  await mkdir(destination, { recursive: true });

  const trackedAtTarget = git(fitnessRoot, 'ls-files', '--', config.target)
    .split('\n').filter(Boolean)
    .map((file) => file.slice(config.target.length + 1));
  const incoming = new Set(files);
  for (const stale of trackedAtTarget) {
    if (!incoming.has(stale) && !protectedDocs.has(stale.split('/').at(-1))) {
      await rm(join(destination, stale), { force: true });
    }
  }

  for (const file of files) {
    const sourcePath = config.sourcePrefix ? `${config.sourcePrefix}${file}` : file;
    const bytes = execFileSync('git', ['-C', config.repo, 'show', `${sha}:${sourcePath}`]);
    const targetPath = join(destination, file);
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, bytes);
  }
}

async function main() {
  const config = configs[appName];
  if (!config || !sourceCommit) {
    throw new Error('Usage: node scripts/publish-mini-app-to-fitness.mjs <sixpack|plan|skills> <source-commit>');
  }

  const source = resolve(config.repo);
  const branch = git(source, 'branch', '--show-current');
  if (branch !== 'dev') throw new Error(`${config.label} source must be on dev (found '${branch || 'detached HEAD'}')`);
  if (!isAncestor(source, sourceCommit, 'dev')) {
    throw new Error(`${sourceCommit} is not part of ${config.label}'s local dev branch`);
  }

  const targetBranch = git(fitnessRoot, 'branch', '--show-current');
  if (targetBranch !== 'dev') throw new Error(`Fitness target must be on dev (found '${targetBranch || 'detached HEAD'}')`);
  if (git(fitnessRoot, 'status', '--porcelain', '--', config.target)) {
    throw new Error(`Fitness target ${config.target} has local changes; commit or resolve them first.`);
  }
  if (git(fitnessRoot, 'diff', '--cached', '--quiet') !== '') {
    throw new Error('Fitness has staged changes; commit them before app sync.');
  }

  run('git', ['fetch', 'origin', 'dev'], fitnessRoot, 'Fetch Fitness origin/dev');
  const targetHead = git(fitnessRoot, 'rev-parse', 'HEAD');
  const remoteHead = git(fitnessRoot, 'rev-parse', 'origin/dev');
  if (targetHead !== remoteHead) {
    throw new Error(`Fitness dev must be exactly at origin/dev before syncing (local ${targetHead.slice(0, 8)}, remote ${remoteHead.slice(0, 8)}).`);
  }

  const files = listSourceFiles(config, sourceCommit);
  if (!files.length) throw new Error(`${config.label} commit contains no integrated view files.`);

  console.log(`${config.label} ${sourceCommit.slice(0, 8)} → Fitness dev (${files.length} files)`);
  await copyCommitFiles(config, sourceCommit, files);

  const changed = git(fitnessRoot, 'status', '--short', '--', config.target);
  if (!changed) {
    console.log('Fitness view already matches this source commit; nothing to push.');
    return;
  }

  console.log('\nBuilding Fitness Firebase bundle before pushing (no local deploy).');
  run('pnpm', ['run', 'build:firebase'], fitnessRoot, 'Fitness Firebase build');

  run('git', ['add', '--', config.target], fitnessRoot, `Stage ${config.label} view`);
  run('git', ['commit', '-m', `chore(fitness): sync ${config.label} from ${appName}-dev`], fitnessRoot, `Commit ${config.label} view`);
  run('git', ['push', 'origin', 'dev'], fitnessRoot, 'Push Fitness dev to trigger CI staging');
  console.log(`\n${config.label} is integrated in Fitness dev and pushed. CI now handles staging.`);
}

main().catch((error) => {
  console.error(`\nFitness mini-app sync stopped: ${error.message}`);
  process.exitCode = 1;
});
