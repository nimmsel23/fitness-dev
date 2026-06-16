# Cloud Chamber — Technical Overview

The "Cloud Chamber" is the architectural bridge that migrates the local AlphaOS Fitness expert logic into the Firebase cloud environment. It enables a fully standalone PWA by moving biomechanical intelligence, AI enrichment, and catalog management into serverless/daemonized cloud processes.

## Core Components

- **Firestore Watcher** (`firestore_watcher.py`): A Python-based daemon (future Cloud Function candidate) that reacts to user input in real-time.
- **Hidden Chamber UI** (`src/views/Coach/`): The administrative interface for the Coach to review and promote data.
- **Global Knowledge Base**: Centralized Firestore collections for exercises, anatomy, and muscle groups.

## Documentation Index

- [Data Schemas](./schemas/README.md): Detailed structure of Firestore documents.
- [Workflows](./workflows/README.md): Step-by-step logic for enrichment and approval.
- [Security Model](./SECURITY.md): Roles, claims, and collection-level access.
