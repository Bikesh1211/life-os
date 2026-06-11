import { pgTable, text, uuid, timestamp, pgEnum, boolean, integer } from "drizzle-orm/pg-core";
import { OCCASIONS, MOODS } from "../constants";

export const outfitOccasionEnum = pgEnum("outfit_occasion", OCCASIONS);
export const outfitMoodEnum = pgEnum("outfit_mood", MOODS);

export const outfits = pgTable("outfits", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  occasion: outfitOccasionEnum("occasion"),
  season: text("season"),
  mood: outfitMoodEnum("mood"),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  coverImage: text("cover_image"),
  notes: text("notes"),
  tags: text("tags").array(),
  wearCount: integer("wear_count").default(0).notNull(),
  lastWorn: timestamp("last_worn", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
