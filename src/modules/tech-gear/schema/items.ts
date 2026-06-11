import { pgTable, text, uuid, timestamp, pgEnum, numeric, boolean, jsonb, date } from "drizzle-orm/pg-core";
import { OWNERSHIP_STATUSES, CONDITIONS } from "../constants";

export const ownershipStatusEnum = pgEnum("ownership_status", OWNERSHIP_STATUSES);
export const conditionEnum = pgEnum("tech_condition", CONDITIONS);

export const techItems = pgTable("tech_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  brand: text("brand"),
  model: text("model"),
  category: text("category").notNull(),
  serialNumber: text("serial_number"),
  color: text("color"),
  location: text("location"),
  purchasePrice: numeric("purchase_price"),
  purchaseDate: timestamp("purchase_date", { withTimezone: true }),
  warrantyExpiry: timestamp("warranty_expiry", { withTimezone: true }),
  warrantyProvider: text("warranty_provider"),
  ownershipStatus: ownershipStatusEnum("ownership_status").default("owned").notNull(),
  condition: conditionEnum("condition").default("good").notNull(),
  specifications: jsonb("specifications").$type<Record<string, string>>().default({}),
  loanedTo: text("loaned_to"),
  loanDate: timestamp("loan_date", { withTimezone: true }),
  expectedReturnDate: timestamp("expected_return_date", { withTimezone: true }),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  notes: text("notes"),
  coverImage: text("cover_image"),
  isArchived: boolean("is_archived").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
