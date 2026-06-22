/**
 * journal-dev Backend — Hono, Port 9170
 * Liest aus ~/.aos/users/<uid>/fitness/journal/ + fuel/nutrition_journal/
 * UID via FITNESS_UID env var (default: 59ole36uNpNwml5H6VDYCXyCME92)
 */

import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { randomUUID } from 'node:crypto'

const PORT      = Number(process.env.PORT || 9170)
const USERS_DIR = path.join(os.homedir(), '.aos', 'users')

function resolveUid() {
  if (process.env.FITNESS_UID) return process.env.FITNESS_UID
  const uidFile = path.join(USERS_DIR, '.active-uid')
  try { return fs.readFileSync(uidFile, 'utf-8').trim() } catch {}
  return '59ole36uNpNwml5H6VDYCXyCME92'
}

const UID = resolveUid()
const USER_DIR  = path.join(USERS_DIR, UID)

const FITNESS_JOURNAL_DIR   = path.join(USER_DIR, 'fitness', 'journal')
const FUEL_JOURNAL_DIR      = path.join(USER_DIR, 'fuel', 'nutrition_journal')
const HABITS_DIR            = path.join(USER_DIR, 'fitness', 'habits')
const HABITS_RECORDS_DIR    = path.join(HABITS_DIR, 'records')
const DEFS_FILE             = path.join(HABITS_DIR, 'definitions.json')

for (const d of [FITNESS_JOURNAL_DIR, HABITS_RECORDS_DIR]) {
  fs.mkdirSync(d, { recursive: true })
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().slice(0, 10)
}

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')) } catch { return fallback }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8')
}

const JOURNAL_SOURCES = [
  { dir: FITNESS_JOURNAL_DIR, label: null    },
  { dir: FUEL_JOURNAL_DIR,    label: 'Fuel'  },
].filter(s => {
  // Fuel ist optional (symlink existiert nur wenn fuel-user vorhanden)
  return true
})

// ── App ───────────────────────────────────────────────────────────────────────

const app = new Hono()

// ── Health ────────────────────────────────────────────────────────────────────

app.get('/health', (c) => c.json({ ok: true, port: PORT, uid: UID, user_dir: USER_DIR }))

// ── Journal ───────────────────────────────────────────────────────────────────

app.get('/journal', (c) => {
  const date  = c.req.query('date') || today()
  const found = JOURNAL_SOURCES
    .map(({ dir, label }) => ({ file: path.join(dir, `${date}.md`), label }))
    .filter(({ file }) => fs.existsSync(file))

  if (!found.length) return c.json({ ok: true, date, content: '', mtime: null })

  const parts = found.map(({ file, label }) => {
    const text = fs.readFileSync(file, 'utf-8')
    return label ? `## ${label} – ${date}\n\n${text}` : text
  })
  const content = parts.join('\n\n---\n\n')
  const mtime   = found
    .map(({ file }) => fs.statSync(file).mtime)
    .reduce((a, b) => a > b ? a : b)
    .toISOString()

  return c.json({ ok: true, date, content, mtime })
})

app.post('/journal', async (c) => {
  const date            = c.req.query('date') || today()
  const { content = '' } = await c.req.json().catch(() => ({}))
  fs.writeFileSync(path.join(FITNESS_JOURNAL_DIR, `${date}.md`), content, 'utf-8')
  return c.json({ ok: true, date })
})

app.get('/journal/list', (c) => {
  const limit = Number(c.req.query('limit') || 50)
  const seen  = new Map()

  for (const { dir } of JOURNAL_SOURCES) {
    if (!fs.existsSync(dir)) continue
    for (const f of fs.readdirSync(dir).filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))) {
      const date  = f.replace('.md', '')
      const mtime = fs.statSync(path.join(dir, f)).mtime
      if (!seen.has(date) || mtime > seen.get(date).mtime) {
        const content = fs.readFileSync(path.join(dir, f), 'utf-8')
        seen.set(date, { mtime, preview: content.slice(0, 120).replace(/\n/g, ' ') })
      }
    }
  }

  const entries = [...seen.entries()]
    .sort((a, b) => b[0].localeCompare(a[0])).slice(0, limit)
    .map(([date, { preview, mtime }]) => ({ date, preview, mtime: mtime.toISOString() }))

  return c.json({ ok: true, entries })
})

// ── Habits ────────────────────────────────────────────────────────────────────

function readDefs() {
  return readJson(DEFS_FILE, [])
}

function writeDefs(defs) {
  fs.mkdirSync(HABITS_DIR, { recursive: true })
  writeJson(DEFS_FILE, defs)
}

function readRecords(date) {
  return readJson(path.join(HABITS_RECORDS_DIR, `${date}.json`), [])
}

function writeRecords(date, records) {
  writeJson(path.join(HABITS_RECORDS_DIR, `${date}.json`), records)
}

app.get('/habitsync/habits', (c) => {
  const date    = c.req.query('date') || today()
  const defs    = readDefs().filter(h => !h.deleted)
  const records = readRecords(date)

  const habits = defs.map(h => ({
    ...h,
    records: records
      .filter(r => r.uuid === h.uuid)
      .map(r => ({ date: r.date, completion: r.completion })),
  }))

  return c.json({ ok: true, habits })
})

app.post('/habitsync/add', async (c) => {
  const { name, icon = 'Activity' } = await c.req.json().catch(() => ({}))
  if (!name?.trim()) return c.json({ ok: false, error: 'name fehlt' }, 400)

  const defs  = readDefs()
  const habit = { uuid: randomUUID(), name: name.trim(), icon, created_at: new Date().toISOString() }
  defs.push(habit)
  writeDefs(defs)
  return c.json({ ok: true, habit })
})

app.post('/habitsync/record/:uuid', async (c) => {
  const uuid     = c.req.param('uuid')
  const date     = c.req.query('date') || today()
  const records  = readRecords(date)
  const existing = records.findIndex(r => r.uuid === uuid)

  if (existing >= 0) {
    records.splice(existing, 1)
  } else {
    records.push({ uuid, date, completion: 'DONE', ts: new Date().toISOString() })
  }

  writeRecords(date, records)
  return c.json({ ok: true, done: existing < 0, date, uuid })
})

app.delete('/habitsync/delete/:uuid', (c) => {
  const uuid = c.req.param('uuid')
  const defs  = readDefs().map(h => h.uuid === uuid ? { ...h, deleted: true } : h)
  writeDefs(defs)
  return c.json({ ok: true, uuid })
})

// ── Start ─────────────────────────────────────────────────────────────────────

console.log(`📓 journal-dev → http://127.0.0.1:${PORT}`)
console.log(`   uid:     ${UID}`)
console.log(`   fitness: ${FITNESS_JOURNAL_DIR}`)
console.log(`   fuel:    ${FUEL_JOURNAL_DIR}`)

serve({ fetch: app.fetch, port: PORT, hostname: '127.0.0.1' })
