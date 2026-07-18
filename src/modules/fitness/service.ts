import { cache } from "react";
import { z } from "zod";
import {
  getProfile,
  upsertProfile,
  createBodyMeasurement,
  getBodyMeasurements,
  getLatestBodyMeasurement,
  getExercises,
  getExerciseById,
  createWorkoutProgram,
  getWorkoutPrograms,
  getWorkoutProgramById,
  updateWorkoutProgram,
  deleteWorkoutProgram,
  createProgramDay,
  getProgramDays,
  deleteProgramDay,
  createProgramExercise,
  getProgramExercises,
  getProgramExercisesWithLibrary,
  deleteProgramExercise,
  createWorkoutSession,
  getWorkoutSessionById,
  getWorkoutSessions,
  updateWorkoutSession,
  deleteWorkoutSession,
  createExerciseSet,
  createExerciseSets,
  getExerciseSets,
  deleteExerciseSetsBySession,
  getPersonalRecords,
  getPersonalRecordForExercise,
  upsertPersonalRecord,
  getWeeklyWorkoutMinutes,
  getWorkoutStreak,
  getSessionVolume,
  type CreateFitnessProfileInput,
  type UpdateFitnessProfileInput,
  type CreateBodyMeasurementInput,
  type CreateWorkoutProgramInput,
  type CreateProgramDayInput,
  type CreateProgramExerciseInput,
  type CreateWorkoutSessionInput,
  type CreateExerciseSetInput,
  type SetRecordCheck,
} from "./repository";

// === CONSTANTS ===
const genders = ["male", "female", "other"] as const;
const activityLevels = ["sedentary", "light", "moderate", "active", "very_active"] as const;
const fitnessGoals = ["lose_fat", "build_muscle", "maintain", "improve_endurance", "general_health"] as const;
const muscleGroups = ["chest", "back", "legs", "shoulders", "arms", "core", "full_body", "cardio"] as const;
const equipment = ["barbell", "dumbbell", "machine", "bodyweight", "cable", "bands", "kettlebell", "other"] as const;
const difficulties = ["beginner", "intermediate", "advanced"] as const;
const recordTypes = ["one_rep_max", "max_weight", "max_reps", "best_volume", "best_time", "best_distance"] as const;

// === ZOD SCHEMAS ===

export const updateProfileSchema = z.object({
  heightCm: z.coerce.number().positive().max(300).optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.enum(genders).optional().nullable(),
  activityLevel: z.enum(activityLevels).optional(),
  fitnessGoal: z.enum(fitnessGoals).optional(),
  targetWeightKg: z.coerce.number().positive().max(500).optional().nullable(),
  weeklyWorkoutGoal: z.coerce.number().int().min(1).max(21).optional(),
  dailyCalorieGoal: z.coerce.number().int().positive().optional().nullable(),
  dailyProteinGoal: z.coerce.number().int().positive().optional().nullable(),
  dailyWaterGoalMl: z.coerce.number().int().positive().optional().nullable(),
});

export const createMeasurementSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weightKg: z.coerce.number().positive().max(500).optional().nullable(),
  bodyFatPercentage: z.coerce.number().min(1).max(70).optional().nullable(),
  muscleMassKg: z.coerce.number().positive().max(200).optional().nullable(),
  waistCm: z.coerce.number().positive().max(200).optional().nullable(),
  hipsCm: z.coerce.number().positive().max(200).optional().nullable(),
  chestCm: z.coerce.number().positive().max(200).optional().nullable(),
  armsCm: z.coerce.number().positive().max(100).optional().nullable(),
  thighsCm: z.coerce.number().positive().max(100).optional().nullable(),
  neckCm: z.coerce.number().positive().max(80).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const createProgramSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional().nullable(),
  goal: z.enum(["lose_fat", "build_muscle", "maintain", "endurance", "general"]).optional(),
  daysPerWeek: z.coerce.number().int().min(1).max(7),
  durationWeeks: z.coerce.number().int().min(1).max(52).optional().nullable(),
  difficulty: z.enum(difficulties).optional(),
  isActive: z.coerce.boolean().optional(),
});

