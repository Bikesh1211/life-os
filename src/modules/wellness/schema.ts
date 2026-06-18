import { pgTable, text, uuid, timestamp, integer, date, numeric, uniqueIndex, index, boolean, time, jsonb } from "drizzle-orm/pg-core";

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

// ── 6. Weight Entry ──
export const wellnessWeightEntries = pgTable("wellness_weight_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  weightKg: numeric("weight_kg").notNull(),
  bodyFatPercentage: numeric("body_fat_percentage"),
  musclePercentage: numeric("muscle_percentage"),
  date: date("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userDateIdx: index("idx_wellness_weight_user_date").on(table.userId, table.date),
}));

// ── 7. Workout Entry ──
export const wellnessWorkoutEntries = pgTable("wellness_workout_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  workoutType: text("workout_type").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  caloriesBurned: integer("calories_burned"),
  distanceKm: numeric("distance_km"),
  notes: text("notes"),
  date: date("date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userDateIdx: index("idx_wellness_workout_user_date").on(table.userId, table.date),
  typeIdx: index("idx_wellness_workout_type").on(table.userId, table.workoutType),
}));

// ── 8. Step Entry (one per day) ──
export const wellnessStepEntries = pgTable("wellness_step_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  steps: integer("steps").notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userDateUniq: uniqueIndex("idx_wellness_steps_user_date").on(table.userId, table.date),
}));

// ── 9. Calorie Entry ──
export const wellnessCalorieEntries = pgTable("wellness_calorie_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  mealType: text("meal_type").notNull(),
  calories: integer("calories").notNull(),
  proteinG: numeric("protein_g"),
  carbsG: numeric("carbs_g"),
  fatG: numeric("fat_g"),
  date: date("date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userDateIdx: index("idx_wellness_calories_user_date").on(table.userId, table.date),
}));

// ── 10. Blood Pressure Entry ──
export const wellnessBloodPressureEntries = pgTable("wellness_blood_pressure_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  systolic: integer("systolic").notNull(),
  diastolic: integer("diastolic").notNull(),
  pulse: integer("pulse"),
  date: date("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userDateIdx: index("idx_wellness_bp_user_date").on(table.userId, table.date),
}));

// ── 11. Heart Rate Entry (one per day) ──
export const wellnessHeartRateEntries = pgTable("wellness_heart_rate_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  resting: integer("resting"),
  average: integer("average"),
  max: integer("max"),
  date: date("date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userDateUniq: uniqueIndex("idx_wellness_hr_user_date").on(table.userId, table.date),
}));

// ── 12. Medicine Reminder ──
export const wellnessMedicineReminders = pgTable("wellness_medicine_reminders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  frequency: text("frequency", { enum: ["daily", "weekly", "custom"] }).notNull(),
  time: text("time").notNull(),
  daysOfWeek: integer("days_of_week").array(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userActiveIdx: index("idx_wellness_medicines_user_active").on(table.userId, table.isActive),
}));

// ── 13. Medicine Log ──
export const wellnessMedicineLogs = pgTable("wellness_medicine_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  medicineId: uuid("medicine_id").notNull(),
  status: text("status", { enum: ["taken", "skipped", "snoozed"] }).notNull(),
  scheduledTime: text("scheduled_time").notNull(),
  takenAt: timestamp("taken_at", { withTimezone: true }).defaultNow().notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  medicineDateIdx: index("idx_wellness_medicine_logs_medicine_date").on(table.medicineId, table.date),
}));

// ── 14. User Health Goal ──
export const wellnessUserGoals = pgTable("wellness_user_goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  goalType: text("goal_type").notNull(),
  title: text("title").notNull(),
  targetValue: numeric("target_value").notNull(),
  currentValue: numeric("current_value").default("0").notNull(),
  unit: text("unit").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userActiveIdx: index("idx_wellness_goals_user_active").on(table.userId, table.isActive),
}));

// ── 15. Achievement ──
export const wellnessAchievements = pgTable("wellness_achievements", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  achievementType: text("achievement_type").notNull(),
  title: text("title").notNull(),
  unlockedAt: timestamp("unlocked_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userAchievementUniq: uniqueIndex("idx_wellness_achievements_user_type").on(table.userId, table.achievementType),
}));
