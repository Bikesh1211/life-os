import { pgTable, text, integer, real, timestamp, boolean, uuid, index } from "drizzle-orm/pg-core";

export const moviesMedia = pgTable("movies_media", {
  id: uuid("id").primaryKey().defaultRandom(),
  tmdbId: text("tmdb_id").unique().notNull(),
  mediaType: text("media_type", { enum: ["movie", "tv"] }).notNull(),
  title: text("title").notNull(),
  overview: text("overview"),
  posterPath: text("poster_path"),
  backdropPath: text("backdrop_path"),
  releaseDate: timestamp("release_date", { withTimezone: true }),
  genres: text("genres").array().default([]).notNull(),
  voteAverage: real("vote_average"),
  runtime: integer("runtime"),
  episodeRuntime: integer("episode_runtime"),
  seasons: integer("seasons"),
  episodes: integer("episodes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const moviesPeople = pgTable("movies_people", {
  id: uuid("id").primaryKey().defaultRandom(),
  tmdbId: text("tmdb_id").unique().notNull(),
  name: text("name").notNull(),
  profilePath: text("profile_path"),
  knownForDepartment: text("known_for_department"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const movieFavorites = pgTable(
  "movie_favorites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    mediaId: text("media_id").notNull(),
    rewatchCount: integer("rewatch_count").default(0).notNull(),
    personalNotes: text("personal_notes"),
    addedAt: timestamp("added_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("idx_movie_favorites_user").on(table.userId, table.addedAt.desc()),
    userMediaIdx: index("idx_movie_favorites_user_media").on(table.userId, table.mediaId),
  }),
);

export const movieRatings = pgTable(
  "movie_ratings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    mediaId: text("media_id").notNull(),
    score: integer("score").notNull(),
    review: text("review"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("idx_movie_ratings_user").on(table.userId, table.createdAt.desc()),
    userMediaIdx: index("idx_movie_ratings_user_media").on(table.userId, table.mediaId),
  }),
);

export const movieWatchlist = pgTable(
  "movie_watchlist",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    mediaId: text("media_id").notNull(),
    status: text("status", {
      enum: ["plan_to_watch", "watching", "completed", "dropped", "rewatching"],
    })
      .default("plan_to_watch")
      .notNull(),
    priority: text("priority", { enum: ["low", "medium", "high"] }).default("medium"),
    tags: text("tags").array().default([]),
    notes: text("notes"),
    reminder: timestamp("reminder", { withTimezone: true }),
    currentSeason: integer("current_season").default(1),
    currentEpisode: integer("current_episode").default(0),
    totalSeasons: integer("total_seasons"),
    totalEpisodes: integer("total_episodes"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("idx_movie_watchlist_user").on(table.userId, table.createdAt.desc()),
    userStatusIdx: index("idx_movie_watchlist_user_status").on(
      table.userId,
      table.status,
      table.updatedAt.desc(),
    ),
  }),
);

export const movieMemories = pgTable(
  "movie_memories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    mediaId: text("media_id"),
    title: text("title"),
    watchedWith: text("watched_with"),
    location: text("location"),
    mood: text("mood"),
    contextText: text("context_text").notNull(),
    photoUrls: text("photo_urls").array().default([]),
    ticketUrls: text("ticket_urls").array().default([]),
    screenshotUrls: text("screenshot_urls").array().default([]),
    tags: text("tags").array().default([]),
    watchDate: timestamp("watch_date", { withTimezone: true }),
    linkedEventId: text("linked_event_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userDateIdx: index("idx_movie_memories_user_date").on(table.userId, table.watchDate.desc()),
    userMediaIdx: index("idx_movie_memories_user_media").on(table.userId, table.mediaId),
  }),
);

export const movieQuotes = pgTable(
  "movie_quotes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    mediaId: text("media_id"),
    quote: text("quote").notNull(),
    character: text("character"),
    timestamp: text("timestamp"),
    personalMeaning: text("personal_meaning"),
    isFavorite: boolean("is_favorite").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("idx_movie_quotes_user").on(table.userId, table.createdAt.desc()),
  }),
);

export const movieCollections = pgTable(
  "movie_collections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    coverUrl: text("cover_url"),
    tags: text("tags").array().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("idx_movie_collections_user").on(table.userId, table.createdAt.desc()),
  }),
);

export const movieCollectionItems = pgTable(
  "movie_collection_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => movieCollections.id, { onDelete: "cascade" }),
    mediaId: text("media_id").notNull(),
    position: integer("position").default(0).notNull(),
    addedAt: timestamp("added_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_movie_collection_items_collection").on(table.collectionId, table.position),
    index("idx_movie_collection_items_media").on(table.mediaId),
  ],
);
