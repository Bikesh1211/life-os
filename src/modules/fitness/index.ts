// Schema tables & enums
export {
  fitnessProfiles,
  fitnessBodyMeasurements,
  fitnessExerciseLibrary,
  fitnessWorkoutPrograms,
  fitnessProgramDays,
  fitnessProgramExercises,
  fitnessWorkoutSessions,
  fitnessExerciseSets,
  fitnessPersonalRecords,
  genderEnum,
  activityLevelEnum,
  fitnessGoalEnum,
  muscleGroupEnum,
  equipmentEnum,
  forceTypeEnum,
  difficultyEnum,
  workoutGoalEnum,
  recordTypeEnum,
} from "./schema";

// Service functions
export {
  getFitnessProfile,
  saveFitnessProfile,
  logBodyMeasurement,
  getMeasurementHistory,
  getLatestMeasurement,
  getExerciseLibrary,
  getExercise,
  createProgram,
  getPrograms,
  getProgram,
  updateProgram,
  removeProgram,
  addProgramDay,
  getProgramDaysWithExercises,
  startWorkoutSession,
  saveWorkoutSession,
  completeWorkoutSession,
  getSession,
  getSessions,
  removeWorkoutSession,
  logExerciseSets,
  getSetsForSession,
  getPRs,
  getDashboardStats,
} from "./service";

// Repository functions
export {
  getSessionVolume,
  getWeeklyWorkoutMinutes,
  getWorkoutStreak,
} from "./repository";

// Service param types
export type {
  UpdateProfileParams,
  CreateMeasurementParams,
  CreateProgramParams,
} from "./service";

// Repository select types
export type {
  FitnessProfile,
  BodyMeasurement,
  Exercise,
  WorkoutProgram,
  ProgramDay,
  ProgramExercise,
  WorkoutSession,
  ExerciseSet,
  PersonalRecord,
  DashboardStats,
} from "./repository";
