import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFitnessProfile extends Document {
  _id: Types.ObjectId;
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
}

const FitnessProfileSchema = new Schema<IFitnessProfile>(
  {
    userId: { type: String, required: true, unique: true },
    heightCm: { type: Number },
    dateOfBirth: { type: Date },
    gender: { type: String },
    activityLevel: { type: String, default: "moderate" },
    fitnessGoal: { type: String, default: "general_health" },
    targetWeightKg: { type: Number },
    weeklyWorkoutGoal: { type: Number, default: 4 },
    dailyCalorieGoal: { type: Number },
    dailyProteinGoal: { type: Number },
    dailyWaterGoalMl: { type: Number },
  },
  { timestamps: true }
);

export interface IFitnessBodyMeasurement extends Document {
  _id: Types.ObjectId;
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
}

const FitnessBodyMeasurementSchema = new Schema<IFitnessBodyMeasurement>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: Date, required: true, index: true },
    weightKg: { type: Number },
    bodyFatPercentage: { type: Number },
    muscleMassKg: { type: Number },
    waistCm: { type: Number },
    hipsCm: { type: Number },
    chestCm: { type: Number },
    armsCm: { type: Number },
    thighsCm: { type: Number },
    neckCm: { type: Number },
  },
  { timestamps: true }
);

export interface IFitnessExerciseLibrary extends Document {
  _id: Types.ObjectId;
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
}

const FitnessExerciseLibrarySchema = new Schema<IFitnessExerciseLibrary>(
  {
    name: { type: String, required: true },
    muscleGroup: { type: String, required: true, index: true },
    equipment: { type: String, required: true },
    forceType: { type: String },
    difficulty: { type: String, default: "beginner" },
    instructions: { type: String },
    videoUrl: { type: String },
    isCardio: { type: Boolean, default: false },
    isBodyweight: { type: Boolean, default: false },
    userId: { type: String, index: true },
  },
  { timestamps: true }
);

export interface IFitnessWorkoutProgram extends Document {
  _id: Types.ObjectId;
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
}

