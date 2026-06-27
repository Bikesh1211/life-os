# ADR-0002: Integrity OS — Read-Side Analytics Layer, Not Standalone Tracker

**Status:** Accepted
**Date:** 2026-06-28
**Tags:** architecture, plugin, integrity

## Context

A new Integrity OS domain was proposed covering commitments, integrity scores, promise tracking, evidence, daily check-ins, and analytics. Three existing modules already manage "things a user intends to do":

- **Tasks** — finite actionable items with a completion status
- **Goals** — long/short-term targets with 0–100 progress
- **Habits** — recurring tracked behaviors with completions and streaks

Building Integrity as a standalone tracker would create a fourth "intention" entity, fragmenting user data and requiring users to maintain the same promise in both a Task and a Commitment.

## Decision

Integrity OS is a **read-side analytics layer** over existing plugins, not a commitment duplicator. It owns:

- A **thin `integrity_commitments` table** for standalone promises with no home in Tasks/Goals/Habits, plus a `linkedEntityType` + `linkedEntityId` FK pattern to wrap existing entities
- An **append-only `integrity_commitment_events` log** for accountability timeline and score trend computation
- A **`integrity_daily_checkins` table** for narrative reflections (blockers, improvements) — user-authored content that can't be derived from commitment statuses
- **All analytics, insights, and the Integrity Score** computed on-read from commitment rows + event log + source plugin statuses via service-layer calls

It does **not** own:
- Recurring behavior scheduling (delegated to Habits)
- Completion tracking of wrapped tasks (reads from Tasks service layer)
- XP, levels, achievements, or badges (registered with the existing Gamification module)
- Notification scheduling (deferred to v2)

## Consequences

### Positive
- No data fragmentation across four intention-tracking systems
- A Task created in Tasks automatically appears in Integrity OS when linked
- Gamification features apply automatically via `awardXp()` calls
- Single source of truth for "what did I promise to do?"

### Negative
- Integrity depends on Tasks, Goals, Habits, and Gamification maintaining backward-compatible service APIs
- Adding a new commitment type (e.g., a future "Projects" plugin) requires extending both the source plugin and Integrity's linking layer
- Cross-plugin queries are more complex than single-table queries

### Neutral
- The Gamification `xpEventTypeEnum` and achievement/badge seed data must be extended with integrity-specific entries
- Evidence storage (text-only for v1, files in v2 via Supabase Storage) is owned by Integrity since no existing plugin handles evidence generically
