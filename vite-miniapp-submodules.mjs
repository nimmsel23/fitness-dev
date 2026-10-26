// Gemeinsamer Vite-Resolver für Plan/6Pack/Skills als Submodule von fitness-app.
// src/views/{Plan,SixPack,Skills} sind nicht mehr eingecheckt; jeder Build, der
// fitness-app-Quellen kompiliert (fitness selbst, Shell, Habits, VOS Fitness …),
// bindet dieses Plugin ein: miniAppSubmodulePlugin(<Pfad zu fitness-app>).
import { dirname, isAbsolute, relative, resolve, sep } from 'path'
import { existsSync, statSync } from 'fs'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Mini-App implementations live in their own repositories. Fitness tracks
// the approved integration commit of each repo as a Git submodule; this
// resolver makes Fitness compile that checkout directly instead of a copied
// view under src/views. Missing files fall back to Fitness-owned adapters.
export function miniAppSubmodulePlugin(root = __dirname) {
  const maps = [
    {
      local: resolve(root, 'src/views/Plan'),
      source: resolve(root, 'plan/src/views/Plan'),
    },
    {
      local: resolve(root, 'src/views/SixPack'),
      source: resolve(root, '6pack'),
    },
    {
      local: resolve(root, 'src/views/Skills'),
      source: resolve(root, 'Skills'),
    },
  ]

  return {
    name: 'fitness-miniapp-submodule-source',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!importer || importer.startsWith('\0')) return null
      const request = source.split('?')[0]
      if (!request.startsWith('.') && !isAbsolute(request)) return null

      const importerPath = importer.split('?')[0]
      const target = isAbsolute(request)
        ? request
        : resolve(dirname(importerPath), request)

      // Fitness generates this data from its own exercise KB before building;
      // 6Pack's standalone source keeps the same import contract.
      if (
        importerPath.startsWith(`${resolve(root, '6pack')}/`) &&
        request === './sixpackData.generated.js'
      ) {
        const fitnessData = resolve(root, 'src/views/SixPack/sixpackData.generated.js')
        if (existsSync(fitnessData)) return fitnessData
      }

      // Der Plan-Checkout bringt ein eigenes, abweichendes Fitness-Gerüst mit
      // (contexts, lib, components, hooks …). Importe daraus gehören zu den
      // Fitness-Gegenstücken, sonst entstehen zwei UserContext-Instanzen und der
      // Plan-Tab bricht ohne Provider ab.
      const planSrc = resolve(root, 'plan/src')
      const planViews = resolve(planSrc, 'views/Plan')
      if (importerPath.startsWith(`${planViews}${sep}`)) {
        const rel = relative(planSrc, target)
        if (rel && !rel.startsWith('..') && !isAbsolute(rel) && !(target === planViews || target.startsWith(`${planViews}${sep}`))) {
          const own = resolve(root, 'src', rel)
          for (const candidate of [own, `${own}.js`, `${own}.jsx`, `${own}/index.js`, `${own}/index.jsx`]) {
            if (existsSync(candidate) && statSync(candidate).isFile()) return candidate
          }
        }
      }

      for (const map of maps) {
        const pathFromView = relative(map.local, target)
        if (pathFromView === '..' || pathFromView.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`) || isAbsolute(pathFromView)) continue
        const submoduleFile = resolve(map.source, pathFromView)
        if (existsSync(submoduleFile)) return submoduleFile
      }
      return null
    },
  }
}
