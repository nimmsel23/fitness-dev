import { test } from 'node:test'
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
