import { useState, useEffect } from 'react';

const AGENT_BASE = 'http://localhost:9120';

let cache = null;
let pending = null;
const listeners = [];

function notify() {
  listeners.splice(0).forEach(fn => fn(cache));
}

async function load() {
  try {
    const res = await fetch(`${AGENT_BASE}/muscles/viz`);
    cache = res.ok ? await res.json() : { rbh: {}, body_muscles: {}, body_muscles_slugs: {} };
  } catch {
    cache = { rbh: {}, body_muscles: {}, body_muscles_slugs: {} };
  }
  notify();
}

function ensure() {
  if (!pending) pending = load();
  return pending;
}

ensure();

export function useMuscleMap() {
  const [map, setMap] = useState(cache);
  useEffect(() => {
    if (cache) { setMap(cache); return; }
    listeners.push(setMap);
    ensure();
    return () => {
      const i = listeners.indexOf(setMap);
      if (i !== -1) listeners.splice(i, 1);
    };
  }, []);
  return map;
}

export function getMuscleMapSync() {
  return cache;
}
