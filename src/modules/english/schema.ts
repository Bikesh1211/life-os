import { pgTable, text, uuid, timestamp, integer, boolean, jsonb, date, uniqueIndex, index } from "drizzle-orm/pg-core";

export const englishWords = pgTable(
  "english_words",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    word: text("word").notNull().unique(),
    pronunciation: text("pronunciation"),
    partOfSpeech: text("part_of_speech"),
    definitions: jsonb("definitions").default([]).notNull(),
    synonyms: text("synonyms").array().default([]).notNull(),
    antonyms: text("antonyms").array().default([]).notNull(),
    collocations: text("collocations").array().default([]).notNull(),
    exampleSentences: text("example_sentences").array().default([]).notNull(),
    topic: text("topic"),
    difficulty: text("difficulty").default("intermediate").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    wordIdx: uniqueIndex("idx_english_word").on(table.word),
    topicIdx: index("idx_english_topic").on(table.topic),
  }),
);

export const englishUserVocabulary = pgTable(
  "english_user_vocabulary",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    wordId: uuid("word_id")
      .notNull()
      .references(() => englishWords.id, { onDelete: "cascade" }),
    mastery: text("mastery").default("new").notNull(),
    isFavorite: boolean("is_favorite").default(false).notNull(),
    notes: text("notes"),
    addedAt: timestamp("added_at", { withTimezone: true }).defaultNow().notNull(),
    lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
    reviewCount: integer("review_count").default(0).notNull(),
    nextReviewAt: timestamp("next_review_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    userWordIdx: uniqueIndex("idx_english_user_word").on(table.userId, table.wordId),
    userMasteryIdx: index("idx_english_user_mastery").on(table.userId, table.mastery),
  }),
);

export const englishQuizAttempts = pgTable(
  "english_quiz_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    wordId: uuid("word_id")
      .notNull()
      .references(() => englishWords.id, { onDelete: "cascade" }),
    quizType: text("quiz_type").notNull(),
    correct: boolean("correct").notNull(),
    responseTimeMs: integer("response_time_ms"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userQuizIdx: index("idx_english_quiz_user").on(table.userId, table.createdAt.desc()),
    wordQuizIdx: index("idx_english_quiz_word").on(table.userId, table.wordId),
  }),
);

export const englishDailyWords = pgTable(
  "english_daily_words",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    wordId: uuid("word_id")
      .notNull()
      .references(() => englishWords.id, { onDelete: "cascade" }),
    scheduledDate: date("scheduled_date").notNull().unique(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    dateIdx: uniqueIndex("idx_english_daily_date").on(table.scheduledDate),
  }),
);
