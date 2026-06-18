"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/infrastructure/providers/supabase-provider";
import { useGamificationProfile } from "./use-gamification";

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
    queryFn: async () => {
      const res = await fetch("/api/habits/analytics/dashboard");
      if (!res.ok) throw new Error("Failed to load habit dashboard");
      return res.json();
    },
    staleTime: 30_000,
  });
}

function useRoutineAnalytics() {
  return useQuery<RoutineAnalytics>({
    queryKey: ["routine-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/routines/analytics");
      if (!res.ok) throw new Error("Failed to load routine analytics");
      return res.json();
    },
    staleTime: 30_000,
  });
}

function useTaskSummary() {
  return useQuery<TaskSummary>({
    queryKey: ["task-summary"],
    queryFn: async () => {
      const res = await fetch("/api/tasks/summary");
      if (!res.ok) throw new Error("Failed to load task summary");
      return res.json();
    },
    staleTime: 30_000,
  });
}

function useGoalSummary() {
  return useQuery<GoalSummary>({
    queryKey: ["goal-summary"],
    queryFn: async () => {
      const res = await fetch("/api/goals/summary");
      if (!res.ok) return { total: 0, active: 0, completed: 0 };
      return res.json();
    },
    staleTime: 30_000,
  });
}

const EMPTY_GOALS: GoalSummary = { total: 0, active: 0, completed: 0 };

export function useProfile() {
  const { user, isLoading: authLoading } = useSupabase();
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
            fullName: user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? null,
            firstName: user?.user_metadata?.given_name ?? null,
            lastName: user?.user_metadata?.family_name ?? null,
            email: user?.email ?? null,
            imageUrl: user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? "",
            createdAt: user?.created_at ? new Date(user.created_at) : null,
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
