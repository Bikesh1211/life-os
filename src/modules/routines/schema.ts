import { pgTable, text, uuid, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";

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

export const routines = pgTable("routines", {
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
});

export const routineItems = pgTable("routine_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  routineId: uuid("routine_id")
    .references(() => routines.id, { onDelete: "cascade" }),
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
});

export const routineExecutions = pgTable("routine_executions", {
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
});

export const routineExecutionItems = pgTable("routine_execution_items", {
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
});

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
