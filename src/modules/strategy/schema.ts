import { pgTable, text, uuid, timestamp, integer, boolean, jsonb, index } from "drizzle-orm/pg-core";

export const strategySections = pgTable(
  "strategy_sections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    sectionType: text("section_type").notNull(),
    content: jsonb("content").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    isPinned: boolean("is_pinned").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    userSectionsIdx: index("idx_strategy_user_sections").on(table.userId, table.sectionType, table.sortOrder),
    userActiveIdx: index("idx_strategy_user_active").on(table.userId, table.deletedAt),
  }),
);

export const strategyVersions = pgTable(
  "strategy_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    versionNumber: integer("version_number").notNull(),
    snapshot: jsonb("snapshot").notNull(),
    summary: text("summary"),
    wordCount: integer("word_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userVersionsIdx: index("idx_strategy_versions_user").on(table.userId, table.versionNumber.desc()),
  }),
);
