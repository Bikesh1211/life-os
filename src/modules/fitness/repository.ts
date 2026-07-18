import { db } from "@/core/database";
import {
  fitnessProfiles,
  fitnessBodyMeasurements,
  fitnessExerciseLibrary,
  fitnessWorkoutPrograms,
  fitnessProgramDays,
  fitnessProgramExercises,
  fitnessWorkoutSessions,
  fitnessExerciseSets,
  fitnessPersonalRecords,
} from "./schema";
import { eq, and, desc, asc, sql, lte, gte } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

// === TYPE INFERENCE ===
export type FitnessProfile = typeof fitnessProfiles.$inferSelect;
export type BodyMeasurement = typeof fitnessBodyMeasurements.$inferSelect;
export type Exercise = typeof fitnessExerciseLibrary.$inferSelect;
export type WorkoutProgram = typeof fitnessWorkoutPrograms.$inferSelect;
export type ProgramDay = typeof fitnessProgramDays.$inferSelect;
export type ProgramExercise = typeof fitnessProgramExercises.$inferSelect;
export type WorkoutSession = typeof fitnessWorkoutSessions.$inferSelect;
export type ExerciseSet = typeof fitnessExerciseSets.$inferSelect;
export type PersonalRecord = typeof fitnessPersonalRecords.$inferSelect;

// === INPUT TYPES ===

type EnumActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
type EnumFitnessGoal = "lose_fat" | "build_muscle" | "maintain" | "improve_endurance" | "general_health";
type EnumDifficulty = "beginner" | "intermediate" | "advanced";
type EnumWorkoutGoal = "lose_fat" | "build_muscle" | "maintain" | "endurance" | "general";

export type CreateFitnessProfileInput = {
  userId: string;
  heightCm?: string | null;
  dateOfBirth?: string | null;
  gender?: "male" | "female" | "other" | null;
  activityLevel?: EnumActivityLevel;
  fitnessGoal?: EnumFitnessGoal;
  targetWeightKg?: string | null;
  weeklyWorkoutGoal?: number;
  dailyCalorieGoal?: number | null;
  dailyProteinGoal?: number | null;
  dailyWaterGoalMl?: number | null;
};

export type UpdateFitnessProfileInput = Partial<Omit<CreateFitnessProfileInput, "userId">>;

export type CreateBodyMeasurementInput = {
  userId: string;
  date: string;
  weightKg?: string | null;
  bodyFatPercentage?: string | null;
  muscleMassKg?: string | null;
  waistCm?: string | null;
  hipsCm?: string | null;
  chestCm?: string | null;
  armsCm?: string | null;
  thighsCm?: string | null;
  neckCm?: string | null;
  notes?: string | null;
};

export type CreateWorkoutProgramInput = {
  userId: string;
  name: string;
  description?: string | null;
  goal?: EnumWorkoutGoal;
  daysPerWeek: number;
  durationWeeks?: number | null;
  difficulty?: EnumDifficulty;
  isActive?: boolean;
  isTemplate?: boolean;
};

export type CreateProgramDayInput = {
  programId: string;
  dayNumber: number;
  name: string;
  sortOrder?: number;
};

export type CreateProgramExerciseInput = {
  programDayId: string;
  exerciseId: string;
  sortOrder?: number;
  targetSets?: number | null;
  targetReps?: string | null;
  targetWeightKg?: string | null;
  restSeconds?: number;
  notes?: string | null;
};

export type CreateWorkoutSessionInput = {
  userId: string;
  programDayId?: string | null;
  name?: string | null;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  durationMinutes?: number | null;
  mood?: number | null;
  energy?: number | null;
  notes?: string | null;
  isCompleted?: boolean;
};

export type CreateExerciseSetInput = {
  sessionId: string;
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  reps?: number | null;
  weightKg?: string | null;
  rpe?: number | null;
  durationSeconds?: number | null;
  distanceMeters?: string | null;
  isWarmup?: boolean;
  isDropSet?: boolean;
  isFailure?: boolean;
  sortOrder?: number;
};

