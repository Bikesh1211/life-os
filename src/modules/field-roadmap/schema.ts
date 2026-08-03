import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  boolean,
  jsonb,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";

export const roadmapEvidenceTypeEnum = pgEnum("roadmap_evidence_type", [
  "knowledge_entry",
  "interview_prep",
  "portfolio_project",
  "milestone",
]);

/**
 * Reference blueprint for a profession (Software Engineer, Doctor, Teacher, ...).
 * Seeded system content, never user-scoped, never mutated. The user's Roadmap is
 * a cloned snapshot of this blueprint.
 */
export const fieldBlueprints = pgTable(
  "field_blueprints",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    icon: text("icon"),
    color: text("color"),
    /** Array of { name, description, milestones: [{ title, description }] } */
    phases: jsonb("phases").notNull().default([]),
    /** Array of { name, description, aliases: string[] } */
    skills: jsonb("skills").notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index("idx_field_blueprints_slug").on(table.slug),
  }),
);

/**
 * A user's own copy of a Field Blueprint. Cloned at pick time so the user can
 * freely edit milestones, phases, and skills without fighting the shared reference.
 * Anchored to the user's target role via career_profile.targetRole.
 */
export const fieldRoadmaps = pgTable(
  "field_roadmaps",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    blueprintId: uuid("blueprint_id")
      .notNull()
      .references(() => fieldBlueprints.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    description: text("description"),
    icon: text("icon"),
    color: text("color"),
    targetRole: text("target_role"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    userActiveIdx: index("idx_field_roadmaps_user_active").on(
      table.userId,
      table.isActive,
      table.deletedAt,
    ),
  }),
);

export const fieldRoadmapPhases = pgTable(
  "field_roadmap_phases",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    roadmapId: uuid("roadmap_id")
      .notNull()
      .references(() => fieldRoadmaps.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    roadmapIdx: index("idx_roadmap_phases_roadmap").on(table.roadmapId, table.sortOrder),
  }),
);

export const fieldRoadmapMilestones = pgTable(
  "field_roadmap_milestones",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    roadmapId: uuid("roadmap_id")
      .notNull()
      .references(() => fieldRoadmaps.id, { onDelete: "cascade" }),
    phaseId: uuid("phase_id")
      .notNull()
      .references(() => fieldRoadmapPhases.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").default(0).notNull(),
    isCompleted: boolean("is_completed").default(false).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    roadmapIdx: index("idx_roadmap_milestones_roadmap").on(table.roadmapId, table.phaseId),
  }),
);

export const fieldRoadmapSkills = pgTable(
  "field_roadmap_skills",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    roadmapId: uuid("roadmap_id")
      .notNull()
      .references(() => fieldRoadmaps.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    /** Keyword aliases used by the rule-based "find evidence" scan. */
    aliases: text("aliases").array().default([]).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    roadmapIdx: index("idx_roadmap_skills_roadmap").on(table.roadmapId, table.sortOrder),
  }),
);

/**
 * A user-confirmed link proving competency in a Roadmap Skill.
 * Nothing attaches silently — every link is confirmed by the user.
 */
export const fieldRoadmapSkillEvidence = pgTable(
  "field_roadmap_skill_evidence",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => fieldRoadmapSkills.id, { onDelete: "cascade" }),
    entityType: roadmapEvidenceTypeEnum("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    skillIdx: index("idx_roadmap_skill_evidence_skill").on(table.skillId),
    entityIdx: index("idx_roadmap_skill_evidence_entity").on(table.entityType, table.entityId),
  }),
);

export type FieldBlueprint = typeof fieldBlueprints.$inferSelect;
export type FieldRoadmap = typeof fieldRoadmaps.$inferSelect;
export type FieldRoadmapPhase = typeof fieldRoadmapPhases.$inferSelect;
export type FieldRoadmapMilestone = typeof fieldRoadmapMilestones.$inferSelect;
export type FieldRoadmapSkill = typeof fieldRoadmapSkills.$inferSelect;
export type FieldRoadmapSkillEvidence = typeof fieldRoadmapSkillEvidence.$inferSelect;

export type BlueprintPhase = {
  name: string;
  description?: string;
  milestones: Array<{ title: string; description?: string }>;
};

export type BlueprintSkill = {
  name: string;
  description?: string;
  aliases?: string[];
};
