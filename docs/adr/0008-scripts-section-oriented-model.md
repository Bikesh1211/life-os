# ADR-0008: Scripts Plugin — Section-Oriented Content Model

**Status:** Accepted  
**Date:** 2026-07-22  
**Tags:** architecture, plugin, scripts

## Context

The Scripts plugin needs a content model for spoken-communication preparation documents (presentations, speeches, meetings, interviews, etc.). Two natural patterns exist in the codebase:

- **Monolithic document** (used by Journal): One ProseMirror JSON blob per entity. Sections are just heading nodes within the document tree.
- **Section-oriented** (used by Books with chapters + parts): Content is split across ordered child rows, each with its own ProseMirror JSON.

The Scripts use case demands several features that intersect with this choice: per-paragraph speaker notes, section-level timing estimates, cue cards per section, presentation mode with "current section" tracking, and structure templates that pre-define section outlines.

## Decision

Use a **section-oriented model**: a Script contains ordered `script_sections`, each with its own ProseMirror `content` column.

Key design points:

- **Structure templates** create an ordered list of empty sections when a Script is first created (e.g., Presentation → Introduction, Agenda, Main Topics, etc.)
- **Sections are independently editable, reorderable, and deletable**
- **Speaker notes** live in two tiers:
  - Lightweight marks (pause, smile, eye contact) stored as inline Tiptap marks on the ProseMirror doc
  - Heavy notes (private note, confidence tip, timing note) stored in a sidecar `script_speaker_notes` JSONB column keyed by ProseMirror node path
- **Per-section metadata** (`estimatedDurationSeconds`, `wordCount`) enables total script timing without scanning the full doc
- **Cue cards** are computed-on-read from section content + speaker notes, not a separate table
- **Presentation Mode** uses the section boundary for "current section / next section" display

## Consequences

### Positive
- Section-level timing estimates — sum of section durations = script duration
- Structure templates work naturally — they are just pre-created sections
- Speaker notes can scope to specific sections without complex path anchoring
- Presentation Mode and Rehearsal Mode get section navigation for free
- Cue cards are trivially derived per section
- Aligns with the existing Books chapter pattern — familiar to the team

### Negative
- More tables/rows to manage compared to a single document (N sections per script)
- Reordering requires bulk-updating `sortOrder` on all sections (matching the Books reorder pattern)
- The monolith-vs-sections mental model is slightly more complex for the user (but Structure Templates handle this)

### Mitigations
- The shared `@/components/editor/` Tiptap component is reused — each section gets its own editor instance, but the UX is seamless (sections appear as a navigable list, not separate pages)
- Bulk reorder follows the same transaction pattern as `reorderChapters` in Books
- Structure Templates remove the "blank page" problem — users never start from scratch

## Alternatives Considered

### Monolithic document (Journal pattern)
Rejected because it lacks section-level boundaries without walking the ProseMirror tree, making speaker notes and per-section timing fragile. Speaker notes would require anchoring to arbitrary node paths in a monolithic tree.

### Books chapters + parts (full chapter model)
Rejected as overengineered — Scripts don't need versioning per-section (versioning is at the whole-script level for v1), collaboration, or reading-progress tracking. A lighter section model suffices.
