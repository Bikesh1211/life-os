import { pgTable, text, uuid, timestamp, integer, boolean, pgEnum, index } from "drizzle-orm/pg-core";
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
    isPrivate: boolean("is_private").default(true).notNull(),
    eventDate: timestamp("event_date", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    userEntriesIdx: index("idx_journal_user_entries").on(table.userId, table.createdAt.desc()),
    userActiveIdx: index("idx_journal_user_active").on(table.userId, table.deletedAt, table.createdAt.desc()),
    moodIdx: index("idx_journal_mood").on(table.userId, table.mood),
    scoreIdx: index("idx_journal_score").on(table.userId, table.reflectionScore),
    tagsIdx: index("idx_journal_tags").using("gin", table.tags),
    ftsIdx: index("idx_journal_fts").using(
      "gin",
      sql`(to_tsvector('english', ${table.title}) || to_tsvector('english', ${table.content}))`,
    ),
  }),
);

export const journalInsights = pgTable("journal_insights", {
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
});
