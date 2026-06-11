import { pgTable, text, uuid, timestamp, numeric, date } from "drizzle-orm/pg-core";
import { techItems } from "./items";

export const techMaintenanceLog = pgTable("tech_maintenance_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  itemId: uuid("item_id").notNull().references(() => techItems.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),
  description: text("description").notNull(),
  cost: numeric("cost"),
  provider: text("provider"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
