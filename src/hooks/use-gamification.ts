"use client";

import { notifications } from "@mantine/notifications";
import { useQuery, useMutation } from "@tanstack/react-query";

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
    queryFn: async () => {
      const res = await fetch("/api/gamification/profile");
      if (!res.ok) throw new Error("Failed to load gamification profile");
      return res.json();
    },
    staleTime: 30_000,
  });
}

export function useGamificationSync() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/gamification/sync", { method: "POST" });
      if (!res.ok) throw new Error("Failed to sync gamification data");
      return res.json();
    },
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
    queryFn: async () => {
      const res = await fetch("/api/gamification/achievements");
      if (!res.ok) throw new Error("Failed to load achievements");
      return res.json();
    },
    staleTime: 30_000,
  });
}

export function useBadges() {
  return useQuery<Badge[]>({
    queryKey: ["gamification", "badges"],
    queryFn: async () => {
      const res = await fetch("/api/gamification/badges");
      if (!res.ok) throw new Error("Failed to load badges");
      return res.json();
    },
    staleTime: 30_000,
  });
}

export function useChallenges() {
  return useQuery<Challenge[]>({
    queryKey: ["gamification", "challenges"],
    queryFn: async () => {
      const res = await fetch("/api/gamification/challenges");
      if (!res.ok) throw new Error("Failed to load challenges");
      return res.json();
    },
    staleTime: 30_000,
  });
}

export function useXpHistory(limit = 100) {
  return useQuery<XpTransaction[]>({
    queryKey: ["gamification", "history", limit],
    queryFn: async () => {
      const res = await fetch(`/api/gamification/history?limit=${limit}`);
      if (!res.ok) throw new Error("Failed to load XP history");
      return res.json();
    },
    staleTime: 30_000,
  });
}
