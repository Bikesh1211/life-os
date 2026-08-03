import { pgTable, text, uuid, timestamp, integer, boolean, index } from "drizzle-orm/pg-core";

export const curbCategories = pgTable(
  "curb_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    icon: text("icon"),
    color: text("color"),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("idx_curb_categories_user").on(table.userId, table.sortOrder),
  }),
);

export const curbHabits = pgTable(
  "curb_habits",
  {
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
  },
  (table) => ({
    userActiveIdx: index("idx_curb_habits_user_active").on(
      table.userId,
      table.deletedAt,
      table.sortOrder,
    ),
  }),
);

export const curbLogs = pgTable(
  "curb_logs",
  {
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
  },
  (table) => ({
    userLoggedIdx: index("idx_curb_logs_user_logged").on(table.userId, table.loggedAt.desc()),
    habitIdx: index("idx_curb_logs_habit").on(table.habitId, table.loggedAt.desc()),
  }),
);
