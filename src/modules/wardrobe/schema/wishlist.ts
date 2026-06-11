import { pgTable, text, uuid, timestamp, numeric, boolean, integer } from "drizzle-orm/pg-core";

export const wishlistItems = pgTable("wishlist_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  brand: text("brand"),
  category: text("category"),
  estimatedPrice: numeric("estimated_price"),
  priority: integer("priority").default(3).notNull(),
  url: text("url"),
  notes: text("notes"),
  isPurchased: boolean("is_purchased").default(false).notNull(),
  purchasedItemId: uuid("purchased_item_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
