# Focus Linq (formerly Life OS)

A personal life management platform. Provides an extensible shell (auth, navigation, design system, app shell) that plugins fill with domain-specific features.

## Language

**Plugin**:
An independently developed feature module that owns its own database schema, routes, and domain logic. Plugins live under `src/modules/`. One plugin never reads another plugin's tables directly — cross-plugin data access goes through a service layer or domain events.

**Core**:
The shared foundation of the platform. Owns auth (Supabase Auth), the app shell (Mantine AppShell), design tokens, navigation configuration, the shared database client, and cross-cutting concerns (logging, error handling, permissions). Core never depends on any plugin.

**Module**:
The physical directory under `src/modules/` where a Plugin's code lives. Every Plugin is a Module; not every Module is necessarily a Plugin (e.g. `src/modules/shared/` is cross-cutting, not a Plugin).

**User**:
A person who authenticates with Supabase Auth and owns their data. `userId` is the Supabase Auth user ID (UUID string). There is no local `users` table — Supabase Auth is the identity source of truth. Every data row across all plugins is scoped to this `userId`.

*Avoid*: Account (when referring to user identity — use Supabase Auth instead), customer, member

**Journal** (plugin):
The personal journaling & reflection plugin at `src/modules/journal/`. Route group is `/journal/*`. Feature ID is `journal`. Owns all journal data — entries, insights, reflections. Sub-routes: Story (`/journal?tab=story`), Browse (`/journal?tab=browse`), Timeline (`/journal?tab=timeline`), Calendar (`/journal?tab=calendar`), Pinned (`/journal?tab=pinned`), Insights (`/journal?tab=insights`), Book View (`/journal?tab=book`). The journal editor uses Tiptap with ProseMirror JSON content format.

**Journal Entry**:
A written personal reflection owned by a User. Contains `title`, `content` (ProseMirror JSON text, returned as rendered HTML for read-only views), `mood` (happy/sad/neutral/anxious/stressed/motivated/excited), `tags` (text array), `reflectionScore` (1-10), `isPinned`, `isPrivate` (defaults true), optional `eventDate` (for backdated entries), and `createdAt`/`updatedAt` timestamps. Soft-deleted via `deletedAt`. Every entry is scoped to a `userId`. When created, a corresponding Timeline Event is automatically created via the Timeline service layer.

**Journal Book View**:
A read-only view mode within the Journal plugin that renders journal entries as a clean modern reading experience. Displays entries grouped by date, one date per page, in single-page layout on all devices. Supports configurable sort order (ascending/descending) persisted to localStorage. Features a minimal bottom toolbar with navigation (prev/next, page counter, date label), sort toggle, and search overlay. Uses framer-motion `AnimatePresence` for clean slide transitions. Dark/light mode adaptive. Keyboard shortcuts (arrow keys for navigation, Escape to close). Data is loaded year-by-year with coverage metadata from `/api/journal/coverage`.

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
The music tracking plugin at `src/modules/music/`. Route group is `/music/*`. Feature ID is `music`. Owns all music-related data — reference metadata (artists, albums, tracks synced from MusicBrainz), listening history, music journal, memories, ratings, favorites, library, collections, and goal configuration. Sub-routes: Overview (`/music`), Library (`/music/library`), Favorites (`/music/favorites`), Collections (`/music/collections`), Memories (`/music/memories`), Song (`/music/song/[id]`), Artist (`/music/artists/[id]`), Album (`/music/albums/[id]`), Journal (`/music/journal`), Timeline (`/music/timeline`), Search (`/music/search`).

**Spotify**:
A secondary external data provider for the Music plugin. Spotify fields (`spotifyUri`, `spotifyId`, `spotifyPopularity`) enrich reference data with cover art, popularity scores, and album/track metadata. Spotify OAuth is optional — used only for importing the user's personal listening history. Never the canonical data source; MusicBrainz remains the primary reference provider.

**MusicBrainz**:
The primary external metadata provider for the Music plugin. MusicBrainz IDs (`musicBrainzId`) are the canonical external identifiers for artists, albums (Release Groups), and tracks. The service layer caches MusicBrainz data locally on first query (pull-on-demand pattern). Cover art is fetched from the Cover Art Archive.

**Music Reference Data**:
The `music_artists`, `music_albums`, and `music_tracks` tables. Populated from MusicBrainz on first search query. Not scoped to any user — these are shared reference tables. Never written by users directly; only by the MusicBrainz sync service layer. Search queries the local reference data first (instant, real UUIDs) and falls back to MusicBrainz sync only when no local match is found.

**Music Listening History**:
A scrobble-model log of songs listened to, stored in `music_listening_history`. Free-form entry supported (artist name + track name without a linked MusicBrainz reference). Analytics (most listened, streaks, genre breakdown) are computed on-read.

**Music Journal**:
A reflection entry linked to a track, album, or artist. Stored in `music_journal`. Separate from the general Journal plugin — music journal entries have music-specific fields (trackId, albumId, artistId) that don't fit the generic journal schema.

**Music Memory**:
A personal memory linked to one or more songs, optionally connected to a Collection or Timeline event. Stored in `music_memories`. Contains `title`, `contextText`, `mood`, `photoUrls`, `memoryDate`, `location`, and optional `linkedEventId` pointing to a Timeline plugin event. Multiple songs are linked via the `music_memory_songs` junction table. Memories can be added to Collections via `music_collection_items` with `entityType: 'memory'`.

**Music Memory Song**:
A junction linking a Memory to a Track in the `music_memory_songs` table. Allows multiple songs per memory with optional `position` for ordering. Enables the "Weekend Hangout" memory to reference several songs (Shape of You, Perfect, Photograph) that define the moment.

**Music Library**:
A user's personal saved-song catalog. Stored in `music_library` (userId, trackId, addedAt). Represents "songs I care about" — distinct from favorites (emotional significance) and collections (thematic grouping). A track can be in the library without being favorited, and vice versa. Library is the primary workspace for browsing and organizing the user's known music.

**Music Rating**:
A user score (1–10) for a track, album, or artist. Polymorphic — `entityType` + `entityId` pattern on `music_ratings`. Optional review text.

**Music Favorite**:
A user's favorited entity — track, album, artist, genre, or decade. Polymorphic on `music_favorites`. Genre/decade favorites use string keys (e.g., `"rock"`, `"2020s"`).

**Music Collection**:
A user-curated or smart-generated group of tracks/albums/artists/memories (e.g., "Gym Collection", "Coding Collection"). Custom collections are manually populated. Smart collections are computed on-read (e.g., "Recently listened", "Highest rated") using query parameters stored as JSON in `smartFilter`. Stored in `music_collections` with items in `music_collection_items`. Items can be tracks, albums, artists, or memories (polymorphic via `entityType`).

*Avoid*: Playlist (always use Collection instead)

**Music Goal Config**:
Music-specific tracking configuration linked to a Goal from the Goals plugin. Stores `targetType` (albums, tracks, genres, countries), `targetCount`, and `currentCount`. The goal itself lives in the `goals` table (Goals plugin); Music only stores the additional context.

**Soundtrack Timeline**:
A computed chronological view at `/music/timeline` joining music memories, listening history, and timeline event links to render a personal music-themed timeline. No dedicated table — derived on-read.

*Avoid*: Scrobble (prefer Listening History), Rating Score (redundant — just Rating), Memory vs Journal (Memories are lightweight links to life events; Journal is active reflection)

**Movies** (plugin):
The movie & entertainment tracking plugin at `src/modules/movies/`. Route group is `/movies/*`. Feature ID is `movies`. Owns all movie/TV/anime data — reference media metadata (synced from TMDB), favorites, watchlist, memories, quotes, collections, ratings, and statistics. Sub-routes: 10 tabs — Dashboard (`/movies`), Discover (`/movies/discover`), Favorites (`/movies/favorites`), Watchlist (`/movies/watchlist`), Memories (`/movies/memories`), TV Shows (`/movies/tv-shows`), Anime (`/movies/anime`), Quotes (`/movies/quotes`), Collections (`/movies/collections`), Statistics (`/movies/statistics`). Tab layout uses the Music-style URL-path pattern with Mantine Tabs.

