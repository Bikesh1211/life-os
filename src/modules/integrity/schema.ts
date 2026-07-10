import { pgTable, text, uuid, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";

export const commitmentStatusEnum = pgEnum("commitment_status", [
  "pending",
  "in_progress",
  "completed_unverified",
  "completed_verified",
  "failed",
  "missed",
  "cancelled",
]);

export const commitmentDifficultyEnum = pgEnum("commitment_difficulty", [
  "easy",
  "medium",
  "hard",
  "extreme",
]);

export const commitmentRepeatEnum = pgEnum("commitment_repeat", [
  "none",
  "daily",
  "weekly",
  "monthly",
]);

export const eventTypeEnum = pgEnum("commitment_event_type", [
  "created",
  "started",
  "progress_updated",
  "evidence_uploaded",
  "completed",
  "failed",
  "missed",
  "cancelled",
  "reminder_sent",
  "milestone_reached",
]);

export const integrityCommitments = pgTable("integrity_commitments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  priority: text("priority").default("medium").notNull(),
  difficulty: commitmentDifficultyEnum("difficulty").default("medium").notNull(),
  estimatedTime: integer("estimated_time"),
  dueDate: timestamp("due_date"),
  dueTime: text("due_time"),
  startDate: timestamp("start_date"),
  tags: text("tags").array(),
  color: text("color"),
  icon: text("icon"),
  evidenceRequired: boolean("evidence_required").default(false).notNull(),
  location: text("location"),
  repeatRule: commitmentRepeatEnum("repeat_rule").default("none").notNull(),
  reminderMinutesBefore: integer("reminder_minutes_before"),
  linkedEntityType: text("linked_entity_type"),
  linkedEntityId: text("linked_entity_id"),
  cancellationReason: text("cancellation_reason"),
  status: commitmentStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const integrityCommitmentEvents = pgTable("integrity_commitment_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  commitmentId: uuid("commitment_id")
    .notNull()
    .references(() => integrityCommitments.id, { onDelete: "cascade" }),
  eventType: eventTypeEnum("event_type").notNull(),
  metadata: text("metadata"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const integrityDailyCheckins = pgTable("integrity_daily_checkins", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  date: text("date").notNull(),
  accomplishments: text("accomplishments"),
  excuses: text("excuses"),
  distractions: text("distractions"),
  proudOf: text("proud_of"),
  improvement: text("improvement"),
  excuseTags: text("excuse_tags").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const integrityDailySnapshots = pgTable("integrity_daily_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  date: text("date").notNull(),
  score: integer("score").notNull(),
  streak: integer("streak").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  levelTitle: text("level_title"),
  subScores: text("sub_scores"),
  commitmentRate: integer("commitment_rate").default(0),
  isAllCompleted: text("is_all_completed").default("false"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