export type SetRecordCheck = {
  exerciseId: string;
  reps: number | null;
  weightKg: string | null;
  isFailure: boolean;
  sessionId: string | null;
};

// === PROFILES ===

export async function getProfile(userId: string): Promise<FitnessProfile | null> {
  const [profile] = await db
    .select()
    .from(fitnessProfiles)
    .where(eq(fitnessProfiles.userId, userId))
    .limit(1);
  return profile ?? null;
}

export async function upsertProfile(userId: string, input: UpdateFitnessProfileInput): Promise<FitnessProfile> {
  const values: Record<string, unknown> = { userId, updatedAt: new Date() };
  if (input.heightCm !== undefined) values.heightCm = input.heightCm;
  if (input.dateOfBirth !== undefined) values.dateOfBirth = input.dateOfBirth;
  if (input.gender !== undefined) values.gender = input.gender;
  if (input.activityLevel !== undefined) values.activityLevel = input.activityLevel;
  if (input.fitnessGoal !== undefined) values.fitnessGoal = input.fitnessGoal;
  if (input.targetWeightKg !== undefined) values.targetWeightKg = input.targetWeightKg;
  if (input.weeklyWorkoutGoal !== undefined) values.weeklyWorkoutGoal = input.weeklyWorkoutGoal;
  if (input.dailyCalorieGoal !== undefined) values.dailyCalorieGoal = input.dailyCalorieGoal;
  if (input.dailyProteinGoal !== undefined) values.dailyProteinGoal = input.dailyProteinGoal;
  if (input.dailyWaterGoalMl !== undefined) values.dailyWaterGoalMl = input.dailyWaterGoalMl;

  const [profile] = await db
    .insert(fitnessProfiles)
    .values(values as any)
    .onConflictDoUpdate({
      target: fitnessProfiles.userId,
      set: values as any,
    })
    .returning();
  return profile;
}

// === BODY MEASUREMENTS ===

export const bodyMeasurementColumns = {
  id: fitnessBodyMeasurements.id,
  userId: fitnessBodyMeasurements.userId,
  date: fitnessBodyMeasurements.date,
  weightKg: fitnessBodyMeasurements.weightKg,
  bodyFatPercentage: fitnessBodyMeasurements.bodyFatPercentage,
  muscleMassKg: fitnessBodyMeasurements.muscleMassKg,
  waistCm: fitnessBodyMeasurements.waistCm,
  hipsCm: fitnessBodyMeasurements.hipsCm,
  chestCm: fitnessBodyMeasurements.chestCm,
  armsCm: fitnessBodyMeasurements.armsCm,
  thighsCm: fitnessBodyMeasurements.thighsCm,
  neckCm: fitnessBodyMeasurements.neckCm,
  notes: fitnessBodyMeasurements.notes,
  createdAt: fitnessBodyMeasurements.createdAt,
};

export async function createBodyMeasurement(input: CreateBodyMeasurementInput): Promise<BodyMeasurement> {
  const [measurement] = await db
    .insert(fitnessBodyMeasurements)
    .values(input)
    .returning(bodyMeasurementColumns);
  return measurement;
}

export async function getBodyMeasurements(
  userId: string,
  dateFrom?: string,
  dateTo?: string,
  limit = 50,
): Promise<BodyMeasurement[]> {
  const conditions: SQL[] = [eq(fitnessBodyMeasurements.userId, userId)];
  if (dateFrom) conditions.push(gte(fitnessBodyMeasurements.date, dateFrom));
  if (dateTo) conditions.push(lte(fitnessBodyMeasurements.date, dateTo));

  return db
    .select(bodyMeasurementColumns)
    .from(fitnessBodyMeasurements)
    .where(and(...conditions))
    .orderBy(desc(fitnessBodyMeasurements.date))
    .limit(limit);
}

export async function getLatestBodyMeasurement(userId: string): Promise<BodyMeasurement | null> {
  const [measurement] = await db
    .select(bodyMeasurementColumns)
    .from(fitnessBodyMeasurements)
    .where(eq(fitnessBodyMeasurements.userId, userId))
    .orderBy(desc(fitnessBodyMeasurements.date))
    .limit(1);
  return measurement ?? null;
}

