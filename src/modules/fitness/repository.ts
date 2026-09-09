import { connectToDatabase } from "@/lib/mongodb";
import {
  FitnessProfileModel,
  FitnessBodyMeasurementModel,
  FitnessExerciseLibraryModel,
  FitnessWorkoutProgramModel,
  FitnessProgramDayModel,
  FitnessProgramExerciseModel,
  FitnessWorkoutSessionModel,
  FitnessExerciseSetModel,
  FitnessPersonalRecordModel,
} from "@/lib/models/fitness";

// ─── Types ────────────────────────────────────────────────────────

export type FitnessProfile = {
  id: string;
  userId: string;
  heightCm?: number;
  dateOfBirth?: Date;
  gender?: string;
  activityLevel: string;
  fitnessGoal: string;
  targetWeightKg?: number;
  weeklyWorkoutGoal: number;
  dailyCalorieGoal?: number;
  dailyProteinGoal?: number;
  dailyWaterGoalMl?: number;
  createdAt: Date;
  updatedAt: Date;
};

export type BodyMeasurement = {
  id: string;
  userId: string;
  date: Date;
  weightKg?: number;
  bodyFatPercentage?: number;
  muscleMassKg?: number;
  waistCm?: number;
  hipsCm?: number;
  chestCm?: number;
  armsCm?: number;
  thighsCm?: number;
  neckCm?: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  forceType?: string;
  difficulty: string;
  instructions?: string;
  videoUrl?: string;
  isCardio: boolean;
  isBodyweight: boolean;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type WorkoutProgram = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  goal?: string;
  daysPerWeek?: number;
  durationWeeks?: number;
  difficulty: string;
  isActive: boolean;
  isTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProgramDay = {
  id: string;
  programId: string;
  dayNumber: number;
  name: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ProgramExercise = {
  id: string;
  programDayId: string;
  exerciseId: string;
  targetSets?: number;
  targetReps?: string;
  targetWeightKg?: number;
  restSeconds: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ProgramExerciseWithName = ProgramExercise & { exerciseName: string };

export type WorkoutSession = {
  id: string;
  userId: string;
  programDayId?: string;
  name?: string;
  date: Date;
  startTime?: Date;
  endTime?: Date;
  durationMinutes?: number;
  mood?: number;
  energy?: number;
  notes?: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ExerciseSet = {
  id: string;
  sessionId: string;
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  reps?: number;
  weightKg?: number;
  rpe?: number;
  durationSeconds?: number;
  distanceMeters?: number;
  isWarmup: boolean;
  isDropSet: boolean;
  isFailure: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type PersonalRecord = {
  id: string;
  userId: string;
  exerciseId: string;
  type: string;
  value: number;
  reps?: number;
  sessionId?: string;
  achievedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

// ─── Input Types ──────────────────────────────────────────────────

type EnumActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
type EnumFitnessGoal = "lose_fat" | "build_muscle" | "maintain" | "improve_endurance" | "general_health";
type EnumDifficulty = "beginner" | "intermediate" | "advanced";
type EnumWorkoutGoal = "lose_fat" | "build_muscle" | "maintain" | "endurance" | "general";

export type CreateFitnessProfileInput = {
  userId: string;
  heightCm?: number | null;
  dateOfBirth?: Date | null;
  gender?: "male" | "female" | "other" | null;
  activityLevel?: EnumActivityLevel;
  fitnessGoal?: EnumFitnessGoal;
  targetWeightKg?: number | null;
  weeklyWorkoutGoal?: number;
  dailyCalorieGoal?: number | null;
  dailyProteinGoal?: number | null;
  dailyWaterGoalMl?: number | null;
};

export type UpdateFitnessProfileInput = Partial<Omit<CreateFitnessProfileInput, "userId">>;

export type CreateBodyMeasurementInput = {
  userId: string;
  date: string;
  weightKg?: number | null;
  bodyFatPercentage?: number | null;
  muscleMassKg?: number | null;
  waistCm?: number | null;
  hipsCm?: number | null;
  chestCm?: number | null;
  armsCm?: number | null;
  thighsCm?: number | null;
  neckCm?: number | null;
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
  targetWeightKg?: number | null;
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
  weightKg?: number | null;
  rpe?: number | null;
  durationSeconds?: number | null;
  distanceMeters?: number | null;
  isWarmup?: boolean;
  isDropSet?: boolean;
  isFailure?: boolean;
  sortOrder?: number;
};

export type SetRecordCheck = {
  exerciseId: string;
  reps: number | null;
  weightKg: number | null;
  isFailure: boolean;
  sessionId: string | null;
};

// ─── Helpers ──────────────────────────────────────────────────────

function mapProfile(doc: any): FitnessProfile {
  return { ...doc, id: doc._id.toString() };
}

function mapMeasurement(doc: any): BodyMeasurement {
  return { ...doc, id: doc._id.toString() };
}

function mapExercise(doc: any): Exercise {
  return { ...doc, id: doc._id.toString() };
}

function mapProgram(doc: any): WorkoutProgram {
  return { ...doc, id: doc._id.toString() };
}

function mapProgramDay(doc: any): ProgramDay {
  return { ...doc, id: doc._id.toString() };
}

function mapProgramExercise(doc: any): ProgramExercise {
  return { ...doc, id: doc._id.toString() };
}

function mapSession(doc: any): WorkoutSession {
  return { ...doc, id: doc._id.toString() };
}

function mapSet(doc: any): ExerciseSet {
  return { ...doc, id: doc._id.toString() };
}

function mapRecord(doc: any): PersonalRecord {
  return { ...doc, id: doc._id.toString() };
}

// ─── Profiles ─────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<FitnessProfile | null> {
  await connectToDatabase();
  const doc = await FitnessProfileModel.findOne({ userId }).lean();
  return doc ? mapProfile(doc) : null;
}

export async function upsertProfile(userId: string, input: UpdateFitnessProfileInput): Promise<FitnessProfile> {
  await connectToDatabase();
  const doc = await FitnessProfileModel.findOneAndUpdate(
    { userId },
    { $set: { ...input, updatedAt: new Date() } },
    { new: true, upsert: true },
  ).lean();
  return mapProfile(doc);
}

// ─── Body Measurements ────────────────────────────────────────────

export const bodyMeasurementColumns = [
  "id",
  "userId",
  "date",
  "weightKg",
  "bodyFatPercentage",
  "muscleMassKg",
  "waistCm",
  "hipsCm",
  "chestCm",
  "armsCm",
  "thighsCm",
  "neckCm",
  "createdAt",
] as const;

export async function createBodyMeasurement(input: CreateBodyMeasurementInput): Promise<BodyMeasurement> {
  await connectToDatabase();
  const doc = await FitnessBodyMeasurementModel.create(input);
  return mapMeasurement(doc.toObject());
}

export async function getBodyMeasurements(
  userId: string,
  dateFrom?: string,
  dateTo?: string,
  limit = 50,
): Promise<BodyMeasurement[]> {
  await connectToDatabase();

  const filter: Record<string, any> = { userId };
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = new Date(dateFrom);
    if (dateTo) filter.date.$lte = new Date(dateTo);
  }

  const docs = await FitnessBodyMeasurementModel.find(filter)
    .sort({ date: -1 })
    .limit(limit)
    .lean();
  return docs.map(mapMeasurement);
}

export async function getLatestBodyMeasurement(userId: string): Promise<BodyMeasurement | null> {
  await connectToDatabase();
  const doc = await FitnessBodyMeasurementModel.findOne({ userId })
    .sort({ date: -1 })
    .lean();
  return doc ? mapMeasurement(doc) : null;
}

// ─── Exercise Library ─────────────────────────────────────────────

export const exerciseColumns = [
  "id",
  "userId",
  "name",
  "muscleGroup",
  "equipment",
  "forceType",
  "difficulty",
  "instructions",
  "videoUrl",
  "isCardio",
  "isBodyweight",
  "createdAt",
] as const;

export async function getExercises(filters?: {
  muscleGroup?: string;
  equipment?: string;
  search?: string;
}): Promise<Exercise[]> {
  await connectToDatabase();

  const filter: Record<string, any> = {};
  if (filters?.muscleGroup) filter.muscleGroup = filters.muscleGroup;
  if (filters?.equipment) filter.equipment = filters.equipment;
  if (filters?.search) {
    filter.name = { $regex: filters.search, $options: "i" };
  }

  const docs = await FitnessExerciseLibraryModel.find(filter)
    .sort({ name: 1 })
    .lean();
  return docs.map(mapExercise);
}

export async function getExerciseById(id: string): Promise<Exercise | null> {
  await connectToDatabase();
  const doc = await FitnessExerciseLibraryModel.findById(id).lean();
  return doc ? mapExercise(doc) : null;
}

// ─── Workout Programs ─────────────────────────────────────────────

export const programColumns = [
  "id",
  "userId",
  "name",
  "description",
  "goal",
  "daysPerWeek",
  "durationWeeks",
  "difficulty",
  "isActive",
  "isTemplate",
  "createdAt",
  "updatedAt",
] as const;

export async function createWorkoutProgram(input: CreateWorkoutProgramInput): Promise<WorkoutProgram> {
  await connectToDatabase();
  const doc = await FitnessWorkoutProgramModel.create(input);
  return mapProgram(doc.toObject());
}

export async function getWorkoutPrograms(userId: string): Promise<WorkoutProgram[]> {
  await connectToDatabase();
  const docs = await FitnessWorkoutProgramModel.find({ userId })
    .sort({ isActive: -1, createdAt: -1 })
    .lean();
  return docs.map(mapProgram);
}

export async function getWorkoutProgramById(id: string, userId: string): Promise<WorkoutProgram | null> {
  await connectToDatabase();
  const doc = await FitnessWorkoutProgramModel.findOne({ _id: id, userId }).lean();
  return doc ? mapProgram(doc) : null;
}

export async function updateWorkoutProgram(
  id: string,
  userId: string,
  input: Partial<CreateWorkoutProgramInput>,
): Promise<WorkoutProgram | null> {
  await connectToDatabase();
  const { userId: _, ...updateData } = input;
  const doc = await FitnessWorkoutProgramModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: { ...updateData, updatedAt: new Date() } },
    { new: true },
  ).lean();
  return doc ? mapProgram(doc) : null;
}

export async function deleteWorkoutProgram(id: string, userId: string): Promise<WorkoutProgram | null> {
  await connectToDatabase();
  const doc = await FitnessWorkoutProgramModel.findOneAndDelete({ _id: id, userId }).lean();
  return doc ? mapProgram(doc) : null;
}

// ─── Program Days ─────────────────────────────────────────────────

export const programDayColumns = [
  "id",
  "programId",
  "dayNumber",
  "name",
  "sortOrder",
  "createdAt",
] as const;

export async function createProgramDay(input: CreateProgramDayInput): Promise<ProgramDay> {
  await connectToDatabase();
  const doc = await FitnessProgramDayModel.create(input);
  return mapProgramDay(doc.toObject());
}

export async function getProgramDays(programId: string): Promise<ProgramDay[]> {
  await connectToDatabase();
  const docs = await FitnessProgramDayModel.find({ programId })
    .sort({ sortOrder: 1, dayNumber: 1 })
    .lean();
  return docs.map(mapProgramDay);
}

export async function deleteProgramDay(id: string): Promise<ProgramDay | null> {
  await connectToDatabase();
  const doc = await FitnessProgramDayModel.findOneAndDelete({ _id: id }).lean();
  return doc ? mapProgramDay(doc) : null;
}

// ─── Program Exercises ────────────────────────────────────────────

export const programExerciseColumns = [
  "id",
  "programDayId",
  "exerciseId",
  "sortOrder",
  "targetSets",
  "targetReps",
  "targetWeightKg",
  "restSeconds",
  "notes",
  "createdAt",
] as const;

export async function createProgramExercise(input: CreateProgramExerciseInput): Promise<ProgramExercise> {
  await connectToDatabase();
  const doc = await FitnessProgramExerciseModel.create(input);
  return mapProgramExercise(doc.toObject());
}

export async function getProgramExercises(programDayId: string): Promise<ProgramExercise[]> {
  await connectToDatabase();
  const docs = await FitnessProgramExerciseModel.find({ programDayId })
    .sort({ sortOrder: 1 })
    .lean();
  return docs.map(mapProgramExercise);
}

export const programExerciseWithNameColumns = [...programExerciseColumns, "exerciseName"] as const;

export async function getProgramExercisesWithLibrary(programDayId: string): Promise<ProgramExerciseWithName[]> {
  await connectToDatabase();
  const docs = await FitnessProgramExerciseModel.aggregate([
    { $match: { programDayId: programDayId } },
    { $sort: { sortOrder: 1 } },
    {
      $lookup: {
        from: "fitnessexerciselibraries",
        localField: "exerciseId",
        foreignField: "_id",
        as: "exerciseInfo",
      },
    },
    { $unwind: { path: "$exerciseInfo", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        exerciseName: "$exerciseInfo.name",
      },
    },
    { $project: { exerciseInfo: 0 } },
  ]);
  return docs.map((doc: any) => ({
    ...mapProgramExercise(doc),
    exerciseName: doc.exerciseName ?? "",
  }));
}

export async function deleteProgramExercise(id: string): Promise<ProgramExercise | null> {
  await connectToDatabase();
  const doc = await FitnessProgramExerciseModel.findOneAndDelete({ _id: id }).lean();
  return doc ? mapProgramExercise(doc) : null;
}

// ─── Workout Sessions ─────────────────────────────────────────────

export const sessionColumns = [
  "id",
  "userId",
  "programDayId",
  "name",
  "date",
  "startTime",
  "endTime",
  "durationMinutes",
  "mood",
  "energy",
  "notes",
  "isCompleted",
  "createdAt",
  "updatedAt",
] as const;

export async function createWorkoutSession(input: CreateWorkoutSessionInput): Promise<WorkoutSession> {
  await connectToDatabase();
  const doc = await FitnessWorkoutSessionModel.create({
    ...input,
    date: new Date(input.date),
    startTime: input.startTime ? new Date(input.startTime) : undefined,
    endTime: input.endTime ? new Date(input.endTime) : undefined,
  });
  return mapSession(doc.toObject());
}

export async function getWorkoutSessionById(id: string, userId: string): Promise<WorkoutSession | null> {
  await connectToDatabase();
  const doc = await FitnessWorkoutSessionModel.findOne({ _id: id, userId }).lean();
  return doc ? mapSession(doc) : null;
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
  await connectToDatabase();

  const filter: Record<string, any> = { userId };
  if (options?.dateFrom || options?.dateTo) {
    filter.date = {};
    if (options.dateFrom) filter.date.$gte = new Date(options.dateFrom);
    if (options.dateTo) filter.date.$lte = new Date(options.dateTo);
  }

  const docs = await FitnessWorkoutSessionModel.find(filter)
    .sort({ date: -1 })
    .skip(options?.offset ?? 0)
    .limit(options?.limit ?? 50)
    .lean();
  return docs.map(mapSession);
}

export async function updateWorkoutSession(
  id: string,
  userId: string,
  input: Partial<CreateWorkoutSessionInput>,
): Promise<WorkoutSession | null> {
  await connectToDatabase();
  const { userId: _, ...updateData } = input;
  if (updateData.date) updateData.date = new Date(updateData.date as any) as any;
  if (updateData.startTime) updateData.startTime = new Date(updateData.startTime as any) as any;
  if (updateData.endTime) updateData.endTime = new Date(updateData.endTime as any) as any;
  const doc = await FitnessWorkoutSessionModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: { ...updateData, updatedAt: new Date() } },
    { new: true },
  ).lean();
  return doc ? mapSession(doc) : null;
}

