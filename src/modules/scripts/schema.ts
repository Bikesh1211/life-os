import { pgTable, text, uuid, timestamp, integer, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const scriptCategories = pgTable(
  "script_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id"),
    name: text("name").notNull(),
    icon: text("icon").notNull().default("Mic"),
    color: text("color").notNull().default("#6C5CE7"),
    sortOrder: integer("sort_order").notNull().default(0),
    defaultTemplateId: uuid("default_template_id"),
    isArchived: boolean("is_archived").notNull().default(false),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userCategoriesIdx: index("idx_script_categories_user").on(table.userId, table.sortOrder),
    userActiveIdx: index("idx_script_categories_active").on(table.userId, table.isArchived),
  }),
);

export const scriptStructureTemplates = pgTable(
  "script_structure_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id").references(() => scriptCategories.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    sections: jsonb("sections").notNull().default([]),
    isSystem: boolean("is_system").notNull().default(true),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    categoryTemplatesIdx: index("idx_script_templates_category").on(table.categoryId),
  }),
);

export const scripts = pgTable(
  "scripts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),

    title: text("title").notNull(),
    subtitle: text("subtitle"),
    categoryId: uuid("category_id").references(() => scriptCategories.id, { onDelete: "set null" }),
    purpose: text("purpose"),
    audience: text("audience"),
    venue: text("venue"),
    language: text("language").default("en"),
    eventDate: timestamp("event_date", { withTimezone: true }),
    eventTime: text("event_time"),
    expectedDuration: integer("expected_duration"),
    speaker: text("speaker"),
    organization: text("organization"),
    tags: text("tags").array().default([]).notNull(),
    attachments: text("attachments").array().default([]).notNull(),
    priority: text("priority", { enum: ["low", "medium", "high", "critical"] }).default("medium").notNull(),
    difficulty: text("difficulty", { enum: ["easy", "medium", "hard"] }).default("medium").notNull(),
    visibility: text("visibility", { enum: ["private", "public"] }).default("private").notNull(),
    status: text("status", { enum: ["draft", "practicing", "ready", "archived"] }).default("draft").notNull(),
    notes: text("notes"),

    wordCount: integer("word_count").default(0).notNull(),
    sectionCount: integer("section_count").default(0).notNull(),
    totalDurationSeconds: integer("total_duration_seconds").default(0).notNull(),
    isFavorite: boolean("is_favorite").default(false).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    userScriptsIdx: index("idx_scripts_user").on(table.userId, table.status, table.createdAt.desc()),
    userDeletedIdx: index("idx_scripts_user_deleted").on(table.userId, table.deletedAt),
    userFavoritesIdx: index("idx_scripts_favorites").on(table.userId, table.isFavorite),
    ftsIdx: index("idx_scripts_fts").using(
      "gin",
      sql`to_tsvector('english', ${table.title} || ' ' || coalesce(${table.subtitle}, '') || ' ' || coalesce(${table.speaker}, '') || ' ' || coalesce(${table.venue}, ''))`,
    ),
  }),
);

export const scriptSections = pgTable(
  "script_sections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    scriptId: uuid("script_id")
      .notNull()
      .references(() => scripts.id, { onDelete: "cascade" }),

    title: text("title").notNull(),
    content: jsonb("content").notNull().default({ type: "doc", content: [] }),
    sortOrder: integer("sort_order").notNull(),
    wordCount: integer("word_count").default(0).notNull(),
    estimatedDurationSeconds: integer("estimated_duration_seconds").default(0).notNull(),
    speakerNotes: jsonb("speaker_notes"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    scriptSectionsIdx: index("idx_script_sections_script").on(table.scriptId, table.sortOrder),
  }),
);

export const scriptVersions = pgTable(
  "script_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    scriptId: uuid("script_id")
      .notNull()
      .references(() => scripts.id, { onDelete: "cascade" }),

    data: jsonb("data").notNull(),
    note: text("note"),
    wordCount: integer("word_count").default(0).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    scriptVersionsIdx: index("idx_script_versions_script").on(table.scriptId, table.createdAt.desc()),
  }),
);

export const scriptPracticeSessions = pgTable(
  "script_practice_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    scriptId: uuid("script_id")
      .notNull()
      .references(() => scripts.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),

    practicedAt: timestamp("practiced_at", { withTimezone: true }).defaultNow().notNull(),
    durationSeconds: integer("duration_seconds").notNull().default(0),
    confidence: integer("confidence").notNull().default(5),
    mistakes: text("mistakes").array().default([]).notNull(),
    voiceQuality: integer("voice_quality").notNull().default(5),
    eyeContact: integer("eye_contact").notNull().default(5),
    bodyLanguageNotes: text("body_language_notes"),
    rating: integer("rating").notNull().default(5),
    improvements: text("improvements"),
    sectionsPracticed: text("sections_practiced").array().default([]).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    scriptPracticeIdx: index("idx_script_practice_script").on(table.scriptId, table.practicedAt.desc()),
    userPracticeDateIdx: index("idx_script_practice_user_date").on(table.userId, table.practicedAt),
  }),
);

export const scriptQuestions = pgTable(
  "script_questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    scriptId: uuid("script_id")
      .notNull()
      .references(() => scripts.id, { onDelete: "cascade" }),

    question: text("question").notNull(),
    suggestedAnswer: text("suggested_answer"),
    difficulty: text("difficulty", { enum: ["easy", "medium", "hard"] }).default("medium").notNull(),
    confidence: integer("confidence").notNull().default(5),
    status: text("status", { enum: ["needs_practice", "practiced", "mastered"] }).default("needs_practice").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    scriptQuestionsIdx: index("idx_script_questions_script").on(table.scriptId, table.createdAt),
  }),
);

export const scriptActionItems = pgTable(
  "script_action_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    scriptId: uuid("script_id")
      .notNull()
      .references(() => scripts.id, { onDelete: "cascade" }),

    text: text("text").notNull(),
    isCompleted: boolean("is_completed").default(false).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    scriptActionsIdx: index("idx_script_actions_script").on(table.scriptId, table.sortOrder),
  }),
);

export const scriptChecklistItems = pgTable(
  "script_checklist_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    scriptId: uuid("script_id")
      .notNull()
      .references(() => scripts.id, { onDelete: "cascade" }),

    text: text("text").notNull(),
    isCompleted: boolean("is_completed").default(false).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    scriptChecklistIdx: index("idx_script_checklist_script").on(table.scriptId, table.sortOrder),
  }),
);