// === EXERCISE LIBRARY ===

export const exerciseColumns = {
  id: fitnessExerciseLibrary.id,
  userId: fitnessExerciseLibrary.userId,
  name: fitnessExerciseLibrary.name,
  muscleGroup: fitnessExerciseLibrary.muscleGroup,
  equipment: fitnessExerciseLibrary.equipment,
  forceType: fitnessExerciseLibrary.forceType,
  difficulty: fitnessExerciseLibrary.difficulty,
  instructions: fitnessExerciseLibrary.instructions,
  videoUrl: fitnessExerciseLibrary.videoUrl,
  isCardio: fitnessExerciseLibrary.isCardio,
  isBodyweight: fitnessExerciseLibrary.isBodyweight,
  createdAt: fitnessExerciseLibrary.createdAt,
};

export async function getExercises(filters?: {
  muscleGroup?: string;
  equipment?: string;
  search?: string;
}): Promise<Exercise[]> {
  const conditions: SQL[] = [];
  if (filters?.muscleGroup) conditions.push(eq(fitnessExerciseLibrary.muscleGroup, filters.muscleGroup as any));
  if (filters?.equipment) conditions.push(eq(fitnessExerciseLibrary.equipment, filters.equipment as any));
  if (filters?.search) {
    conditions.push(sql`${fitnessExerciseLibrary.name} ILIKE ${`%${filters.search}%`}`);
  }

  return db
    .select(exerciseColumns)
    .from(fitnessExerciseLibrary)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(fitnessExerciseLibrary.name));
}

export async function getExerciseById(id: string): Promise<Exercise | null> {
  const [exercise] = await db
    .select(exerciseColumns)
    .from(fitnessExerciseLibrary)
    .where(eq(fitnessExerciseLibrary.id, id))
    .limit(1);
  return exercise ?? null;
}

// === WORKOUT PROGRAMS ===

export const programColumns = {
  id: fitnessWorkoutPrograms.id,
  userId: fitnessWorkoutPrograms.userId,
  name: fitnessWorkoutPrograms.name,
  description: fitnessWorkoutPrograms.description,
  goal: fitnessWorkoutPrograms.goal,
  daysPerWeek: fitnessWorkoutPrograms.daysPerWeek,
  durationWeeks: fitnessWorkoutPrograms.durationWeeks,
  difficulty: fitnessWorkoutPrograms.difficulty,
  isActive: fitnessWorkoutPrograms.isActive,
  isTemplate: fitnessWorkoutPrograms.isTemplate,
  createdAt: fitnessWorkoutPrograms.createdAt,
  updatedAt: fitnessWorkoutPrograms.updatedAt,
};

export async function createWorkoutProgram(input: CreateWorkoutProgramInput): Promise<WorkoutProgram> {
  const [program] = await db
    .insert(fitnessWorkoutPrograms)
    .values(input)
    .returning(programColumns);
  return program;
}

export async function getWorkoutPrograms(userId: string): Promise<WorkoutProgram[]> {
  return db
    .select(programColumns)
    .from(fitnessWorkoutPrograms)
    .where(eq(fitnessWorkoutPrograms.userId, userId))
    .orderBy(desc(fitnessWorkoutPrograms.isActive), desc(fitnessWorkoutPrograms.createdAt));
}

export async function getWorkoutProgramById(id: string, userId: string): Promise<WorkoutProgram | null> {
  const [program] = await db
    .select(programColumns)
    .from(fitnessWorkoutPrograms)
    .where(and(eq(fitnessWorkoutPrograms.id, id), eq(fitnessWorkoutPrograms.userId, userId)))
    .limit(1);
  return program ?? null;
}

export async function updateWorkoutProgram(
  id: string,
  userId: string,
  input: Partial<CreateWorkoutProgramInput>,
): Promise<WorkoutProgram | null> {
  const [program] = await db
    .update(fitnessWorkoutPrograms)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(fitnessWorkoutPrograms.id, id), eq(fitnessWorkoutPrograms.userId, userId)))
    .returning(programColumns);
  return program ?? null;
}

