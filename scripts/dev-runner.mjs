// Starts both the API server and Vite in parallel for dev mode.
import { spawn } from 'child_process'

function run(cmd, args, env = {}) {
  const p = spawn(cmd, args, {
    stdio: 'inherit',
    shell: false,
    env: { ...process.env, ...env },
  })
  p.on('error', err => { console.error(`[${cmd}]`, err.message); process.exit(1) })
  return p
}

const agent = run('python3', ['-m', 'fitness_agent.server'], { PYTHONPATH: 'catalog' })
const api   = run('node', ['node_modules/.bin/nodemon', '--watch', 'server.mjs', '--ext', 'mjs', '--signal', 'SIGTERM', 'server.mjs'])
const vite  = run('node', ['node_modules/.bin/vite'], { VITE_API_BASE: '' })

process.on('SIGTERM', () => { agent.kill(); api.kill(); vite.kill() })
process.on('SIGINT',  () => { agent.kill(); api.kill(); vite.kill() })
