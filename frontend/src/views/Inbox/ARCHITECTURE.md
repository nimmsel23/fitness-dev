# View Architecture: Inbox (Coach Lab)

## Purpose
Staging area for new exercise requests. This view is **exclusive to the Local/Coach environment**.

## Logic
1. User (or Coach) searches for an exercise that doesn't exist.
2. `sendToInbox` is triggered.
3. Fitness Agent (Python) detects the request and enriches it with AI data (Biomechanics, Coaching Notes).
4. Coach reviews and "Approves" the exercise to move it into the Expert Catalog.

## Components
- `Inbox.jsx`: List of pending exercises with biomechanical warnings and AI-generated notes.

## Data Flow
- Calls local API: `GET /fitness/inbox`, `POST /fitness/inbox/:id/approve`, `DELETE /fitness/inbox/:id`.
