# 6Pack integration

Fitness owns the runtime integration at `src/views/SixPack/`. The standalone
source remains in `~/6pack-dev` (`dev` for app development, `fitness` for its
Fitness-facing integration). Fitness builds the Session tab and 6Pack assets
from its own checkout; no 6Pack Git submodule or workspace package is needed.

The Fitness KB remains the source of truth for exercise data. Run
`pnpm run build:sixpack-data` to generate
`src/views/SixPack/sixpackData.generated.js` from
`fitness/catalog/kb/exercises/6pack/` and `calisthenics/`.

The standalone repo has `origin` pointing to `nimmsel23/6pack-dev` and a local
`upstream` remote pointing to `nimmsel23/fitness-dev`. Keep its `dev` branch
tracking `origin/dev`; its `fitness` branch tracks `origin/fitness`. Transfer
changes between the standalone app and Fitness as reviewed source changes in
`src/views/SixPack/`, updating Fitness imports and the KB generator as needed.

CI builds Fitness from its own source tree. The Preview and Live workflows
watch `src/**`, install the locked root workspace, and run the Firebase build;
they do not need to initialize a 6Pack submodule.
