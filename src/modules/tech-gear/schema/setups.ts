import { pgTable, text, uuid, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const techSetups = pgTable("tech_setups", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  coverImage: text("cover_image"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