export const createSessionSchema = z.object({
  programDayId: z.string().uuid().optional().nullable(),
  name: z.string().max(200).optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  durationMinutes: z.coerce.number().int().positive().optional().nullable(),
  mood: z.coerce.number().int().min(1).max(5).optional().nullable(),
  energy: z.coerce.number().int().min(1).max(5).optional().nullable(),
  notes: z.string().optional().nullable(),
  isCompleted: z.coerce.boolean().optional(),
});

const createSetSchema = z.object({
  exerciseId: z.string().uuid(),
  exerciseName: z.string().min(1),
  setNumber: z.coerce.number().int().min(1),
  reps: z.coerce.number().int().min(0).optional().nullable(),
  weightKg: z.coerce.number().positive().max(1000).optional().nullable(),
  rpe: z.coerce.number().int().min(1).max(10).optional().nullable(),
  durationSeconds: z.coerce.number().int().positive().optional().nullable(),
  distanceMeters: z.coerce.number().positive().optional().nullable(),
  isWarmup: z.coerce.boolean().optional(),
  isDropSet: z.coerce.boolean().optional(),
  isFailure: z.coerce.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export const createSetsSchema = z.object({
  sessionId: z.string().uuid(),
  sets: z.array(createSetSchema).min(1),
});

// === INFERRED TYPES ===
export type UpdateProfileParams = z.infer<typeof updateProfileSchema>;
export type CreateMeasurementParams = z.infer<typeof createMeasurementSchema>;
export type CreateProgramParams = z.infer<typeof createProgramSchema>;

// === PROFILE ===

export const getFitnessProfile = cache(async (userId: string) => {
  return getProfile(userId);
});

export async function saveFitnessProfile(userId: string, params: UpdateProfileParams) {
  const validated = updateProfileSchema.parse(params);
  const input: UpdateFitnessProfileInput = {};
  if (validated.heightCm !== undefined) input.heightCm = validated.heightCm?.toString() ?? null;
  if (validated.dateOfBirth !== undefined) input.dateOfBirth = validated.dateOfBirth;
  if (validated.gender !== undefined) input.gender = validated.gender;
  if (validated.activityLevel !== undefined) input.activityLevel = validated.activityLevel;
  if (validated.fitnessGoal !== undefined) input.fitnessGoal = validated.fitnessGoal;
  if (validated.targetWeightKg !== undefined) input.targetWeightKg = validated.targetWeightKg?.toString() ?? null;
  if (validated.weeklyWorkoutGoal !== undefined) input.weeklyWorkoutGoal = validated.weeklyWorkoutGoal;
  if (validated.dailyCalorieGoal !== undefined) input.dailyCalorieGoal = validated.dailyCalorieGoal ?? null;
  if (validated.dailyProteinGoal !== undefined) input.dailyProteinGoal = validated.dailyProteinGoal ?? null;
  if (validated.dailyWaterGoalMl !== undefined) input.dailyWaterGoalMl = validated.dailyWaterGoalMl ?? null;
  return upsertProfile(userId, input);
}

// === BODY MEASUREMENTS ===

export async function logBodyMeasurement(userId: string, params: CreateMeasurementParams) {
  const validated = createMeasurementSchema.parse(params);
  const input: CreateBodyMeasurementInput = { userId, date: validated.date };
  if (validated.weightKg !== undefined) input.weightKg = validated.weightKg?.toString() ?? null;
  if (validated.bodyFatPercentage !== undefined) input.bodyFatPercentage = validated.bodyFatPercentage?.toString() ?? null;
  if (validated.muscleMassKg !== undefined) input.muscleMassKg = validated.muscleMassKg?.toString() ?? null;
  if (validated.waistCm !== undefined) input.waistCm = validated.waistCm?.toString() ?? null;
  if (validated.hipsCm !== undefined) input.hipsCm = validated.hipsCm?.toString() ?? null;
  if (validated.chestCm !== undefined) input.chestCm = validated.chestCm?.toString() ?? null;
  if (validated.armsCm !== undefined) input.armsCm = validated.armsCm?.toString() ?? null;
  if (validated.thighsCm !== undefined) input.thighsCm = validated.thighsCm?.toString() ?? null;
  if (validated.neckCm !== undefined) input.neckCm = validated.neckCm?.toString() ?? null;
  if (validated.notes !== undefined) input.notes = validated.notes ?? null;
  return createBodyMeasurement(input);
}

export const getMeasurementHistory = cache(async (userId: string, dateFrom?: string, dateTo?: string) => {
  return getBodyMeasurements(userId, dateFrom, dateTo);
});

export const getLatestMeasurement = cache(async (userId: string) => {
  return getLatestBodyMeasurement(userId);
});

// === EXERCISE LIBRARY ===

export const getExerciseLibrary = cache(async (filters?: { muscleGroup?: string; equipment?: string; search?: string }) => {
  return getExercises(filters);
});

export const getExercise = cache(async (id: string) => {
  return getExerciseById(id);
});

// === WORKOUT PROGRAMS ===

export async function createProgram(userId: string, params: CreateProgramParams) {
  const validated = createProgramSchema.parse(params);
  const input: CreateWorkoutProgramInput = {
    userId,
    name: validated.name,
    description: validated.description ?? null,
    goal: validated.goal ?? "general",
    daysPerWeek: validated.daysPerWeek,
    durationWeeks: validated.durationWeeks ?? null,
    difficulty: validated.difficulty ?? "beginner",
    isActive: validated.isActive ?? true,
  };
  return createWorkoutProgram(input);
}

export const getPrograms = cache(async (userId: string) => {
  return getWorkoutPrograms(userId);
});

export const getProgram = cache(async (id: string, userId: string) => {
  return getWorkoutProgramById(id, userId);
});

export async function updateProgram(id: string, userId: string, params: Partial<CreateProgramParams>) {
  const input: Partial<CreateWorkoutProgramInput> = {};
  if (params.name !== undefined) input.name = params.name;
  if (params.description !== undefined) input.description = params.description ?? null;
  if (params.goal !== undefined) input.goal = params.goal;
  if (params.daysPerWeek !== undefined) input.daysPerWeek = params.daysPerWeek;
  if (params.durationWeeks !== undefined) input.durationWeeks = params.durationWeeks ?? null;
  if (params.difficulty !== undefined) input.difficulty = params.difficulty;
  if (params.isActive !== undefined) input.isActive = params.isActive;
  return updateWorkoutProgram(id, userId, input);
}

export async function removeProgram(id: string, userId: string) {
  return deleteWorkoutProgram(id, userId);
}

// === PROGRAM DAYS ===

export async function addProgramDay(programId: string, dayNumber: number, name: string) {
  const existingDays = await getProgramDays(programId);
  return createProgramDay({
    programId,
    dayNumber,
    name,
    sortOrder: existingDays.length,
  });
}

export const getProgramDaysWithExercises = cache(async (programId: string) => {
  const days = await getProgramDays(programId);
  const daysWithExercises = await Promise.all(
    days.map(async (day) => {
      const exercises = await getProgramExercisesWithLibrary(day.id);
      return { ...day, exercises };
    }),
  );
  return daysWithExercises;
});

// === WORKOUT SESSIONS ===

export async function startWorkoutSession(userId: string, date: string, programDayId?: string | null) {
  let name: string | null = null;
  if (programDayId) {
    const days = await getProgramDays(programDayId);
    const day = days[0];
    if (day) name = day.name;
  }

  const session = await createWorkoutSession({
    userId,
    programDayId: programDayId ?? null,
    name,
    date,
    isCompleted: false,
  });

  return session;
}

export async function saveWorkoutSession(
  id: string,
  userId: string,
  params: z.infer<typeof createSessionSchema>,
) {
  const validated = createSessionSchema.parse(params);
  const input: Partial<CreateWorkoutSessionInput> = {};
  if (validated.name !== undefined) input.name = validated.name ?? null;
  if (validated.startTime !== undefined) input.startTime = validated.startTime ?? null;
  if (validated.endTime !== undefined) input.endTime = validated.endTime ?? null;
  if (validated.durationMinutes !== undefined) input.durationMinutes = validated.durationMinutes ?? null;
  if (validated.mood !== undefined) input.mood = validated.mood ?? null;
  if (validated.energy !== undefined) input.energy = validated.energy ?? null;
  if (validated.notes !== undefined) input.notes = validated.notes ?? null;
  if (validated.isCompleted !== undefined) input.isCompleted = validated.isCompleted;
  return updateWorkoutSession(id, userId, input);
}

export async function completeWorkoutSession(id: string, userId: string) {
  const session = await getWorkoutSessionById(id, userId);
  if (!session) return null;

  const duration = session.startTime && session.endTime
    ? computeDurationMinutes(session.startTime, session.endTime)
    : null;

  const updated = await updateWorkoutSession(id, userId, {
    isCompleted: true,
    durationMinutes: duration,
    endTime: new Date().toTimeString().slice(0, 5),
  });

  // Check for personal records
  const sets = await getExerciseSets(id);
  for (const set of sets) {
    await checkAndUpdatePR(userId, set);
  }

  // Fire cross-plugin events
  await fireWorkoutCompletedEvents(userId, id, duration ?? 0);

  return updated;
}

function computeDurationMinutes(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

export const getSession = cache(async (id: string, userId: string) => {
  return getWorkoutSessionById(id, userId);
});

export const getSessions = cache(async (userId: string, options?: { dateFrom?: string; dateTo?: string; limit?: number }) => {
  return getWorkoutSessions(userId, options);
});

export async function removeWorkoutSession(id: string, userId: string) {
  return deleteWorkoutSession(id, userId);
}

// === EXERCISE SETS ===

export async function logExerciseSets(sessionId: string, sets: CreateExerciseSetInput[]) {
  // Delete existing sets for this session and recreate
  await deleteExerciseSetsBySession(sessionId);
  if (sets.length === 0) return [];
  return createExerciseSets(sets);
}

export const getSetsForSession = cache(async (sessionId: string) => {
  return getExerciseSets(sessionId);
});

// === PERSONAL RECORDS ===

async function checkAndUpdatePR(userId: string, set: SetRecordCheck) {
  const weightNum = set.weightKg ? Number(set.weightKg) : 0;
  const volume = set.weightKg && set.reps ? Number(set.weightKg) * set.reps : 0;

  const checks: { type: string; value: number }[] = [];

  if (set.reps === 1 && weightNum > 0) {
    checks.push({ type: "one_rep_max", value: weightNum });
  }
  if (weightNum > 0) {
    checks.push({ type: "max_weight", value: weightNum });
  }
  if (set.reps && !set.isFailure && set.reps > 0) {
    checks.push({ type: "max_reps", value: set.reps });
  }
  if (volume > 0) {
    checks.push({ type: "best_volume", value: volume });
  }

  for (const check of checks) {
    const existing = await getPersonalRecordForExercise(userId, set.exerciseId, check.type);
    if (!existing || Number(existing.value) < check.value) {
      await upsertPersonalRecord(
        userId,
        set.exerciseId,
        check.type,
        check.value.toString(),
        set.reps,
        set.sessionId ?? null,
      );
    }
  }
}

export const getPRs = cache(async (userId: string) => {
  return getPersonalRecords(userId);
});

// === DASHBOARD STATS ===

export const getDashboardStats = cache(async (userId: string) => {
  const [profile, weeklyMinutes, streak, sessions, latestMeasurement] = await Promise.all([
    getProfile(userId),
    getWeeklyWorkoutMinutes(userId),
    getWorkoutStreak(userId),
    getWorkoutSessions(userId, { limit: 5 }),
    getLatestBodyMeasurement(userId),
  ]);

  return {
    profile,
    weeklyWorkoutMinutes: weeklyMinutes,
    streak,
    weeklyGoal: profile?.weeklyWorkoutGoal ?? 4,
    recentSessions: sessions,
    latestMeasurement,
  };
});

// === CROSS-PLUGIN INTEGRATION ===

async function fireWorkoutCompletedEvents(userId: string, sessionId: string, durationMinutes: number) {
  try {
    const { createTimelineEvent } = await import("@/modules/timeline");
    await createTimelineEvent(userId, {
      title: `Workout completed`,
      eventDate: new Date().toISOString(),
      category: "health",
      importance: "medium",
      linkedEntityId: sessionId,
      linkedEntityType: "fitness_workout",
      durationMinutes,
    });
  } catch {
    // Timeline plugin may not be available
  }

  try {
    const { awardXp } = await import("@/modules/gamification");
    await awardXp(userId, "workout_logged", sessionId, "Workout completed", 5);
  } catch {
    // Gamification may not be available
  }
}
