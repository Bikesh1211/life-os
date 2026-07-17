import { pgTable, text, uuid, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";

export const timeEntries = pgTable("time_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  categoryId: uuid("category_id"),
  projectId: text("project_id"),
  tags: text("tags").array(),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }),
  durationMinutes: integer("duration_minutes"),
  isBillable: boolean("is_billable").default(false).notNull(),
  notes: text("notes"),
  timelineEventId: text("timeline_event_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const timeCategories = pgTable("time_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  icon: text("icon").default("clock").notNull(),
  color: text("color").default("blue").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const timeActiveTimer = pgTable("time_active_timer", {
  userId: text("user_id").primaryKey(),
  entryId: uuid("entry_id").notNull(),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  elapsedBeforePause: integer("elapsed_before_pause").default(0).notNull(),
  isPaused: boolean("is_paused").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const timeBudgets = pgTable("time_budgets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  categoryId: uuid("category_id").notNull(),
  period: text("period", { enum: ["weekly", "monthly"] }).notNull(),
  targetMinutes: integer("target_minutes").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const timeUserPreferences = pgTable("time_user_preferences", {
  userId: text("user_id").primaryKey(),
  widgetVisibility: jsonb("widget_visibility").default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
