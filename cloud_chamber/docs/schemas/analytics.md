# Analytics Document Schema

Stored at `fitness/{uid}/analytics/dashboard`.
This document is automatically updated by the Cloud Chamber Analytics Watcher whenever a user's session is added, modified, or deleted.

```json
{{
  "last_updated": "timestamp",
  "rolling_28_days": {{
    "total_volume": "number",
    "session_count": "number",
    "exercise_count": "number",
    "body_region_scores": {{
      "chest": "number",
      "back": "number",
      "shoulders": "number",
      "arms": "number",
      "core": "number",
      "legs": "number"
    }}
  }}
}}
```

## Workflow

```mermaid
sequenceDiagram
    participant U as User (PWA)
    participant S as Firestore (Sessions)
    participant W as Analytics Watcher (Python)
    participant A as Firestore (Analytics)

    U->>S: Save Training Session (docId: date)
    S->>W: Trigger on_snapshot (Sessions CollectionGroup)
    W->>S: Fetch last 28 days of sessions for UID
    W->>W: Calculate Rolling Stats & Muscle Coverage
    W->>A: Update Document (fitness/{uid}/analytics/dashboard)
    U->>A: Read Pre-calculated Stats (Fast!)
```
