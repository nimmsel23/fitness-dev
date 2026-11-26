import { test } from 'node:test'
import vm from 'node:vm'
import path from 'node:path'
import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { miniAppSubmodulePlugin } from '../vite-miniapp-submodules.mjs'

test('Fitness resolves Skills and its stylesheet from the shared 6Pack source', async () => {
  const workspace = mkdtempSync(join(tmpdir(), 'fitness-shared-'))
  try {
    const root = join(workspace, 'fitness-dev')
    const shared = join(workspace, '6pack-dev')
    mkdirSync(root)
    mkdirSync(join(shared, 'skills'), { recursive: true })
    mkdirSync(join(workspace, 'skills-dev'))
    writeFileSync(join(shared, 'skills', 'CoreSkills.jsx'), 'shared')
    writeFileSync(join(workspace, 'skills-dev', 'CoreSkills.jsx'), 'legacy')
    const plugin = miniAppSubmodulePlugin(root)
    const importer = join(root, 'src', 'App.jsx')
    const actual = await plugin.resolveId.call({}, './views/Skills/CoreSkills.jsx', importer)
    assert.equal(actual, join(shared, 'skills', 'CoreSkills.jsx'))
    const alias = plugin.config().resolve.alias.find((item) => item.find.test('@vos-skills/skills.css'))
    assert.equal(alias.replacement, `${shared}/skills/`)
    rmSync(join(workspace, 'skills-dev'), { recursive: true })
    assert.equal(
      await miniAppSubmodulePlugin(root).resolveId.call({}, './views/Skills/CoreSkills.jsx', importer),
      actual,
    )
  } finally {
    rmSync(workspace, { recursive: true, force: true })
  }
})

test('Tailwind scans shared Skills without a legacy Skills checkout', () => {
  const module = { exports: {} }
  const root = '/fixture/fitness-dev'
  vm.runInNewContext(readFileSync(new URL('../tailwind.config.cjs', import.meta.url), 'utf8'), {
    module,
    __dirname: root,
    require: (name) =>
      name === 'path' ? path : { existsSync: (dir) => ['/fixture/plan-dev', '/fixture/6pack-dev'].includes(dir) },
  })
  assert(module.exports.content.includes('/fixture/6pack-dev/**/*.{js,jsx,ts,tsx}'))
  assert(!module.exports.content.some((pattern) => /skills-(dev|app)/.test(pattern)))
})
