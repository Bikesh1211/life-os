# ADR-0001: Wellness Plugin — Hybrid Architecture

**Status:** Accepted  
**Date:** 2026-06-16  
**Tags:** architecture, plugin, wellness

## Context

A new Personal Wellness domain was proposed covering mood tracking, sleep tracking, hydration, grooming, hygiene, self-care, confidence tracking, analytics, gamification, and AI coaching.

Several existing modules already own overlapping concepts:
- **Timeline** has `mood` (1-5) and `energy` (1-5) on `timeline_events`
- **Habits** tracks recurring activities (daily/weekly/monthly) with completions, streaks, and analytics
- **Gamification** has XP, levels, achievements, badges, and challenges
- **Goals** has goal tracking with progress

Adding wellness could follow one of three paths:
1. **New standalone plugin** — owns everything from scratch, duplicates existing functionality
2. **Extend existing plugins** — add wellness fields to Timeline, Habits, Gamification, Goals
3. **Hybrid** — new plugin for wellness-native data, delegates habit-like behavior to existing modules

## Decision

Adopt **Option 3 (Hybrid)**. A new `wellness` plugin at `src/modules/wellness/` that:

- **Owns its own tables** for data that has no existing home: mood logs, sleep records, hydration entries, confidence check-ins, habit enrichment.
- **Delegates recurring activities** (grooming, hygiene, self-care) to the existing **Habits** module. Wellness adds enrichment data via a `wellness_habit_enrichment` table (FK to `habits.id`) — cost tracking, seasonal triggers, next-due-date computation, photos.
- **Hooks into Gamification** by calling `gamification.awardXp()` for Wellness-native actions (mood logged, sleep recorded, hydration entry, confidence check-in). New XP event types are added to the Gamification enum.
- **Hooks into Timeline** via service layer calls for cross-plugin visibility (e.g., "Slept 7.5h" appears on the timeline feed).
- **Rules-based insights** for v1 (matching the pattern in Habits). LLM-powered weekly reports deferred to v2.

## Consequences

### Positive
- No duplication of the Habits engine (scheduling, completions, streaks, analytics)
- Existing gamification features apply automatically to grooming/hygiene habits
- Clean separation — Mood Log vs Timeline mood are different concerns
- Analytics can join across modules (sleep from wellness, habits from Habits, timeline from Timeline)

### Negative
- Cross-plugin queries are more complex than single-plugin queries (joins or service calls)
- Wellness depends on Habits, Gamification, Timeline, and Goals modules existing and maintaining backward-compatible APIs
- Enrichment data for grooming sits in a different schema from the core habit
- No background job infrastructure exists yet — due-date reminders are read-side computed

### Neutral
- The Gamification `xpEventTypeEnum` must be extended with wellness event types
- New wellness XP values (2-5 per log) are much smaller than habit/task XP (10-25), creating a balanced economy

## Alternatives Considered

### Option 1: Standalone plugin
Every table duplicated from scratch (wellness_habits, wellness_streaks, wellness_gamification). Would have required rebuilding streak computation, analytics pipelines, and gamification hooks already present in Habits and Gamification. Rejected due to cost and divergence risk.

### Option 2: Extend existing plugins
Mood dimensions added to timeline_events (stretching the schema), grooming fields to habits table, wellness-specific concepts leaking into generic modules. Rejected because it couples generic infrastructure to domain-specific concerns.
