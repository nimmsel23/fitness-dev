# View Architecture: Fokus

## Purpose
Read-only focus map derived from the `Hit` outputs of the Anamnese flow. It does not mirror the full Anamnese structure and does not own separate persistence.

## Features
- Shows only the filled `Hit` outputs as the actual focus map.
- Keeps `Insights` and `Lessons Learned` as a reflection block below the hits.
- Reuses existing state from `UserContext`.

## Logic
- Pure view layer.
- All data comes from `useUser()` in `src/contexts/UserContext.jsx`.
- Filters out empty hits before rendering.
- No save action, no additional state storage.
