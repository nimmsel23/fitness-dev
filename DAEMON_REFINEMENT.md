# Demand-Driven Refinement: Autonomous Expert Daemon

The **Autonomous Expert Daemon** has evolved from a passive ingestion gatekeeper into a proactive "Knowledge Miner." It ensures the `anatomy-kb` catalog evolves based on actual usage patterns, prioritizing high-impact exercises for promotion to the **Expert Tier**.

## The Autonomous Feedback Loop

The refinement process follows a "Demand-Driven" cycle:

### 1. Session Ingestion & Analytics
The daemon periodically scans synchronized user sessions and imports them into a local analytical layer (`training_history.sqlite`). This allows the system to track the real-world popularity of every exercise in the catalog.

### 2. Popularity Analysis
By correlating session data with the exercise registry, the daemon identifies "Knowledge Gaps":
- Exercises that are **frequently logged** by clients.
- Exercises that are currently residing in the **Bulk Tier (Tier 2)** and marked as `unreviewed`.

### 3. Proactive Draft Generation (Inbox Tier)
Instead of waiting for manual requests, the daemon proactively selects the top unreviewed exercises (by usage volume) and generates **Expert Drafts** using the Gemini API.
- **Drafts are saved as `inbox_{exercise_id}.yml`.**
- These drafts include structured anatomy, coaching cues, and common errors, seeded by professional standards.

## Workflow for the Coach

This autonomous logic transforms the maintenance workflow:

1. **Morning Review:** The coach checks the `inbox/` for new drafts generated overnight.
2. **Usage Signal:** The daemon provides context: *"Proposed for refinement: 'Arnold Press' was logged 12 times this week but is still unreviewed."*
3. **Approval:** The coach reviews the draft and uses the `approve` command:
   ```bash
   anatomy approve arnold_press --notes "Focus on slow eccentric phase."
   ```
4. **Promotion:** The exercise is moved to the **Expert Tier**, the `unreviewed` tag is removed, and the knowledge is synced to Firestore.

## Technical Components

- **SQLite History:** `~/.aos/fitness/sessions/training_history.sqlite` provides the usage data.
- **Analysis Engine:** Part of the Expert Daemon that identifies high-demand/low-quality gaps.
- **Gemini Ingestion:** Utilizes the established `ingest`/`enrich` prompts to generate high-quality drafts.

This ensures that the `anatomy-kb` is not just large, but **intelligently curated**, focusing expert effort where it provides the most value to clients.
