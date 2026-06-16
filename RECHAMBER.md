# Hidden Chamber — AlphaOS Fitness Cloud Migration

This document outlines the architecture for moving the "Local Expert" logic into a cloud-native Firestore environment.

## Architecture

### 1. Global KB (`kb/`)
*   The master exercise catalog and anatomy knowledge base are moved from local YAML files to global Firestore collections:
    *   `fitness/kb/exercises`: Expert-tier exercises.
    *   `fitness/kb/anatomy`: Biomechanical facts.
    *   `fitness/kb/muscles`: Normalized muscle groups.

### 2. Multi-User Inbox Workflow
*   **Clients** (Users) log unknown exercises to `fitness/{uid}/inbox`.
*   **Cloud Expert** (Python Watcher/Cloud Function) listens to `fitness/*/inbox`.
*   **Enrichment**: The expert calls Gemini, validates biomechanics, and writes back to `fitness/{uid}/inbox/{docId}/enriched`.
*   **Coach Approval**: The "Coach" (Super-User) reviews the enriched entries in the "Hidden Chamber" UI and promotes them to the global KB.

### 3. "Hidden Chamber" (Coach UI)
*   A new view in the PWA accessible only to users with the `coach` custom claim.
*   Shows a unified view of all pending inbox items across all users.
*   Provides one-click approval to promote entries to the global catalog.

## Staging & Testing

### Cloud Watcher
The watcher is currently a standalone Python script that uses `firebase-admin` to simulate a Cloud Function.
Run it via:
```bash
python cloud_chamber/firestore_watcher.py
```

### Seeding Data
To migrate your local YAML catalog to Firestore, use the existing sync tool:
```bash
python -m catalog.fitness_agent kb-sync
```

### Hidden Chamber UI
Access the new view in the PWA by navigating to `#coach` or clicking the Shield icon in the sidebar (if logged in as `alpha*`).
