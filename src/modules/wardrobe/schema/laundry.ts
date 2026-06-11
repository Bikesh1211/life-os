import { pgTable, text, uuid, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";
import { LAUNDRY_STATUS } from "../constants";

export const laundryStatusEnum = pgEnum("laundry_status", LAUNDRY_STATUS);

export const laundryItems = pgTable("laundry_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  itemId: uuid("item_id"),
  name: text("name").notNull(),
  status: laundryStatusEnum("status").default("laundry").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