**Movie Memory**:
A personal memory linked to a movie or TV show. Stored in `movie_memories`. Contains `title`, `contextText`, `mood` (fixed emoji set), `photoUrls`, `ticketUrls`, `screenshotUrls`, `tags`, `watchDate`, `location`, `watchedWith`, and optional `linkedEventId` pointing to a Timeline event. No junction tables for additional media/people in v2 — single media per memory via `mediaId`.

**Movie Favorite**:
A bookmarked movie/TV show in `movie_favorites`. Tracks `rewatchCount`, `personalNotes`. Separate from Ratings (you can rate without favoriting).

**Movie Rating**:
A 1-10 score for any movie/TV show in `movie_ratings`. Optional review text. Separate from Favorites.

**Movie Watchlist**:
A queue + progress tracker in `movie_watchlist`. Statuses: `plan_to_watch`, `watching`, `completed`, `dropped`, `rewatching`. TV shows additionally track `currentSeason`, `currentEpisode`, `totalSeasons`, `totalEpisodes`. Serves as both the queue and TV show episode progress tracking.

**Movie Quote**:
A favorite quote from a movie/TV show in `movie_quotes`. Contains `quote`, `character`, `timestamp`, `personalMeaning`, `isFavorite`.

**Movie Collection**:
A user-curated group of movies/TV shows in `movie_collections` with items in `movie_collection_items`. Media-only (no polymorphic entities in v1). Private (scoped to userId).

**TMDB**:
The primary external metadata provider for the Movies plugin. TMDB IDs (`tmdbId`) are the canonical external identifiers for movies, TV shows, and people. The service layer caches TMDB data locally on first query (pull-on-demand pattern). Poster and backdrop artwork URLs are constructed from TMDB's image CDN at render time.

**Movies Reference Data**:
The `movies_media` table (movies + TV shows combined, anime identified by Animation genre) and `movies_people` table. Populated from TMDB on first search query. Not scoped to any user — shared reference tables. Never written by users directly; only by the TMDB sync service layer.

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

**Tech Gear** (plugin):
The personal tech inventory plugin at `src/modules/tech-gear/`. Route is `/inventory/tech-gear`. Feature ID is `tech_gear`. Owns technology asset tracking — laptops, phones, components, cables, software licenses, and more. Sub-routes: Dashboard (`/inventory/tech-gear`), Items (`/inventory/tech-gear/items`), Setups (`/inventory/tech-gear/setups`).

**Tech Item**:
A technology asset owned or used by a User. Every item has a `category` (fixed enum), `brand`, `model`, optional `serialNumber`, `warrantyExpiry`, `warrantyProvider`, `ownershipStatus` (owned/sold/lost/loaned-out/borrowed), `condition` (new/excellent/good/fair/broken/repairing), `color`, `location`, and a JSONB `specifications` column for category-specific attributes (CPU, RAM, storage, cable length, connector type, etc.). Loan tracking fields (`loanedTo`, `loanDate`, `expectedReturnDate`) live on the item row, null when not loaned.

**Tech Setup**:
A user-curated grouping of Tech Items, analogous to Wardrobe Outfits. Stored in `tech_setups` with items linked via `tech_setup_items` junction table. Example: "Workstation" groups a laptop, monitor, keyboard, mouse.

**Tech Maintenance Log**:
A record of a repair or service event on a Tech Item. Stored in `tech_maintenance_log` with `itemId`, `date`, `description`, `cost`, `provider`, `notes`. Multiple log entries per item.

**Category** (Tech Gear):
A fixed enum on Tech Items: `laptops`, `phones`, `tablets`, `headphones-audio`, `cameras`, `wearables`, `monitors`, `keyboards`, `mice`, `networking`, `smart-home`, `gaming`, `storage`, `components`, `cables-adapters`, `software-licenses`, `accessories`, `other`. Validated by Zod, not a database enum.

**Ownership Status**:
A fixed enum on Tech Items: `owned`, `sold`, `lost`, `loaned-out`, `borrowed`. Default `owned`.

**Condition** (Tech Gear):
A fixed enum on Tech Items: `new`, `excellent`, `good`, `fair`, `broken`, `repairing`. Default `good`.

**Tag** (Core):
A cross-entity tag managed by the core module at `src/core/tags/`. Tags are stored in `core_tags` (id, userId, name, color) and linked via `core_taggings` (tagId, entityId, entityType). Polymorphic — any plugin can tag its entities without owning its own tags table.

**Routines** (plugin):
The daily schedule, routine management, and daily planning plugin at `src/modules/routines/`. Route groups are `/routines/*` (routine management) and `/calendar` (daily planner). Feature ID is `routines`. Owns all routine data — named routines, timed activity items, daily execution tracking, ad-hoc schedule items, and analytics. Sub-routes: Calendar/Planner (`/calendar`), Dashboard (`/routines`), Details (`/routines/[id]`), Timeline (`/routines/[id]/timeline`), Analytics (`/routines/[id]/analytics`), Templates (`/routines/templates`).

**Routine**:
A named, structured daily schedule owned by a User. Contains a name, description, color, icon, and schedule configuration. Examples: "Morning Routine", "Work Routine", "Evening Routine". Every routine is scoped to a `userId`. Routines are the recurring/reusable unit; ad-hoc items are one-off.

