import { pgTable, text, uuid, timestamp, integer } from "drizzle-orm/pg-core";
import { techSetups } from "./setups";
import { techItems } from "./items";

export const techSetupItems = pgTable("tech_setup_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  setupId: uuid("setup_id").notNull().references(() => techSetups.id, { onDelete: "cascade" }),
  itemId: uuid("item_id").notNull().references(() => techItems.id, { onDelete: "cascade" }),
  position: integer("position").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
