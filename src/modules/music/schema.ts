import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  boolean,
  pgEnum,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

// ─── Reference data (populated from MusicBrainz + enriched by Spotify, no userId) ─

export const musicArtists = pgTable("music_artists", {
  id: uuid("id").defaultRandom().primaryKey(),
  musicBrainzId: text("music_brainz_id").unique(),
  name: text("name").notNull(),
  country: text("country"),
  type: text("type"), // "person", "group", "orchestra", "choir", etc.
  genres: text("genres").array().default([]).notNull(),
  imageUrl: text("image_url"),
  // Spotify enrichment
  spotifyId: text("spotify_id").unique(),
  spotifyPopularity: integer("spotify_popularity"), // 0–100
  // Metadata
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const musicAlbums = pgTable(
  "music_albums",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    musicBrainzId: text("music_brainz_id").unique(),
    artistId: uuid("artist_id")
      .references(() => musicArtists.id)
      .notNull(),
    title: text("title").notNull(),
    releaseDate: timestamp("release_date", { withTimezone: true }),
    coverArtUrl: text("cover_art_url"),
    totalTracks: integer("total_tracks"),
    // Spotify enrichment
    spotifyId: text("spotify_id").unique(),
    spotifyPopularity: integer("spotify_popularity"),
    label: text("label"),
    // Metadata
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_music_albums_artist").on(table.artistId),
  ],
);

export const musicTracks = pgTable(
  "music_tracks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    musicBrainzId: text("music_brainz_id").unique(),
    albumId: uuid("album_id").references(() => musicAlbums.id),
    artistId: uuid("artist_id")
      .references(() => musicArtists.id)
      .notNull(),
    title: text("title").notNull(),
    duration: integer("duration"), // seconds
    trackNumber: integer("track_number"),
    isrc: text("isrc"), // International Standard Recording Code
    // Spotify enrichment
    spotifyUri: text("spotify_uri"), // spotify:track:xxx
    spotifyId: text("spotify_id").unique(),
    spotifyPopularity: integer("spotify_popularity"),
    explicit: boolean("explicit").default(false),
    previewUrl: text("preview_url"),
    // Metadata
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_music_tracks_album").on(table.albumId),
    index("idx_music_tracks_artist").on(table.artistId),
  ],
);

// ─── User data (scoped to userId) ────────────────────────────────

export const musicListeningHistory = pgTable(
  "music_listening_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    trackId: uuid("track_id").references(() => musicTracks.id),
    artistName: text("artist_name"), // free-form fallback
    trackName: text("track_name"), // free-form fallback
    listenedAt: timestamp("listened_at", { withTimezone: true }).defaultNow().notNull(),
    duration: integer("duration"), // seconds listened
    msPlayed: integer("ms_played"), // milliseconds played (from Spotify)
    spotifyPlayId: text("spotify_play_id"), // Spotify play context ID
    sessionId: uuid("session_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_music_listening_track").on(table.trackId),
  ],
);

export const musicJournal = pgTable("music_journal", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  trackId: uuid("track_id").references(() => musicTracks.id),
  albumId: uuid("album_id").references(() => musicAlbums.id),
  artistId: uuid("artist_id").references(() => musicArtists.id),
  mood: text("mood"),
  journalEntry: text("journal_entry").notNull(),
  photoUrls: text("photo_urls").array().default([]), // attached photos
  location: text("location"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const musicJournalSongs = pgTable("music_journal_songs", {
  id: uuid("id").defaultRandom().primaryKey(),
  journalId: uuid("journal_id")
    .references(() => musicJournal.id, { onDelete: "cascade" })
    .notNull(),
  trackId: uuid("track_id").references(() => musicTracks.id),
  albumId: uuid("album_id").references(() => musicAlbums.id),
  artistId: uuid("artist_id").references(() => musicArtists.id),
  position: integer("position").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const musicMoodEntries = pgTable("music_mood_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  mood: text("mood").notNull(),
  note: text("note"),
  date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const musicMemories = pgTable("music_memories", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  trackId: text("track_id"),
  albumId: text("album_id"),
  artistId: text("artist_id"),
  title: text("title"),
  contextText: text("context_text").notNull(),
  mood: text("mood"),
  photoUrls: text("photo_urls").array().default([]),
  memoryDate: timestamp("memory_date", { withTimezone: true }),
  linkedEventId: text("linked_event_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const musicRatings = pgTable("music_ratings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  entityType: text("entity_type").notNull(), // "track", "album", "artist"
  entityId: uuid("entity_id").notNull(),
  score: integer("score").notNull(), // 1–10
  review: text("review"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const musicFavorites = pgTable("music_favorites", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  entityType: text("entity_type").notNull(), // "track", "album", "artist", "genre", "decade"
  entityId: text("entity_id").notNull(), // for genre/decade, this is a string key
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const musicCollections = pgTable("music_collections", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  coverArtUrl: text("cover_art_url"),
  isSmart: boolean("is_smart").default(false).notNull(),
  smartFilter: text("smart_filter"), // JSON string of filter criteria for smart collections
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const musicCollectionItems = pgTable(
  "music_collection_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    collectionId: uuid("collection_id")
      .references(() => musicCollections.id, { onDelete: "cascade" })
      .notNull(),
    entityType: text("entity_type").notNull(), // "track", "album", "artist", "memory"
    entityId: text("entity_id").notNull(),
    position: integer("position").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_music_collection_items_collection").on(table.collectionId, table.position),
    index("idx_music_collection_items_entity").on(table.entityType, table.entityId),
  ],
);

export const musicLibrary = pgTable(
  "music_library",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    trackId: uuid("track_id")
      .references(() => musicTracks.id)
      .notNull(),
    addedAt: timestamp("added_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_music_library_user_added").on(table.userId, table.addedAt.desc()),
    index("idx_music_library_track").on(table.trackId),
  ],
);

export const musicMemorySongs = pgTable("music_memory_songs", {
  id: uuid("id").defaultRandom().primaryKey(),
  memoryId: uuid("memory_id")
    .references(() => musicMemories.id, { onDelete: "cascade" })
    .notNull(),
  trackId: text("track_id").notNull(),
  position: integer("position").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const musicNotes = pgTable(
  "music_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    entityType: text("entity_type").notNull(), // "track", "album", "artist"
    entityId: text("entity_id").notNull(), // text to support itunes- prefix
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    userEntityIdx: index("idx_music_notes_user_entity").on(
      table.userId,
      table.entityType,
      table.entityId,
    ),
  }),
);

// ─── Music Goals (links to the external Goals plugin) ────────────

export const musicGoalConfig = pgTable(
  "music_goal_config",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    goalId: text("goal_id").notNull(), // references goals.id (external plugin, service-layer only)
    targetType: text("target_type").notNull(), // "albums", "tracks", "genres", "countries"
    targetValue: text("target_value"), // specific genre name, country, or null for count-based
    targetCount: integer("target_count"),
    currentCount: integer("current_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("idx_music_goal_config_user").on(table.userId, table.goalId),
  }),
);

// ─── Spotify OAuth tokens (scoped to userId) ─────────────────────

export const musicSpotifyTokens = pgTable("music_spotify_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().unique(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  scope: text("scope"),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
