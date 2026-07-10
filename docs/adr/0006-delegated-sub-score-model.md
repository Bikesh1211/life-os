# ADR-0006: Delegated Sub-Score Model with Daily Snapshot Caching

**Status:** Accepted
**Date:** 2026-07-10
**Tags:** architecture, discipline, scoring, performance

## Context

The Discipline Score needed to incorporate data from 7+ external plugins (commitments, habits, tasks, sleep, exercise, journaling, goals). Three approaches were considered:

1. **Pure single-plugin score** — Only commitment data, same as the existing Integrity Score
2. **Cross-plugin real-time computation** — Read from all 7 plugins on every dashboard load and compute the score on-the-fly
3. **Delegated sub-scores** — Each plugin exposes a sub-score contribution (0–100) through its service layer; the Discipline service sums them with fixed weights

Additionally, the score needed to be fast enough for the dashboard (which loads on every visit) while supporting historical analytics.

## Decision

**Delegated sub-scores with daily snapshot caching.**

- The score is a weighted average of 7 sub-scores: Commitments (30%), Habits (15%), Tasks (15%), Sleep (10%), Exercise (10%), Journaling (10%), Goals (10%)
- Each sub-score is fetched from the respective plugin's service layer (the service layers already exist for Habits `getSummary`, Tasks `getTaskStats`, Wellness `getSleepRecords`, Journal `getJournalStats`, Goals `getGoals`, Timeline `getTimelineEvents`)
- A capped streak bonus (min(currentStreak × 0.5, 15)) is applied after the weighted average
- The final score is clamped to [0, 100]

**Caching**: A new `integrity_daily_snapshots` table stores one row per user per day with the computed score, sub-scores (JSONB), streak, level, and commitment rate. The snapshot is recomputed on:
- First dashboard visit of the day
- When a commitment status changes (triggered by the commitment update flow)
- The dashboard always reads from the latest snapshot (O(1) read) rather than recomputing from 7 sources (O(n) read)

## Consequences

### Positive
- Dashboard loads are instant — single row read vs 7 service calls
- Historical score data is available for analytics charts without recomputation
- Sub-scores stored as JSONB enable the score breakdown visualization
- New plugins can be added to the score by adding a sub-score and weight — no schema migration
- Zero-weight for missing plugins (Focus Mode will be added in v2 with a 0 default)

### Negative
- The score may be slightly stale (up to the last snapshot computation)
- Each plugin must maintain backward-compatible service layer APIs
- Adding a new sub-score requires code changes in both the source plugin and the Discipline service
- The streak bonus is computed from the all-or-nothing streak, which is itself computed from commitment data

### Neutral
- The old `calculateIntegrityScore` function is preserved for backward compatibility; internal tools and API routes that depend on it continue to work
- Users can override score weights via a future settings panel (stored as JSONB on user preferences)
