import {
  pgTable,
  text,
  uuid,
  timestamp,
  date,
  integer,
  pgEnum,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const habitCategoryEnum = pgEnum("habit_category", [
  "health",
  "fitness",
  "reading",
  "learning",
  "productivity",
  "mindfulness",
  "finance",
  "social",
  "creative",
]);

export const habitFrequencyEnum = pgEnum("habit_frequency", [
  "daily",
  "weekly",
  "monthly",
] as const);

export const habitFrequencyTypeEnum = pgEnum("habit_frequency_type", [
  "daily",
  "weekly",
  "monthly",
  "every_x_days",
  "every_x_weeks",
  "specific_weekdays",
  "specific_dates",
] as const);

export const habits = pgTable(
  "habits",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    category: habitCategoryEnum("category"),
    frequency: habitFrequencyEnum("frequency").default("daily").notNull(),
    frequencyType: habitFrequencyTypeEnum("frequency_type").default("daily").notNull(),
    frequencyInterval: integer("frequency_interval"),
    frequencyWeekdays: integer("frequency_weekdays").array(),
    frequencyMonthDay: integer("frequency_month_day"),
    timesPerDay: integer("times_per_day").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    userActiveIdx: index("idx_habits_user_active").on(
      table.userId,
      table.deletedAt,
      table.createdAt,
    ),
  }),
);

export const habitCompletions = pgTable("habit_completions", {
  id: uuid("id").defaultRandom().primaryKey(),
  habitId: uuid("habit_id")
    .notNull()
    .references(() => habits.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  completedDate: date("completed_date").notNull(),
  note: text("note"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
