# Focus Linq (formerly Life OS)

A personal life management platform. Provides an extensible shell (auth, navigation, design system, app shell) that plugins fill with domain-specific features.

## Language

**Plugin**:
An independently developed feature module that owns its own database schema, routes, and domain logic. Plugins live under `src/modules/`. One plugin never reads another plugin's tables directly — cross-plugin data access goes through a service layer or domain events.

**Core**:
The shared foundation of the platform. Owns auth (Clerk), the app shell (Mantine AppShell), design tokens, navigation configuration, the shared database client, and cross-cutting concerns (logging, error handling, permissions). Core never depends on any plugin.

**Module**:
The physical directory under `src/modules/` where a Plugin's code lives. Every Plugin is a Module; not every Module is necessarily a Plugin (e.g. `src/modules/shared/` is cross-cutting, not a Plugin).

**User**:
A person who authenticates with Clerk and owns their data. `userId` is the Clerk user ID string (`auth().userId`). There is no local `users` table — Clerk is the identity source of truth. Every data row across all plugins is scoped to this `userId`.

*Avoid*: Account (when referring to user identity — use Clerk instead), customer, member

**Financial Account**:
A financial institution account or wallet owned by a User. Examples: bank account, credit card, cash wallet, UPI, PayPal. Not a user identity concept — distinct from the Clerk-based User model. Every Financial Account is scoped to a `userId`. Managed by the Expenses plugin.

**Timeline Event**:
A life event or daily activity with a date. Can be past (birth, started career, ate lunch) or future (vacation, deadline). Past/future is computed from `eventDate`, never stored. Daily activities may have `startTime`/`endTime` (HH:mm). Milestone events have a single `eventDate` with no time fields. Every event is scoped to a `userId`.

**Category**:
A fixed enum on timeline events: `personal`, `career`, `education`, `health`, `finance`, `travel`, `relationships`, `business`, `entertainment`, `custom`.

**Importance**:
A fixed enum on timeline events: `critical`, `high`, `medium`, `low`.

**Recurrence**:
A fixed enum on timeline events: `none`, `daily`, `weekly`, `monthly`, `yearly`. Defines how the event repeats after its initial `eventDate`. For past events with recurring, the "next occurrence" is computed on-the-fly by adding the recurrence period from `eventDate` until a future date is reached. No instance rows are stored.

**Life Timeline** (aka "Timeline"):
The plugin at `src/modules/timeline/`. A unified daily activity tracker and life milestone manager. Lets users record everything they do throughout the day (eating, walking, working, shopping, sleeping) and also track notable life events (birthdays, anniversaries, deadlines, vacations). Database table is `timeline_events`. Route group is `/timeline/*`. Feature ID is `timeline`. Sub-routes: Today (`/timeline/today`), Feed (`/timeline/feed`), Calendar (`/timeline/calendar`), Categories (`/timeline/categories`), Analytics (`/timeline/analytics`), Memories (`/timeline/memories`), Settings (`/timeline/settings`).

**Activity Entry**:
A timeline entry representing something the user did. Has a `title`, `activityType` (e.g. "Walking", "Coding", "Breakfast"), `category` (fixed enum), optional `startTime`/`endTime` (HH:mm), computed `durationMinutes`, `tags`, `mood` (1-5), `energy` (1-5), and `location` (freeform). Every entry is scoped to a `userId`.

**Activity Type**:
A freeform text label describing the specific activity within a category. System provides suggestions (e.g. Food → Breakfast, Lunch, Dinner, Snacks, Coffee) but users can type anything. Stored in `activityType` column on `timeline_events`.

**Quick Add**:
The primary creation UX — an inline input at the top of the Today view. Type natural language like "Ate Chowmein" or "Walked 2km" and press Enter to create an entry in seconds. Category is auto-inferred from keywords. Optional fields (time, mood, energy, location) are progressive disclosure below the input.

**Milestone**:
A notable life event within the Life Timeline (not a separate concept). Distinguished from daily activities by `importance` (`critical`/`high`) and the absence of time fields. The old Milestones route (`/milestones`) is absorbed into Timeline as a filter view.

**Activity Category**:
A fixed enum on timeline events defining the high-level domain: `personal`, `career`, `education`, `health`, `finance`, `travel`, `relationships`, `business`, `entertainment`, `custom`. For daily activities, each category has suggested `activityType` values. Milestones use the same enum.

**Daily Summary**:
A computed-on-read aggregation of a day's activities showing activity count, total tracked time, and top categories. No stored table — derived from querying entries for the date.

**Expenses** (plugin):
The personal finance tracker plugin at `src/modules/expenses/`. Owns all financial data — transactions, budgets, financial accounts, subscriptions, and analytics. Route group is `/finance/*`. Feature ID is `expenses`. Sub-routes: Overview (`/finance`), Transactions (`/finance/transactions`), Budgets (`/finance/budgets`), Accounts (`/finance/accounts`), Subscriptions (`/finance/subscriptions`), Analytics (`/finance/analytics`).

