import { pgTable, text, uuid, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";

export const countdownCategoryEnum = pgEnum("countdown_category", [
  "football",
  "movies",
  "concerts",
  "travel",
  "retreats",
  "birthdays",
  "weddings",
  "festivals",
  "exams",
  "meetings",
  "product-launches",
  "holidays",
  "personal",
  "custom",
]);

export const countdownStatusEnum = pgEnum("countdown_status", [
  "pending",
  "completed",
  "archived",
]);

export const countdownRecurrenceEnum = pgEnum("countdown_recurrence", [
  "none",
  "yearly",
]);

export const countdownEvents = pgTable("countdown_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: countdownCategoryEnum("category").default("personal").notNull(),
  eventDate: timestamp("event_date", { withTimezone: true }).notNull(),
  eventTime: text("event_time"),
  timezone: text("timezone"),
  location: text("location"),
  organizer: text("organizer"),
  coverImage: text("cover_image"),
  bannerImage: text("banner_image"),
  color: text("color"),
  icon: text("icon"),
  notes: text("notes"),
  isFavorited: boolean("is_favorited").default(false).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  recurrence: countdownRecurrenceEnum("recurrence").default("none").notNull(),
  createTimelineEvent: boolean("create_timeline_event").default(true).notNull(),
  status: countdownStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const countdownChecklistItems = pgTable("countdown_checklist_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").notNull().references(() => countdownEvents.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const countdownReminders = pgTable("countdown_reminders", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").notNull().references(() => countdownEvents.id, { onDelete: "cascade" }),
  offset: text("offset").notNull(),
  reminderAt: timestamp("reminder_at", { withTimezone: true }).notNull(),
  isSent: boolean("is_sent").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const countdownMemories = pgTable("countdown_memories", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").notNull().references(() => countdownEvents.id, { onDelete: "cascade" }),
  photos: text("photos").array().default([]).notNull(),
  reflection: text("reflection"),
  rating: integer("rating"),
  archived: boolean("archived").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
