# Mini-App Sync in Fitness

Pushes to `dev` in `6pack-dev`, `plan-dev`, or `skills-dev` can update the
matching integrated Fitness view. The source repositories' versioned
`.githooks/pre-push` hooks pass the exact commit being pushed to
`scripts/publish-mini-app-to-fitness.mjs`.

The publisher checks that Fitness is on `dev`, the target view has no local
changes, and Fitness `dev` matches `origin/dev`. It copies only the app view
files, runs `pnpm run build:firebase`, commits only that view, and pushes
Fitness `dev`. Fitness CI handles staging. It never calls the local
`deploy.sh`.

| Source repo | Integrated source |
| --- | --- |
| `6pack-dev` | `src/views/SixPack/` |
| `plan-dev` | `src/views/Plan/` |
| `skills-dev` | `src/views/Skills/` |

Only app code pushes trigger the sync; docs-only commits do not. If the
Fitness publisher has not yet reached `~/fitness-dev`, the source hook warns
and lets the standalone push continue. If the Fitness build or push fails,
the source push is stopped so the two published app states do not silently
drift.

Enable the hook in each source checkout once with:

```sh
git config core.hooksPath .githooks
```

The Fitness target must be on `dev` and have no unpushed commits. Resolve any
Fitness view edits before the next mini-app push so the publisher can update
the integrated copy safely.
