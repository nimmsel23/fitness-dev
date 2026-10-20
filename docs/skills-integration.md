# Skills integration

Fitness owns its in-app integration at `src/views/Skills/`; the Session tab
imports the view from there. The standalone source remains in `~/skills-dev`
(`dev` for app development, `fitness` for Fitness-facing integration). Fitness
does not need a Skills Git submodule or workspace package to build the tab.

The standalone repo has `origin` pointing to `nimmsel23/skills-dev` and a
local `upstream` remote pointing to `nimmsel23/fitness-dev`. Keep `dev`
tracking `origin/dev` and `fitness` tracking `origin/fitness`. Transfer changes
between the standalone app and Fitness as reviewed source changes in
`src/views/Skills/`, carrying along any component, style, data, or dependency
updates required by the Fitness build.

CI builds Skills as part of the Fitness app through `src/**`; no nested
standalone install or submodule initialization is needed. The separate
`skills-dev` repo remains available for its own app workflow.
