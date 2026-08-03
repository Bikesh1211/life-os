import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  boolean,
  jsonb,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const moodEnum = pgEnum("journal_mood", [
  "happy",
  "sad",
  "neutral",
  "anxious",
  "stressed",
  "motivated",
  "excited",
]);

export const journalEntries = pgTable(
  "journal_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    mood: moodEnum("mood"),
    tags: text("tags").array().default([]).notNull(),
    reflectionScore: integer("reflection_score"),
    isPinned: boolean("is_pinned").default(false).notNull(),
    isPrivate: boolean("is_private").default(true).notNull(),
    eventDate: timestamp("event_date", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    userEntriesIdx: index("idx_journal_user_entries").on(table.userId, table.createdAt.desc()),
    userActiveIdx: index("idx_journal_user_active").on(
      table.userId,
      table.deletedAt,
      table.createdAt.desc(),
    ),
    moodIdx: index("idx_journal_mood").on(table.userId, table.mood),
    scoreIdx: index("idx_journal_score").on(table.userId, table.reflectionScore),
    tagsIdx: index("idx_journal_tags").using("gin", table.tags),
    ftsIdx: index("idx_journal_fts").using(
      "gin",
      sql`(to_tsvector('english', ${table.title}) || to_tsvector('english', ${table.content}))`,
    ),
  }),
);

export const journalInsights = pgTable(
  "journal_insights",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    journalEntryId: uuid("journal_entry_id")
      .references(() => journalEntries.id, { onDelete: "cascade" })
      .notNull(),
    summary: text("summary"),
    sentimentScore: integer("sentiment_score"),
    keywords: text("keywords").array().default([]).notNull(),
    aiReflection: text("ai_reflection"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("idx_journal_insights_user").on(table.userId),
    entryIdx: index("idx_journal_insights_entry").on(table.journalEntryId),
  }),
);

export const journalVersions = pgTable(
  "journal_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    entryId: uuid("entry_id")
      .notNull()
      .references(() => journalEntries.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    title: text("title").notNull(),
    wordCount: integer("word_count").default(0).notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    entryVersionsIdx: index("idx_journal_versions_entry").on(table.entryId, table.createdAt.desc()),
  }),
);

export const journalBookmarks = pgTable(
  "journal_bookmarks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    entryId: uuid("entry_id")
      .notNull()
      .references(() => journalEntries.id, { onDelete: "cascade" }),
    position: jsonb("position").notNull(),
    excerpt: text("excerpt"),
    label: text("label"),
    color: text("color").default("yellow"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userEntryBookmarksIdx: index("idx_journal_bookmarks_entry").on(table.userId, table.entryId),
    userBookmarksCreatedIdx: index("idx_journal_bookmarks_created").on(
      table.userId,
      table.createdAt.desc(),
    ),
  }),
);

export const journalHighlights = pgTable(
  "journal_highlights",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    entryId: uuid("entry_id")
      .notNull()
      .references(() => journalEntries.id, { onDelete: "cascade" }),
    position: jsonb("position").notNull(),
    text: text("text").notNull(),
    color: text("color").default("yellow"),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userEntryHighlightsIdx: index("idx_journal_highlights_entry").on(table.userId, table.entryId),
    highlightsColorIdx: index("idx_journal_highlights_color").on(table.userId, table.color),
  }),
);

export const journalWritingSessions = pgTable(
  "journal_writing_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    entryId: uuid("entry_id")
      .notNull()
      .references(() => journalEntries.id, { onDelete: "cascade" }),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    durationSeconds: integer("duration_seconds"),
    wordsAdded: integer("words_added").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    entrySessionsIdx: index("idx_journal_sessions_entry").on(table.entryId, table.startedAt.desc()),
    userSessionsDateIdx: index("idx_journal_sessions_user_date").on(table.userId, table.startedAt),
  }),
);
