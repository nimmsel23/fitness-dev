# View Architecture: Fokus

## Purpose
Read-only focus map derived from the Anamnese state. It does not own separate persistence.

## Features
- Mirrors the four stages `REAL / RAW / RELEVANT / RESULTS`.
- Reuses Anamnese answers from `UserContext`.
- Shows only filled `Hit` cards in `Strike`.

## Logic
- Pure view layer.
- All data comes from `useUser()` in `src/contexts/UserContext.jsx`.
- No save action, no additional state storage.
