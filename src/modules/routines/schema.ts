import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  boolean,
  jsonb,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

export const routineScheduleTypeEnum = pgEnum("routine_schedule_type", [
  "daily",
  "weekdays",
  "weekends",
  "custom",
] as const);

export const routineExecutionStatusEnum = pgEnum("routine_execution_status", [
  "pending",
  "in_progress",
  "completed",
  "skipped",
  "missed",
] as const);

export const routineItemStatusEnum = pgEnum("routine_item_status", [
  "pending",
  "in_progress",
  "completed",
  "skipped",
] as const);

export const routines = pgTable(
  "routines",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    color: text("color"),
    icon: text("icon"),
    isActive: boolean("is_active").default(true).notNull(),
    scheduleType: routineScheduleTypeEnum("schedule_type").default("daily").notNull(),
    customDays: text("custom_days").array(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userActiveIdx: index("idx_routines_user_active").on(table.userId, table.isActive),
  }),
);

export const routineItems = pgTable(
  "routine_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    routineId: uuid("routine_id").references(() => routines.id, { onDelete: "cascade" }),
    userId: text("user_id"),
    title: text("title").notNull(),
    description: text("description"),
    startTime: text("start_time").notNull(),
    endTime: text("end_time"),
    order: integer("order").notNull().default(0),
    isOptional: boolean("is_optional").default(false).notNull(),
    category: text("category"),
    priority: text("priority"),
    location: text("location"),
    date: text("date"),
    status: routineItemStatusEnum("status"),
    linkedHabitId: text("linked_habit_id"),
    linkedTaskId: text("linked_task_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    routineIdx: index("idx_routine_items_routine").on(table.routineId, table.order),
    userDateIdx: index("idx_routine_items_user_date").on(table.userId, table.date),
  }),
);

export const routineExecutions = pgTable(
  "routine_executions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    routineId: uuid("routine_id")
      .notNull()
      .references(() => routines.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    date: text("date").notNull(),
    plannedStart: text("planned_start"),
    plannedEnd: text("planned_end"),
    actualStart: text("actual_start"),
    actualEnd: text("actual_end"),
    status: routineExecutionStatusEnum("status").default("pending").notNull(),
    completionRate: integer("completion_rate").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userDateIdx: index("idx_routine_executions_user_date").on(table.userId, table.date.desc()),
    routineIdx: index("idx_routine_executions_routine").on(table.routineId, table.date.desc()),
  }),
);

export const routineExecutionItems = pgTable(
  "routine_execution_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    executionId: uuid("execution_id")
      .notNull()
      .references(() => routineExecutions.id, { onDelete: "cascade" }),
    routineItemId: uuid("routine_item_id")
      .notNull()
      .references(() => routineItems.id, { onDelete: "cascade" }),
    plannedStart: text("planned_start"),
    plannedEnd: text("planned_end"),
    actualStart: text("actual_start"),
    actualEnd: text("actual_end"),
    status: routineItemStatusEnum("status").default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_routine_execution_items_execution").on(table.executionId),
    index("idx_routine_execution_items_item").on(table.routineItemId),
  ],
);

export const routineTemplates = pgTable("routine_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color"),
  icon: text("icon"),
  scheduleType: routineScheduleTypeEnum("schedule_type").default("daily").notNull(),
  customDays: text("custom_days").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const routineTemplateItems = pgTable("routine_template_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateId: uuid("template_id")
    .notNull()
    .references(() => routineTemplates.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  startTime: text("start_time").notNull(),
  endTime: text("end_time"),
  order: integer("order").notNull().default(0),
  isOptional: boolean("is_optional").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Daily Planner tables ──

export const dailyGoals = pgTable(
  "daily_goals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    date: text("date").notNull(),
    title: text("title").notNull(),
    isCompleted: boolean("is_completed").default(false).notNull(),
    taskId: text("task_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userDateIdx: index("idx_daily_goals_user_date").on(table.userId, table.date.desc()),
  }),
);

export const dailyPriorities = pgTable(
  "daily_priorities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    date: text("date").notNull(),
    title: text("title").notNull(),
    estimatedDuration: integer("estimated_duration"),
    status: text("status").default("pending").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    taskId: text("task_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userDateIdx: index("idx_daily_priorities_user_date").on(table.userId, table.date.desc()),
  }),
);

export const dailyPlannerSnapshots = pgTable(
  "daily_planner_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    date: text("date").notNull(),
    productivityScore: integer("productivity_score").notNull(),
    subScores: jsonb("sub_scores").default({}).notNull(),
    tasksCompleted: integer("tasks_completed").default(0).notNull(),
    tasksTotal: integer("tasks_total").default(0).notNull(),
    focusMinutes: integer("focus_minutes").default(0).notNull(),
    habitsCompleted: integer("habits_completed").default(0).notNull(),
    habitsTotal: integer("habits_total").default(0).notNull(),
    dailyGoalCompleted: boolean("daily_goal_completed").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userDateIdx: index("idx_daily_planner_snapshots_user_date").on(table.userId, table.date.desc()),
  }),
);

export const dailyNotes = pgTable(
  "daily_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    date: text("date").notNull(),
    content: text("content"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userDateIdx: index("idx_daily_notes_user_date").on(table.userId, table.date.desc()),
  }),
);

export const plannerPreferences = pgTable("planner_preferences", {
  userId: text("user_id").primaryKey(),
  morningReminderTime: text("morning_reminder_time"),
  eveningReminderTime: text("evening_reminder_time"),
  notificationConfig: jsonb("notification_config").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
