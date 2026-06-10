import { pgTable, text, uuid, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";

export const difficultyLevelEnum = pgEnum("knowledge_difficulty", [
  "beginner",
  "intermediate",
  "advanced",
]);

export const reviewStatusEnum = pgEnum("knowledge_review_status", [
  "not_reviewed",
  "reviewing",
  "mastered",
]);

export const knowledgeEntries = pgTable("knowledge_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  subcategory: text("subcategory"),
  dateLearned: timestamp("date_learned", { withTimezone: true }).notNull(),
  summary: text("summary"),
  detailedNotes: text("detailed_notes"),
  keyTakeaways: text("key_takeaways"),
  examples: text("examples"),
  resources: text("resources"),
  tags: text("tags").array().notNull().default([]),
  difficultyLevel: difficultyLevelEnum("difficulty_level").default("beginner").notNull(),
  learningSource: text("learning_source"),
  resourceUrl: text("resource_url"),
  masteryLevel: integer("mastery_level").default(1).notNull(),
  confidenceScore: integer("confidence_score").default(1).notNull(),
  timeSpent: integer("time_spent"),
  reviewStatus: reviewStatusEnum("review_status").default("not_reviewed").notNull(),
  lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
  nextActions: text("next_actions"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const knowledgeEntryLinks = pgTable("knowledge_entry_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  entryId: uuid("entry_id")
    .notNull()
    .references(() => knowledgeEntries.id, { onDelete: "cascade" }),
  linkedEntryId: uuid("linked_entry_id")
    .notNull()
    .references(() => knowledgeEntries.id, { onDelete: "cascade" }),
  relationshipType: text("relationship_type").notNull().default("related_to"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
