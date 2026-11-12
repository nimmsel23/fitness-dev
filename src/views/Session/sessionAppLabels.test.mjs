import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import esbuild from 'esbuild';

const here = dirname(fileURLToPath(import.meta.url));

const entry = `
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { ExternalLink, TimerReset, Sparkles } from 'lucide-react';
import SessionModeTabs from './SessionModeTabs.jsx';
import { SessionShellProvider } from './sessionShell.jsx';
import { buildPortalEntries } from './GatePortalGrid.jsx';
import { getNavItems, NAV_ITEMS } from '../../constants/NavigationItems.js';

function iconName(Icon) {
  if (Icon === ExternalLink) return 'external';
  if (Icon === TimerReset) return 'timer';
  if (Icon === Sparkles) return 'skills';
  return 'other';
}

export function tabs(shell) {
  return renderToStaticMarkup(createElement(
    SessionShellProvider,
    { inShell: shell },
    createElement(SessionModeTabs, { sessionMode: 'strength', setSessionMode() {}, subTab: null }),
  ));
}

export function portal(shell) {
  return buildPortalEntries({ shell })
    .filter((item) => item.id === 'timer' || item.id === 'skills')
    .map((item) => ({ id: item.id, label: item.label, icon: iconName(item.Icon) }));
}

function sessionSubs(items) {
  return items.find((item) => item.id === 'session').sub
    .filter((item) => item.id === 'timer' || item.id === 'skills')
    .map((item) => ({ id: item.id, label: item.label, icon: iconName(item.Icon) }));
}

export function standaloneNav() {
  return sessionSubs(getNavItems());
}

export function shellNav() {
  return sessionSubs(NAV_ITEMS);
}
`;

async function loadLabels() {
  const dir = await mkdtemp(join(here, '.tmp-labels-'));
  const outfile = join(dir, 'entry.mjs');
  await esbuild.build({
    stdin: {
      contents: entry,
      resolveDir: here,
      sourcefile: 'sessionAppLabels.entry.jsx',
      loader: 'jsx',
    },
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'node',
    packages: 'external',
    jsx: 'automatic',
    alias: {
      '@utils': join(here, '../../lib/utils.js'),
    },
    define: {
      'import.meta.env.VITE_SOLO_TAB': '""',
    },
  });
  const mod = await import(pathToFileURL(outfile).href);
  return { mod, cleanup: () => rm(dir, { recursive: true, force: true }) };
}

test('rendered 6Pack and Skills labels follow shell vs standalone', async () => {
  const { mod, cleanup } = await loadLabels();
  try {
    const standalone = mod.tabs(false);
    const shell = mod.tabs(true);
    assert.match(standalone, /> 6Pack-App</);
    assert.match(standalone, /> Skills-App</);
    assert.match(standalone, /lucide-external-link/);
    assert.doesNotMatch(standalone, /lucide-timer-reset/);
    assert.match(shell, /> 6Pack</);
    assert.match(shell, /> Skills</);
    assert.match(shell, /lucide-timer-reset/);
    assert.match(shell, /lucide-sparkles/);
    assert.doesNotMatch(shell, /6Pack-App/);
    assert.doesNotMatch(shell, /Skills-App/);
    assert.doesNotMatch(shell, /lucide-external-link/);
    assert.match(standalone, /6Pack-App öffnen/);
    assert.match(shell, /aria-label="6Pack"/);

    assert.deepEqual(mod.portal(false), [
      { id: 'timer', label: '6Pack-App', icon: 'external' },
      { id: 'skills', label: 'Skills-App', icon: 'external' },
    ]);
    assert.deepEqual(mod.portal(true), [
      { id: 'timer', label: '6Pack', icon: 'timer' },
      { id: 'skills', label: 'Skills', icon: 'skills' },
    ]);

    assert.deepEqual(mod.standaloneNav(), [
      { id: 'timer', label: '6Pack-App', icon: 'external' },
      { id: 'skills', label: 'Skills-App', icon: 'external' },
    ]);
    assert.deepEqual(mod.shellNav(), [
      { id: 'timer', label: '6Pack', icon: 'timer' },
      { id: 'skills', label: 'Skills', icon: 'skills' },
    ]);
  } finally {
    await cleanup();
  }
});
