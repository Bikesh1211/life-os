"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/infrastructure/providers/auth-provider";
import { useGamificationProfile } from "./use-gamification";
import { apiFetch } from "@/core/api/http";

type HabitDashboard = {
  totalHabits: number;
  activeHabits: number;
  completedToday: number;
  completionRate: number;
  rateChange: number;
  currentStreak: number;
  longestStreak: number;
  consistencyScore: number;
  totalCompletions: number;
  dailyTrend: Array<{ date: string; count: number }>;
  categoryDistribution: Array<{ category: string; count: number }>;
};

type RoutineAnalytics = {
  routineCount: number;
  executionCount: number;
  completionRate: number;
  totalCompleted: number;
  totalMissed: number;
  totalSkipped: number;
  consistencyScore: number;
  dailyTrend: Array<{ date: string; completed: number; total: number; rate: number }>;
  routinePerformance: Array<{
    routineId: string;
    routineName: string;
    total: number;
    completed: number;
    rate: number;
  }>;
};

type TaskSummary = {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
};

type GoalSummary = {
  total: number;
  active: number;
  completed: number;
};

export type ProfileData = {
  user: {
    fullName: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    imageUrl: string;
    createdAt: Date | null;
  };
  gamification: ReturnType<typeof useGamificationProfile>["data"];
  habits: HabitDashboard | null;
  routines: RoutineAnalytics | null;
  tasks: TaskSummary | null;
  goals: GoalSummary;
};

function useHabitDashboard() {
  return useQuery<HabitDashboard>({
    queryKey: ["habit-dashboard"],
    queryFn: () => apiFetch<HabitDashboard>("/api/habits/analytics/dashboard"),
    staleTime: 30_000,
  });
}

function useRoutineAnalytics() {
  return useQuery<RoutineAnalytics>({
    queryKey: ["routine-analytics"],
    queryFn: () => apiFetch<RoutineAnalytics>("/api/routines/analytics"),
    staleTime: 30_000,
  });
}

function useTaskSummary() {
  return useQuery<TaskSummary>({
    queryKey: ["task-summary"],
    queryFn: () => apiFetch<TaskSummary>("/api/tasks/summary"),
    staleTime: 30_000,
  });
}

function useGoalSummary() {
  return useQuery<GoalSummary>({
    queryKey: ["goal-summary"],
    queryFn: () => apiFetch<GoalSummary>("/api/goals/summary"),
    staleTime: 30_000,
  });
}

const EMPTY_GOALS: GoalSummary = { total: 0, active: 0, completed: 0 };

export function useProfile() {
  const { user, isLoading: authLoading } = useAuth();
  const gamification = useGamificationProfile();
  const habits = useHabitDashboard();
  const routines = useRoutineAnalytics();
  const tasks = useTaskSummary();
  const goals = useGoalSummary();

  const isLoading =
    authLoading ||
    gamification.isLoading ||
    habits.isLoading ||
    routines.isLoading ||
    tasks.isLoading;

  const isLoadingGoals = goals.isLoading;

  const profile: ProfileData | null =
    !authLoading && gamification.data
      ? {
          user: {
            fullName: user?.fullName ?? null,
            firstName: user?.fullName?.split(" ")[0] ?? null,
            lastName: user?.fullName?.split(" ").slice(1).join(" ") ?? null,
            email: user?.email ?? null,
            imageUrl: user?.avatarUrl ?? "",
            createdAt: null,
          },
          gamification: gamification.data,
          habits: habits.data ?? null,
          routines: routines.data ?? null,
          tasks: tasks.data ?? null,
          goals: goals.data ?? EMPTY_GOALS,
        }
      : null;

  return {
    profile,
    isLoading,
    isLoadingGoals,
    refetch: () => {
      gamification.refetch();
      habits.refetch();
      routines.refetch();
      tasks.refetch();
      goals.refetch();
    },
  };
}
