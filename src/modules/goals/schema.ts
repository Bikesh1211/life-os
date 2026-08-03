import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  boolean,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

export const goalStatusEnum = pgEnum("goal_status", ["draft", "active", "completed", "cancelled"]);

export const goals = pgTable(
  "goals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    type: text("type").default("short-term").notNull(),
    status: goalStatusEnum("status").default("draft").notNull(),
    progress: integer("progress").default(0).notNull(),
    deadline: timestamp("deadline"),
    category: text("category"),
    startDate: timestamp("start_date"),
    completionDate: timestamp("completion_date"),
    linkedEntityType: text("linked_entity_type"),
    linkedEntityId: text("linked_entity_id"),
    aiSuggested: boolean("ai_suggested").default(false).notNull(),
    reward: text("reward"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    userActiveIdx: index("idx_goals_user_active").on(
      table.userId,
      table.deletedAt,
      table.createdAt.desc(),
    ),
    userStatusIdx: index("idx_goals_user_status").on(table.userId, table.status, table.deletedAt),
    userDeadlineIdx: index("idx_goals_user_deadline").on(table.userId, table.deadline),
  }),
);

export const goalMilestones = pgTable(
  "goal_milestones",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    goalId: uuid("goal_id")
      .notNull()
      .references(() => goals.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    completed: boolean("completed").default(false).notNull(),
    order: integer("order").default(0).notNull(),
    targetDate: timestamp("target_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_goal_milestones_goal").on(table.goalId, table.order),
  ],
);