export async function deleteWorkoutSession(id: string, userId: string): Promise<WorkoutSession | null> {
  await connectToDatabase();
  const doc = await FitnessWorkoutSessionModel.findOneAndDelete({ _id: id, userId }).lean();
  return doc ? mapSession(doc) : null;
}

// ─── Exercise Sets ────────────────────────────────────────────────

export const setColumns = [
  "id",
  "sessionId",
  "exerciseId",
  "exerciseName",
  "setNumber",
  "reps",
  "weightKg",
  "rpe",
  "durationSeconds",
  "distanceMeters",
  "isWarmup",
  "isDropSet",
  "isFailure",
  "createdAt",
] as const;

export async function createExerciseSet(input: CreateExerciseSetInput): Promise<ExerciseSet> {
  await connectToDatabase();
  const doc = await FitnessExerciseSetModel.create(input);
  return mapSet(doc.toObject());
}

export async function createExerciseSets(inputs: CreateExerciseSetInput[]): Promise<ExerciseSet[]> {
  await connectToDatabase();
  const docs = await FitnessExerciseSetModel.insertMany(inputs);
  return docs.map((doc) => mapSet(doc.toObject()));
}

export async function getExerciseSets(sessionId: string): Promise<ExerciseSet[]> {
  await connectToDatabase();
  const docs = await FitnessExerciseSetModel.find({ sessionId })
    .sort({ sortOrder: 1 })
    .lean();
  return docs.map(mapSet);
}

