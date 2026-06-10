import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const sidebarPreferences = pgTable("sidebar_preferences", {
  userId: text("user_id").primaryKey().notNull(),
  favorites: text("favorites").notNull().default("[]"),
  visibility: text("visibility").notNull().default('{"hiddenGroups":[],"hiddenItems":[]}'),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
