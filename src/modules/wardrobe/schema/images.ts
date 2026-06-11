import { pgTable, text, uuid, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { clothingItems } from "./items";

export const clothingImages = pgTable("clothing_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  itemId: uuid("item_id").notNull().references(() => clothingItems.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  isCover: boolean("is_cover").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