export async function deleteExerciseSetsBySession(sessionId: string): Promise<void> {
  await connectToDatabase();
  await FitnessExerciseSetModel.deleteMany({ sessionId });
}

// ─── Personal Records ─────────────────────────────────────────────

export const recordColumns = [
  "id",
  "userId",
  "exerciseId",
  "type",
  "value",
  "reps",
  "sessionId",
  "achievedAt",
  "createdAt",
] as const;

export async function getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
  await connectToDatabase();
  const docs = await FitnessPersonalRecordModel.find({ userId })
    .sort({ achievedAt: -1 })
    .lean();
  return docs.map(mapRecord);
}

export async function getPersonalRecordForExercise(
  userId: string,
  exerciseId: string,
  recordType: string,
): Promise<PersonalRecord | null> {
  await connectToDatabase();
  const doc = await FitnessPersonalRecordModel.findOne({ userId, exerciseId, type: recordType }).lean();
  return doc ? mapRecord(doc) : null;
}

export async function upsertPersonalRecord(
  userId: string,
  exerciseId: string,
  recordType: string,
  value: number,
  reps: number | null,
  sessionId: string | null,
): Promise<PersonalRecord> {
  await connectToDatabase();
  const doc = await FitnessPersonalRecordModel.findOneAndUpdate(
    { userId, exerciseId, type: recordType },
    {
      $set: {
        value,
        reps,
        sessionId,
        achievedAt: new Date(),
      },
    },
    { new: true, upsert: true },
  ).lean();
  return mapRecord(doc);
}

