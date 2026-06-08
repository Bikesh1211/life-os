import { pgTable, text, uuid, timestamp, integer } from "drizzle-orm/pg-core";

export const expenseCategories = pgTable("expense_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id"),
  name: text("name").notNull(),
  icon: text("icon"),
  color: text("color"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