const FitnessWorkoutProgramSchema = new Schema<IFitnessWorkoutProgram>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    goal: { type: String },
    daysPerWeek: { type: Number },
    durationWeeks: { type: Number },
    difficulty: { type: String, default: "beginner" },
    isActive: { type: Boolean, default: false },
    isTemplate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface IFitnessProgramDay extends Document {
  _id: Types.ObjectId;
  programId: Types.ObjectId;
  dayNumber: number;
  name: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const FitnessProgramDaySchema = new Schema<IFitnessProgramDay>(
  {
    programId: { type: Schema.Types.ObjectId, ref: "FitnessWorkoutProgram", required: true, index: true },
    dayNumber: { type: Number, required: true },
    name: { type: String, required: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export interface IFitnessProgramExercise extends Document {
  _id: Types.ObjectId;
  programDayId: Types.ObjectId;
  exerciseId: Types.ObjectId;
  targetSets?: number;
  targetReps?: string;
  targetWeightKg?: number;
  restSeconds: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const FitnessProgramExerciseSchema = new Schema<IFitnessProgramExercise>(
  {
    programDayId: { type: Schema.Types.ObjectId, ref: "FitnessProgramDay", required: true, index: true },
    exerciseId: { type: Schema.Types.ObjectId, ref: "FitnessExerciseLibrary", required: true, index: true },
    targetSets: { type: Number },
    targetReps: { type: String },
    targetWeightKg: { type: Number },
    restSeconds: { type: Number, default: 90 },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export interface IFitnessWorkoutSession extends Document {
  _id: Types.ObjectId;
  userId: string;
  programDayId?: Types.ObjectId;
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
}

const FitnessWorkoutSessionSchema = new Schema<IFitnessWorkoutSession>(
  {
    userId: { type: String, required: true, index: true },
    programDayId: { type: Schema.Types.ObjectId, ref: "FitnessProgramDay" },
    name: { type: String },
    date: { type: Date, required: true, index: true },
    startTime: { type: Date },
    endTime: { type: Date },
    durationMinutes: { type: Number },
    mood: { type: Number },
    energy: { type: Number },
    notes: { type: String },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface IFitnessExerciseSet extends Document {
  _id: Types.ObjectId;
  sessionId: Types.ObjectId;
  exerciseId: Types.ObjectId;
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
}

const FitnessExerciseSetSchema = new Schema<IFitnessExerciseSet>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: "FitnessWorkoutSession", required: true, index: true },
    exerciseId: { type: Schema.Types.ObjectId, ref: "FitnessExerciseLibrary", required: true },
    exerciseName: { type: String, required: true },
    setNumber: { type: Number, required: true },
    reps: { type: Number },
    weightKg: { type: Number },
    rpe: { type: Number },
    durationSeconds: { type: Number },
    distanceMeters: { type: Number },
    isWarmup: { type: Boolean, default: false },
    isDropSet: { type: Boolean, default: false },
    isFailure: { type: Boolean, default: false },
  },
  { timestamps: true }
);

FitnessExerciseSetSchema.index({ sessionId: 1 });

export interface IFitnessPersonalRecord extends Document {
  _id: Types.ObjectId;
  userId: string;
  exerciseId: Types.ObjectId;
  type: string;
  value: number;
  reps?: number;
  sessionId?: Types.ObjectId;
  achievedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FitnessPersonalRecordSchema = new Schema<IFitnessPersonalRecord>(
  {
    userId: { type: String, required: true, index: true },
    exerciseId: { type: Schema.Types.ObjectId, ref: "FitnessExerciseLibrary", required: true, index: true },
    type: { type: String, required: true },
    value: { type: Number, required: true },
    reps: { type: Number },
    sessionId: { type: Schema.Types.ObjectId, ref: "FitnessWorkoutSession" },
    achievedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

FitnessPersonalRecordSchema.index({ userId: 1, exerciseId: 1, type: 1 }, { unique: true });

export const FitnessProfileModel =
  mongoose.models.FitnessProfile || mongoose.model<IFitnessProfile>("FitnessProfile", FitnessProfileSchema);
export const FitnessBodyMeasurementModel =
  mongoose.models.FitnessBodyMeasurement ||
  mongoose.model<IFitnessBodyMeasurement>("FitnessBodyMeasurement", FitnessBodyMeasurementSchema);
export const FitnessExerciseLibraryModel =
  mongoose.models.FitnessExerciseLibrary ||
  mongoose.model<IFitnessExerciseLibrary>("FitnessExerciseLibrary", FitnessExerciseLibrarySchema);
export const FitnessWorkoutProgramModel =
  mongoose.models.FitnessWorkoutProgram ||
  mongoose.model<IFitnessWorkoutProgram>("FitnessWorkoutProgram", FitnessWorkoutProgramSchema);
export const FitnessProgramDayModel =
  mongoose.models.FitnessProgramDay ||
  mongoose.model<IFitnessProgramDay>("FitnessProgramDay", FitnessProgramDaySchema);
export const FitnessProgramExerciseModel =
  mongoose.models.FitnessProgramExercise ||
  mongoose.model<IFitnessProgramExercise>("FitnessProgramExercise", FitnessProgramExerciseSchema);
export const FitnessWorkoutSessionModel =
  mongoose.models.FitnessWorkoutSession ||
  mongoose.model<IFitnessWorkoutSession>("FitnessWorkoutSession", FitnessWorkoutSessionSchema);
export const FitnessExerciseSetModel =
  mongoose.models.FitnessExerciseSet ||
  mongoose.model<IFitnessExerciseSet>("FitnessExerciseSet", FitnessExerciseSetSchema);
export const FitnessPersonalRecordModel =
  mongoose.models.FitnessPersonalRecord ||
  mongoose.model<IFitnessPersonalRecord>("FitnessPersonalRecord", FitnessPersonalRecordSchema);
