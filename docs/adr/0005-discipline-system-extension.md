# ADR-0005: Discipline System — Brand Extension of Integrity OS

**Status:** Accepted
**Date:** 2026-07-10
**Tags:** architecture, discipline, integrity, branding

## Context

A new Discipline System was proposed as a flagship feature to help users build self-discipline through accountability, consistency, reflection, and measurable progress. The plan detailed a separate plugin with its own score, streak, levels, journal, and challenge systems.

However, the existing Integrity OS plugin at `src/modules/integrity/` already owns all the core data models needed: commitments, integrity score (0–100), streaks, daily accountability check-ins, event logging, and rule-based insights. Building a new plugin would duplicate the entire schema and violate the established rule that "one plugin never reads another plugin's tables directly."

Three options were evaluated:
1. **Extend Integrity OS** — Add discipline-specific fields, algorithms, and UX to the existing plugin
2. **New standalone plugin** — `src/modules/discipline/` with its own tables and service layer
3. **Cross-cutting enrichment** — A thin layer over Integrity + Gamification, similar to Wellness Grooming

## Decision

**Option 1: Extend Integrity OS.** The Discipline System is the user-facing brand identity of Integrity OS.

- The technical module remains `src/modules/integrity/` — table names, file structure, and database schema stay unchanged
- The user-facing route becomes `/discipline` (with `/integrity` permanently redirecting)
- All UI copy uses "Discipline" — Discipline Score, Discipline Streak, Discipline Level
- The existing Integrity Score algorithm is extended with delegated sub-scores from 7 external plugins (30% commitments, 15% habits, 15% tasks, 10% sleep, 10% exercise, 10% journaling, 10% goals)
- A new all-or-nothing streak calculation is added alongside the existing per-day streak
- The existing 3-field check-in is redesigned to 5 guided prompts
- Gamification challenges are seeded, not recreated

## Consequences

### Positive
- No data duplication or schema fragmentation
- Existing commitments, events, and check-in data are immediately available to the Discipline dashboard
- Users who already use Integrity OS automatically get Discipline features without migration
- Single module to maintain, test, and deploy

### Negative
- The module directory name `integrity` conflicts with the user-facing brand `discipline`, which may confuse new developers
- Future developers must understand that Discipline ≠ Integrity as separate domains — they are the same system
- The renamed route and user-facing terms may cause temporary confusion for existing users who know the feature as "Integrity OS"

### Neutral
- The old `/integrity` route must be maintained as a permanent redirect for bookmarked URLs
- All API routes remain under `/api/integrity/` but `src/app/(app)/` routes move to `/discipline/`
