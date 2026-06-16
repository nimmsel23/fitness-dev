# AlphaOS Fitness — The Cloud Chamber Architecture

> **Vision**: Transform the local "Coach Expert" system into a decentralized, cloud-native intelligence hub that enables a fully standalone PWA while maintaining professional biomechanical rigor.

## 1. Motivation
Currently, the "Expert Intelligence" (Gemini enrichment, biomechanical audits, YAML catalog) is tethered to a local machine. The **Cloud Chamber** project migrates this logic into Firebase, creating a multi-tenant ecosystem where the PWA acts as the primary interface for both Clients and the Coach.

## 2. The "Hidden Chamber" Concept
The architecture introduces a privileged administrative layer within the Firebase project:
- **Clients**: Log exercises, view statistics, and learn via the PWA.
- **Expert (Cloud)**: An autonomous process (Watcher/Cloud Functions) that enriches unknown data in real-time.
- **Coach (You)**: Accesses the "Hidden Chamber" UI to approve, refine, and curate the global knowledge base from any device.

## 3. Core Components

### A. Standalone PWA (The Gateway)
- **Multi-Tenant**: Users are partitioned by UID.
- **Local/Cloud Parity**: Uses the `@db` abstraction to work seamlessly with local Node.js or Remote Firestore.
- **Coach View**: A hidden administrative tab for catalog management.

### B. Global Knowledge Base (The Brain)
- **`kb/exercises`**: The curated master catalog.
- **`kb/anatomy`**: Deep teaching data and activation maps.
- **`kb/muscles`**: Normalized muscle group definitions (wger-aligned).

### C. Cloud Chamber Watcher (The Expert)
- **Real-time Listener**: Monitors all `fitness/*/inbox` collections.
- **AI Enrichment**: Automatically triggers Gemini for new entries.
- **Biomechanical Guardrails**: Validates input against anatomical rules before presenting to the Coach.

## 4. Data Flow: The Enrichment Loop
1. **Input**: Client logs "Bench Press" (unknown). Entry goes to `inbox` with status `pending`.
2. **Enrich**: Cloud Watcher detects entry, calls Gemini, and updates Doc to `ai_enriched`.
3. **Review**: Coach sees the entry in the Hidden Chamber UI.
4. **Promote**: Coach clicks "Approve". Logic moves data to global `kb/exercises` and marks inbox as `approved`.

## 5. Technology Stack
- **Frontend**: React, Tailwind, Lucide (React-based).
- **Backend**: Firebase Firestore (NoSQL), Auth, Cloud Functions (Python Gen 2).
- **Intelligence**: Python 3.11+, Firebase Admin SDK, Google Gemini API.

## 6. Roadmap
- [x] Establish `@db` Contract in PWA.
- [x] Create Cloud Chamber Staging area.
- [x] Implement Global Firestore Watcher (Prototype).
- [x] Implement Hidden Chamber UI (Prototype).
- [x] Migrate `anatomy-kb` to Firestore.
- [ ] Port Biomechanical Auditor to Python Cloud Functions.
- [ ] Implement Multi-User Dashboard Analytics in Cloud.

---
*This document is the Root Authority for the Cloud Chamber migration.*
