# AlphaOS Exercise Catalog — 3-Tier Architecture

This directory contains the exercise knowledge base (`catalog/kb/exercises/`). Exercises in the ecosystem follow a strict 3-tier hierarchy to ensure biomechanical integrity and seamless AI enrichment.

---

## 3-Tier Catalog Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│ TIER 1: EXPERT / APPROVED (`020.yml`, `041.yml`, `080.yml`) │
│ - Biomechanically audited and curated                       │
│ - Indexed in region files (`chest.yml`, `core.yml`, etc.)   │
│ - Highest priority in resolver & search (Tier rank 0)       │
└──────────────────────────────▲──────────────────────────────┘
                               │
               Manual Review / `/inbox/{id}/approve`
                               │
┌──────────────────────────────┴──────────────────────────────┐
│ TIER 2: INBOX / DRAFTS (`inbox_*.yml`)                      │
│ - AI-generated or staging area for new exercises            │
│ - Pending human review & approval                           │
│ - Medium priority in resolver & search (Tier rank 1)        │
└──────────────────────────────▲──────────────────────────────┘
                               │
                AI Ingestion / User Log Staging
                               │
┌──────────────────────────────┴──────────────────────────────┐
│ TIER 3: BULK / UNREVIEWED (`unreviewed_wger.yml`, etc.)     │
│ - 1850+ raw exercises from wger & yuhonas datasets           │
│ - Fallback data source                                      │
│ - Lowest priority in resolver & search (Tier rank 2)        │
└─────────────────────────────────────────────────────────────┘
```

---

## Tier Definitions & File Placement

1. **Tier 1 — Expert / Approved (`<id>.yml`)**
   - **Location:** `catalog/kb/exercises/<id>.yml` (e.g. `041.yml`, `080.yml`, `601.yml`).
   - **Requirements:** Must pass `fitness.catalog` auditor checks (`biomechanics`, `muscle_ids`, `coaching_notes`). Must be registered in regional index files (`chest.yml`, `legs.yml`, `core.yml`, etc.).

2. **Tier 2 — Inbox / Drafts (`inbox_*.yml`)**
   - **Location:** `catalog/kb/exercises/inbox_*.yml` (e.g. `inbox_ab_wheel.yml`, `inbox_chest_press.yml`).
   - **Purpose:** Temporary staging area for unapproved exercises or AI-enriched drafts.
   - **Workflow:** When reviewed and approved, move/rename file to `<id>.yml`, update fields to Tier 1 standards, and add to the regional index file.

3. **Tier 3 — Bulk / Unreviewed Dataset (`unreviewed_*.yml`)**
   - **Location:** `catalog/kb/exercises/unreviewed_wger.yml` and `unreviewed_yuhonas.yml`.
   - **Purpose:** Large unreviewed corpus for search fallbacks and AI auto-completion.

---

## Data Flow & Resolver Scoring

- **Resolver Tier Ranking:** `expert` (0) > `inbox` (1) > `bulk` (2).
- **Source Score Bonus:** `expert` (+10) > `inbox` (+5) > `bulk` (+0).
- **Firestore Sync Policy (`kb_sync`):** Expert (Tier 1) data always takes precedence over Bulk (Tier 3) data during Cloud Firestore synchronization.
