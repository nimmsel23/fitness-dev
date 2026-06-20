/**
 * journal-dev Backend — Hono, Port 9170
 * Journal + Habits — vollständig standalone, keine externe Abhängigkeit
 * Datenpfad: ~/.aos/journal/
 *   YYYY-MM-DD.md              — Journal-Einträge
 *   habits/definitions.json    — Habit-Definitionen
 *   habits/records/YYYY-MM-DD.json — Tages-Records
 */

import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { randomUUID } from 'node:crypto'

const PORT = Number(process.env.PORT || 9170)
const DATA_DIR = process.env.JOURNAL_DATA_DIR
  ? path.resolve(process.env.JOURNAL_DATA_DIR)
  : path.join(os.homedir(), '.aos', 'journal')

const HABITS_DIR     = path.join(DATA_DIR, 'habits')
const RECORDS_DIR    = path.join(DATA_DIR, 'habits', 'records')
const DEFS_FILE      = path.join(HABITS_DIR, 'definitions.json')

fs.mkdirSync(DATA_DIR, { recursive: true })
fs.mkdirSync(RECORDS_DIR, { recursive: true })

// ── File Helpers ──────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().slice(0, 10)
}

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')) } catch { return fallback }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8')
}

function journalPath(date) {
  return path.join(DATA_DIR, `${date}.md`)
}

function recordsPath(date) {
  return path.join(RECORDS_DIR, `${date}.json`)
}

// ── Habit Helpers ─────────────────────────────────────────────────────────────

function readDefs() {
  return readJson(DEFS_FILE, [])
}

function writeDefs(defs) {
  writeJson(DEFS_FILE, defs)
}

function readRecords(date) {
  return readJson(recordsPath(date), [])
}

function writeRecords(date, records) {
  writeJson(recordsPath(date), records)
}

// ── App ───────────────────────────────────────────────────────────────────────

const app = new Hono()

// ── Health ────────────────────────────────────────────────────────────────────

app.get('/health', (c) => c.json({ ok: true, port: PORT, data: DATA_DIR }))

// ── Journal ───────────────────────────────────────────────────────────────────

app.get('/journal', (c) => {
  const date = c.req.query('date') || today()
  const file = journalPath(date)
  const content = fs.existsSync(file) ? fs.readFileSync(file, 'utf-8') : ''
  const mtime = fs.existsSync(file) ? fs.statSync(file).mtime.toISOString() : null
  return c.json({ ok: true, date, content, mtime })
})

app.post('/journal', async (c) => {
  const date = c.req.query('date') || today()
  const { content = '' } = await c.req.json().catch(() => ({}))
  fs.writeFileSync(journalPath(date), content, 'utf-8')
  return c.json({ ok: true, date })
})

app.get('/journal/list', (c) => {
  const limit = Number(c.req.query('limit') || 30)
  const entries = fs.readdirSync(DATA_DIR)
    .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
    .sort().reverse().slice(0, limit)
    .map(f => {
      const date = f.replace('.md', '')
      const content = fs.readFileSync(path.join(DATA_DIR, f), 'utf-8')
      return { date, preview: content.slice(0, 120).replace(/\n/g, ' ') }
    })
  return c.json({ ok: true, entries })
})

// ── Habits ────────────────────────────────────────────────────────────────────

// GET /habitsync/habits — alle Definitionen + heutige Records eingebettet
app.get('/habitsync/habits', (c) => {
  const date = c.req.query('date') || today()
  const defs = readDefs().filter(h => !h.deleted)
  const records = readRecords(date)

  const habits = defs.map(h => ({
    ...h,
    records: records
      .filter(r => r.uuid === h.uuid)
      .map(r => ({ date: r.date, completion: r.completion })),
  }))

  return c.json({ ok: true, habits })
})

// POST /habitsync/add — neues Habit anlegen
app.post('/habitsync/add', async (c) => {
  const { name, icon = 'Activity' } = await c.req.json().catch(() => ({}))
  if (!name?.trim()) return c.json({ ok: false, error: 'name fehlt' }, 400)

  const defs = readDefs()
  const habit = { uuid: randomUUID(), name: name.trim(), icon, created_at: new Date().toISOString() }
  defs.push(habit)
  writeDefs(defs)
  return c.json({ ok: true, habit })
})

// POST /habitsync/record/:uuid — Toggle: erledigt ↔ rückgängig
app.post('/habitsync/record/:uuid', async (c) => {
  const uuid = c.req.param('uuid')
  const date = c.req.query('date') || today()
  const records = readRecords(date)
  const existing = records.findIndex(r => r.uuid === uuid)

  if (existing >= 0) {
    records.splice(existing, 1)
  } else {
    records.push({ uuid, date, completion: 'DONE', ts: new Date().toISOString() })
  }

  writeRecords(date, records)
  return c.json({ ok: true, done: existing < 0, date, uuid })
})

// DELETE /habitsync/delete/:uuid — Habit als gelöscht markieren
app.delete('/habitsync/delete/:uuid', (c) => {
  const uuid = c.req.param('uuid')
  const defs = readDefs().map(h => h.uuid === uuid ? { ...h, deleted: true } : h)
  writeDefs(defs)
  return c.json({ ok: true, uuid })
})

// ── Start ─────────────────────────────────────────────────────────────────────

console.log(`📓 journal-dev → http://127.0.0.1:${PORT}`)
console.log(`   data:    ${DATA_DIR}`)
console.log(`   habits:  ${HABITS_DIR}`)

serve({ fetch: app.fetch, port: PORT, hostname: '127.0.0.1' })
