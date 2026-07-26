# Exercise Catalog Flow

This is the intended path from logged workout data to expert catalog data.

## Pipeline

1. User logs a workout with one or more exercises.
2. Resolver checks the expert catalog first, then unreviewed `yuhonas`, then unreviewed `wger`.
3. If nothing matches, the app writes a new inbox entry for the unknown exercise, e.g. Jefferson Curl or Skin The Cat.
4. AI enrichment creates or refreshes an inbox draft from the raw exercise context.
5. A coach reviews the draft in the coach tab, terminal, or local dev server.
6. The coach either rejects/regenerates the draft or approves it.
7. Only approved drafts become canonical files under `fitness/catalog/kb/exercises/`.
8. Canonical exercise files get `status: reviewed` or `status: expert` and become the app/source-of-truth layer.

Do not hand-edit `unreviewed_wger.yml`, `unreviewed_yuhonas.yml`, or random inbox drafts to fix live semantics. Fix the enrichment/review path, then approve a reviewed exercise into the expert layer.

## Local Fitness Agent

The local Python backend layer under `fitness/` owns enrichment mechanics:

- `fitness/catalog/api/watcher.py` watches runtime user inbox JSON files.
- `fitness/catalog/agent/gemini.py` builds the enrichment prompt and calls providers.
- `fitness/catalog/agent/inbox_actions.py` shares TUI/CLI review actions.
- `fitness/catalog/tui.py` exposes local review, feedback, re-enrich, approve, and delete actions.

Provider chain for draft enrichment:

1. Gemini API when `GEMINI_API_KEY` is configured.
2. Claude Haiku via `claude -p --model haiku` as CLI fallback/reviewer.
3. Codex CLI as a final local draft fallback.

Provider output is still only a draft. Approval is a coach action.

## Muscle Fields

Exercise muscle fields use the same coarse bucket vocabulary as top-level `fitness/catalog/kb/muscles/*.yml` when the exercise only needs coverage-level semantics:

- `chest`
- `back`
- `shoulders`
- `arms`
- `core`
- `glutes`
- `quadriceps`
- `hamstrings`
- `calves`
- `legs`
- `adductors`
- `abductors`
- `iliopsoas`
- `lower_back`
- `middle_back`
- `upper_back`
- `rhomboids`
- `bizeps`

Fine muscle IDs such as `102_pectoralis_major_clavicular` or `601a_rectus_femoris` are allowed only when the draft is intentionally more anatomical than coverage-level. Do not use legacy aliases like `quads` or stale numbered slugs.

## Role Standard

`primary_muscles` means prime movers. `secondary_muscles` means meaningful contributors. `stabilizers` means muscles that stabilize position or force transfer but are not the main mover.

Examples:

- Incline dumbbell press: primary `chest`, secondary `shoulders`, `arms`, stabilizers `core`, optionally `upper_back`.
- Front squat: primary `quadriceps`, secondary `glutes`, `adductors`, stabilizers `core`, `lower_back`, `calves`.
- Leg extension: primary `quadriceps`, secondary empty, stabilizers empty or minimal machine-position support.
- Leg press: primary `quadriceps`, secondary `glutes`, `adductors`, `hamstrings`.
- Romanian deadlift: primary `hamstrings`, `glutes`, secondary `lower_back`, stabilizers `core`, `upper_back`, `arms`.

## ID Review Gate

Exercise IDs are semantic and must not be casually reused.

- `041` is currently the incline dumbbell press line (`Schraegbankdruecken KH` / `Incline Dumbbell Press`).
- `061` is currently the front squat line (`Frontkniebeuge` / `Front Squat`).

If an ID is wrong, treat it as an ID migration task: inspect logs, registry, anatomy teaching files, aliases, and Firestore push behavior before changing it. Do not silently turn `061` into a chest exercise while existing sessions and lessons still use it as front squat.

## Coach Review Checklist

- Required fields exist: `exercise_id`, `display_name`, `category`, `type`, `movement_pattern`, `equipment`, `primary_muscles`, `secondary_muscles`, `stabilizers`, `coaching_notes`, `common_errors`, `tags`, `aliases`, `source`.
- Muscle values use current bucket names or intentional fine IDs.
- Primary/secondary/stabilizer roles match the movement pattern.
- Compound lifts have more than one meaningful role unless they are intentionally simplified for a specific view.
- Isolation exercises do not invent irrelevant stabilizers.
- German and English names are consistent with aliases.
- The exercise ID matches the known numbering/registry history.
- Approval writes one canonical reviewed/expert file and leaves raw unreviewed imports as raw imports.