export async function deleteWorkoutProgram(id: string, userId: string): Promise<WorkoutProgram | null> {
  const [program] = await db
    .delete(fitnessWorkoutPrograms)
    .where(and(eq(fitnessWorkoutPrograms.id, id), eq(fitnessWorkoutPrograms.userId, userId)))
    .returning(programColumns);
  return program ?? null;
}

// === PROGRAM DAYS ===

export const programDayColumns = {
  id: fitnessProgramDays.id,
  programId: fitnessProgramDays.programId,
  dayNumber: fitnessProgramDays.dayNumber,
  name: fitnessProgramDays.name,
  sortOrder: fitnessProgramDays.sortOrder,
  createdAt: fitnessProgramDays.createdAt,
};

export async function createProgramDay(input: CreateProgramDayInput): Promise<ProgramDay> {
  const [day] = await db
    .insert(fitnessProgramDays)
    .values(input)
    .returning(programDayColumns);
  return day;
}

export async function getProgramDays(programId: string): Promise<ProgramDay[]> {
  return db
    .select(programDayColumns)
    .from(fitnessProgramDays)
    .where(eq(fitnessProgramDays.programId, programId))
    .orderBy(asc(fitnessProgramDays.sortOrder), asc(fitnessProgramDays.dayNumber));
}

export async function deleteProgramDay(id: string): Promise<ProgramDay | null> {
  const [day] = await db
    .delete(fitnessProgramDays)
    .where(eq(fitnessProgramDays.id, id))
    .returning(programDayColumns);
  return day ?? null;
}

// === PROGRAM EXERCISES ===

export const programExerciseColumns = {
  id: fitnessProgramExercises.id,
  programDayId: fitnessProgramExercises.programDayId,
  exerciseId: fitnessProgramExercises.exerciseId,
  sortOrder: fitnessProgramExercises.sortOrder,
  targetSets: fitnessProgramExercises.targetSets,
  targetReps: fitnessProgramExercises.targetReps,
  targetWeightKg: fitnessProgramExercises.targetWeightKg,
  restSeconds: fitnessProgramExercises.restSeconds,
  notes: fitnessProgramExercises.notes,
  createdAt: fitnessProgramExercises.createdAt,
};

export async function createProgramExercise(input: CreateProgramExerciseInput): Promise<ProgramExercise> {
  const [exercise] = await db
    .insert(fitnessProgramExercises)
    .values(input)
    .returning(programExerciseColumns);
  return exercise;
}

export async function getProgramExercises(programDayId: string): Promise<ProgramExercise[]> {
  return db
    .select(programExerciseColumns)
    .from(fitnessProgramExercises)
    .where(eq(fitnessProgramExercises.programDayId, programDayId))
    .orderBy(asc(fitnessProgramExercises.sortOrder));
}

export async function deleteProgramExercise(id: string): Promise<ProgramExercise | null> {
  const [exercise] = await db
    .delete(fitnessProgramExercises)
    .where(eq(fitnessProgramExercises.id, id))
    .returning(programExerciseColumns);
  return exercise ?? null;
}

// === WORKOUT SESSIONS ===

export const sessionColumns = {
  id: fitnessWorkoutSessions.id,
  userId: fitnessWorkoutSessions.userId,
  programDayId: fitnessWorkoutSessions.programDayId,
  name: fitnessWorkoutSessions.name,
  date: fitnessWorkoutSessions.date,
  startTime: fitnessWorkoutSessions.startTime,
  endTime: fitnessWorkoutSessions.endTime,
  durationMinutes: fitnessWorkoutSessions.durationMinutes,
  mood: fitnessWorkoutSessions.mood,
  energy: fitnessWorkoutSessions.energy,
  notes: fitnessWorkoutSessions.notes,
  isCompleted: fitnessWorkoutSessions.isCompleted,
  createdAt: fitnessWorkoutSessions.createdAt,
  updatedAt: fitnessWorkoutSessions.updatedAt,
};

