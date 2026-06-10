<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:skills-reference -->

# Required skills

Before writing **any** new code, load these skills and follow their guidance:

- **`modern-nextjs`** — App Router, Server Components, caching, data fetching, Turbopack, PPR. Always load first for any Next.js feature work.
- **`nextjs-architecture`** — Project structure, module organisation, separation of concerns, SOLID in Next.js, Server vs Client Component placement, review checklist.
- **`diagnose`** — Structured debugging loop (feedback loop → reproduce → hypothesise → instrument → fix → regression test). Required when fixing bugs or performance regressions.

# Domain context

Read `CONTEXT.md` (root) for the full project domain glossary. It defines:
- Plugin vs Module vs Core boundaries
- Every plugin's schema ownership and cross-plugin access rules (service layer only)
- Route groups and feature IDs
- Naming conventions and avoided terms

Cross-reference plugin schemas at `src/modules/{feature}/schema.ts`.

<!-- END:skills-reference -->
