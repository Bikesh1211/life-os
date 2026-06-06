import { pgTable, text, uuid, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";

export const goalStatusEnum = pgEnum("goal_status", ["draft", "active", "completed", "cancelled"]);

export const goals = pgTable("goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: goalStatusEnum("status").default("draft").notNull(),
  progress: integer("progress").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});
