import { pgTable, text, uuid, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const curbCategories = pgTable("curb_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  icon: text("icon"),
  color: text("color"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const curbHabits = pgTable("curb_habits", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  icon: text("icon"),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => curbCategories.id, { onDelete: "cascade" }),
  limitType: text("limit_type", { enum: ["daily", "weekly", "monthly", "zero"] })
    .notNull()
    .default("daily"),
  limitValue: integer("limit_value").default(0).notNull(),
  color: text("color"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const curbLogs = pgTable("curb_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  habitId: uuid("habit_id")
    .notNull()
    .references(() => curbHabits.id, { onDelete: "cascade" }),
  loggedAt: timestamp("logged_at", { withTimezone: true }).defaultNow().notNull(),
  trigger: text("trigger"),
  mood: text("mood"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
