# Life OS

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
A life event with a date. Can be past (birth, started career) or future (vacation, deadline). Past/future is computed from `eventDate`, never stored. Every event is scoped to a `userId`.

**Category**:
A fixed enum on timeline events: `personal`, `career`, `education`, `health`, `finance`, `travel`, `relationships`, `business`, `entertainment`, `custom`.

**Importance**:
A fixed enum on timeline events: `critical`, `high`, `medium`, `low`.

**Recurrence**:
A fixed enum on timeline events: `none`, `daily`, `weekly`, `monthly`, `yearly`. Defines how the event repeats after its initial `eventDate`. For past events with recurring, the "next occurrence" is computed on-the-fly by adding the recurrence period from `eventDate` until a future date is reached. No instance rows are stored.

**Life Timeline** (aka "Timeline"):
The plugin at `src/modules/timeline/`. Database table is `timeline_events`. Route is `/timeline`. Feature ID is `timeline`. This is the user-facing name "Life Timeline" internally shortened to `timeline`.

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

## Example dialogue

**Dev**: I need to add a priority field to Tasks. Where's the schema?
**Domain expert**: In `src/modules/tasks/schema.ts`. Tasks Plugin owns its tables.
**Dev**: And if Habits needs to reference task priorities for the focus mode feature?
**Domain expert**: Habits queries Tasks through the Tasks service layer, never directly. Tasks exposes a `getTaskPriority(taskId)` method.
**Dev**: What if I need to add a new Plugin?
**Domain expert**: Create a directory in `src/modules/`, register your routes with the core, and own your schema. Done.
