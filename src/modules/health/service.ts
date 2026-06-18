import { cache } from "react";
import {
  getWeightEntries,
  getBloodPressureEntries,
  getHeartRateEntries,
  getSleepRecords,
  getMoodLogs,
  getStepEntries,
  getWorkoutEntries,
  getCalorieEntries,
  getMedicineReminders,
  getUserGoals,
  getAchievements,
  getHydrationDailyTotal,
} from "@/modules/wellness";
import type { AnalyticsFilterParams } from "@/modules/wellness";

const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

export type VitalsSnapshot = {
  latestWeight: { weightKg: string; date: string } | null;
  latestBp: { systolic: number; diastolic: number; pulse: number | null; date: string } | null;
  latestHr: { resting: number | null; average: number | null; date: string } | null;
  avgSleepDuration: number | null;
  avgSleepQuality: number | null;
  todayHydration: number;
};

export type TrendPoint = { date: string; value: number };
export type VitalsTrends = {
  weight: TrendPoint[];
  systolic: TrendPoint[];
  diastolic: TrendPoint[];
  sleepDuration: TrendPoint[];
  sleepQuality: TrendPoint[];
};

export type FitnessSummary = {
  totalWorkoutMinutesWeek: number;
  totalWorkoutMinutesMonth: number;
  totalCaloriesBurned: number;
  workoutByType: { type: string; minutes: number }[];
  stepTrend: TrendPoint[];
  avgDailySteps: number;
};

export type NutritionSummary = {
  dailyCalories: TrendPoint[];
  avgDailyCalories: number;
  macroBreakdown: { protein: number; carbs: number; fat: number };
  todayCalories: number;
};

export type HealthDashboard = {
  vitals: VitalsSnapshot;
  vitalsTrends: VitalsTrends;
  fitness: FitnessSummary;
  nutrition: NutritionSummary;
  activeGoals: { id: string; title: string; progress: number; currentValue: string; targetValue: string; unit: string }[];
  activeMedicines: number;
  achievements: number;
};

