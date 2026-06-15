import { pgTable, text, uuid, timestamp, integer } from "drizzle-orm/pg-core";
import { outfits } from "./outfits";
import { clothingItems } from "./items";

export const outfitItems = pgTable("outfit_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  outfitId: uuid("outfit_id").notNull().references(() => outfits.id, { onDelete: "cascade" }),
  itemId: uuid("item_id").notNull().references(() => clothingItems.id, { onDelete: "cascade" }),
  position: integer("position").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
