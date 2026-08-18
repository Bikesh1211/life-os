"use client";

import { notifications } from "@mantine/notifications";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiFetch, toSearchParams } from "@/core/api/http";

export type LevelInfo = {
  level: number;
  currentXp: number;
  xpForNext: number;
  progress: number;
  totalXp: number;
};

export type GamificationMetrics = {
  id: string;
  userId: string;
  totalXp: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  consistencyScore: number;
  lastSyncedAt: string | null;
  updatedAt: string;
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  criteriaType: string;
  criteriaValue: number;
  unlocked: boolean;
  unlockedAt: string | null;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xpReward: number;
  criteriaType: string;
  criteriaValue: number;
  unlocked: boolean;
  unlockedAt: string | null;
};

export type Challenge = {
  id: string;
  name: string;
  description: string;
  challengeType: "daily" | "weekly" | "monthly";
  criteriaType: string;
  criteriaValue: number;
  xpReward: number;
  badgeId: string | null;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  progress: number;
  isCompleted: boolean;
  completedAt: string | null;
};

export type GamificationProfile = {
  metrics: GamificationMetrics | null;
  levelInfo: LevelInfo;
  achievements: {
    all: Achievement[];
    unlocked: Achievement[];
    locked: Achievement[];
  };
  badges: {
    all: Badge[];
    unlocked: Badge[];
    locked: Badge[];
  };
  challenges: Challenge[];
};

export type XpTransaction = {
  id: string;
  userId: string;
  eventType: string;
  eventSource: string;
  xpAmount: number;
  description: string;
  createdAt: string;
};

export function useGamificationProfile() {
  return useQuery<GamificationProfile>({
    queryKey: ["gamification", "profile"],
    queryFn: () => apiFetch<GamificationProfile>("/api/gamification/profile"),
    staleTime: 30_000,
  });
}

export function useGamificationSync() {
  return useMutation({
    mutationFn: () => apiFetch("/api/gamification/sync", { method: "POST" }),
    onSuccess: () => {
      notifications.show({ title: "Synced", message: "Gamification data synced", color: "green" });
    },
    onError: () => {
      notifications.show({ title: "Error", message: "Failed to sync gamification data", color: "red" });
    },
  });
}

export function useAchievements() {
  return useQuery<Achievement[]>({
    queryKey: ["gamification", "achievements"],
    queryFn: () => apiFetch<Achievement[]>("/api/gamification/achievements"),
    staleTime: 30_000,
  });
}

export function useBadges() {
  return useQuery<Badge[]>({
    queryKey: ["gamification", "badges"],
    queryFn: () => apiFetch<Badge[]>("/api/gamification/badges"),
    staleTime: 30_000,
  });
}

export function useChallenges() {
  return useQuery<Challenge[]>({
    queryKey: ["gamification", "challenges"],
    queryFn: () => apiFetch<Challenge[]>("/api/gamification/challenges"),
    staleTime: 30_000,
  });
}

export function useXpHistory(limit = 100) {
  return useQuery<XpTransaction[]>({
    queryKey: ["gamification", "history", limit],
    queryFn: () => apiFetch<XpTransaction[]>(`/api/gamification/history${toSearchParams({ limit })}`),
    staleTime: 30_000,
  });
}
