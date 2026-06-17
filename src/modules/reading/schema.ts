import { pgTable, text, uuid, timestamp, integer, boolean, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ─── Tables ───────────────────────────────────────────────────────

export const readingItems = pgTable(
  "reading_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),

    // Type discriminator
    type: text("type", { enum: ["book", "article", "pdf", "research_paper"] }).notNull(),

    // Core metadata
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    authors: text("authors").array().default([]).notNull(),
    publisher: text("publisher"),
    isbn: text("isbn"),
    doi: text("doi"),
    journal: text("journal"),
    url: text("url"),
    fileUrl: text("file_url"),
    coverUrl: text("cover_url"),
    description: text("description"),
    language: text("language").default("en"),
    publishedYear: integer("published_year"),
    pageCount: integer("page_count"),

    // Reading status & progress
    status: text("status", {
      enum: ["want_to_read", "reading", "completed", "on_hold", "dropped"],
    })
      .default("want_to_read")
      .notNull(),
    currentPage: integer("current_page").default(0).notNull(),
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    lastOpenedAt: timestamp("last_opened_at", { withTimezone: true }),

    // User review
    rating: integer("rating"),
    review: text("review"),

    // Organization
    tags: text("tags").array().default([]).notNull(),
    isFavorited: boolean("is_favorited").default(false).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    userItemsIdx: index("idx_reading_items_user").on(table.userId, table.type, table.status, table.createdAt.desc()),
    userActiveIdx: index("idx_reading_items_active").on(table.userId, table.deletedAt, table.createdAt.desc()),
    tagsIdx: index("idx_reading_items_tags").using("gin", table.tags),
    authorsIdx: index("idx_reading_items_authors").using("gin", table.authors),
    ftsIdx: index("idx_reading_items_fts").using(
      "gin",
      sql`(to_tsvector('english', ${table.title}) || to_tsvector('english', ${table.description}))`,
    ),
  }),
);

export const readingAnnotations = pgTable(
  "reading_annotations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    readingItemId: uuid("reading_item_id")
      .notNull()
      .references(() => readingItems.id, { onDelete: "cascade" }),

    type: text("type", { enum: ["highlight", "quote"] }).notNull(),
    text: text("text").notNull(),
    color: text("color"),
    note: text("note"),
    page: integer("page"),
    location: text("location"),
    tags: text("tags").array().default([]).notNull(),
    isFavorited: boolean("is_favorited").default(false).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userAnnotationsIdx: index("idx_reading_annotations_user").on(table.userId, table.readingItemId, table.createdAt.desc()),
    ftsAnnotationsIdx: index("idx_reading_annotations_fts").using("gin", sql`to_tsvector('english', ${table.text})`),
  }),
);

export const readingNotes = pgTable(
  "reading_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    readingItemId: uuid("reading_item_id")
      .notNull()
      .references(() => readingItems.id, { onDelete: "cascade" }),

    title: text("title").notNull(),
    content: text("content"),
    tags: text("tags").array().default([]).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    userNotesIdx: index("idx_reading_notes_user").on(table.userId, table.readingItemId, table.createdAt.desc()),
    ftsNotesIdx: index("idx_reading_notes_fts").using("gin", sql`to_tsvector('english', ${table.title})`),
  }),
);

export const readingSessions = pgTable(
  "reading_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    readingItemId: uuid("reading_item_id")
      .notNull()
      .references(() => readingItems.id, { onDelete: "cascade" }),

    startTime: timestamp("start_time", { withTimezone: true }).notNull(),
    endTime: timestamp("end_time", { withTimezone: true }),
    pagesRead: integer("pages_read"),
    note: text("note"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userSessionsIdx: index("idx_reading_sessions_user").on(table.userId, table.readingItemId, table.startTime.desc()),
  }),
);
