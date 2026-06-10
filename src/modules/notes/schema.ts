import { pgTable, text, uuid, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    category: text("category").default("personal").notNull(),
    tags: text("tags").array().default([]).notNull(),
    isPinned: boolean("is_pinned").default(false).notNull(),
    isArchived: boolean("is_archived").default(false).notNull(),
    reminderDate: timestamp("reminder_date", { withTimezone: true }),
    priority: text("priority").default("medium").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    userActiveIdx: index("idx_notes_user_active").on(table.userId, table.isArchived, table.isPinned.desc(), table.createdAt.desc()),
    categoryIdx: index("idx_notes_category").on(table.userId, table.category),
    tagsIdx: index("idx_notes_tags").using("gin", table.tags),
    ftsIdx: index("idx_notes_fts").using(
      "gin",
      sql`(to_tsvector('english', ${table.title}) || to_tsvector('english', ${table.content}))`,
    ),
  }),
);

export const noteTags = pgTable(
  "note_tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    color: text("color").default("blue").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userTagsIdx: index("idx_note_tags_user").on(table.userId, table.name),
  }),
);
