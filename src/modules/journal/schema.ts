import { pgTable, text, uuid, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";

export const moodEnum = pgEnum("journal_mood", [
  "happy",
  "sad",
  "neutral",
  "anxious",
  "stressed",
  "motivated",
  "excited",
]);

export const journalEntries = pgTable("journal_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content"),
  mood: moodEnum("mood"),
  tags: text("tags").array().default([]).notNull(),
  reflectionScore: integer("reflection_score"),
  isPrivate: boolean("is_private").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

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
