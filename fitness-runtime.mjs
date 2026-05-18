import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

function resolveHomeDir(p) {
  if (!p || typeof p !== 'string') return p
  if (p.startsWith('~/')) return path.join(os.homedir(), p.slice(2))
  if (p === '~') return os.homedir()
  return p
}

function pythonJson(script, args = [], input = null) {
  const proc = spawnSync('python3', ['-c', script, ...args], {
    encoding: 'utf8',
    input: input === null ? undefined : JSON.stringify(input),
    maxBuffer: 10 * 1024 * 1024,
  })
  if (proc.status !== 0) {
    const message = (proc.stderr || proc.stdout || 'python execution failed').trim()
    throw new Error(message)
  }
  const text = (proc.stdout || '').trim()
  return text ? JSON.parse(text) : null
}

const SNAPSHOT_SCRIPT = String.raw`
import json, os, sys, pathlib

root = pathlib.Path(sys.argv[1]).expanduser().resolve()
sys.path.insert(0, str(root))
os.environ['FITNESS_AGENT_HOME'] = str(root)

from fitness_agent.loader import load_runtime_directory_yaml, load_runtime_yaml
from fitness_agent.resolver import build_exercise_index
from fitness_agent.teaching import load_all_lessons

def unwrap(section):
    if isinstance(section, dict) and len(section) == 1:
        only = next(iter(section.values()))
        if isinstance(only, dict):
            return only
    return section

snapshot = {
    "root": str(root),
    "config": load_runtime_yaml("config.yml"),
    "aliases": load_runtime_yaml("maps/aliases.yml"),
    "program_rules": unwrap(load_runtime_yaml("rules/program_rules.yml")),
    "progression_rules": unwrap(load_runtime_yaml("rules/progression_rules.yml")),
    "safety_rules": unwrap(load_runtime_yaml("rules/safety_rules.yml")),
    "muscles": unwrap(load_runtime_yaml("muscles/muscles.yml")),
    "muscle_coverage_rules": unwrap(load_runtime_yaml("muscles/muscle_coverage_rules.yml")),
    "body_highlighter_bridge": unwrap(load_runtime_yaml("muscles/body_highlighter_bridge.yml")),
    "wger_mapping": unwrap(load_runtime_yaml("maps/wger_mapping.yml")),
    "external_db_mapping": unwrap(load_runtime_yaml("maps/external_db_mapping.yml")),
    "exercises": [],
    "lessons": [],
}

for record in build_exercise_index():
    snapshot["exercises"].append({
        "exercise_id": record.exercise_id,
        "display_name": record.display_name,
        "source_file": record.source_file,
        "german": record.german,
        "movement_pattern": record.movement_pattern,
        "equipment": record.equipment or [],
        "aliases": record.aliases or [],
        "primary_muscles": record.primary_muscles or [],
        "secondary_muscles": record.secondary_muscles or [],
        "stabilizers": record.stabilizers or [],
        "variations": record.variations or [],
        "coaching_notes": record.coaching_notes or [],
        "common_errors": record.common_errors or [],
        "tags": record.tags or [],
        "wger_muscle_ids": record.wger_muscle_ids if hasattr(record, 'wger_muscle_ids') else None,
    })

for lesson in load_all_lessons():
    snapshot["lessons"].append(lesson)

print(json.dumps(snapshot, ensure_ascii=False))
`

function loadRuntimeSnapshot() {
  const runtimeRoot = resolveHomeDir(process.env.FITNESS_AGENT_HOME || '~/fitness-dev/catalog')
  try {
    return pythonJson(SNAPSHOT_SCRIPT, [runtimeRoot])
  } catch (error) {
    console.error('[fitness-runtime] snapshot load failed:', error?.message || error)
    return {
      root: runtimeRoot,
      config: {},
      aliases: { aliases: {} },
      program_rules: {},
      progression_rules: {},
      safety_rules: {},
      muscles: {},
      muscle_coverage_rules: {},
      body_highlighter_bridge: {},
      wger_mapping: {},
      external_db_mapping: {},
      exercises: [],
      lessons: [],
    }
  }
}

