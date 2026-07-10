# ADR-0007: All-or-Nothing Streak Model

**Status:** Accepted
**Date:** 2026-07-10
**Tags:** architecture, discipline, streak, gamification

## Context

The Discipline System plan proposed a strict streak: "Maintain streaks only when users complete their daily commitments. Missing important commitments should reduce the streak."

The existing Integrity OS streak (`calculateCurrentStreak`) counts any day with at least one completed commitment as a streak day. This is permissive — a user who makes 5 commitments and completes 1 still extends their streak.

Three options were evaluated:
1. **All-or-nothing** — Streak breaks if any commitment for the day is missed/failed/pending
2. **Weighted streak** — Streak breaks based on a weighted completion rate (priority × difficulty)
3. **Per-commitment streaks** — Track streaks per individual commitment, not per day

## Decision

**All-or-nothing streak (option 1).**

A new `calculateAllOrNothingStreak` function is added alongside the existing `calculateCurrentStreak`. It:
- Groups commitments by date
- Counts consecutive days backward from today where EVERY commitment on that day has a completion status (completed_unverified or completed_verified)
- Breaks if any commitment on a day is pending, in_progress, failed, missed, or cancelled

The existing per-day streak (`calculateCurrentStreak`) is preserved for:
- Internal analytics and insight generation
- Legacy API routes that depend on it
- The "any completion" streak shown in the non-Discipline Integrity UI

The Discipline dashboard exclusively uses the all-or-nothing streak. This creates a clear UX signal: Discipline Streak = "did I keep every promise today?" vs Integrity Streak = "was I productive today?"

## Consequences

### Positive
- Simple, unambiguous rule — users understand "I must complete everything I promised"
- Creates the right incentive system: commit realistically, then follow through completely
- No complex weighting math that users can't reason about
- Both streaks coexist, giving richer analytics data

### Negative
- More punishing — a single missed low-priority commitment breaks the streak
- May discourage users from making many commitments (they keep the bar low to protect their streak)
- Requires clear UI communication about what breaks the streak

### Neutral
- Two streak calculations run on every dashboard load (cheap — in-memory on the commitments array)
- Users who never miss a commitment see identical values for both streaks