**Routine Item**:
A single time-blocked activity. Can belong to a Routine (`routineId` set, `date` null) or be an ad-hoc item (`routineId` null, `date` set). Has `title`, `startTime` (HH:mm), optional `endTime` (HH:mm), `order`, `category` (reuses Timeline's `timeline_category` enum), `priority` (low/medium/high, nullable), optional `location`, and `isOptional`. Ad-hoc items additionally have a `date` (YYYY-MM-DD) and `status` (pending/in_progress/completed/skipped). Items can link to a Habit (`linkedHabitId`) or Task (`linkedTaskId`). Overlapping time blocks within the same day are prevented at the application level.

**Ad-hoc Item**:
A routine_item with `routineId IS NULL` and `date` set. Belongs directly to a User (via `userId` on the row) for a specific date. Does not repeat. Created via the Quick Add bar or by clicking a time slot on the calendar. Contrast with Routine Items which derive their date from the parent Routine's schedule.

**Daily Plan**:
The unified view at `/calendar` showing all items for a selected day: routine items from routines scheduled that day plus ad-hoc items with that date. Supports Grid (hourly calendar with drag-and-drop via `@dnd-kit`) and Agenda (grouped chronological list by morning/afternoon/evening) display modes. A metrics header at the top shows total planned hours, completion rate, and completed count.

**Routine Execution**:
A daily tracking record for a Routine. Created on-the-fly when the user views the calendar. Tracks `status` (pending/in_progress/completed/skipped/missed), actual start/end times, and `completionRate` (percentage of items completed). One execution per routine per day. Ad-hoc items bypass executions — their status lives directly on the routine_item row.

**Routine Execution Item**:
The per-item status within a Routine Execution. Each Routine Item gets its own `status` (pending/in_progress/completed/skipped) and optional actual start/end times. Enables granular tracking of which activities were done, skipped, or are currently active.

**Routine Template**:
A pre-defined routine blueprint in `routine_templates`. System-seeded (Morning, Student, Deep Work, Fitness, Evening). Users browse templates and clone them as their own Routines. Templates are reference data, not user-scoped.

**Schedule Type**:
An enum on Routines defining when the routine activates: `daily` (every day), `weekdays` (Mon-Fri), `weekends` (Sat-Sun), or `custom` (user-specified day array). A routine is "scheduled today" if the current day matches its schedule. Recurrence lives at the Routine level — there is no per-item recurrence. For a single recurring activity, create a single-item Routine.

**Routine Analytics**:
Computed on-read metrics for Routines. Includes completion rate over time, per-routine performance, most-missed items, best/worst days, and daily trends. No stored analytics table — all derived from `routine_executions` data. The daily calendar also shows a compact productivity header (total planned hours, completed count, completion rate) computed from both routine execution items and ad-hoc items.

*Avoid*: Overlap between Daily Planner and Timeline — Planner is future intention (what you plan to do), Timeline is past recording (what you actually did). Task status instead of routine_item status for task-linked items.

*Avoid*: Playlist (always use Collection instead for Music), Inventory Item (use Tech Item for tech, Clothing Item for wardrobe)

**Dev**: I need to add a new category to Notes. Where do I change it?
**Domain expert**: In `src/modules/notes/service.ts`. Categories are validated by Zod — add it to the `categories` const array. No migration needed since categories are text columns.
**Dev**: And tags?
**Domain expert**: Tags live in the `note_tags` table. User-defined, scoped to `userId`. Notes reference them by name via the text array column `tags`. The `note_tags` table only stores name + color for display.

**Wellness** (plugin):
The personal wellness, self-care, and grooming management plugin at `src/modules/wellness/`. Route is `/wellness`. Feature ID is `wellness`. Owns wellness-specific data — mood logs, sleep records, hydration entries, confidence check-ins, and habit enrichment for grooming/hygiene/self-care. Integrates with existing plugins rather than duplicating their functionality. Sub-routes: Overview (`/wellness`), Sleep (`/wellness/sleep`), Grooming (`/wellness/grooming`), Analytics (`/wellness/analytics`).

**Mood Log**:
A rich multi-dimensional mood check-in owned by a User. Contains 8 dimensions scored 1-10 (happiness, stress, anxiety, motivation, energy, confidence, focus, mental fatigue), plus optional notes, emoji, tags, and voice note URL. Multiple check-ins per day allowed. Stored in `wellness_mood_logs`. Distinct from Timeline's per-activity `mood` field (1-5 integer) — Timeline mood rates a specific activity; Mood Log is a holistic emotional snapshot with multiple dimensions.

**Sleep Record**:
A logged sleep session owned by a User. Contains bedtime, wake time, subjective quality (1-10), interruption count (default 0), optional sleepLatencyMinutes, optional moodAfterWaking, optional energyLevel (1-5), notes, and optional importSource for future wearable sync (null = manual). Duration is computed on read from bedtime/wake time. Multiple records per day allowed (e.g., main sleep + nap). No `type` field — a 20min record is a nap, a 7h record is main sleep; analytics infer from duration and time-of-day. The full-featured sleep dashboard lives at `/wellness/sleep`. Stored in `wellness_sleep_records`.

**Sleep Dashboard**:
The primary sleep tracking UI at `/wellness/sleep`. A multi-tab page with tabs: Dashboard (today's cards + quick log), History (timeline + calendar), Analytics (charts + statistics), Insights (rule-based observations + achievements). All data is read from `wellness_sleep_records` via the Wellness service layer. No separate plugin — sleep lives within Wellness.

**Sleep Goal**:
A user-configurable daily sleep target stored in `wellness_user_preferences.sleepGoalHours` (default 8). Goal completion percentage, remaining sleep needed, and goal streak are computed on-read. The goal is perpetual (like a Habit), not terminal (not a Goal). Sleep goals do not live in the Goals plugin.

**Sleep Streak**:
Consecutive days where the user's total sleep duration met or exceeded their sleep goal. Distinct from the Discipline System's all-or-nothing streak — Sleep Streak is domain-specific to sleep and only affects sleep achievements. Streak is computed on-read from `wellness_sleep_records`. Bonuses and badges are registered in the Gamification module, never stored in Wellness.

**Sleep Insight**:
A rule-generated observation about the user's sleep patterns, surfaced on the Sleep Dashboard. Examples: "You slept 42 minutes more than yesterday", "Your average bedtime this week is 10:35 PM", "You sleep best when you go to bed before 11 PM." Generated by the Wellness analytics service using simple aggregations — no LLM dependency in v1. LLM-powered sleep coaching deferred to v2.

*Avoid*: AI, coach, assistant (when referring to v1 rule-based insights — use "Sleep Insight" instead)

**Hydration Entry**:
A single logged drink of water owned by a User. Contains the date, amount in milliliters, and timestamp. Many entries per day — daily total is `SUM(amountMl)`. Daily hydration goals are computed at the service layer (user-set or default), not stored. Stored in `wellness_hydration_entries`.

**Confidence Check-in**:
A daily self-perception snapshot owned by a User. Contains an overall confidence score (1-10), plus optional dimension scores for self-esteem, social comfort, public speaking confidence, and appearance satisfaction. One check-in per day — overwrite, not duplicate. Stored in `wellness_confidence_checkins`.

**Wellness Habit Enrichment**:
Structured metadata attached to a Habit (from the Habits plugin) that qualifies it as a wellness/grooming/hygiene/self-care activity. Contains `wellnessType`, `subcategory`, `lastCompletedDate`, `nextDueDate`, `reminderDaysBefore`, `seasonalMonths`, `estimatedCost`, and `notes`. The next-due date is computed on read from the habit's frequency and completion history. Not stored in a user-facing table — the enrichment is internal to the Wellness plugin. Stored in `wellness_habit_enrichment`.

*Avoid*: Duplicating Habits logic — grooming schedules ARE habits with enrichment. Avoid storing recurring activity engines in Wellness — delegate to Habits.

**Wellness Score**:
A computed-on-read 0-100 metric combining 7 sub-scores: Mood, Sleep, Hydration, Grooming, Hygiene, Self-Care, Confidence. Each sub-score is normalized from raw data (e.g., average mood dimensions, sleep quality × duration factor, hydration goal attainment). The Overall Wellness Score is a weighted average: Mood 20%, Sleep 20%, Hydration 15%, Grooming 10%, Hygiene 10%, Self-Care 15%, Confidence 10%. No stored scores — all computed on read with optional caching.

**Wellness Insight**:
A rule-generated observation about the user's wellness patterns, surfaced on the dashboard. Examples: "Your sleep quality drops when bedtime exceeds midnight" or "Grooming days correlate with higher confidence." Generated by the Wellness analytics service, matching the existing Habits insight pattern. No LLM dependency in v1 — LLM-powered weekly reports deferred.

*Avoid*: AI, coach, assistant (when referring to v1 rule-based insights — use "Insight" instead)

**Discipline System**:
The flagship user-facing identity of Integrity OS, at `/discipline`. The technical module remains `src/modules/integrity/` and owns the same tables. Every user-facing term uses "Discipline" — Discipline Score, Discipline Streak, Discipline Level. The route `/integrity` permanently redirects to `/discipline`.

**Discipline Score**:
A 0–100 computed metric that extends the Integrity Score algorithm with delegated sub-scores from 7 weighted factors: Commitments (30%), Habits (15%), Tasks (15%), Sleep (10%), Exercise (10%), Journaling (10%), Goals (10%). Each external plugin exposes data through its service layer — score computations are in the Integrity service. Strengthened with a capped streak bonus (min(currentStreak × 0.5, 15)). Final clamped to [0, 100]. No stored score — computed on-read via daily snapshots cached in `integrity_daily_snapshots`.

**Discipline Streak (All-or-Nothing)**:
A stricter streak than Integrity's per-day streak. Counts consecutive days where every single commitment for that day was completed (completed_unverified or completed_verified). If any commitment is missed/failed/pending, the streak breaks. Used for the Discipline dashboard UI and score bonus calculation. Distinct from the existing Integrity Streak (any completion = counted day), which remains available for internal analytics.

**Daily Accountability Journal**:
The Integrity Daily Check-in, extended with 5 guided prompts: accomplishments, excuses, distractions, proudOf, improvement. Plus `excuseTags` (text array from predefined list: overslept, procrastinated, social-media, gaming, netflix, poor-planning, low-energy, unexpected-work, illness, family-commitment, weather, forgot, other). One entry per user per date.

**Discipline Level**:
A cosmetic/vanity title displayed on the Discipline dashboard, derived from the Discipline Score. 7 levels: Beginner (0+), Consistent (30+), Focused (50+), Disciplined (65+), Iron Mind (78+), Elite Performer (88+), Life Master (95+). Does not affect Gamification levels, XP, or other progression systems.

**Excuse Tracker**:
A predefined list of common failure reasons (`excuseTags` on the daily check-in) with aggregate reports showing the most common excuses. Reports generated from `integrity_daily_checkins.excuseTags` data.

**Discipline Milestone**:
Stored as `milestone_reached` events in the commitment event log (`integrity_commitment_events`). Fired when thresholds are hit: 7-day streak, 30-day streak, Life Master score. Metadata JSONB stores the milestone type/type/value. Powers the Discipline Timeline view.

**Discipline Snapshot**:
A daily cached row in `integrity_daily_snapshots` storing the computed score, streak, level, sub-scores (JSONB), commitment rate, and all-completed status. Computed on first dashboard visit of the day or when a commitment status changes. Enables fast dashboard loads and historical score analytics.

*Avoid*: Rebuilding a parallel commitment engine in a new plugin — extend Integrity OS instead. Avoid creating separate discipline score logic — it's the Integrity score with a broader algorithm. Avoid LLM dependency in v1 — use rule-based insights. Avoid building Focus Mode in v1 — defer to v2. Avoid duplicating Gamification challenges — seed discipline challenges in the Gamification module. Avoid creating a separate progress levels system — Discipline Levels are cosmetic titles only.

**Grooming Activity**:
A personal care routine activity tracked within Wellness at `/wellness/grooming`. Each Grooming Activity is a Habit (from the Habits plugin) enriched with grooming-specific metadata in `wellness_habit_enrichment` where `wellnessType: "grooming"`. Enrichment stores `groomingCategory`, `icon`, `color`, `preferredTime`, `estimatedDurationMinutes`, `sortOrder`, `isArchived`, and `reminderConfig` (JSONB, unused in v1). Users can add, edit, delete, archive, and reorder activities. Default activities are seeded from `GROOMING_DEFAULT_TEMPLATES` on first visit. Completions are stored as Habit completions with `metadata` (JSONB) for mood, energy, cleanliness, confidence, photo URLs, and rating.

*Avoid*: Building grooming as a standalone plugin — it enriches Habits rather than duplicating them.

**Grooming Category**:
A Zod-validated freeform text label on a Grooming Activity enrichment. Values: `hair-care`, `face-care`, `skin-care`, `dental-care`, `body-care`, `personal-hygiene`, `clothing-care`, `custom`. Not a DB enum — new categories can be added without migration. Follows the Notes category pattern.

**Grooming Frequency Type**:
An extended enum on the Habits table (`habit_frequency_type`) supporting richer scheduling beyond the base `daily`/`weekly`/`monthly`. Values: `daily`, `weekly`, `monthly`, `every_x_days`, `every_x_weeks`, `specific_weekdays`, `specific_dates`. Accompanied by `frequencyInterval` (integer for every-X patterns), `frequencyWeekdays` (integer array 0-6 for day-of-week), and `frequencyMonthDay` (integer 1-31). All habits benefit from this extension, not just grooming.

**Grooming Completion**:
A Habit Completion (from Habits plugin) for a grooming-enriched habit. Stores `metadata` JSONB with optional fields: `mood` (1-10), `energy` (1-10), `cleanliness` (1-10), `confidence` (1-10), `rating` (1-10), `photoUrls` (string array). The Wellness service's `completeGroomingActivity` creates the completion, updates the enrichment's `lastCompletedDate`/`nextDueDate`, fires a Timeline Event, and awards XP via Gamification.

**Grooming Score**:
A 0-100 sub-score within the Wellness Score computation (`computeWellnessScores`). Derived from the ratio of overdue to total grooming enrichments with `wellnessType: "grooming"`. Accessed independently on the Grooming Dashboard via the `/api/wellness/grooming/dashboard` endpoint. No separate computation — reads from the existing Wellness Score's grooming sub-component (10% weight).

**Grooming Insight**:
A rule-generated observation about the user's grooming patterns, surfaced on the Grooming Insights tab. Examples: "You've maintained grooming consistency for 7 consecutive days!", "3 grooming activities are overdue: Hair Wash, Nail Cutting". Generated by `getGroomingInsights` in the Wellness service using simple aggregations — no LLM dependency in v1. Follows the same pattern as Wellness/Network/Integrity Insights.

**Goals** (plugin):
The life goal tracking plugin at `src/modules/goals/`. Route group is `/goals/*`. Feature ID is `goals`. Owns all goal data — long-term life goals, short-term targets, milestones, and progress. Integrates with other plugins via the service layer rather than duplicating their tracking. Sub-routes: Overview (`/goals`), Active (`/goals/active`), Completed (`/goals/completed`), Templates (`/goals/templates`), Analytics (`/goals/analytics`).

**Goal**:
A one-time target with a desired outcome, owned by a User. Contains `title`, `description`, `type` (long-term/short-term), `deadline`, `progress` (0-100 integer), `status` (draft/active/completed/cancelled), and optional `category`. Progress is manually updated or computed from linked plugin data (e.g., a "Read 10 books" goal reads completions from the Habits plugin). Every goal is scoped to a `userId`.

*Avoid*: Using Goals for ongoing behavior tracking — that's what Habits are for. A Goal has a terminal state; a Habit is perpetual.

**Goal Milestone**:
A checkpoint within a Goal marking meaningful progress. Stored in `goal_milestones`. Contains `title`, `completed`, `order`, and optional `targetDate`. Examples: "Finish NestJS fundamentals" milestone within "Learn NestJS" goal. Multiple milestones per goal.

**Network** (plugin):
The personal relationships and connections plugin at `src/modules/network/`. Route group is `/network/*`. Feature ID is `network`. Owns all relationship data — connections, memories, meetups, gifts, events, and analytics. Replaces the former Network stub at `src/app/(app)/network/`. Sub-routes: Overview (`/network`), Connections (`/network/connections`), Birthdays (`/network/birthdays`), Meetups (`/network/meetups`), Trips (`/network/trips`), Memories (`/network/memories`), Gifts (`/network/gifts`), Events (`/network/events`), Timeline (`/network/timeline`), Insights (`/network/insights`).

**Connection**:
A person in the User's personal network. Owned by a User. Contains full name, nickname, profile picture URL (external URL, no upload infrastructure in v1), gender, birthday (auto-calculates age and zodiac sign), phone, email, address, country, city, occupation, social links, a text array of `relationshipTypes`, optional `notes` (plain text), and `isFavorite` (boolean). Tracks important dates — birthday, firstMetDate, friendshipAnniversary, lastMetDate, lastCallDate, lastMessageDate. Days-since-last-meetup, friendship-duration, and birthday-countdown are computed on read. Every connection is scoped to a `userId`.

**Relationship Type**:
A freeform text label on a Connection. Stored as a text array, not an enum — allows multiple types per Connection and user-defined labels. Examples: "Best Friend", "Childhood Friend", "College Friend", "Office Friend", "Relative", "Travel Buddy", "Mentor", "Other". Distinct from Timeline's `Category` enum (which has a `relationships` value for timeline event category) — different namespaces.

**Network Trip**:
A many-to-many link between a Connection and a Trip from the Travel plugin. Stored in a `network_trip_participants` junction table (connectionId, tripId). The canonical trip data lives in `travel_trips` (Travel plugin); Network never reads `travel_trips` directly — it queries through the Travel service layer. No trip data is duplicated in the Network plugin.

**Network Memory**:
A personal memory linked to one or more Connections. Stored in `network_memories` with a `network_memory_connections` junction table. Contains `title`, `description`, `photoUrls`, `videoUrls`, `audioUrl`, `quotes`, `memoryDate`, `location`, `tags`, `isFavorite`. Separate from Music Memories and Movie Memories — friendship memories are their own domain owned by the Network plugin.

**Network Meetup**:
A recorded gathering with one or more Connections. Stored in `network_meetups` with a `network_meetup_connections` junction table. Contains `title`, `date`, `location`, `photos`, `expense`, `notes`, `mood`. Multiple connections can be tagged in a single meetup. Optionally creates a Timeline Event on creation.

**Network Event**:
A notable social event (birthday party, wedding, farewell, festival, reunion, etc.). Stored in `network_events` with a `network_event_connections` junction table. Contains `eventType` (freeform), `date`, `location`, `photos`, `expense`, `notes`. Events are their own domain — not stored in the Timeline plugin. Optionally creates a Timeline Event on creation.

**Network Gift**:
A gift exchanged with a Connection. Stored in `network_gifts`. Contains `connectionId`, `direction` (given/received), `giftName`, `occasion` (freeform), `price` (nullable — only tracked for given gifts), `date`, `notes`. Single table with direction enum — no separate tables for given vs received.

**Network Insight**:
A rule-generated observation about the user's relationships, surfaced on the dashboard and Insights tab. Examples: "You haven't met Rahul for 95 days", "3 birthdays are coming this month", "Your longest friendship is 12 years." Generated by the Network analytics service using simple aggregations — no LLM dependency in v1. Follows the same pattern as Wellness Insights.

**Books** (plugin):
The writing, publishing, reading, and library management plugin at `src/modules/books/`. Route group is `/creator-studio/books/*`. Feature ID is `books`. Mounted inside the Creator Studio shell alongside Articles, Blog Posts, and Vlog Scripts. Owns all book-writing data — authored books, parts, chapters, versions, collaboration, publishing, and reading-progress. Separate from the Reading plugin (which tracks consumption of third-party content). Sub-routes: Library (`/creator-studio/books`), Book detail (`/creator-studio/books/[id]`), Writing editor (`/creator-studio/books/[id]/write`), Reading mode (`/creator-studio/books/[id]/read`), Settings (`/creator-studio/books/[id]/settings`), New book (`/creator-studio/books/new`).

**Book**:
A written work owned by a User. Contains title, subtitle, description, author byline, co-authors, language, ISBN, genre, tags, keywords, cover URL, banner image URL, copyright, license, publisher, edition, series, reading level, age rating. Has a `status` of `draft`, `published`, or `archived`, plus an `isListed` boolean (controls discoverability), and optional `publishAt` date for scheduling. Every book is scoped to a `userId`. Authorship is derived (any user who has published a book is an author).

**Book Part**:
An optional grouping layer for Book Chapters. Stored in `book_parts`. A Part has a title and order. A book can have zero or more parts. Chapters below a part belong to that part via `partId`. Drag-dropping a part reorders all its child chapters.

**Book Chapter**:
A single named section of a Book. Stored in `book_chapters`. Contains a title, content (ProseMirror JSON — Tiptap's native rich-document format), order, word count, and optional `aiMeta` JSONB column for future AI features. Supports per-chapter operations: drag-drop reorder, duplicate, merge, split. Content is the canonical source — sections are h1/h2/h3 headings within chapter content, pages are computed at render time.

**Book Version**:
A snapshot-based version of a Book Chapter. Stored in `book_versions`. Created by debounced autosave. Stores the full ProseMirror JSON content + word count. Diffing between versions is computed on read. No per-character granularity — this is not Yjs/OT.

**Book Collaborator**:
A user invited to collaborate on a Book. Stored in `book_collaborators` with a role: `owner`, `editor`, `commenter`, or `viewer`. Owner is the book creator. Editors can edit content. Commenters can add comments. Viewers can read. Collaboration v1 is snapshot-based (last-writer-wins with conflict notification), not real-time OT/live cursors.

**Book Comment**:
A threaded annotation anchored to a ProseMirror document position within a Chapter. Stored in `book_comments`. Contains text, the user who wrote it, and a path into the ProseMirror JSON node tree.

**Book Reading Progress**:
A tracking record of where a user left off in a Book. Stored in `book_reading_progress`. Contains current chapter ID, scroll position, percentage complete, and last-updated timestamp. One row per book per user. Powers the "Resume reading" feature.

**Bookmark**:
A saved position within a Book for quick navigation. Stored in `book_bookmarks`. Contains chapter ID, ProseMirror position path, excerpt text, optional label, and color.

**Book Highlight**:
A colored text selection within a Book Chapter. Stored in `book_highlights`. Anchored to a ProseMirror document position (not a page number), enabling highlights to stay anchored when content changes. Supports multiple colors. Separate from the Reading plugin's annotations, which are for third-party content.

**Countdown** (plugin):
The personal event countdown plugin at `src/modules/countdown/`. Route group is `/countdown/*`. Feature ID is `countdown`. Owns all countdown data — events, checklists, attachments, reminders, memories. Provides a focused anticipation experience for future events (movie releases, football matches, concerts, vacations, weddings, product launches, etc.). Distinct from the Timeline plugin which records life events and daily activities — Countdown is specifically about the build-up phase (creation to event date) and post-event closure.

**Countdown Event**:
A future-dated event the User is anticipating, owned by a User. Contains `title`, `description`, `category` (see Countdown Category), `eventDate`, `eventTime`, `timezone`, `location`, `organizer`, `coverImage`, `bannerImage`, `color`, `icon`, `notes` (Markdown), `isFavorited`, `isArchived`, `recurrence` (none/yearly), `status` (pending/completed/archived), `createdAt`, `eventDate`. Progress is computed on-read as percentage from `createdAt` to `eventDate`. Every countdown is scoped to a `userId`. Optionally creates a Timeline Event via the Timeline service layer upon creation for cross-plugin visibility. For yearly recurrence, the target date is computed on-read (no instance rows), matching the Timeline plugin's pattern.

**Countdown Category**:
A fixed enum on Countdown Events: `football`, `movies`, `concerts`, `travel`, `retreats`, `birthdays`, `weddings`, `festivals`, `exams`, `meetings`, `product-launches`, `holidays`, `personal`, `custom`. Own enum — distinct from Timeline's `Category` enum which is lifecycle-oriented. Each category has a default icon and accent color.

**Countdown Checklist**:
A task list within a Countdown Event for preparation tracking. Stored in `countdown_checklist_items` with `eventId`, `text`, `isCompleted`, `order`. Completion percentage is computed on-read per event.

**Countdown Reminder**:
A notification trigger tied to a Countdown Event. Stored in `countdown_reminders` with `eventId`, `reminderAt` (computed offset from `eventDate`), `offset` (e.g. `1d`, `3h`, `30m`), `isSent`. Reminders fire at the computed time via the local notification system. No push notification infrastructure in v1 — uses browser/local notifications.

**Countdown Memory**:
A post-event reflection stored after the countdown reaches zero. Contains `photos` (URLs), `reflection`, `rating` (1-10), `archived` (boolean). Created after the event date passes.

*Avoid*: Confusing Countdown with Timeline events. A Countdown is about building anticipation with live timers, checklists, and reminders; a Timeline Event is a record of "something happened or will happen." They complement each other — a football match can be both a Countdown and a Timeline Event.

**Reading** (plugin):
The consumption-tracking plugin at `src/modules/reading/`. Route group is `/reading/*`. Feature ID is `reading`. Owns reading-list management — reading items (books, articles, PDFs, research papers), annotations, notes, sessions, and dashboard stats. Tracks what the user reads, progress, and time spent. The reading-item schema tracks consumption (status, currentPage, startDate, endDate, rating, review). Does not handle authored/collaborative writing — that is the Books plugin's domain. Cross-plugin: the Books plugin's Library can query Reading's service layer to display "books you're reading" alongside "books you've written." Sub-routes: Dashboard (`/reading`), Items (`/reading/library` — note the route is `/reading` not `/books`).

**Feedback** (plugin):
The user feedback collection plugin at `src/modules/feedback/`. Route is `/feedback`. Feature ID is `feedback`. Owns all user-submitted feedback — general comments, bug reports, feature ideas, praise, complaints. Provides a simple submission form in the Settings section and an admin-style list view for the app owner. One submission per User action — no editing, no deleting. Every entry is scoped to a `userId` for abuse prevention, with an optional `isAnonymous` flag controlling display.

**Feedback Entry**:
A single user feedback submission owned by a User. Contains `category` (bug/feature/idea/complaint/praise/general), `message` (free text), `isAnonymous` (boolean, default false), `pageUrl` (auto-captured path), optional `userAgent`, and `readAt` (nullable timestamp for triage). No editing — submitted as-is. Stored in `feedback_entries`.

**Integrity OS** (plugin):
The personal integrity & accountability tracking plugin at `src/modules/integrity/`. Route is `/integrity`. Feature ID is `integrity`. Owns all integrity data — commitments, integrity score, promise ratio, accountability timeline, evidence, daily integrity check-ins, promise reviews, and analytics. Sub-routes: Dashboard (`/integrity`), Review (`/integrity/review`), Timeline (`/integrity/timeline`), Analytics (`/integrity/analytics`). Does NOT own gamification (XP, levels, achievements, badges) — those are delegated to the cross-plugin Gamification module at `src/modules/gamification/`.

**Commitment**:
A promise an entity makes to themselves, tracked by Integrity OS. Commitments can wrap existing entities (Tasks, Goals, Habits via `linkedEntityType` + `linkedEntityId`) or be standalone promises created directly in Integrity OS. Every commitment is scoped to a `userId`. The canonical entity name is "Commitment"; "Promise" is reserved for achievement/badge names and friendly UI copy only.

**Integrity Score**:
A 0–100 computed metric unique to Integrity OS that measures how well the User honors their Commitments. Computed on-read from commitment completions, misses, failures, streaks, difficulty multipliers, and reliability trend. Updated in real time. Distinct from the Gamification module's `consistencyScore` — Integrity Score is domain-specific to commitment-keeping. Penalties scale by difficulty (easy × 0.5, hard × 1.5, extreme × 2.0). Streaks provide a capped bonus. The final score is clamped to 0–100.

**Gamification (cross-plugin)**:
The shared XP, level, achievement, badge, and challenge system at `src/modules/gamification/`. Integrity OS extends this system by registering new event types (`commitment_completed`, `commitment_streak_bonus`, `integrity_milestone`, etc.) and seeding integrity-themed achievements/badges. Integrity OS calls `awardXp()` from the Gamification service; it never builds its own parallel gamification engine.

**Commitment Status**:
A fixed set of states on a Commitment: `pending`, `in_progress`, `completed_unverified`, `completed_verified`, `failed`, `missed`, `cancelled`. Cancelled requires a `cancellationReason` text field. Completed verdicts (verify vs unverified) depend on whether evidence was required and provided. Missed = deadline passed with no action. Failed = actively attempted but could not complete.

**Daily Integrity Check-In**:
A lightweight daily reflection stored in `integrity_daily_checkins`. Contains `date` (one per day), optional free-text fields for blockers, improvement notes, and a summary reflection. Distinct from commitment activity — the check-in captures the user's own narrative about their integrity that day, while commitment status changes are tracked on the commitment rows themselves.

**Evidence** (Integrity OS):
Attachments proving a Commitment was honored. v1 supports only text-based evidence: URLs, completion notes, and optional GPS location (inline text). No file uploads in v1. v2 adds image uploads via Supabase Storage. Evidence is optional per commitment unless `evidenceRequired` is set, in which case completion transitions to `completed_verified` only after evidence is provided.

**Commitment Linking**:
A linking pattern for Commitments that wrap existing entities (Tasks, Goals, Habits). The commitment stores `linkedEntityType` + `linkedEntityId`. Integrity OS reads the source entity's status through its service layer. Completing the source entity auto-transitions the linked commitment to `completed_unverified`. The user can separately visit Integrity OS to add evidence, upgrading to `completed_verified`. Deleting the linked entity transitions the commitment to `cancelled`.

**Commitment Event Log**:
An append-only log of all state transitions and user actions on a Commitment, stored in `integrity_commitment_events`. One row per event (created, started, evidence_uploaded, completed, failed, missed, cancelled, reminder_sent). Powers the Accountability Timeline view and feeds Integrity Score trend calculations. Each event has a `commitmentId`, `eventType`, optional `metadata` (JSONB), and `timestamp`.

**Integrity Insight**:
A rule-generated observation about the user's integrity patterns, surfaced on the dashboard. Examples: "You keep 95% of your morning commitments", "Fridays have the highest failure rate", "You're improving by 12% compared to last month." Generated by the Integrity analytics service using simple aggregations — no LLM dependency in v1. Follows the same pattern as Habits plugin insights.

**Commitment Field Model**:
Stored on `integrity_commitments`: `title`, `description`, `category`, `priority`, `difficulty`, `estimatedTime`, `dueDate`, `dueTime`, `startDate`, `tags` (text[]), `color`, `icon`, `evidenceRequired` (boolean), `location`, `repeatRule` (none/daily/weekly/monthly), `reminderMinutesBefore` (stored but unused in v1), `status` (state machine). Computed on-read: current streak, longest streak, completion percentage, completion time. Visibility/public/team dropped for v1 — single-user only.

**Career OS** (plugin):
The professional career management plugin at `src/modules/career/`. Route group is `/career/*`. Feature ID is `career`. Owns career-domain tables — resumes, job applications, interview prep, salary history, certifications, portfolio projects, achievement vault. Delegates overlapping concerns to existing plugins via their service layers: career goals to Goals (with `category: "career"`), learning & skill tracking to Knowledge Vault (extending its schema with `targetLevel` and `projects`), career journal entries to Journal, career timeline events to Timeline, professional contacts to Network (extending Connection schema with career-specific fields). Sub-routes: Dashboard (`/career`), Goals (`/career/goals`), Skills (`/career/skills`), Resumes (`/career/resumes`), Applications (`/career/applications`), Interviews (`/career/interviews`), Certifications (`/career/certifications`), Portfolio (`/career/portfolio`), Achievements (`/career/achievements`), Networking (`/career/networking`), Learning (`/career/learning`), Journal (`/career/journal`), Salary (`/career/salary`), Timeline (`/career/timeline`), Analytics (`/career/analytics`).

**Job Application**:
A career opportunity tracked by the user within Career OS. Owned by a User. Contains company, position, location, salary range, recruiter info, job description URL, application date, interview dates, notes, documents, and a status that moves through a Kanban board: wishlist → saved → applied → assessment → interview → technical_interview → final_interview → offer → negotiation → accepted | rejected. Every application is scoped to a `userId`.

**Resume**:
A versioned resume document owned by a User. Stored in `career_resumes` with content as rich text (Tiptap ProseMirror JSON). Supports version history snapshots, PDF/DOCX export, ATS scoring metadata, and multiple named variants (e.g. "Backend Resume", "PM Resume"). Every resume is scoped to a `userId`.

**Career Certification**:
A professional credential owned by a User. Contains certification name, issuing organization, credential ID, issue date, expiry date, verification URL, PDF certificate URL, skills covered, and status. Expiry reminders computed on read. Every certification is scoped to a `userId`.

**Portfolio Project**:
A professional project owned by a User. Contains name, description, technologies used, GitHub URL, live demo URL, screenshots, role, team size, timeline, achievements, and lessons learned. Every project is scoped to a `userId`.

**Career Achievement**:
A notable professional accomplishment owned by a User. Categories: promotion, award, certification, scholarship, research_paper, open_source, speaking_event, competition, patent, publication. Supports images, PDFs, and links. Every achievement is scoped to a `userId`.

**Salary Record**:
A historical earnings entry owned by a User. Contains base salary, bonus, stocks, incentives, currency, effective date, and optional promotion/role context. Visualized as a growth chart over time. Every record is scoped to a `userId`.

**Interview Prep**:
A study item within Career OS's interview preparation workspace. Owned by a User. Can be HR question, technical question, DSA problem, system design topic, behavioral question, or STAR story. Tracks completion status, revision count, confidence level (1-5), and notes. Every item is scoped to a `userId`.

**Career Profile**:
A user's canonical professional identity, stored in a single-row `career_profile` table per user. Contains current position, company, years of experience, career level, target role, dream company, and bio. Not derived from applications or resumes — curated directly by the user. Every profile is scoped to a `userId`.

**Career Insight**:
A computed-on-read observation about the user's career patterns, surfaced on the dashboard. Examples: "Your interview success rate is 75%", "You've spent 120 hours learning this quarter", "3 certifications expiring next month." Generated by the Career analytics service using simple aggregations — no LLM dependency in v1. Follows the same pattern as Wellness/Network Insights.

**Loans** (plugin):
The personal lending & borrowing tracking plugin at `src/modules/loans/`. Route group is `/finance/loans/*`. Feature ID is `loans`. Owns all loan data — loans, repayments, loan events, and loan-specific analytics. Builds on the Expenses plugin for financial account transactions and the Network plugin for counterparty connections. Sub-routes: Dashboard (`/finance/loans`), Loans List (`/finance/loans/list`), Loan Detail (`/finance/loans/[id]`), Person Profile (`/finance/loans/people/[id]`), Analytics (`/finance/loans/analytics`), Reports (`/finance/loans/reports`).

**Loan**:
A tracked lending or borrowing relationship between a User and a Connection from the Network plugin. Has a `direction` (lent/borrowed), `principalAmount`, optional `interestRate`/`interestType`, `totalPayable` (principal + interest, computed at creation), `loanDate`, `dueDate`, `status` (active/partially_paid/fully_paid/cancelled/disputed), optional `installmentCount`/`installmentAmount`/`installmentFrequency` for structured plans, optional `linkedEntityType`/`linkedEntityId` for cross-plugin linking, and `isPinned`/`archivedAt` for list management. Soft-deleted via `deletedAt`. Counterparty data lives in the Network plugin's `connections` table, never duplicated. Every loan is scoped to a `userId`.

*Avoid*: Debt (prefer Loan — debt implies borrower perspective only, Loan handles both lender and borrower), Person/Counterparty (use Network Connection), Category (loans use Core Tags, not category enums)

**Loan Disbursement**:
An Expense transaction created in the Expenses plugin when money is lent. Uses the dedicated transaction type `loan_disbursement`, created against the user-selected Financial Account. Account balances reflect the real outflow, but the Expenses dashboard excludes `loan_disbursement` transactions from monthly spending reports. Every disbursement is linked to its Loan via `linkedEntityId`/`linkedEntityType` on the transaction.

**Loan Repayment**:
An Income transaction created in the Expenses plugin when money is repaid. Uses the dedicated transaction type `loan_repayment`, created against the user-selected Financial Account. Follows the same pattern as Loan Disbursement — affects balances but excluded from income reports. A Repayment also creates a record in `loan_repayments` for loan-specific tracking (installment number, payment method, receipt URL).

**Loan Repayment** (loan tracking record):
A record in `loan_repayments` of a payment made toward or received on a Loan. Contains amount, date, optional paymentMethod, notes, receiptUrl, and installmentNumber (null for open repayments). Paid amount is SUM(repayments); remaining amount is totalPayable - SUM(repayments); completion percentage is computed on-read.

**Loan Installment**:
An optional structured repayment plan on a Loan. When `installmentCount` and `installmentAmount` are set on a loan, each repayment maps to an installment slot by `installmentNumber`. Overdue detection checks per-installment due dates (derived from `loanDate` + installment frequency). Installments are NOT a separate table — tracked via `installmentNumber` on the repayment record.

**Loan Event**:
An append-only log entry in `loan_events` recording every action on a Loan. Event types: created, updated, repayment_added, status_changed, attachment_uploaded, reminder_sent, loan_closed. Stores structured metadata (before/after values) as JSONB. Powers the loan timeline view. Additionally, a lightweight Timeline Event is created for cross-plugin discoverability on the global timeline feed. Follows the same pattern as Integrity OS's `integrity_commitment_events`.

**Loans Dashboard**:
The primary view at `/finance/loans` showing loan-specific summary cards: Total Lent, Total Borrowed, Outstanding to Receive, Outstanding to Pay, Active Loans, Closed Loans, Overdue Loans, Net Personal Balance (total lent - total borrowed). Charts for lending vs borrowing, monthly trends, outstanding balance, repayment progress. Separate from the Expenses dashboard — each plugin owns its dashboard with no metric duplication.

**Loan Overdue**:
A computed-on-read status derived from `dueDate < now() AND status IN ('active', 'partially_paid')`. Never stored as a separate status. Displayed as a badge/flag on loan cards and in the dashboard. No cron job or manual toggle needed.

**Loan Reliability Score**:
A private 0-100 metric computed on-read per Connection, derived from their repayment behavior. Formula: `(% of repayments on time + % of loans fully repaid) / 2`, weighted by recency. Never stored — computed on-demand from loan and repayment data. Visible only to the User on the person profile page.

**Loan-to-Expense Transaction**:
An auto-created transaction in the Expenses plugin when a loan is disbursed or repaid. Directed by the user's selected Financial Account. Uses transaction types `loan_disbursement` (for lent money) and `loan_repayment` (for borrowed/repaid money). Both types are excluded from the Expenses dashboard's monthly spending/income calculations but do affect account balances. The transaction is bidirectionally linked to the loan via `linkedEntityId`/`linkedEntityType`.

**Loan Attachment**:
An external URL (not a file upload) attached to a Loan or Repayment. Stored as `text[]` columns (`attachments` on loans, `receiptUrl` on repayments). Users paste links to receipts, loan agreements, screenshots, or voice notes hosted externally (Google Drive, Dropbox, etc.). No file upload infrastructure in v1 — matches the existing pattern across Tech Gear, Network, and Integrity plugins.

*Avoid*: Upload, File Upload, Storage (in v1 — defer to cross-app file upload infrastructure)

**Curb** (plugin):
The personal bad habits reduction tracker at `src/modules/curb/`. Route group is `/curb/*`. Feature ID is `curb`. Owns all reduction-tracking data — habits being curbed, increment logs, categories, triggers, moods, target limits, clean streaks, and analytics. Distinct from the Habits plugin which tracks positive behaviors to increase. Curb is about awareness and gradual reduction of unwanted behaviors. Sub-routes: Dashboard (`/curb`), Habits (`/curb/habits`), Calendar (`/curb/calendar`), Timeline (`/curb/timeline`), Analytics (`/curb/analytics`), Insights (`/curb/insights`). Tab layout uses the Habits-style query-param pattern (`?tab=`).

**Curb Habit**:
A personal unwanted behavior the User wants to reduce. Contains `name`, `icon`, `categoryId`, `limitType` (daily/weekly/monthly/zero), `limitValue` (integer ceiling), `color`, `sortOrder`, and `isArchived`. Every curb habit is scoped to a `userId`. Distinct from a Habit (positive behavior to increase) — Curb Habits track reduction, not accumulation.

**Curb Log**:
A single occurrence of a Curb Habit. Created with a single tap of the "+" button. Contains `habitId`, `loggedAt` (timestamp), optional `trigger`, optional `mood`, optional `note`. Today's count per habit is computed as `COUNT(*) WHERE date = today`. The timeline view, trigger analytics, and mood correlations all derive from log-level data. Each log is scoped to a `userId`.

**Curb Category**:
A user-defined or system-seeded organizing label for Curb Habits. System defaults: Digital, Health, Productivity, Mental, Personal. Users can create custom categories. Stored as a separate `curb_categories` table (id, userId, name, icon, color, sortOrder). Not a DB enum — new categories can be added without migration. Follows the Grooming Category pattern.

**Curb Target Limit**:
A per-habit ceiling on occurrences. Each Curb Habit has a single `limitType` (daily/weekly/monthly/zero) and `limitValue` (integer). Exceeded state is computed on-read by comparing today's count (or weekly/monthly aggregate) against the limit. Exceeded triggers a red status indicator and may create a Timeline Event.

**Curb Clean Streak**:
Consecutive days with **zero** occurrences of a specific Curb Habit. Used for zero-target habits (e.g., Porn, Gambling). Computed on-read from log data.

**Curb Target Streak**:
Consecutive days where occurrences of a Curb Habit are ≤ its target limit. For limit-based habits (e.g., ≤3 cigarettes/day). More forgiving than Clean Streak. Computed on-read.

**Curb Risk Score**:
A 0–100 computed metric for the current day. Formula: `min(100, todayRatio × 40 + exceededCount × 30 + streakBreaks × 30)`, where `todayRatio` = today's total count / 30-day average, `exceededCount` = number of habits exceeding their target, `streakBreaks` = number of clean/target streaks broken today. Higher = worse. Computed on-read.

**Curb Recovery Progress**:
A per-habit 0–100% metric showing reduction over time. Formula: `max(0, (prev30dayAvg - current7dayAvg) / prev30dayAvg × 100)`. Overall recovery is the average across all active habits. Computed on-read.

**Curb Trigger**:
A freeform text label optionally attached to a Curb Log. System-seeded suggestions: Stress, Boredom, Anxiety, Friends, After Work, Late Night, Morning, Study Break, Social Event. Users can type custom triggers. Analytics aggregates by exact string match.

**Curb Mood**:
A freeform text label optionally attached to a Curb Log. System-seeded suggestions: Happy, Sad, Stress, Tired, Excited, Lonely, Bored, Angry. Users can type custom moods. Always optional per log — tap and go, no prompt.

**Curb Insight**:
A rule-generated observation about the user's curb patterns, surfaced on the Insights tab. Examples: "You use Social Media mostly between 9 PM and 11 PM", "Most junk food happens on weekends", "Stress is responsible for 65% of smoking logs." Generated by the Curb analytics service using simple aggregations — no LLM dependency in v1. Follows the same pattern as Habits/Wellness/Network Insights.

*Avoid*: Bad Habit (use Curb Habit instead — the term "bad" carries shame; "Curb" is neutral and action-oriented)

**Time Audit** (plugin):
The personal time tracking and productivity analytics plugin at `src/modules/time-audit/`. Route group is `/time-audit/*`. Feature ID is `time_audit`. Owns all time tracking data — time entries, categories, active timers, time budgets, and analytics. Designed for deterministic, non-AI computation. Sub-routes: Dashboard (`/time-audit` with tabs: Overview, Timeline, Categories, Projects, Budgets), Reports (`/time-audit/reports`). Tab layout uses the URL-path pattern with Mantine Tabs.

**Time Entry**:
A recorded time session owned by a User. Contains `title`, `description`, `categoryId` (FK to `time_categories`), `projectId` (references `task_projects` from the Tasks plugin), `tags` (text array), `startTime`, `endTime`, computed `durationMinutes`, `isBillable` (boolean), `notes`, and optional `timelineEventId` (FK to auto-created Timeline event). Created manually or via a timer. Soft-deleted via `deletedAt`. When created, auto-creates a corresponding Timeline Event with `linkedEntityType: 'time_audit'`. Every entry is scoped to a `userId`.

**Time Category**:
A user-defined organizing label for Time Entries, stored in `time_categories`. Contains `name`, `icon`, `color`, `sortOrder`, and `isArchived`. System-seeded with defaults (Work, Deep Work, Learning, Reading, Writing, Exercise, Meetings, Planning, Personal, Entertainment, Gaming, Family, Sleep, Break, Other). Users can create, edit, reorder, and archive categories. Not a DB enum — Zod-validated text. Follows the Curb Category pattern.

**Active Timer**:
A single running timer per User, stored in `time_active_timer`. One row per user (userId PK). Tracks `entryId` (the time_entry being built), `startTime`, and `elapsedBeforePause` (accumulated seconds from prior resume/pause cycles). Created when user starts a timer, updated on pause/resume, deleted when timer is stopped and the time entry is finalized. Timer state survives page refresh and cross-device usage.

**Time Budget**:
A per-category weekly or monthly target for tracked time, stored in `time_budgets`. Contains `categoryId`, `period` (weekly/monthly), and `targetMinutes`. Progress is computed on-read against `time_entries` for the current period. Budgets auto-reset at period boundaries. Categories exceeding or falling below targets are highlighted in the dashboard.

**Time Audit Dashboard Widget**:
A metric card on the Time Audit Overview tab. Default set: Time Tracked Today, Weekly Hours, Monthly Hours, Active Timer, Recent Sessions, Category Breakdown, Weekly Trend, Tracking Streak, Time Budget Progress, Top Categories, Top Projects. Static grid layout (no drag/resize in v1). Widget visibility is persisted per user via `time_user_preferences`.

**Time Audit Comparison**:
Inline percentage-change indicators on dashboard metric cards comparing the current period to the previous period (this week vs last week, this month vs last month). No dedicated comparison page or tab. Always computed on-read.

**Time Audit Streak**:
Consecutive days where at least one time entry was logged. Computed on-read using the Habits plugin's `calculateStreak` utility. No separate table. Powers the Tracking Streak widget and Productivity Statistics.

**Time Audit Productivity Statistics**:
Computed-on-read metrics: Average Daily Hours, Average Weekly Hours, Average Monthly Hours, Average Session Duration, Total Sessions, Consecutive Tracking Days, Longest Tracking Streak. All derived from `time_entries` data.

**Time Audit Weekly Summary**:
A computed-on-read summary card pinned at the top of the Overview dashboard tab. Shows current week's Total Hours, Session Count, Most Used Category, Most Worked Project, Longest Session, Average Daily Hours, and top categories by time allocation. Always displays the current week (Mon-Sun).

**Time Audit Report**:
A CSV export of time entries filtered by date range. Accessed via the `/time-audit/reports` page. Supports daily, weekly, monthly, and custom date range exports. PDF and Excel deferred to v2.

*Avoid*: AI, ML, prediction, recommendation (when referring to v1 deterministic analytics — no AI features in v1 AI features deferred to v2)

**Strategy** (plugin):
The personal operating manual module at `src/modules/strategy/`. Route is `/strategy`. Feature ID is `strategy`. Owns a user's personal handbook — how they think, work, make decisions, and live. Built as an expansion of the existing Strategy skeleton which previously had stub tabs for Vision, Decisions, and Principles. Sub-routes: Single page at `/strategy` with tab-driven sections. All data is user-scoped.

*Avoid*: Personal Operating Manual (the user-facing product name is "Operating Manual" or "Manual"; "Strategy" is the internal module name)

**Operating Manual**:
The user-facing name for the Strategy plugin. A living document where the user documents their personal framework — values, principles, rules, vision, boundaries, energy patterns, work style. Displayed as "Operating Manual" in navigation and UI but served by the `strategy` module internally.

**Manual Section**:
A named, typed block of content within the Operating Manual. Stored in `strategy_sections` with a polymorphic model — all sections share one table, differentiated by `sectionType`, with typed content stored as JSONB. Section types: `about_me`, `core_values`, `life_principles`, `strengths`, `weaknesses`, `long_term_vision`, `rules`, `boundaries`, `energy_patterns`, `work_style`, `reflection_notes`, `review_schedule`. Each section is validatable by a section-type-specific Zod schema.

**About Me**:
A single-row section type on the Operating Manual containing the user's identity: full name, personal mission, life motto, biography, current focus, and personal identity statement. One row per user.

**Core Value**:
A multi-row section within the Operating Manual. Each value has a name, description, why-it-matters text, real-life examples, and a sort order for drag-reordering by importance. Examples: Integrity, Growth, Learning, Family, Freedom, Discipline.

**Life Principle**:
A multi-row section within the Operating Manual. Each principle supports rich text content, categorization, a pin flag, and a sort order. Examples: "Always finish what you start", "Prioritize health before work."

**Strength**:
A multi-row section within the Operating Manual. Each strength has a title, description, real-life examples, and a strategy for using it more effectively.

**Weakness**:
A multi-row section within the Operating Manual. Each weakness has a title, description, triggers, and an improvement strategy.

**Long-Term Vision**:
A section within the Operating Manual containing 8 fixed sub-sections: Career, Health, Finance, Relationships, Learning, Lifestyle, Personal Growth, Legacy. Each sub-section is rich text with optional images.

**Rule**:
A multi-row section within the Operating Manual. A single unified concept covering both behavioral rules and decision-making rules, discriminated by `category`: `decision`, `behavior`, `boundary`, `ritual`. Each rule has priority, examples, and notes.

*Avoid*: Personal Rules (use Rule with category instead); Decision-Making Rules (use Rule with category `decision`)

**Boundary**:
A section within the Operating Manual with 3 fixed categories: Work (working hours, communication rules, availability), Personal (privacy, family time, rest time), Digital (social media limits, phone usage, notification rules).

**Energy Pattern**:
A multi-row section within the Operating Manual covering both energy-increasing and energy-decreasing activities, discriminated by `impact`: `booster` or `drain`. Each pattern has a description, rating (1-10), frequency, and notes.

*Avoid*: Energy Booster / Energy Drain (merge both into Energy Pattern)

**Work Style**:
A single-row section within the Operating Manual containing structured preference fields: best working hours, deep work duration, preferred meeting length, communication style, learning style, planning style, focus environment, collaboration preference, remote/office preference. Includes free-form notes.

**Reflection Note**:
A multi-row section within the Operating Manual for ongoing personal reflections. Supports rich text, markdown, images, and attachments. Less structured than Journal entries — these are cumulative notes on the user's self-understanding journey.

**Manual Version**:
A snapshot of the entire Operating Manual JSON document at a point in time. Stored in `strategy_versions`. Created on significant edits. Supports restoring any previous version.
