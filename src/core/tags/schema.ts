import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";

export const coreTags = pgTable("core_tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  color: text("color"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const coreTaggings = pgTable("core_taggings", {
  id: uuid("id").defaultRandom().primaryKey(),
  tagId: uuid("tag_id").notNull().references(() => coreTags.id, { onDelete: "cascade" }),
  entityId: uuid("entity_id").notNull(),
  entityType: text("entity_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