**Backdated Entry**:
A journal entry with an `eventDate` that differs from its `createdAt`. The user creates the entry on one date but writes about a different (past) date. Displayed in the journal timeline under its `eventDate` with a "Written [date]" badge indicating when it was actually created. The `eventDate` column is optional — if null, the entry is a normal "written today" entry.

**Music** (plugin):
The music tracking plugin at `src/modules/music/`. Route group is `/music/*`. Feature ID is `music`. Owns all music-related data — reference metadata (artists, albums, tracks synced from MusicBrainz), listening history, music journal, memories, ratings, favorites, collections, and goal configuration. Sub-routes: Overview (`/music`), Library (`/music/library`), History (`/music/history`), Journal (`/music/journal`), Ratings (`/music/ratings`), Analytics (`/music/analytics`), Goals (`/music/goals`).

**Spotify**:
A secondary external data provider for the Music plugin. Spotify fields (`spotifyUri`, `spotifyId`, `spotifyPopularity`) enrich reference data with cover art, popularity scores, and album/track metadata. Spotify OAuth is optional — used only for importing the user's personal listening history. Never the canonical data source; MusicBrainz remains the primary reference provider.

**MusicBrainz**:
The primary external metadata provider for the Music plugin. MusicBrainz IDs (`musicBrainzId`) are the canonical external identifiers for artists, albums (Release Groups), and tracks. The service layer caches MusicBrainz data locally on first query (pull-on-demand pattern). Cover art is fetched from the Cover Art Archive.

**Music Reference Data**:
The `music_artists`, `music_albums`, and `music_tracks` tables. Populated from MusicBrainz on first search query. Not scoped to any user — these are shared reference tables. Never written by users directly; only by the MusicBrainz sync service layer.

**Music Listening History**:
A scrobble-model log of songs listened to, stored in `music_listening_history`. Free-form entry supported (artist name + track name without a linked MusicBrainz reference). Analytics (most listened, streaks, genre breakdown) are computed on-read.

**Music Journal**:
A reflection entry linked to a track, album, or artist. Stored in `music_journal`. Separate from the general Journal plugin — music journal entries have music-specific fields (trackId, albumId, artistId) that don't fit the generic journal schema.

**Music Memory**:
A lightweight link between a track/artist and a life context. Stored in `music_memories`. Contains context text and an optional `linkedEventId` pointing to a Timeline plugin event. Distinct from the richer Music Journal.

**Music Rating**:
A user score (1–10) for a track, album, or artist. Polymorphic — `entityType` + `entityId` pattern on `music_ratings`. Optional review text.

**Music Favorite**:
A user's favorited entity — track, album, artist, genre, or decade. Polymorphic on `music_favorites`. Genre/decade favorites use string keys (e.g., `"rock"`, `"2020s"`).

**Music Collection**:
A user-curated or smart-generated group of tracks/albums/artists. Custom collections are manually populated. Smart collections are computed on-read (e.g., "Recently listened", "Highest rated") using query parameters stored as JSON in `smartFilter`.

**Music Goal Config**:
Music-specific tracking configuration linked to a Goal from the Goals plugin. Stores `targetType` (albums, tracks, genres, countries), `targetCount`, and `currentCount`. The goal itself lives in the `goals` table (Goals plugin); Music only stores the additional context.

**Soundtrack Timeline**:
A computed chronological view at `/music/timeline` joining music memories, listening history, and timeline event links to render a personal music-themed timeline. No dedicated table — derived on-read.

*Avoid*: Playlist (prefer Collection instead), Scrobble (prefer Listening History), Rating Score (redundant — just Rating), Memory vs Journal (Memories are lightweight links to life events; Journal is active reflection)

**Notes** (plugin):
The quick capture notes plugin at `src/modules/notes/`. Route is `/notes`. Feature ID is `notes`. Owns all note-taking data — notes, tags, categories. Sub-routes: Notes list (`/notes`). Design goal: Apple Notes meets Google Keep — simple, beautiful, extremely fast. Prioritises quick capture over rich editing.

**Note**:
A single quick-capture entry owned by a User. Contains `title`, `content` (plain text with markdown-like formatting), `category` (fixed text), `tags` (text array of tag names), `isPinned`, `isArchived`, `priority` (low/medium/high), optional `reminderDate`, and automatic `createdAt`/`updatedAt` timestamps. Soft-deleted via `deletedAt`. Pinned notes always sort first. Archived notes are hidden from the default list view. Every note is scoped to a `userId`.

**Note Tag**:
A user-defined tag with a `name` and `color` stored in the `note_tags` table. Tags are lightweight — no hierarchy, no descriptions. The same tag name can exist for different users (scoped by `userId`). Tags appear as coloured badges on note cards and can be used to filter the list.

