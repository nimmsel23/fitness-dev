// Deployment runner supporting different targets (Firebase vs. Desktop Local)
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

const args = process.argv.slice(2)

let mode = 'firebase' // Default

// Parse arguments (both flags and positional arguments)
let modeFromArgs = null
for (let i = 0; i < args.length; i++) {
  const arg = args[i]
  if (arg === '--mode' && i + 1 < args.length) {
    modeFromArgs = args[i + 1]
    i++ // Skip next arg
  } else if (arg.startsWith('--mode=')) {
    modeFromArgs = arg.split('=')[1]
  } else if (arg === 'firebase' || arg === 'local' || arg === 'desktop') {
    modeFromArgs = arg
  }
}

if (modeFromArgs) {
  mode = modeFromArgs.toLowerCase().trim()
} else {
  // Fall back to npm config env var if set and not a boolean placeholder "true"
  const envMode = process.env.npm_config_mode
  if (envMode && envMode !== 'true') {
    mode = envMode.toLowerCase().trim()
  }
}

// Normalize aliases
if (mode === 'desktop') {
  mode = 'local'
}

// Check if running inside a git worktree, and isolate firebase files
const currentDir = process.cwd()
if (currentDir.includes('/.worktrees/')) {
  const worktreeFitnessPath = path.resolve(currentDir, '../fitness')
  const realFitnessPath = '/home/alpha/fitness'

  if (fs.existsSync(realFitnessPath)) {
    fs.mkdirSync(worktreeFitnessPath, { recursive: true })
    const filesToCopy = ['firebase.json', '.firebaserc', 'firestore.rules', 'firestore.indexes.json']
    for (const file of filesToCopy) {
      const src = path.join(realFitnessPath, file)
      const dest = path.join(worktreeFitnessPath, file)
      if (fs.existsSync(src) && !fs.existsSync(dest)) {
        console.log(`📋 Copying ${file} from real fitness to worktree fitness to isolate deployment config...`)
        fs.copyFileSync(src, dest)
      }
    }
  }
}

console.log(`🚀 Starting deployment in mode: ${mode}`)

let cmd
let cmdArgs

if (mode === 'firebase') {
  cmd = 'npm'
  cmdArgs = ['run', 'deploy:firebase']
} else if (mode === 'local') {
  cmd = './deploy.sh'
  cmdArgs = []
} else {
  console.error(`❌ Unknown deployment mode: ${mode}`)
  console.error(`Supported modes: 'firebase' (default), 'local' (or 'desktop')`)
  process.exit(1)
}

const p = spawn(cmd, cmdArgs, {
  stdio: 'inherit',
  shell: true,
})

p.on('close', (code) => {
  process.exit(code || 0)
})

p.on('error', (err) => {
  console.error(`❌ Failed to start deployment command:`, err)
  process.exit(1)
})
