import { pgTable, text, uuid, timestamp, boolean, integer, jsonb, pgEnum, index } from "drizzle-orm/pg-core";

export const taskStatusEnum = pgEnum("task_status", ["todo", "in_progress", "done", "archived", "cancelled"]);
export const taskRecurrenceEnum = pgEnum("task_recurrence", ["none", "daily", "weekdays", "weekly", "monthly", "yearly"]);

export const taskProjects = pgTable(
  "task_projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    title: text("title").notNull(),
    color: text("color").default("blue").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    userProjectsIdx: index("idx_task_projects_user").on(table.userId, table.deletedAt),
  }),
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    projectId: uuid("project_id").references(() => taskProjects.id, { onDelete: "set null" }),
    parentId: uuid("parent_id"),
    title: text("title").notNull(),
    description: text("description"),
    descriptionJson: jsonb("description_json"),
    status: taskStatusEnum("status").default("todo").notNull(),
    priority: text("priority").default("p3").notNull(),
    dueDate: timestamp("due_date", { withTimezone: true }),
    startDate: timestamp("start_date", { withTimezone: true }),
    estimatedMinutes: integer("estimated_minutes"),
    actualMinutes: integer("actual_minutes"),
    recurrence: taskRecurrenceEnum("recurrence").default("none").notNull(),
    recurrenceEndDate: timestamp("recurrence_end_date", { withTimezone: true }),
    order: integer("order").default(0).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    userTasksIdx: index("idx_tasks_user").on(table.userId, table.status, table.deletedAt),
    dueDateIdx: index("idx_tasks_due_date").on(table.userId, table.dueDate),
    projectIdx: index("idx_tasks_project").on(table.projectId),
    parentIdx: index("idx_tasks_parent").on(table.parentId),
    priorityIdx: index("idx_tasks_priority").on(table.userId, table.priority),
  }),
);

export const taskLabels = pgTable(
  "task_labels",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    color: text("color").default("blue").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userLabelsIdx: index("idx_task_labels_user").on(table.userId, table.name),
  }),
);

export const taskTasksLabels = pgTable(
  "task_tasks_labels",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    labelId: uuid("label_id")
      .notNull()
      .references(() => taskLabels.id, { onDelete: "cascade" }),
  },
  (table) => ({
    taskLabelIdx: index("idx_task_tasks_labels_task").on(table.taskId),
    labelTaskIdx: index("idx_task_tasks_labels_label").on(table.labelId),
  }),
);