export async function createWorkoutSession(input: CreateWorkoutSessionInput): Promise<WorkoutSession> {
  const [session] = await db
    .insert(fitnessWorkoutSessions)
    .values(input)
    .returning(sessionColumns);
  return session;
}

export async function getWorkoutSessionById(id: string, userId: string): Promise<WorkoutSession | null> {
  const [session] = await db
    .select(sessionColumns)
    .from(fitnessWorkoutSessions)
    .where(and(eq(fitnessWorkoutSessions.id, id), eq(fitnessWorkoutSessions.userId, userId)))
    .limit(1);
  return session ?? null;
}

export async function getWorkoutSessions(
  userId: string,
  options?: {
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  },
): Promise<WorkoutSession[]> {
  const conditions: SQL[] = [eq(fitnessWorkoutSessions.userId, userId)];
  if (options?.dateFrom) conditions.push(gte(fitnessWorkoutSessions.date, options.dateFrom));
  if (options?.dateTo) conditions.push(lte(fitnessWorkoutSessions.date, options.dateTo));

  return db
    .select(sessionColumns)
    .from(fitnessWorkoutSessions)
    .where(and(...conditions))
    .orderBy(desc(fitnessWorkoutSessions.date))
    .limit(options?.limit ?? 50)
    .offset(options?.offset ?? 0);
}

export async function updateWorkoutSession(
  id: string,
  userId: string,
  input: Partial<CreateWorkoutSessionInput>,
): Promise<WorkoutSession | null> {
  const [session] = await db
    .update(fitnessWorkoutSessions)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(fitnessWorkoutSessions.id, id), eq(fitnessWorkoutSessions.userId, userId)))
    .returning(sessionColumns);
  return session ?? null;
}

export async function deleteWorkoutSession(id: string, userId: string): Promise<WorkoutSession | null> {
  const [session] = await db
    .delete(fitnessWorkoutSessions)
    .where(and(eq(fitnessWorkoutSessions.id, id), eq(fitnessWorkoutSessions.userId, userId)))
    .returning(sessionColumns);
  return session ?? null;
}

// === EXERCISE SETS ===

export const setColumns = {
  id: fitnessExerciseSets.id,
  sessionId: fitnessExerciseSets.sessionId,
  exerciseId: fitnessExerciseSets.exerciseId,
  exerciseName: fitnessExerciseSets.exerciseName,
  setNumber: fitnessExerciseSets.setNumber,
  reps: fitnessExerciseSets.reps,
  weightKg: fitnessExerciseSets.weightKg,
  rpe: fitnessExerciseSets.rpe,
  durationSeconds: fitnessExerciseSets.durationSeconds,
  distanceMeters: fitnessExerciseSets.distanceMeters,
  isWarmup: fitnessExerciseSets.isWarmup,
  isDropSet: fitnessExerciseSets.isDropSet,
  isFailure: fitnessExerciseSets.isFailure,
  sortOrder: fitnessExerciseSets.sortOrder,
  createdAt: fitnessExerciseSets.createdAt,
};

export async function createExerciseSet(input: CreateExerciseSetInput): Promise<ExerciseSet> {
  const [set] = await db
    .insert(fitnessExerciseSets)
    .values(input)
    .returning(setColumns);
  return set;
}

export async function createExerciseSets(inputs: CreateExerciseSetInput[]): Promise<ExerciseSet[]> {
  return db.insert(fitnessExerciseSets).values(inputs).returning(setColumns);
}

export async function getExerciseSets(sessionId: string): Promise<ExerciseSet[]> {
  return db
    .select(setColumns)
    .from(fitnessExerciseSets)
    .where(eq(fitnessExerciseSets.sessionId, sessionId))
    .orderBy(asc(fitnessExerciseSets.sortOrder));
}

export async function deleteExerciseSetsBySession(sessionId: string): Promise<void> {
  await db.delete(fitnessExerciseSets).where(eq(fitnessExerciseSets.sessionId, sessionId));
}

// === PERSONAL RECORDS ===