export const fitnessSnapshot = loadRuntimeSnapshot()

function unwrapSection(section) {
  if (!section || typeof section !== 'object' || Array.isArray(section)) return section
  const keys = Object.keys(section)
  if (keys.length === 1) {
    const only = section[keys[0]]
    if (only && typeof only === 'object' && !Array.isArray(only)) return only
  }
  return section
}

export const fitnessConfig = unwrapSection(fitnessSnapshot.config) || {}
export const obsidianExportPath = resolveHomeDir(fitnessConfig?.obsidian?.export_path || '')

export const fitnessPaths = {
  root: resolveHomeDir(fitnessConfig?.paths?.root || '~/.fitness-agent'),
  obsidianExportPath,
}

export const fitnessData = {
  config: fitnessConfig,
  aliases: unwrapSection(fitnessSnapshot.aliases) || {},
  programRules: unwrapSection(fitnessSnapshot.program_rules) || {},
  progressionRules: unwrapSection(fitnessSnapshot.progression_rules) || {},
  safetyRules: unwrapSection(fitnessSnapshot.safety_rules) || {},
  muscles: unwrapSection(fitnessSnapshot.muscles) || {},
  muscleCoverageRules: unwrapSection(fitnessSnapshot.muscle_coverage_rules) || {},
  bodyHighlighterBridge: unwrapSection(fitnessSnapshot.body_highlighter_bridge) || {},
  wgerMapping: unwrapSection(fitnessSnapshot.wger_mapping) || {},
  externalDbMapping: unwrapSection(fitnessSnapshot.external_db_mapping) || {},
  exercises: Array.isArray(fitnessSnapshot.exercises) ? fitnessSnapshot.exercises : [],
  lessons: Array.isArray(fitnessSnapshot.lessons) ? fitnessSnapshot.lessons : [],
}

const lessonByExerciseId = new Map(
  fitnessData.lessons.map(lesson => [lesson.exercise_id, lesson])
)

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function listOfText(value) {
  return Array.isArray(value) ? value.map(item => String(item || '').trim()).filter(Boolean) : []
}

function candidateTexts(exercise) {
  return [
    exercise.exercise_id,
    exercise.display_name,
    exercise.german,
    ...listOfText(exercise.aliases),
  ].filter(Boolean)
}

function similarity(a, b) {
  const left = normalizeText(a)
  const right = normalizeText(b)
  if (!left || !right) return 0
  if (left === right) return 1

  const matrix = Array.from({ length: left.length + 1 }, () => new Array(right.length + 1).fill(0))
  for (let i = 0; i <= left.length; i++) matrix[i][0] = i
  for (let j = 0; j <= right.length; j++) matrix[0][j] = j

  for (let i = 1; i <= left.length; i++) {
    for (let j = 1; j <= right.length; j++) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      )
    }
  }

  const distance = matrix[left.length][right.length]
  return 1 - distance / Math.max(left.length, right.length)
}

function matchExercise(exercise, normalizedQuery) {
  let best = 0
  for (const candidate of candidateTexts(exercise)) {
    const score = similarity(normalizedQuery, candidate)
    if (score > best) best = score
  }
  return best
}

export function getExerciseLessons(exerciseId) {
  return lessonByExerciseId.get(exerciseId) || null
}

