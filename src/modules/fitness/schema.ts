import {
  pgTable, text, uuid, timestamp, integer, boolean, decimal, date, pgEnum, index,
} from "drizzle-orm/pg-core";

export const genderEnum = pgEnum("fitness_gender", ["male", "female", "other"]);
export const activityLevelEnum = pgEnum("fitness_activity_level", [
  "sedentary", "light", "moderate", "active", "very_active",
]);
export const fitnessGoalEnum = pgEnum("fitness_goal", [
  "lose_fat", "build_muscle", "maintain", "improve_endurance", "general_health",
]);
export const muscleGroupEnum = pgEnum("fitness_muscle_group", [
  "chest", "back", "legs", "shoulders", "arms", "core", "full_body", "cardio",
]);
export const equipmentEnum = pgEnum("fitness_equipment", [
  "barbell", "dumbbell", "machine", "bodyweight", "cable", "bands", "kettlebell", "other",
]);
export const forceTypeEnum = pgEnum("fitness_force_type", [
  "push", "pull", "static", "isolation", "compound",
]);
export const difficultyEnum = pgEnum("fitness_difficulty", [
  "beginner", "intermediate", "advanced",
]);
export const workoutGoalEnum = pgEnum("fitness_workout_goal", [
  "lose_fat", "build_muscle", "maintain", "endurance", "general",
]);
export const recordTypeEnum = pgEnum("fitness_record_type", [
  "one_rep_max", "max_weight", "max_reps", "best_volume", "best_time", "best_distance",
]);

export const fitnessProfiles = pgTable(
  "fitness_profiles",
  {
    userId: text("user_id").primaryKey(),
    heightCm: decimal("height_cm", { precision: 5, scale: 1 }),
    dateOfBirth: date("date_of_birth"),
    gender: genderEnum("gender"),
    activityLevel: activityLevelEnum("activity_level").default("moderate").notNull(),
    fitnessGoal: fitnessGoalEnum("fitness_goal").default("general_health").notNull(),
    targetWeightKg: decimal("target_weight_kg", { precision: 5, scale: 1 }),
    weeklyWorkoutGoal: integer("weekly_workout_goal").default(4).notNull(),
    dailyCalorieGoal: integer("daily_calorie_goal").default(2000),
    dailyProteinGoal: integer("daily_protein_goal").default(150),
    dailyWaterGoalMl: integer("daily_water_goal_ml").default(2500),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
);

export const fitnessBodyMeasurements = pgTable(
  "fitness_body_measurements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    date: date("date").notNull(),
    weightKg: decimal("weight_kg", { precision: 5, scale: 1 }),
    bodyFatPercentage: decimal("body_fat_percentage", { precision: 4, scale: 1 }),
    muscleMassKg: decimal("muscle_mass_kg", { precision: 5, scale: 1 }),
    waistCm: decimal("waist_cm", { precision: 4, scale: 1 }),
    hipsCm: decimal("hips_cm", { precision: 4, scale: 1 }),
    chestCm: decimal("chest_cm", { precision: 4, scale: 1 }),
    armsCm: decimal("arms_cm", { precision: 4, scale: 1 }),
    thighsCm: decimal("thighs_cm", { precision: 4, scale: 1 }),
    neckCm: decimal("neck_cm", { precision: 4, scale: 1 }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userDateIdx: index("idx_fitness_body_measurements_user_date").on(table.userId, table.date),
    dateIdx: index("idx_fitness_body_measurements_date").on(table.date),
  }),
);

export const fitnessExerciseLibrary = pgTable(
  "fitness_exercise_library",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id"),
    name: text("name").notNull(),
    muscleGroup: muscleGroupEnum("muscle_group").notNull(),
    equipment: equipmentEnum("equipment").default("bodyweight").notNull(),
    forceType: forceTypeEnum("force_type"),
    difficulty: difficultyEnum("difficulty").default("beginner").notNull(),
    instructions: text("instructions"),
    videoUrl: text("video_url"),
    isCardio: boolean("is_cardio").default(false).notNull(),
    isBodyweight: boolean("is_bodyweight").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: index("idx_fitness_exercises_name").on(table.name),
    muscleIdx: index("idx_fitness_exercises_muscle").on(table.muscleGroup),
  }),
);