export const getVitalsSnapshot = cache(async (userId: string): Promise<VitalsSnapshot> => {
  const [weightEntries, bpEntries, hrEntries, sleepRecords, todayHydration] = await Promise.all([
    getWeightEntries(userId, { dateFrom: daysAgo(30), dateTo: today() }),
    getBloodPressureEntries(userId, { dateFrom: daysAgo(7), dateTo: today() }),
    getHeartRateEntries(userId, { dateFrom: daysAgo(7), dateTo: today() }),
    getSleepRecords(userId, { dateFrom: daysAgo(7), dateTo: today() }),
    getHydrationDailyTotal(userId, today()),
  ]);

  const sortedWeight = [...weightEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const sortedBp = [...bpEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const sortedHr = [...hrEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const sortedSleep = [...sleepRecords].sort((a, b) => new Date(b.bedtime).getTime() - new Date(a.bedtime).getTime());

  const avgDuration = sleepRecords.length > 0
    ? Math.round(sleepRecords.reduce((s, r) => s + (r.wakeTime.getTime() - r.bedtime.getTime()) / 3600000, 0) / sleepRecords.length * 10) / 10
    : null;
  const avgQuality = sleepRecords.length > 0
    ? Math.round(sleepRecords.reduce((s, r) => s + (r.quality ?? 0), 0) / sleepRecords.filter((r) => r.quality).length * 10) / 10
    : null;

  return {
    latestWeight: sortedWeight[0] ? { weightKg: sortedWeight[0].weightKg, date: sortedWeight[0].date } : null,
    latestBp: sortedBp[0] ? {
      systolic: sortedBp[0].systolic,
      diastolic: sortedBp[0].diastolic,
      pulse: sortedBp[0].pulse,
      date: sortedBp[0].date,
    } : null,
    latestHr: sortedHr[0] ? {
      resting: sortedHr[0].resting,
      average: sortedHr[0].average,
      date: sortedHr[0].date,
    } : null,
    avgSleepDuration: avgDuration,
    avgSleepQuality: avgQuality,
    todayHydration,
  };
});

export const getVitalsTrends = cache(async (userId: string): Promise<VitalsTrends> => {
  const [weightEntries, bpEntries, sleepRecords] = await Promise.all([
    getWeightEntries(userId, { dateFrom: daysAgo(30), dateTo: today() }),
    getBloodPressureEntries(userId, { dateFrom: daysAgo(14), dateTo: today() }),
    getSleepRecords(userId, { dateFrom: daysAgo(14), dateTo: today() }),
  ]);

  return {
    weight: weightEntries
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((e) => ({ date: e.date, value: Number(e.weightKg) })),
    systolic: bpEntries
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((e) => ({ date: e.date, value: e.systolic })),
    diastolic: bpEntries
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((e) => ({ date: e.date, value: e.diastolic })),
    sleepDuration: sleepRecords
      .filter((r) => r.wakeTime && r.bedtime)
      .map((r) => ({
        date: r.bedtime.toISOString().slice(0, 10),
        value: Math.round((r.wakeTime.getTime() - r.bedtime.getTime()) / 3600000 * 10) / 10,
      })),
    sleepQuality: sleepRecords
      .filter((r) => r.quality)
      .map((r) => ({
        date: r.bedtime.toISOString().slice(0, 10),
        value: r.quality!,
      })),
  };
});

export const getFitnessSummary = cache(async (userId: string): Promise<FitnessSummary> => {
  const [workouts, stepEntries] = await Promise.all([
    getWorkoutEntries(userId, { dateFrom: daysAgo(30), dateTo: today() }),
    getStepEntries(userId, { dateFrom: daysAgo(14), dateTo: today() }),
  ]);

  const thisWeek = workouts.filter((w) => w.date >= daysAgo(7));

  const workoutByType = Object.entries(
    workouts.reduce<Record<string, number>>((acc, w) => {
      acc[w.workoutType] = (acc[w.workoutType] ?? 0) + w.durationMinutes;
      return acc;
    }, {})
  ).map(([type, minutes]) => ({ type, minutes })).sort((a, b) => b.minutes - a.minutes);

  const stepDays = [...stepEntries]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((e) => ({ date: e.date, value: e.steps }));

  const avgDailySteps = stepEntries.length > 0
    ? Math.round(stepEntries.reduce((s, e) => s + e.steps, 0) / stepEntries.length)
    : 0;

  return {
    totalWorkoutMinutesWeek: thisWeek.reduce((s, w) => s + w.durationMinutes, 0),
    totalWorkoutMinutesMonth: workouts.reduce((s, w) => s + w.durationMinutes, 0),
    totalCaloriesBurned: workouts.reduce((s, w) => s + (w.caloriesBurned ?? 0), 0),
    workoutByType,
    stepTrend: stepDays,
    avgDailySteps,
  };
});

export const getNutritionSummary = cache(async (userId: string): Promise<NutritionSummary> => {
  const entries = await getCalorieEntries(userId, { dateFrom: daysAgo(14), dateTo: today() });

  const dailyCalMap = new Map<string, { cal: number; protein: number; carbs: number; fat: number }>();
  for (const e of entries) {
    const existing = dailyCalMap.get(e.date) ?? { cal: 0, protein: 0, carbs: 0, fat: 0 };
    existing.cal += e.calories;
    existing.protein += Number(e.proteinG ?? 0);
    existing.carbs += Number(e.carbsG ?? 0);
    existing.fat += Number(e.fatG ?? 0);
    dailyCalMap.set(e.date, existing);
  }

  const dailyCalories = Array.from(dailyCalMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date, value: vals.cal }));

  const totalDays = dailyCalMap.size;
  const avgCalories = totalDays > 0
    ? Math.round(Array.from(dailyCalMap.values()).reduce((s, d) => s + d.cal, 0) / totalDays)
    : 0;

  const totals = { protein: 0, carbs: 0, fat: 0 };
  for (const d of dailyCalMap.values()) {
    totals.protein += d.protein;
    totals.carbs += d.carbs;
    totals.fat += d.fat;
  }
  if (totalDays > 0) {
    totals.protein = Math.round(totals.protein / totalDays);
    totals.carbs = Math.round(totals.carbs / totalDays);
    totals.fat = Math.round(totals.fat / totalDays);
  }

  const todayCal = dailyCalMap.get(today())?.cal ?? 0;

  return {
    dailyCalories,
    avgDailyCalories: avgCalories,
    macroBreakdown: totals,
    todayCalories: todayCal,
  };
});

export const getHealthDashboard = cache(async (userId: string): Promise<HealthDashboard> => {
  const [vitals, vitalsTrends, fitness, nutrition, goals, medicines, achievements] = await Promise.all([
    getVitalsSnapshot(userId),
    getVitalsTrends(userId),
    getFitnessSummary(userId),
    getNutritionSummary(userId),
    getUserGoals(userId),
    getMedicineReminders(userId),
    getAchievements(userId),
  ]);

  return {
    vitals,
    vitalsTrends,
    fitness,
    nutrition,
    activeGoals: goals.filter((g) => g.isActive).map((g) => ({
      id: g.id,
      title: g.title,
      progress: Number(g.targetValue) > 0
        ? Math.min(100, Math.round((Number(g.currentValue) / Number(g.targetValue)) * 100))
        : 0,
      currentValue: g.currentValue,
      targetValue: g.targetValue,
      unit: g.unit,
    })),
    activeMedicines: medicines.filter((m) => m.isActive).length,
    achievements: achievements.length,
  };
});
