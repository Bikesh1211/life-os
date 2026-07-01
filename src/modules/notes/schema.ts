import { pgTable, text, uuid, timestamp, boolean, integer, jsonb, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    contentJson: jsonb("content_json"),
    excerpt: text("excerpt"),
    coverImage: text("cover_image"),
    category: text("category").default("personal").notNull(),
    tags: text("tags").array().default([]).notNull(),
    isPinned: boolean("is_pinned").default(false).notNull(),
    status: text("status").default("published").notNull(),
    folderId: uuid("folder_id"),
    reminderDate: timestamp("reminder_date", { withTimezone: true }),
    color: text("color"),
    priority: text("priority").default("medium").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    userActiveIdx: index("idx_notes_user_active").on(table.userId, table.status, table.isPinned.desc(), table.createdAt.desc()),
    categoryIdx: index("idx_notes_category").on(table.userId, table.category),
    tagsIdx: index("idx_notes_tags").using("gin", table.tags),
    ftsIdx: index("idx_notes_fts").using(
      "gin",
      sql`(to_tsvector('english', ${table.title}) || to_tsvector('english', ${table.content}))`,
    ),
    folderIdx: index("idx_notes_folder").on(table.userId, table.folderId),
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

export const noteFolders = pgTable(
  "note_folders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    parentId: uuid("parent_id"),
    color: text("color").default("blue").notNull(),
    icon: text("icon"),
    order: integer("order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userFoldersIdx: index("idx_note_folders_user").on(table.userId, table.parentId),
  }),
);

export const noteLinks = pgTable(
  "note_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    noteId: uuid("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    linkedNoteId: uuid("linked_note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    noteLinksIdx: index("idx_note_links_note").on(table.noteId),
    linkedNoteIdx: index("idx_note_links_linked").on(table.linkedNoteId),
  }),
);