export const recordColumns = {
  id: fitnessPersonalRecords.id,
  userId: fitnessPersonalRecords.userId,
  exerciseId: fitnessPersonalRecords.exerciseId,
  recordType: fitnessPersonalRecords.recordType,
  value: fitnessPersonalRecords.value,
  reps: fitnessPersonalRecords.reps,
  sessionId: fitnessPersonalRecords.sessionId,
  achievedAt: fitnessPersonalRecords.achievedAt,
  notes: fitnessPersonalRecords.notes,
  createdAt: fitnessPersonalRecords.createdAt,
};

export async function getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
  return db
    .select(recordColumns)
    .from(fitnessPersonalRecords)
    .where(eq(fitnessPersonalRecords.userId, userId))
    .orderBy(desc(fitnessPersonalRecords.achievedAt));
}

export async function getPersonalRecordForExercise(
  userId: string,
  exerciseId: string,
  recordType: string,
): Promise<PersonalRecord | null> {
  const [record] = await db
    .select(recordColumns)
    .from(fitnessPersonalRecords)
    .where(and(
      eq(fitnessPersonalRecords.userId, userId),
      eq(fitnessPersonalRecords.exerciseId, exerciseId),
      eq(fitnessPersonalRecords.recordType, recordType as any),
    ))
    .limit(1);
  return record ?? null;
}

export async function upsertPersonalRecord(
  userId: string,
  exerciseId: string,
  recordType: string,
  value: string,
  reps: number | null,
  sessionId: string | null,
): Promise<PersonalRecord> {
  const [record] = await db
    .insert(fitnessPersonalRecords)
    .values({ userId, exerciseId, recordType: recordType as any, value, reps, sessionId })
    .onConflictDoUpdate({
      target: [fitnessPersonalRecords.userId, fitnessPersonalRecords.exerciseId, fitnessPersonalRecords.recordType],
      set: { value, reps, sessionId, achievedAt: new Date() },
    })
    .returning(recordColumns);
  return record;
}

// === AGGREGATIONS ===

export async function getWeeklyWorkoutMinutes(userId: string): Promise<number> {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startStr = startOfWeek.toISOString().slice(0, 10);

  const [result] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${fitnessWorkoutSessions.durationMinutes}), 0)`,
    })
    .from(fitnessWorkoutSessions)
    .where(and(
      eq(fitnessWorkoutSessions.userId, userId),
      gte(fitnessWorkoutSessions.date, startStr),
      eq(fitnessWorkoutSessions.isCompleted, true),
    ));
  return result?.total ?? 0;
}

export async function getWorkoutStreak(userId: string): Promise<number> {
  const sessions = await db
    .select({ date: fitnessWorkoutSessions.date })
    .from(fitnessWorkoutSessions)
    .where(and(
      eq(fitnessWorkoutSessions.userId, userId),
      eq(fitnessWorkoutSessions.isCompleted, true),
    ))
    .orderBy(desc(fitnessWorkoutSessions.date));

  if (sessions.length === 0) return 0;

  let streak = 0;
  const today = new Date().toISOString().slice(0, 10);
  let expectedDate = today;

  for (const session of sessions) {
    if (session.date === expectedDate || session.date === getPreviousDate(expectedDate)) {
      streak++;
      expectedDate = session.date;
    } else if (session.date < expectedDate) {
      break;
    }
  }

  return streak;
}

function getPreviousDate(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export async function getSessionVolume(sessionId: string): Promise<number> {
  const [result] = await db
    .select({
      total: sql<number>`COALESCE(SUM(
        CASE WHEN ${fitnessExerciseSets.isWarmup} = false
          THEN ${fitnessExerciseSets.weightKg}::numeric * ${fitnessExerciseSets.reps}
          ELSE 0 END
      ), 0)`,
    })
    .from(fitnessExerciseSets)
    .where(eq(fitnessExerciseSets.sessionId, sessionId));

  return Math.round(result?.total ?? 0);
}

export type DashboardStats = {
  totalSessions: number;
  totalDurationMinutes: number;
  totalWorkoutsThisWeek: number;
  currentStreak: number;
  weeklyWorkoutMinutes: number;
};
