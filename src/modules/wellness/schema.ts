import { pgTable, text, uuid, timestamp, integer, date, numeric, uniqueIndex, index } from "drizzle-orm/pg-core";

// ── 1. Mood Log ──
export const wellnessMoodLogs = pgTable("wellness_mood_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  loggedAt: timestamp("logged_at", { withTimezone: true }).defaultNow().notNull(),

  // 8 dimensions 1-10
  happiness: integer("happiness").notNull(),
  stress: integer("stress").notNull(),
  anxiety: integer("anxiety").notNull(),
  motivation: integer("motivation").notNull(),
  energy: integer("energy").notNull(),
  confidence: integer("confidence").notNull(),
  focus: integer("focus").notNull(),
  mentalFatigue: integer("mental_fatigue").notNull(),

  notes: text("notes"),
  tags: text("tags").array(),
  emoji: text("emoji"),
  voiceNoteUrl: text("voice_note_url"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userTimeIdx: index("idx_wellness_mood_user_time").on(table.userId, table.loggedAt),
}));

// ── 2. Sleep Record ──
export const wellnessSleepRecords = pgTable("wellness_sleep_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  bedtime: timestamp("bedtime", { withTimezone: true }).notNull(),
  wakeTime: timestamp("wake_time", { withTimezone: true }).notNull(),
  quality: integer("quality"),
  interruptions: integer("interruptions").default(0).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userBedtimeIdx: index("idx_wellness_sleep_user_time").on(table.userId, table.bedtime),
}));

// ── 3. Hydration Entry ──
export const wellnessHydrationEntries = pgTable("wellness_hydration_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  date: date("date").notNull(),
  amountMl: integer("amount_ml").notNull(),
  loggedAt: timestamp("logged_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userDateIdx: index("idx_wellness_hydration_user_date").on(table.userId, table.date),
}));

// ── 4. Confidence Check-in (one per day) ──
export const wellnessConfidenceCheckins = pgTable("wellness_confidence_checkins", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  date: date("date").notNull(),
  score: integer("score").notNull(),
  selfEsteem: integer("self_esteem"),
  socialComfort: integer("social_comfort"),
  publicSpeakingConfidence: integer("public_speaking_confidence"),
  appearanceSatisfaction: integer("appearance_satisfaction"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userDateUniq: uniqueIndex("idx_wellness_confidence_user_date").on(table.userId, table.date),
}));

// ── 5. Wellness Habit Enrichment (one per habit) ──
export const wellnessHabitEnrichment = pgTable("wellness_habit_enrichment", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  habitId: uuid("habit_id").notNull(),
  wellnessType: text("wellness_type", { enum: ["grooming", "hygiene", "self-care", "confidence"] }).notNull(),
  subcategory: text("subcategory"),
  lastCompletedDate: date("last_completed_date"),
  nextDueDate: date("next_due_date"),
  reminderDaysBefore: integer("reminder_days_before").default(3).notNull(),
  seasonalMonths: integer("seasonal_months").array(),
  estimatedCost: numeric("estimated_cost"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userHabitUniq: uniqueIndex("idx_wellness_enrichment_habit").on(table.userId, table.habitId),
  wellnessTypeIdx: index("idx_wellness_enrichment_type").on(table.userId, table.wellnessType),
  dueDateIdx: index("idx_wellness_enrichment_due").on(table.nextDueDate),
}));
