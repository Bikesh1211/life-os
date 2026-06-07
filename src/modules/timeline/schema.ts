import { pgTable, text, uuid, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";

export const categoryEnum = pgEnum("timeline_category", [
  "personal",
  "career",
  "education",
  "health",
  "finance",
  "travel",
  "relationships",
  "business",
  "entertainment",
  "custom",
]);

export const importanceEnum = pgEnum("timeline_importance", [
  "critical",
  "high",
  "medium",
  "low",
]);

export const recurrenceEnum = pgEnum("timeline_recurrence", [
  "none",
  "daily",
  "weekly",
  "monthly",
  "yearly",
]);

export const timelineEvents = pgTable("timeline_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  eventDate: timestamp("event_date", { withTimezone: true }).notNull(),
  category: categoryEnum("category").default("personal").notNull(),
  importance: importanceEnum("importance").default("medium").notNull(),
  recurrence: recurrenceEnum("recurrence").default("none").notNull(),
  color: text("color"),
  icon: text("icon"),
  isPinned: boolean("is_pinned").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
