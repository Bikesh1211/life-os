# ADR 0003: Journal Book View Architecture

## Status

Accepted

## Context

The Journal plugin needs a view-only "Book View" mode that renders existing journal entries as a realistic digital diary. The feature must handle potentially thousands of entries, support an immersive reading experience with page-turn animations, and integrate as a new tab within the existing `?tab=` routing pattern.

Key decisions involve:
1. Data loading strategy for thousands of entries across multiple years
2. Page-turn animation approach (realistic 3D curl vs. simpler slide)
3. Tab-based integration vs. separate route
4. Content rendering format (ProseMirror JSON → HTML conversion)

## Decision

### 1. Year-by-year data loading with dedicated coverage endpoint

Entries are loaded one year at a time (`/api/journal?dateFrom=2024-01-01&dateTo=2024-12-31`). Adjacent years are prefetched in the background. A new `/api/journal/coverage` endpoint returns which year/month combinations have entries (a lightweight `SELECT DISTINCT` query), powering the timeline navigation drawer without fetching full entries.

**Rationale**: Fetching all entries upfront would be slow for users with 5+ years of daily entries (1,800+ items). Year-by-year loading keeps individual payloads small (~365 entries max), enables instant year-jump navigation by fetching the target year, and the existing API already supports date-range filtering. A dedicated coverage endpoint avoids hitting the journal list endpoint just to build the index.

### 2. Framer Motion for 3D page flip animation

The page turn animation uses framer-motion's `AnimatePresence` with custom `rotateY` and `x` transforms, applying `perspective: 1500px` on the container for a 3D book-like feel. On desktop, a two-page spread is rendered with the right page receiving a `rotateY` transform (simulating the page flipping) while both pages slide together. On mobile, a single page slides with opacity.

**Rationale**: Framer Motion is already a dependency. The `react-pageflip` library could not be installed due to npm compatibility issues. However, the framer-motion approach is actually preferable for this codebase: it avoids a new dependency, the animation is controllable per-page, and the `AnimatePresence` pattern integrates naturally with existing codebase conventions (94+ usages of framer-motion across the app). The 3D curl effect of `react-pageflip` would be more realistic, but the hard-edge flip with rotation is still convincingly book-like.

**Trade-off**: The page curl is a hard 3D transform (not a soft curled-page effect). The realistic curl would require canvas-based rendering or a dedicated library. The current approach is visually pleasing but less realistic than a library like `react-pageflip`. If realistic curl is desired in the future, it can be swapped in without changing the data layer.

### 3. Tab-based integration (`?tab=book`) within existing Journal page

Book View is added as a 7th tab in the existing `JournalContent.tsx` component, following the `?tab=book` query parameter pattern used by Story, Browse, Timeline, Calendar, Pinned, and Insights tabs.

**Rationale**: The entire app uses tab-based navigation for view modes within plugins (Music, Movies, Timeline, Journal). Adding Book View as a tab is consistent with the existing UX pattern, avoids route duplication, and leverages the existing URL sync, tab state management, and layout. It also means the Book View is immediately accessible from the Journal tab bar without navigating to a different page.

**Trade-off**: A separate route (`/journal/book`) would allow deep-linking to the book without the parent journal UI loading first. The decision to use a tab means the Journal's page-level data fetching always runs before Book View can render, adding a small loading sequence. This is acceptable because the tab switch already renders immediately with skeleton states.

### 4. Server-side ProseMirror-to-HTML conversion

Journal entry content is stored as Tiptap/ProseMirror JSON. For read-only Book View rendering, the content is converted to styled HTML on the server side using `@tiptap/html` and returned as an `htmlContent` field in the API response.

**Rationale**: Mounting a full read-only Tiptap editor instance for every page would be wasteful — the Book View can render dozens of entries per year. Server-side conversion keeps the client bundle smaller, avoids editor initialization overhead on each page turn, and centralises rendering logic. The HTML is injected via `dangerouslySetInnerHTML` within styled book page containers. Search highlighting adds `<mark>` tags at the server level when a search term is active.

**Trade-off**: Client-side rendering would allow interactive features (inline editing, annotation) within the book. Since Book View is view-only with edit access via a modal opening the existing editor, server-side rendering is sufficient. If inline annotation or highlighting is added later, a hybrid approach (server HTML + client DOM walker for highlights) could be adopted.

## Consequences

- Book View ships as a new component directory under `src/app/(app)/journal/components/book-view/`, with no changes to existing journal components except adding one tab entry in `JournalContent.tsx`.
- Users with slow connections experience a brief loading state when crossing year boundaries (skeleton pages shown during prefetch).
- The `/api/journal/coverage` endpoint needs its own tests and documentation alongside the existing API routes.
- Sort order is stored in localStorage and triggers a full data reload when toggled (clears cached entries, re-fetches in the new direction).
- Reading position is stored in localStorage (not the database), meaning position is lost if the user clears browser storage. Cross-device position sync would require a database-stored position as a future enhancement.
