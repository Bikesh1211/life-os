import { pgTable, text, uuid, timestamp, integer, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const books = pgTable(
  "books",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),

    // Core metadata
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    description: text("description"),
    authorByline: text("author_byline"),
    language: text("language").default("en"),
    isbn: text("isbn"),
    bookType: text("book_type"),
    genre: text("genre"),
    tags: text("tags").array().default([]).notNull(),
    keywords: text("keywords").array().default([]).notNull(),
    coverUrl: text("cover_url"),
    bannerUrl: text("banner_url"),
    copyright: text("copyright"),
    license: text("license"),
    publisher: text("publisher"),
    edition: text("edition"),
    series: text("series"),
    readingLevel: text("reading_level"),
    ageRating: text("age_rating"),

    // Writing goals
    targetWordCount: integer("target_word_count"),
    targetChapterCount: integer("target_chapter_count"),
    dailyWritingGoal: integer("daily_writing_goal"),
    weeklyGoal: integer("weekly_goal"),
    deadline: timestamp("deadline", { withTimezone: true }),

    // Publishing
    status: text("status", { enum: ["draft", "published", "archived"] })
      .default("draft")
      .notNull(),
    isListed: boolean("is_listed").default(true).notNull(),
    publishAt: timestamp("publish_at", { withTimezone: true }),

    // Counts
    wordCount: integer("word_count").default(0).notNull(),
    chapterCount: integer("chapter_count").default(0).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    userBooksIdx: index("idx_books_user").on(table.userId, table.status, table.createdAt.desc()),
    userDeletedIdx: index("idx_books_user_deleted").on(table.userId, table.deletedAt),
    ftsIdx: index("idx_books_fts").using(
      "gin",
      sql`to_tsvector('english', ${table.title} || ' ' || coalesce(${table.description}, ''))`,
    ),
  }),
);

export const bookParts = pgTable(
  "book_parts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),

    title: text("title").notNull(),
    order: integer("order").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    bookPartsIdx: index("idx_book_parts_book").on(table.bookId, table.order),
  }),
);

export const bookChapters = pgTable(
  "book_chapters",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    partId: uuid("part_id").references(() => bookParts.id, { onDelete: "set null" }),

    title: text("title").notNull(),
    content: jsonb("content").notNull().default({ type: "doc", content: [] }),
    order: integer("order").notNull(),
    wordCount: integer("word_count").default(0).notNull(),
    aiMeta: jsonb("ai_meta"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    bookChaptersIdx: index("idx_book_chapters_book").on(table.bookId, table.order),
    partChaptersIdx: index("idx_book_chapters_part").on(table.partId, table.order),
    chaptersFtsIdx: index("idx_book_chapters_fts").using(
      "gin",
      sql`to_tsvector('english', ${table.title} || ' ' || coalesce(${table.content}::text, ''))`,
    ),
  }),
);

export const bookVersions = pgTable(
  "book_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    chapterId: uuid("chapter_id")
      .notNull()
      .references(() => bookChapters.id, { onDelete: "cascade" }),

    content: jsonb("content").notNull(),
    wordCount: integer("word_count").default(0).notNull(),
    note: text("note"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    chapterVersionsIdx: index("idx_book_versions_chapter").on(table.chapterId, table.createdAt.desc()),
  }),
);

export const bookCollaborators = pgTable(
  "book_collaborators",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),

    role: text("role", { enum: ["owner", "editor", "commenter", "viewer"] })
      .notNull()
      .default("editor"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    bookCollabIdx: index("idx_book_collaborators_book").on(table.bookId, table.userId),
    userCollabIdx: index("idx_book_collaborators_user").on(table.userId),
  }),
);

export const bookCharacters = pgTable(
  "book_characters",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),

    name: text("name").notNull(),
    imageUrl: text("image_url"),
    age: text("age"),
    personality: text("personality"),
    background: text("background"),
    appearance: text("appearance"),
    goals: text("goals"),
    notes: text("notes"),
    color: text("color"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    bookCharactersIdx: index("idx_book_characters_book").on(table.bookId, table.name),
    userCharactersIdx: index("idx_book_characters_user").on(table.userId),
  }),
);

