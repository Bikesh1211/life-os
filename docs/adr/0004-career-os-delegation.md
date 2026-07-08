# ADR-0004: Career OS — Delegation Architecture

**Status:** Accepted  
**Date:** 2026-07-08  
**Tags:** architecture, plugin, career

## Context

A new Career OS plugin was proposed to manage the user's professional career — resumes, job applications, interview prep, certifications, salary history, portfolio projects, achievements, goals, skills, learning, journal, timeline, networking, and analytics.

Several existing modules already own overlapping concepts:

- **Goals** tracks goals with milestones, progress (0-100), and a `category` field that includes `"career"`
- **Knowledge Vault** tracks learning entries with subjects, mastery levels (1-10), confidence scores, learning sources, time spent, and review cycles
- **Journal** owns rich journal entries (Tiptap ProseMirror content) with tags, mood, and privacy controls
- **Timeline** owns life events and daily activities with a `category: "career"` enum value
- **Network** owns personal connections with name, company, phone, email, tags, and relationship types
- **Gamification** owns XP, achievements, and badges

Building Career OS from scratch would duplicate all of these domains.

Two extreme alternatives exist:
1. **Thin skin** — Career OS is a pure UI layer. All data lives in existing plugins. No new tables.
2. **Standalone** — Career OS owns every table independently. Full data duplication.

## Decision

Adopt a **delegation architecture**: Career OS owns tables only for data that has no existing home, and delegates everything else to existing plugins via their service layers.

### Owned by Career OS (`career_*` tables)

| Table | Rationale |
|---|---|
| `career_profile` | No existing home — canonical professional identity (position, company, level, target role) |
| `career_resumes` | No existing home — rich document with version history, ATS metadata |
| `career_resume_versions` | Version snapshots of resume content |
| `job_applications` | No existing home — company, position, salary, recruiter, Kanban status |
| `career_interview_prep` | No existing home — study items with revision count, confidence level |
| `career_certifications` | No existing home — credential ID, expiry, verification URL |
| `portfolio_projects` | No existing home — GitHub link, screenshots, technologies |
| `career_achievements` | No existing home — professional portfolio entries (promotions, awards, publications) |
| `career_salary_records` | No existing home — historical earnings with bonus, stocks, currency |

### Delegated to existing plugins

| Career OS feature | Delegates to | Mechanism |
|---|---|---|
| Career Goals | Goals plugin | Goals with `category: "career"`; Career OS queries Goal service layer |
| Skill Roadmap | Knowledge Vault | Career-extended schema adds `targetLevel` + `projects` to `knowledge_entries`; Career OS seeds default subjects |
| Learning Tracker | Knowledge Vault | Existing `knowledge_entries` with learning sources, time spent; Career OS queries Knowledge service layer |
| Career Journal | Journal plugin | Journal entries with career context; Career OS queries Journal service layer |
| Career Timeline | Timeline plugin | Timeline events with `category: "career"`; Career OS queries Timeline service layer |
| Networking CRM | Network plugin | Network Connections extended with career-specific fields (linkedinUrl, howWeMet); Career OS queries Network service layer |
| Gamification hooks | Gamification module | Career OS calls `gamification.awardXp()` for career actions (application sent, interview completed, certification earned) |

### Cross-plugin data flow

- Career OS never reads another plugin's tables directly
- Career OS calls service-layer methods (e.g., `goals.getGoals(userId, { category: "career" })`)
- When Career OS needs to extend another plugin's schema, it contributes migration files that modify the target plugin's tables (e.g., adding `targetLevel` to `knowledge_entries`)
- Career OS's analytics service queries multiple plugin service layers on read and aggregates in-memory

## Consequences

### Positive
- No duplication of goals, learning, journal, timeline, or contacts engines
- Existing cross-plugin features (Timeline feed, Network reminders) automatically include career data
- User sees consistent data — a contact is the same person in both Network and Career OS
- Career OS stays focused on genuinely novel features (resumes, applications, interviews, salary)

### Negative
- Analytics requires joining data across 5+ service layers (slower than a single query)
- Career OS depends on Goals, Knowledge Vault, Journal, Timeline, Network, and Gamification maintaining backward-compatible APIs
- Seeding default career subjects in Knowledge Vault blurs the boundary slightly
- Extending another plugin's schema requires coordination at migration time

### Neutral
- Extension columns on other plugins' tables are nullable — no existing data migration needed
- This matches the established pattern from Wellness plugin (ADR-0001)

## Alternatives Considered

### Thin skin (no new tables)
Every piece of career data lives in existing plugins — a resume is a Knowledge Vault entry, a job application is a Timeline event with metadata. Rejected because resumes, applications, interview prep, certifications, and salary data have fundamentally different schemas that don't fit existing tables. The abstraction would leak everywhere.

### Standalone (full duplication)
Career OS copies every concept — own goals, own learning entries, own contacts, own journal, own timeline events. Rejected because it doubles data entry for the user (add a contact in Career OS, add them again in Network) and multiplies schema maintenance. The Wellness ADR already established delegation as the proven pattern.
