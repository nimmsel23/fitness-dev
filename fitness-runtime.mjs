import fs from 'node:fs'
import path from 'node:path'

const AGENT_BASE = 'http://localhost:9120'

async function fetchAgent(endpoint, options = {}, { silent = false } = {}) {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${AGENT_BASE}${endpoint}`
    const res = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    })
    return res.ok ? res.json() : null
  } catch (err) {
    if (!silent) console.error(`[fitness-runtime] agent fetch failed (${endpoint}):`, err.message)
    return null
  }
}

// Minimal placeholder data while agent is loading or if it fails
const fallbackData = {
  config: {},
  exercises: [],
  lessons: [],
  muscles: {},
}

let cachedSnapshot = null
let lastSnapshotAttempt = 0
const SNAPSHOT_TTL_MS = 30_000

export async function loadRuntimeSnapshot({ force = false } = {}) {
  const now = Date.now()
  const hasData = cachedSnapshot && (cachedSnapshot.exercises?.length || 0) > 0
  if (!force && hasData && now - lastSnapshotAttempt < SNAPSHOT_TTL_MS) {
    return cachedSnapshot
  }
  lastSnapshotAttempt = now

  // On first-ever load: retry up to 3× silently to handle agent startup lag
  const isFirstLoad = !cachedSnapshot
  const attempts = isFirstLoad ? 3 : 1
  for (let i = 0; i < attempts; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, 2000))
    const snapshot = await fetchAgent('/snapshot', {}, { silent: i < attempts - 1 })
    if (snapshot) {
      cachedSnapshot = snapshot
      return snapshot
    }
  }
  return cachedSnapshot || fallbackData
}

// Lazy proxy — re-reads cachedSnapshot on every property access so callers
// don't capture a stale empty object from boot time.
export const fitnessData = new Proxy({}, {
  get(_t, prop) {
    const src = cachedSnapshot || fallbackData
    return src[prop]
  },
})

// Kick off an initial load in the background (non-blocking).
loadRuntimeSnapshot().catch(() => {})

export function obsidianTargetPath() {
  return fitnessData.config?.obsidian?.export_path || ''
}

function toFrontendExercise(ex, extra = {}) {
  if (!ex) return null
  return {
    ...ex,
    id: ex.exercise_id || ex.id,
    name: ex.display_name || ex.german || ex.name || ex.exercise_id,
    displayName: ex.display_name || ex.name,
    primaryMuscles: ex.primary_muscles || ex.primaryMuscles || [],
    secondaryMuscles: ex.secondary_muscles || ex.secondaryMuscles || [],
    source: ex.source || 'local_yaml',
    ...extra,
  }
}

export async function searchExercises(query, limit = 12) {
  const result = await fetchAgent(`/search?q=${encodeURIComponent(query)}&limit=${limit}`)
  if (result?.ok) {
    return {
      ok: true,
      query,
      results: (result.results || []).map(ex => toFrontendExercise(ex)),
      suggestions: (result.results || []).slice(0, 3).map(r => ({
        canonical_id: r.exercise_id || r.id,
        display_name: r.display_name,
      })),
    }
  }

  // Fallback: cached snapshot mit includes
  let snapshot = cachedSnapshot
  if (!snapshot || !(snapshot.exercises?.length)) {
    snapshot = await loadRuntimeSnapshot({ force: true })
  }
  const normalized = query.toLowerCase()
  const matches = (snapshot?.exercises || [])
    .filter(ex =>
      (ex.exercise_id || '').includes(normalized) ||
      (ex.display_name || '').toLowerCase().includes(normalized) ||
      (ex.german || '').toLowerCase().includes(normalized)
    )
    .slice(0, limit)
    .map(ex => toFrontendExercise(ex))

  return {
    ok: true,
    source: 'snapshot',
    query,
    results: matches,
    suggestions: matches.slice(0, 3).map(m => ({ canonical_id: m.id, display_name: m.name })),
  }
}


export async function buildPlan(options = {}) {
  const query = new URLSearchParams(options).toString()
  return fetchAgent(`/plan?${query}`)
}

export async function getWeeklySummary(weekSelector = 'current') {
  return fetchAgent(`/weekly?week=${weekSelector}`)
}

export async function exportWithPython(kind, payload = {}) {
  return fetchAgent(`/export/${kind}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function exportSessionMarkdown(session) {
  const targetDir = obsidianTargetPath()
  if (!targetDir) return { error: 'obsidian export path missing' }

  const date = session?.date || new Date().toISOString().slice(0, 10)
  const noteName = `Sessions/${date}`
  const target = path.join(targetDir, `${noteName}.md`)
  
  try {
    fs.mkdirSync(path.dirname(target), { recursive: true })

    const exercises = Array.isArray(session?.exercises) ? session.exercises : []
    const lines = [
      '---',
      'type: training-session',
      `date: ${JSON.stringify(date)}`,
      `block: ${JSON.stringify(session?.block || '')}`,
      '---',
      `# Session ${date}`,
      '',
      '## Summary',
      `- Block: ${session?.block || 'n/a'}`,
      `- Effort: ${session?.effort ?? 'n/a'}`,
      `- Mood: ${session?.mood || 'n/a'}`,
      '',
      '## Exercises',
      '| Exercise | Sets | Reps | Weight | Note |',
      '| --- | --- | --- | --- | --- |',
      ...(exercises.length
        ? exercises.map(ex => `| ${ex.name || 'Uebung'} | ${ex.sets ?? ''} | ${ex.reps ?? ''} | ${ex.weight ?? ''} | ${ex.note || ''} |`)
        : ['| - | - | - | - | - |']),
      '',
      '## Notes',
      session?.notes ? String(session.notes) : '-',
    ]

    const content = lines.join('\n').replace(/\n+$/, '\n')
    fs.writeFileSync(target, content, 'utf8')
    return { path: target, used_fallback_name: false, overwritten: false, warning: null }
  } catch (err) {
    console.error('[fitness-runtime] exportSessionMarkdown failed:', err.message)
    return { error: err.message }
  }
}

export async function queueForEnrichment(ex) {
  if (!ex || ex.source === 'expert') return
  fetchAgent('/inbox/queue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ exercise_id: ex.id || ex.exercise_id, name: ex.name || ex.display_name }),
  }, { silent: true }).catch(() => {})
}

const FAV_KEY = 'fitness_favourites'
export function getFavourites() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]') } catch { return [] }
}
export function toggleFavourite(exerciseId) {
  const favs = getFavourites()
  const idx = favs.indexOf(exerciseId)
  const next = idx >= 0 ? favs.filter(f => f !== exerciseId) : [...favs, exerciseId]
  localStorage.setItem(FAV_KEY, JSON.stringify(next))
  return next.includes(exerciseId)
}
