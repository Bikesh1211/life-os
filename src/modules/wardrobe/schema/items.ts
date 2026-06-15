import { pgTable, text, uuid, timestamp, pgEnum, numeric, boolean, integer } from "drizzle-orm/pg-core";
import { CLOTHING_CATEGORIES, CONDITIONS, SEASONS, SIZES } from "../constants";

export const clothingCategoryEnum = pgEnum("clothing_category", CLOTHING_CATEGORIES);
export const clothingConditionEnum = pgEnum("clothing_condition", CONDITIONS);
export const clothingSeasonEnum = pgEnum("clothing_season", SEASONS);
export const clothingSizeEnum = pgEnum("clothing_size", SIZES);

export const clothingItems = pgTable("clothing_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  category: clothingCategoryEnum("category").notNull(),
  subcategory: text("subcategory"),
  brand: text("brand"),
  color: text("color"),
  size: clothingSizeEnum("size"),
  material: text("material"),
  purchaseDate: timestamp("purchase_date", { withTimezone: true }),
  purchasePrice: numeric("purchase_price"),
  currentValue: numeric("current_value"),
  condition: clothingConditionEnum("condition").default("good").notNull(),
  season: clothingSeasonEnum("season").default("all-season").notNull(),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  wearCount: integer("wear_count").default(0).notNull(),
  lastWorn: timestamp("last_worn", { withTimezone: true }),
  laundryStatus: text("laundry_status").default("ready").notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  notes: text("notes"),
  coverImage: text("cover_image"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