export const bookResearchNotes = pgTable(
  "book_research_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),

    title: text("title").notNull(),
    content: text("content"),
    sourceType: text("source_type"),
    sourceUrl: text("source_url"),
    tags: text("tags").array().default([]).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    bookResearchNotesIdx: index("idx_book_research_notes_book").on(table.bookId, table.createdAt.desc()),
  }),
);

export const bookChapterCharacters = pgTable(
  "book_chapter_characters",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    chapterId: uuid("chapter_id")
      .notNull()
      .references(() => bookChapters.id, { onDelete: "cascade" }),
    characterId: uuid("character_id")
      .notNull()
      .references(() => bookCharacters.id, { onDelete: "cascade" }),
    position: jsonb("position"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    chapterCharactersIdx: index("idx_book_chapter_characters_chapter").on(table.chapterId),
    characterChapterIdx: index("idx_book_chapter_characters_character").on(table.characterId),
  }),
);

export const bookChapterResearchNotes = pgTable(
  "book_chapter_research_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    chapterId: uuid("chapter_id")
      .notNull()
      .references(() => bookChapters.id, { onDelete: "cascade" }),
    noteId: uuid("note_id")
      .notNull()
      .references(() => bookResearchNotes.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    chapterNotesIdx: index("idx_book_chapter_research_chapter").on(table.chapterId),
    noteChapterIdx: index("idx_book_chapter_research_note").on(table.noteId),
  }),
);

export const bookWritingSessions = pgTable(
  "book_writing_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    chapterId: uuid("chapter_id").references(() => bookChapters.id, { onDelete: "set null" }),
    userId: text("user_id").notNull(),

    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    durationSeconds: integer("duration_seconds"),
    wordsAdded: integer("words_added").default(0).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    bookSessionsIdx: index("idx_book_sessions_book").on(table.bookId, table.startedAt.desc()),
    userSessionsDateIdx: index("idx_book_sessions_user_date").on(table.userId, table.startedAt),
  }),
);

export const bookComments = pgTable(
  "book_comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    chapterId: uuid("chapter_id")
      .notNull()
      .references(() => bookChapters.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),

    text: text("text").notNull(),
    position: jsonb("position"),
    parentId: uuid("parent_id"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    chapterCommentsIdx: index("idx_book_comments_chapter").on(table.chapterId, table.createdAt),
  }),
);

export const bookReadingProgress = pgTable(
  "book_reading_progress",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    chapterId: uuid("chapter_id")
      .notNull()
      .references(() => bookChapters.id, { onDelete: "cascade" }),

    scrollPosition: integer("scroll_position").default(0).notNull(),
    percentage: integer("percentage").default(0).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userBookProgressIdx: index("idx_book_progress_user_book").on(table.userId, table.bookId),
  }),
);

export const bookBookmarks = pgTable(
  "book_bookmarks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    chapterId: uuid("chapter_id")
      .notNull()
      .references(() => bookChapters.id, { onDelete: "cascade" }),

    position: jsonb("position").notNull(),
    excerpt: text("excerpt"),
    label: text("label"),
    color: text("color").default("yellow"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userBookBookmarksIdx: index("idx_book_bookmarks_user_book").on(table.userId, table.bookId, table.chapterId),
    userBookmarksCreatedIdx: index("idx_book_bookmarks_created").on(table.userId, table.createdAt.desc()),
  }),
);

export const bookHighlights = pgTable(
  "book_highlights",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    chapterId: uuid("chapter_id")
      .notNull()
      .references(() => bookChapters.id, { onDelete: "cascade" }),

    position: jsonb("position").notNull(),
    text: text("text").notNull(),
    color: text("color").default("yellow"),
    note: text("note"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userBookHighlightsIdx: index("idx_book_highlights_user_book").on(table.userId, table.bookId, table.chapterId),
    highlightsColorIdx: index("idx_book_highlights_color").on(table.userId, table.color),
  }),
);
