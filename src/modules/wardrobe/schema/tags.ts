import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { clothingItems } from "./items";

export const wardrobeTags = pgTable("wardrobe_tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  color: text("color"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const wardrobeItemTags = pgTable("wardrobe_item_tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  itemId: uuid("item_id").notNull().references(() => clothingItems.id, { onDelete: "cascade" }),
  tagId: uuid("tag_id").notNull().references(() => wardrobeTags.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