**Note Category**:
A fixed set of values on a Note: `personal`, `work`, `study`, `ideas`, `journal`. Validated by Zod, not a database enum — allows adding new categories without migrations. Displayed as a coloured badge on note cards.

**Quick Capture**:
The primary creation UX — a floating action button (bottom-right) or `Ctrl+Shift+N`/`Cmd+Shift+N` opens a modal with title auto-focused. Type and save in seconds. The modal has progressive category selection and tag picking.

**Knowledge Vault** (plugin):
The personal knowledge management plugin at `src/modules/knowledge/`. Route is `/knowledge`. Feature ID is `knowledge`. Owns all knowledge capture data — entries, subjects, relationships, tags. Sub-routes: Overview (`/knowledge`), Library (`/knowledge/library`), Timeline (`/knowledge/timeline`), Analytics (`/knowledge/analytics`).

**Knowledge Entry**:
A logged learning event owned by a User. Contains title, subject, summary, detailed notes (markdown), key takeaways, examples, resources, tags, difficulty, source, mastery level, confidence score, time spent, and review status. Every entry is scoped to a `userId`.

**Subject**:
A user-defined flat taxonomy label on a Knowledge Entry. Each User creates their own subjects (e.g. "Technology", "Career", "Personal Growth"). One entry has exactly one subject.
*Avoid*: Category (reserved for Timeline Events)

**Subcategory**:
An optional freeform text label on a Knowledge Entry, providing additional refinement within the Subject. Not a taxonomy level — purely descriptive.

**Tag**:
A cross-cutting keyword label on a Knowledge Entry. Many tags per entry, spanning multiple subjects. Used for search and implicit relationships.

**Learning Source**:
A user-extensible classification of where knowledge was acquired. Defaults: Course, Book, Article, Video, Podcast, Documentation, Work Experience, Personal Experiment, Other.

**Difficulty Level**:
A fixed enum on Knowledge Entries: `beginner`, `intermediate`, `advanced`.

**Mastery Level**:
A 1–10 numeric score on a Knowledge Entry indicating how well the user knows the content. Higher = more competent.

**Confidence Score**:
A 1–10 numeric score on a Knowledge Entry indicating how sure the user is that their understanding is correct. Distinct from Mastery (competence vs certainty).

**Review Status**:
A fixed enum on Knowledge Entries: `not_reviewed`, `reviewing`, `mastered`. `mastered` is terminal — the entry stops appearing in review queues. Next review date is computed on-read from `lastReviewedAt` and `masteryLevel`.

**Knowledge Relationship**:
A typed, directed link between two Knowledge Entries. Stored in a junction table with a `relationshipType` indicating how they relate (e.g. `related_to`, `prerequisite`, `builds_on`, `references`). Forms the knowledge graph.

**Knowledge Timeline**:
A date-grouped view within Knowledge Vault showing entries by `dateLearned`. Every Knowledge Entry automatically creates a Timeline Event in the Life Timeline plugin upon creation. Knowledge Vault calls the Timeline service layer — it never writes to `timeline_events` directly.

## Example dialogue

**Dev**: I need to add a priority field to Tasks. Where's the schema?
**Domain expert**: In `src/modules/tasks/schema.ts`. Tasks Plugin owns its tables.
**Dev**: And if Habits needs to reference task priorities for the focus mode feature?
**Domain expert**: Habits queries Tasks through the Tasks service layer, never directly. Tasks exposes a `getTaskPriority(taskId)` method.
**Dev**: What if I need to add a new Plugin?
**Domain expert**: Create a directory in `src/modules/`, register your routes with the core, and own your schema. Done.

**Dev**: I'm building Knowledge Vault. When a user creates a knowledge entry, should it appear on the Life Timeline?
**Domain expert**: Yes. The Knowledge Vault service layer calls the Timeline service to create a Timeline Event. Knowledge Vault never writes to `timeline_events` directly — it uses the service layer.
**Dev**: And subjects are user-defined — no shared taxonomy?
**Domain expert**: Correct. Each user creates their own flat list of subjects. No global subject table. Scoped to `userId` like everything else.
**Dev**: What about the Notes plugin — same thing?
**Domain expert**: Different thing. Notes is a quick scratchpad. Knowledge Vault is structured learning with mastery tracking, review cycles, and a knowledge graph. They're separate plugins but entries across them can be linked.

**Dev**: I need to add a new category to Notes. Where do I change it?
**Domain expert**: In `src/modules/notes/service.ts`. Categories are validated by Zod — add it to the `categories` const array. No migration needed since categories are text columns.
**Dev**: And tags?
**Domain expert**: Tags live in the `note_tags` table. User-defined, scoped to `userId`. Notes reference them by name via the text array column `tags`. The `note_tags` table only stores name + color for display.