export const fitnessWorkoutPrograms = pgTable(
  "fitness_workout_programs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    goal: workoutGoalEnum("goal").default("general").notNull(),
    daysPerWeek: integer("days_per_week").notNull(),
    durationWeeks: integer("duration_weeks"),
    difficulty: difficultyEnum("difficulty").default("beginner").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    isTemplate: boolean("is_template").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("idx_fitness_programs_user").on(table.userId),
  }),
);

export const fitnessProgramDays = pgTable(
  "fitness_program_days",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    programId: uuid("program_id").notNull().references(() => fitnessWorkoutPrograms.id, { onDelete: "cascade" }),
    dayNumber: integer("day_number").notNull(),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    programIdx: index("idx_fitness_program_days_program").on(table.programId),
  }),
);

export const fitnessProgramExercises = pgTable(
  "fitness_program_exercises",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    programDayId: uuid("program_day_id").notNull().references(() => fitnessProgramDays.id, { onDelete: "cascade" }),
    exerciseId: uuid("exercise_id").notNull().references(() => fitnessExerciseLibrary.id),
    sortOrder: integer("sort_order").default(0).notNull(),
    targetSets: integer("target_sets"),
    targetReps: text("target_reps"),
    targetWeightKg: decimal("target_weight_kg", { precision: 5, scale: 1 }),
    restSeconds: integer("rest_seconds").default(90),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    dayIdx: index("idx_fitness_program_exercises_day").on(table.programDayId),
  }),
);

export const fitnessWorkoutSessions = pgTable(
  "fitness_workout_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    programDayId: uuid("program_day_id").references(() => fitnessProgramDays.id),
    name: text("name"),
    date: date("date").notNull(),
    startTime: text("start_time"),
    endTime: text("end_time"),
    durationMinutes: integer("duration_minutes"),
    mood: integer("mood"),
    energy: integer("energy"),
    notes: text("notes"),
    isCompleted: boolean("is_completed").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userDateIdx: index("idx_fitness_sessions_user_date").on(table.userId, table.date),
    programDayIdx: index("idx_fitness_sessions_program_day").on(table.programDayId),
  }),
);

export const fitnessExerciseSets = pgTable(
  "fitness_exercise_sets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id").notNull().references(() => fitnessWorkoutSessions.id, { onDelete: "cascade" }),
    exerciseId: uuid("exercise_id").notNull().references(() => fitnessExerciseLibrary.id),
    exerciseName: text("exercise_name").notNull(),
    setNumber: integer("set_number").notNull(),
    reps: integer("reps"),
    weightKg: decimal("weight_kg", { precision: 5, scale: 1 }),
    rpe: integer("rpe"),
    durationSeconds: integer("duration_seconds"),
    distanceMeters: decimal("distance_meters", { precision: 7, scale: 1 }),
    isWarmup: boolean("is_warmup").default(false).notNull(),
    isDropSet: boolean("is_drop_set").default(false).notNull(),
    isFailure: boolean("is_failure").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    sessionIdx: index("idx_fitness_exercise_sets_session").on(table.sessionId),
  }),
);

export const fitnessPersonalRecords = pgTable(
  "fitness_personal_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    exerciseId: uuid("exercise_id").notNull().references(() => fitnessExerciseLibrary.id),
    recordType: recordTypeEnum("record_type").notNull(),
    value: decimal("value", { precision: 7, scale: 1 }).notNull(),
    reps: integer("reps"),
    sessionId: uuid("session_id").references(() => fitnessWorkoutSessions.id),
    achievedAt: timestamp("achieved_at", { withTimezone: true }).defaultNow().notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userExerciseTypeIdx: index("idx_fitness_prs_user_exercise_type").on(table.userId, table.exerciseId, table.recordType),
  }),
);