export function resolveExerciseQuery(query) {
  const normalizedQuery = normalizeText(query)
  const aliasMap = unwrapSection(fitnessData.aliases?.aliases || fitnessData.aliases) || {}
  const entries = fitnessData.exercises
  const suggestions = []

  if (!normalizedQuery) {
    return {
      query,
      matched: false,
      source: 'none',
      confidence: 'low',
      suggestions: [],
      result: null,
    }
  }

  const exact = entries.find(record => record.exercise_id === query.trim())
  if (exact) {
    return buildResolveResult(query, exact, 'canonical_id', 'high', [])
  }

  const aliasMatch = aliasMap[normalizedQuery]
  if (aliasMatch) {
    const record = entries.find(item => item.exercise_id === aliasMatch)
    if (record) return buildResolveResult(query, record, 'alias', 'high', [])
  }

  const nameMatch = entries.find(record => candidateTexts(record).some(text => normalizeText(text) === normalizedQuery))
  if (nameMatch) {
    return buildResolveResult(query, nameMatch, 'name', 'high', [])
  }

  const scored = entries
    .map(record => ({ record, score: matchExercise(record, normalizedQuery) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)

  const best = scored[0]
  const rankedSuggestions = scored.slice(0, 3).map(item => ({
    canonical_id: item.record.exercise_id,
    display_name: item.record.display_name,
  }))

  if (best && best.score >= 0.6) {
    return buildResolveResult(query, best.record, 'fuzzy', best.score >= 0.75 ? 'medium' : 'low', rankedSuggestions)
  }

  return {
    query,
    matched: false,
    source: 'none',
    confidence: 'low',
    suggestions: rankedSuggestions,
    result: null,
  }
}

function buildResolveResult(query, record, source, confidence, suggestions) {
  const lesson = getExerciseLessons(record.exercise_id)
  return {
    query,
    matched: true,
    source,
    confidence,
    suggestions,
    result: enrichExercise(record, lesson),
  }
}

export function enrichExercise(record, lesson = null) {
  return {
    ...record,
    name: record.display_name,
    displayName: record.display_name,
    category: record.source_file.replace(/\.yml$/i, ''),
    equipment: record.equipment || [],
    primaryMuscles: record.primary_muscles || [],
    secondaryMuscles: record.secondary_muscles || [],
    stabilizers: record.stabilizers || [],
    variations: record.variations || [],
    coachingNotes: record.coaching_notes || [],
    commonErrors: record.common_errors || [],
    tags: record.tags || [],
    movementPattern: record.movement_pattern || '',
    wger_muscle_ids: record.wger_muscle_ids || null,
    lesson,
  }
}

export function searchExercises(query, limit = 12) {
  const resolved = resolveExerciseQuery(query)
  if (resolved.matched && resolved.result) {
    return {
      ok: true,
      source: 'local_yaml',
      query,
      results: [resolved.result],
      suggestions: resolved.suggestions,
    }
  }

  const normalizedQuery = normalizeText(query)
  const allMatches = fitnessData.exercises
    .map(record => ({ record, score: matchExercise(record, normalizedQuery) }))
    .filter(item => item.score > 0.2)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => enrichExercise(item.record, getExerciseLessons(item.record.exercise_id)))

  return {
    ok: true,
    source: 'local_yaml',
    query,
    results: allMatches,
    suggestions: allMatches.slice(0, 3).map(item => ({
      canonical_id: item.exercise_id,
      display_name: item.display_name,
    })),
  }
}

function toTemplateName({ template, split, day }) {
  const templates = fitnessData.programRules?.templates || {}
  const candidateTemplates = new Set(Object.keys(templates))
  const input = String(template || '').trim()
  if (input && candidateTemplates.has(input)) return input

  const dayName = String(day || '').trim().toLowerCase()
  if (dayName) {
    const candidate = `${dayName}_day`
    if (candidateTemplates.has(candidate)) return candidate
  }

  const splitName = String(split || '').trim().toLowerCase()
  if (splitName) {
    const mapped = `${splitName}_day`
    if (candidateTemplates.has(mapped)) return mapped
    if (splitName === 'full_body') return 'full_body'
  }

  const defaultSplit = String(fitnessData.programRules?.default_split || '').trim().toLowerCase()
  if (defaultSplit === 'full_body') return 'full_body'
  if (candidateTemplates.has(defaultSplit)) return defaultSplit

  return 'push_day'
}

function selectExercise(candidates, selectedIds) {
  if (!Array.isArray(candidates)) return null
  for (const candidate of candidates) {
    if (!candidate || selectedIds.has(candidate)) continue
    const record = fitnessData.exercises.find(item => item.exercise_id === candidate)
    if (record) {
      selectedIds.add(candidate)
      return enrichExercise(record, getExerciseLessons(candidate))
    }
  }
  return null
}

function buildTemplateSlots(templateDef, selectedIds) {
  const rawSlots = Array.isArray(templateDef?.slots) ? templateDef.slots : []
  const slots = []
  for (const slot of rawSlots) {
    if (!slot || typeof slot !== 'object') continue
    const name = String(slot.name || '').trim()
    if (!name) continue
    const chooseFrom = Array.isArray(slot.choose_from) ? slot.choose_from.filter(item => typeof item === 'string') : []
    const selectedExercise = selectExercise(chooseFrom, selectedIds)
    slots.push({
      name,
      choose_from: chooseFrom,
      selected_exercise: selectedExercise,
    })
  }
  return slots
}

function buildFullBodySlots(selectedIds) {
  const templates = fitnessData.programRules?.templates || {}
  const sequence = [
    ['push_day', ['main_chest_press', 'shoulder_press_or_raise']],
    ['pull_day', ['vertical_pull', 'horizontal_pull']],
    ['legs_day', ['main_squat', 'main_hinge']],
  ]
  const slots = []
  for (const [templateName, preferredNames] of sequence) {
    const template = templates[templateName]
    const rawSlots = Array.isArray(template?.slots) ? template.slots : []
    for (const preferred of preferredNames) {
      const slot = rawSlots.find(item => String(item?.name || '') === preferred)
      if (!slot) continue
      const chooseFrom = Array.isArray(slot.choose_from) ? slot.choose_from.filter(item => typeof item === 'string') : []
      const selected_exercise = selectExercise(chooseFrom, selectedIds)
      slots.push({ name: slot.name, choose_from: chooseFrom, selected_exercise })
    }
  }
  return slots
}

function scoreExerciseCoverage(exercise, sets, rpe) {
  const rules = fitnessData.muscleCoverageRules?.role_weights || {
    primary: 1,
    secondary: 0.5,
    stabilizer: 0.2,
    minor: 0.1,
  }
  const factors = fitnessData.muscleCoverageRules?.effort_factors_by_rpe || {
    6: 0.7, 7: 0.85, 8: 1.0, 9: 1.15, 10: 1.3,
  }
  const effortFactor = Number(factors[String(rpe)]) || 1
  const result = { muscle_scores: {}, body_region_scores: {}, unmapped_muscles: [] }
  const addMuscle = (muscle, role, rawScore) => {
    const key = normalizeText(muscle) || muscle
    if (!key) return
    result.muscle_scores[key] = (result.muscle_scores[key] || 0) + rawScore
    const muscleMeta = fitnessData.muscles?.[key]
    const region = muscleMeta?.body_region
    if (region) {
      result.body_region_scores[region] = (result.body_region_scores[region] || 0) + rawScore
    } else {
      result.unmapped_muscles.push(key)
    }
  }
  const roleEntries = [
    ['primary_muscles', 'primary'],
    ['secondary_muscles', 'secondary'],
    ['stabilizers', 'stabilizer'],
  ]
  for (const [field, role] of roleEntries) {
    for (const muscle of listOfText(exercise[field])) {
      addMuscle(muscle, role, sets * (rules[role] || 0) * effortFactor)
    }
  }
  result.unmapped_muscles = [...new Set(result.unmapped_muscles)]
  return result
}

export function buildPlan({ template = '', split = '', day = '', goal = '' } = {}) {
  const templateName = toTemplateName({ template, split, day })
  const templates = fitnessData.programRules?.templates || {}
  const selectedIds = new Set()
  let slots = []

  if (templateName === 'full_body') {
    slots = buildFullBodySlots(selectedIds)
  } else {
    slots = buildTemplateSlots(templates[templateName], selectedIds)
  }

  const coverageDefaults = fitnessData.programRules?.coverage_defaults || {}
  const sets = Number(coverageDefaults.sets || 1)
  const rpe = Number(coverageDefaults.rpe || 8)
  const muscleScores = {}
  const bodyRegionScores = {}
  const unmapped = new Set()

  for (const slot of slots) {
    const exercise = slot.selected_exercise
    if (!exercise) continue
    const coverage = scoreExerciseCoverage(exercise, sets, rpe)
    for (const [key, score] of Object.entries(coverage.muscle_scores)) {
      muscleScores[key] = (muscleScores[key] || 0) + score
    }
    for (const [key, score] of Object.entries(coverage.body_region_scores)) {
      bodyRegionScores[key] = (bodyRegionScores[key] || 0) + score
    }
    for (const item of coverage.unmapped_muscles) unmapped.add(item)
  }

  return {
    ok: true,
    template: templateName,
    split: split || templateName.replace(/_day$/i, ''),
    day: day || null,
    goal: goal || null,
    slots,
    coverage_summary: {
      sets,
      rpe,
      selected_exercises: slots
        .filter(slot => slot.selected_exercise)
        .map(slot => ({
          exercise: slot.selected_exercise.exercise_id,
          sets,
          rpe,
        })),
      muscle_scores: Object.fromEntries(Object.entries(muscleScores).sort(([a], [b]) => a.localeCompare(b))),
      body_region_scores: Object.fromEntries(Object.entries(bodyRegionScores).sort(([a], [b]) => a.localeCompare(b))),
      unmapped_muscles: [...unmapped].sort(),
    },
  }
}

const EXPORT_SCRIPT = String.raw`
import json, os, sys, pathlib

root = pathlib.Path(sys.argv[1]).expanduser().resolve()
sys.path.insert(0, str(root))
os.environ['FITNESS_AGENT_HOME'] = str(root)

kind = sys.argv[2]
payload = json.load(sys.stdin)

from fitness_agent import obsidian

if kind == 'exercise_sheet':
    result = obsidian.export_coach_sheet_note(payload['query'], force=bool(payload.get('force')))
elif kind == 'exercise_lesson':
    result = obsidian.export_teach_note(payload['exercise_id'], mode=payload.get('mode', 'trainer'), force=bool(payload.get('force')))
elif kind == 'plan':
    result = obsidian.export_plan_note(payload['plan'], force=bool(payload.get('force')))
elif kind == 'weekly':
    _, result = obsidian.export_weekly_report_note(payload.get('week_selector', 'current'), force=bool(payload.get('force')))
else:
    raise SystemExit(f'unknown export kind: {kind}')

print(json.dumps({
    'path': str(result.path),
    'used_fallback_name': bool(getattr(result, 'used_fallback_name', False)),
    'overwritten': bool(getattr(result, 'overwritten', False)),
    'warning': getattr(result, 'warning', None),
}, ensure_ascii=False))
`

export function exportWithPython(kind, payload = {}) {
  const runtimeRoot = resolveHomeDir(process.env.FITNESS_AGENT_HOME || '~/fitness-dev/catalog')
  return pythonJson(EXPORT_SCRIPT, [runtimeRoot, kind], payload)
}

const WEEKLY_SCRIPT = String.raw`
import json, os, sys, pathlib
from collections import defaultdict

root = pathlib.Path(sys.argv[1]).expanduser().resolve()
week_selector = sys.argv[2]
sys.path.insert(0, str(root))
os.environ['FITNESS_AGENT_HOME'] = str(root)

from fitness_agent.history import read_history_range
from fitness_agent.resolver import build_exercise_index
from fitness_agent.weekly import build_weekly_coverage, resolve_week_selector

week = build_weekly_coverage(week_selector)
bounds = resolve_week_selector(week_selector)
entries = read_history_range(bounds["date_from"], bounds["date_to"])
exercise_lookup = {record.exercise_id: record for record in build_exercise_index()}

sessions = {}
top_exercises = defaultdict(lambda: {"exercise_id": "", "display_name": "", "count": 0, "total_volume": 0.0})
total_volume = 0.0

for entry in entries:
    workout_id = str(entry.get("workout_id") or entry.get("date") or "").strip() or entry.get("date") or "workout"
    bucket = sessions.setdefault(workout_id, {
        "date": str(entry.get("date") or ""),
        "workout_id": workout_id,
        "exercise_count": 0,
        "total_sets": 0,
        "total_volume": 0.0,
        "rpe_values": [],
        "done_count": 0,
        "exercise_ids": [],
        "display_names": [],
    })
    sets = int(entry.get("sets") or 0)
    reps = int(entry.get("reps") or 0)
    weight = float(entry.get("weight") or 0)
    rpe = int(entry.get("rpe") or 0)
    done = bool(entry.get("done"))
    exercise_id = str(entry.get("exercise_id") or "").strip()
    display_name = str(entry.get("display_name") or exercise_id or "").strip()
    volume = sets * reps * weight

    bucket["exercise_count"] += 1
    bucket["total_sets"] += sets
    bucket["total_volume"] += volume
    bucket["rpe_values"].append(rpe)
    if done:
        bucket["done_count"] += 1
    if exercise_id and exercise_id not in bucket["exercise_ids"]:
        bucket["exercise_ids"].append(exercise_id)
    if display_name and display_name not in bucket["display_names"]:
        bucket["display_names"].append(display_name)

    total_volume += volume

    if exercise_id:
        exercise_bucket = top_exercises[exercise_id]
        exercise_bucket["exercise_id"] = exercise_id
        exercise_bucket["display_name"] = display_name or exercise_bucket["display_name"] or exercise_id
        exercise_bucket["count"] += 1
        exercise_bucket["total_volume"] += volume

session_list = []
for bucket in sessions.values():
    rpe_values = bucket.pop("rpe_values")
    bucket["avg_rpe"] = round(sum(rpe_values) / len(rpe_values), 2) if rpe_values else None
    bucket["done_ratio"] = round(bucket["done_count"] / bucket["exercise_count"], 2) if bucket["exercise_count"] else 0
    bucket["total_volume"] = round(bucket["total_volume"], 2)
    session_list.append(bucket)

session_list.sort(key=lambda item: (item["date"], item["workout_id"]), reverse=True)
top_exercise_list = sorted(top_exercises.values(), key=lambda item: (item["count"], item["total_volume"]), reverse=True)
top_exercise_payload = []
for item in top_exercise_list:
    record = exercise_lookup.get(item["exercise_id"])
    if record is None:
        top_exercise_payload.append(item)
        continue
    top_exercise_payload.append({
        **item,
        "primary_muscles": list(record.primary_muscles or []),
        "secondary_muscles": list(record.secondary_muscles or []),
        "stabilizers": list(record.stabilizers or []),
        "variations": list(record.variations or []),
        "coaching_notes": list(record.coaching_notes or []),
        "common_errors": list(record.common_errors or []),
        "tags": list(record.tags or []),
        "movement_pattern": record.movement_pattern or "",
        "source_file": record.source_file,
        "lesson": None,
    })

payload = {
    **week,
    "week_selector": week_selector,
    "bounds": bounds,
    "entries": entries,
    "sessions": session_list,
    "session_count": len(session_list),
    "total_volume": round(total_volume, 2),
    "top_exercises": top_exercise_payload,
}

print(json.dumps(payload, ensure_ascii=False))
`

export function getWeeklySummary(weekSelector = 'current') {
  const runtimeRoot = resolveHomeDir(process.env.FITNESS_AGENT_HOME || '~/fitness-dev/catalog')
  return pythonJson(WEEKLY_SCRIPT, [runtimeRoot, weekSelector])
}

export function obsidianTargetPath() {
  return fitnessPaths.obsidianExportPath
}

export function exportSessionMarkdown(session) {
  const targetDir = obsidianTargetPath()
  if (!targetDir) throw new Error('obsidian export path missing')

  const date = session?.date || new Date().toISOString().slice(0, 10)
  const noteName = `Sessions/${date}`
  const target = path.join(targetDir, `${noteName}.md`)
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
}
