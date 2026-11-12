// 6Pack and Skills are external apps only in the Fitness standalone host.
// Inside the VitalOS shell they are local tabs. App.jsx calls
// markStandaloneHost() because the shell never mounts that file
// (vitalos src/shell/FitnessApp.jsx renders Session directly). An explicit
// `shell` or `embedded` prop overrides the host mark.

const COPY = {
  timer: { plain: '6Pack', app: '6Pack-App' },
  skills: { plain: 'Skills', app: 'Skills-App' },
};

let standaloneHost = false;

export function markStandaloneHost() {
  standaloneHost = true;
}

export function isStandaloneHost() {
  return standaloneHost;
}

export function resetStandaloneHostForTests() {
  standaloneHost = false;
}

export function externalSessionCopy(id, { shell = false } = {}) {
  const spec = COPY[id];
  if (!spec) return null;
  if (shell) return { label: spec.plain, external: false, ariaLabel: spec.plain };
  return { label: spec.app, external: true, ariaLabel: `${spec.app} öffnen` };
}

// `shell` / `embedded` default to “not passed”. Omitted means: standalone
// only after App.jsx has marked this bundle; otherwise the VitalOS shell.
export function resolveInShell({ shell, embedded } = {}) {
  if (typeof shell === 'boolean') return shell;
  if (typeof embedded === 'boolean') return embedded;
  return !standaloneHost;
}
