import { pgTable, text, uuid, timestamp, date } from "drizzle-orm/pg-core";
import { clothingItems } from "./items";

export const wearHistory = pgTable("wear_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  itemId: uuid("item_id").notNull().references(() => clothingItems.id, { onDelete: "cascade" }),
  wornDate: date("worn_date").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
