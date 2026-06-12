import fs from 'node:fs'
import path from 'node:path'

const AGENT_BASE = 'http://localhost:9120'

async function fetchAgent(endpoint, options = {}) {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${AGENT_BASE}${endpoint}`
    const res = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    })
    return res.ok ? res.json() : null
  } catch (err) {
    console.error(`[fitness-runtime] agent fetch failed (${endpoint}):`, err.message)
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

export async function loadRuntimeSnapshot() {
  const snapshot = await fetchAgent('/snapshot')
  if (snapshot) {
    cachedSnapshot = snapshot
    return snapshot
  }
  return cachedSnapshot || fallbackData
}

// These are now async or return cached data
export const fitnessSnapshot = await loadRuntimeSnapshot()
export const fitnessData = fitnessSnapshot

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
  const result = await fetchAgent(`/resolve?q=${encodeURIComponent(query)}`)
  if (result && result.matched && result.exercise) {
    const enriched = toFrontendExercise(result.exercise, { lesson: result.lesson })
    return {
      ok: true,
      source: 'local_yaml',
      query,
      results: [enriched],
      suggestions: result.suggestions,
    }
  }

  // Fallback to searching the cached snapshot
  const normalized = query.toLowerCase()
  const matches = (fitnessData.exercises || [])
    .filter(ex =>
      (ex.exercise_id || '').includes(normalized) ||
      (ex.display_name || '').toLowerCase().includes(normalized) ||
      (ex.german || '').toLowerCase().includes(normalized)
    )
    .slice(0, limit)
    .map(ex => toFrontendExercise(ex))

  return {
    ok: true,
    source: 'local_yaml',
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
    const totalVolume = exercises.reduce((sum, ex) => {
      const sets = Number(ex.sets || 0)
      const reps = Number(ex.reps || 0)
      const weight = Number(ex.weight || 0)
      return sum + (Number.isFinite(sets) && Number.isFinite(reps) && Number.isFinite(weight) ? sets * reps * weight : 0)
    }, 0)

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
      `- Total volume: ${Math.round(totalVolume).toLocaleString('de-AT')} kg`,
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
