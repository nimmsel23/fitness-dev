# Firestore Data Schemas

This directory defines the "Source of Truth" for all documents in the AlphaOS Fitness ecosystem.

## Collections

### 1. `fitness/{uid}/inbox/{docId}`
The staging area for new exercises logged by users.
- **Fields**:
  - `name` (string): The raw input name.
  - `status` (string): `pending` | `ai_enriched` | `approved` | `rejected`.
  - `received_at` (timestamp).
  - `enriched` (map): The JSON result from Gemini (see [Exercise Schema](./exercise.md)).

### 2. `fitness/kb/exercises/{exId}`
The global, curated exercise catalog.
- **Fields**: See [Exercise Schema](./exercise.md).

### 3. `fitness/kb/anatomy/{exId}`
Biomechanical facts and teaching data.
- **Fields**:
  - `lesson` (string): Markdown content for the "Lernen" tab.
  - `muscles` (map): Detailed muscle activation data.

## Shared Schemas
- [Exercise Document Structure](./exercise.md)
- [Biometrics / Body Document](./body.md)
