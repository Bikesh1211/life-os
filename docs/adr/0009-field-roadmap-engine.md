# ADR-0009: Field Roadmap — Profession-Agnostic Growth Engine

**Status:** Accepted
**Date:** 2026-08-04
**Tags:** architecture, plugin, roadmap, career

## Context

The user wants a feature that makes them measurably better at their field — for a software engineer: crack interviews and progress toward a senior/staff level; for a doctor: the residency-to-specialist path; for a teacher: pedagogy to mastery. The app already owns most of the raw material, but nothing turns it into a *forward journey*:

- **Career OS** (ADR-0004) tracks material: resumes, job applications (Kanban), interview prep items, certifications, portfolio projects, achievements, salary, and `career_profile` with `targetRole`, `careerLevel`, `yearsOfExperience`.
- **Knowledge Vault** tracks learning: entries with subjects, mastery levels (1-10), confidence scores, and a spaced review queue.
- **Goals** tracks terminal goals with milestones and progress.

What's missing is a **blueprint-to-target-role engine** — a printable map that says "you are here, do this next" and reports *how ready you are for the role you want*. Career OS records what you've done; it does not tell you what to do next or how far away your target is.

### Design tensions surfaced during review

1. **Milestone checklist vs proficiency** — a pure checklist ("ship a side project") is gameable and flat; it doesn't make you a senior. A pure skill bar is a pretty graph with no narrative.
2. **Static content vs living tracker.** A curated list of "top 10 system design topics" rots and is not user-owned.
3. **Readiness — a number with semantic risk.** "You are 60% ready" must be a self-diagnostic, never confused with a job-offer predictor.
4. **Algorithm placement.** ADR-0004 delegated a "Skill Roadmap" to Knowledge Vault; the Field Roadmap is a *new* forward-facing engine on top of that, not a relocation of it.

## Decision

Introduce a new plugin, **Field Roadmap**, at `src/modules/field-roadmap/` with route group `/field-roadmap/*` and feature ID `field_roadmap`. It is a proof-gated, milestone + proficiency engine that composes existing trackers through their service layers.

### The model (owned tables)

| Entity | Table(s) | Notes |
|---|---|---|
| **Field Blueprint** | reference (seeded) | Profession template: named Phases, Milestones, Skills. Never user-scoped, never mutated. |
| **Roadmap** | clone of a Blueprint | User-scoped snapshot. User owns and edits it. Anchored to `career_profile.targetRole`. |
| **Phase** | part of Roadmap | 3-5 named stages (e.g. Foundation → Employable → Proficient → Senior). |
| **Roadmap Milestone** | part of Roadmap | Concrete done/not-done target inside a Phase. |
| **Roadmap Skill** | part of Roadmap | Competency with a computed 1-10 proficiency bar. |
| **Roadmap Evidence** | junction (skill ↔ source) | User-confirmed links proving proficiency. |

### Key computation rules

- **Skill Proficiency is never stored.** It is the 1-10 bar computed on-read from *confirmed evidence only*. A self-assigned slider is not allowed.
- **Evidence sources** (each read through its plugin's service layer): a Knowledge Vault entry (via its mastery level), a Career interview-prep item, a Career portfolio project, or a completed Roadmap Milestone.
- **Nothing attaches silently.** A rule-based "find evidence" scan (keyword/alias match on the skill) offers suggestions; the User confirms each link. No LLM in v1.
- **Target-Role Readiness** is the headline number: computed on-read from skill proficiency + completed milestones, anchored to `career_profile.targetRole`. A confidence bar, not a job-offer predictor.

### Cross-plugin data flow

- Field Roadmap reads Career (`career_profile.targetRole`, interview prep, projects), Knowledge Vault (entry mastery), and its own milestones through service layers.
- It never reads another plugin's tables directly.
- The "next step" hint on the dashboard is deterministic (current phase + most evidence-starved skill) — a rule, not an AI coach.

## Consequences

### Positive
- Turns existing "what happened" trackers into a forward "what next" plan for any profession.
- Honest proficiency: the bar can't be gamed without doing real, linked artifacts.
- Prof noise of the whole product uses the same plugin/seed/service-layer architecture.

### Negative
- Cold start: evidence bars read low until the user attaches artifacts — mitigated by the "find evidence" suggestion flow.
- More state than a static guide; introduces new tables & junction.
- Requires Career OS / Knowledge Vault to keep backward-compatible service APIs.

### Neutral
- Blueprints are reference data, so the roadmap problem of "curated content rotting" is bounded by portability pattern.
- The roadmap is a routed plugin with its own nav, not a career sub-rib.

## Alternatives Considered

- **B-field-** roadmap (static content guide only), **Career OS extension** (roadmap tables inside career module), **thin-skin** (no tables). All rejected — see Q1/Q3/Q7 in the design session. A field-agnostic roadmap needs its own tables and its own plugin for the doctor/teacher identity to survive.

## Reconcile with ADR-0004

ADR-0004's "Skill Roadmap → Knowledge Vault" delegates the *learning/search* of role skills. Field Roadmap is a distinct *compass* on top: it composes Knowledge mastery as just one evidence source, and adds blueprint-grade backtracking and readiness. No conflict; Field Roadmap # is additive.