// Starts both the API server and Vite in parallel for dev mode.
import { spawn } from 'child_process'
import { createConnection } from 'net'

function run(cmd, args, env = {}) {
  const p = spawn(cmd, args, {
    stdio: 'inherit',
    shell: false,
    env: { ...process.env, ...env },
  })
  p.on('error', err => { console.error(`[${cmd}]`, err.message); process.exit(1) })
  return p
}

function portInUse(port) {
  return new Promise(resolve => {
    const c = createConnection({ port, host: '127.0.0.1' })
    c.on('connect', () => { c.destroy(); resolve(true) })
    c.on('error',   () => resolve(false))
  })
}

const API_PORT = Number(process.env.FITNESS_NODE_PORT || 9100)

const alreadyRunning = await portInUse(API_PORT)

// fitness_agent/server.py (:9120) — Legacy, wird archiviert
// PYTHONPATH=. damit fitness_agent/ am Repo-Root gefunden wird (nicht mehr in catalog/)
const agent = run('python3', ['-m', 'fitness_agent.server'], { PYTHONPATH: '.' })

if (alreadyRunning) {
  console.log(`[dev-runner] server.mjs already running on :${API_PORT} — skipping nodemon`)
} else {
  run('node', ['node_modules/.bin/nodemon', '--watch', 'server.mjs', '--ext', 'mjs', '--signal', 'SIGTERM', 'server.mjs'])
}

const vite = run('node', ['node_modules/.bin/vite'], { VITE_API_BASE: '' })

process.on('SIGTERM', () => { agent?.kill(); vite.kill() })
process.on('SIGINT',  () => { agent?.kill(); vite.kill() })
