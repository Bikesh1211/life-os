import { pgTable, text, uuid, timestamp, boolean, date, integer } from "drizzle-orm/pg-core";

export const packingLists = pgTable("packing_lists", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  destination: text("destination"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  notes: text("notes"),
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const packingListItems = pgTable("packing_list_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  listId: uuid("list_id").notNull().references(() => packingLists.id, { onDelete: "cascade" }),
  itemId: uuid("item_id"),
  name: text("name").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  isPacked: boolean("is_packed").default(false).notNull(),
  category: text("category"),
  position: integer("position").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