// ─── Aggregations ─────────────────────────────────────────────────

export async function getWeeklyWorkoutMinutes(userId: string): Promise<number> {
  await connectToDatabase();
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const result = await FitnessWorkoutSessionModel.aggregate([
    {
      $match: {
        userId,
        date: { $gte: startOfWeek },
        isCompleted: true,
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: { $ifNull: ["$durationMinutes", 0] } },
      },
    },
  ]);
  return result[0]?.total ?? 0;
}

export async function getWorkoutStreak(userId: string): Promise<number> {
  await connectToDatabase();
  const sessions = await FitnessWorkoutSessionModel.find({ userId, isCompleted: true })
    .select({ date: 1 })
    .sort({ date: -1 })
    .lean();

  if (sessions.length === 0) return 0;

  let streak = 0;
  const today = new Date().toISOString().slice(0, 10);
  let expectedDate = today;

  for (const session of sessions) {
    const sessionDate = new Date(session.date).toISOString().slice(0, 10);
    if (sessionDate === expectedDate || sessionDate === getPreviousDate(expectedDate)) {
      streak++;
      expectedDate = sessionDate;
    } else if (sessionDate < expectedDate) {
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
  await connectToDatabase();
  const result = await FitnessExerciseSetModel.aggregate([
    { $match: { sessionId } },
    {
      $group: {
        _id: null,
        total: {
          $sum: {
            $cond: [
              { $eq: ["$isWarmup", false] },
              { $multiply: [{ $ifNull: ["$weightKg", 0] }, { $ifNull: ["$reps", 0] }] },
              0,
            ],
          },
        },
      },
    },
  ]);
  return Math.round(result[0]?.total ?? 0);
}

export type DashboardStats = {
  totalSessions: number;
  totalDurationMinutes: number;
  totalWorkoutsThisWeek: number;
  currentStreak: number;
  weeklyWorkoutMinutes: number;
};
