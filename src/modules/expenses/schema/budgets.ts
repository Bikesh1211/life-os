import { pgTable, text, uuid, timestamp, pgEnum, numeric, index } from "drizzle-orm/pg-core";
import { expenseCategories } from "./categories";
import { BUDGET_PERIODS } from "../constants";

export const budgetPeriodEnum = pgEnum("budget_period", BUDGET_PERIODS);

export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => expenseCategories.id),
    amount: numeric("amount").notNull(),
    period: budgetPeriodEnum("period").default("monthly").notNull(),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    userIdx: index("idx_budgets_user").on(table.userId, table.deletedAt, table.createdAt),
  }),
);
