import type {
  GamificationAchievement,
  GamificationBadge,
  GamificationChallenge,
} from "./repository";

export const SEED_ACHIEVEMENTS: Omit<GamificationAchievement, "id" | "createdAt">[] = [
  { name: "First Steps", title: "First Steps", description: "Complete your first habit", icon: "star", xpReward: 10, criteriaType: "habit_count", criteriaValue: 1, updatedAt: new Date() },
  { name: "Getting Started", title: "Getting Started", description: "Complete your first task", icon: "check", xpReward: 10, criteriaType: "task_count", criteriaValue: 1, updatedAt: new Date() },
  { name: "Routine Runner", title: "Routine Runner", description: "Complete your first routine", icon: "repeat", xpReward: 15, criteriaType: "routine_count", criteriaValue: 1, updatedAt: new Date() },
  { name: "Level Up", title: "Level Up", description: "Reach level 5", icon: "trending-up", xpReward: 50, criteriaType: "level_reached", criteriaValue: 5, updatedAt: new Date() },
  { name: "Rising Star", title: "Rising Star", description: "Reach level 10", icon: "star", xpReward: 100, criteriaType: "level_reached", criteriaValue: 10, updatedAt: new Date() },
  { name: "Century", title: "Century", description: "Complete 100 habits", icon: "target", xpReward: 100, criteriaType: "habit_count", criteriaValue: 100, updatedAt: new Date() },
  { name: "Task Master", title: "Task Master", description: "Complete 50 tasks", icon: "clipboard-check", xpReward: 75, criteriaType: "task_count", criteriaValue: 50, updatedAt: new Date() },
  { name: "Dedicated", title: "Dedicated", description: "Maintain a 7 day streak", icon: "flame", xpReward: 50, criteriaType: "streak_days", criteriaValue: 7, updatedAt: new Date() },
  { name: "Unstoppable", title: "Unstoppable", description: "Maintain a 30 day streak", icon: "flame", xpReward: 250, criteriaType: "streak_days", criteriaValue: 30, updatedAt: new Date() },
  { name: "Routine Champion", title: "Routine Champion", description: "Complete all routine activities for 7 days", icon: "repeat", xpReward: 100, criteriaType: "routine_count", criteriaValue: 7, updatedAt: new Date() },
  { name: "Challenge Accepted", title: "Challenge Accepted", description: "Complete your first challenge", icon: "award", xpReward: 25, criteriaType: "challenge_completed", criteriaValue: 1, updatedAt: new Date() },
  { name: "Challenge Enthusiast", title: "Challenge Enthusiast", description: "Complete 10 challenges", icon: "award", xpReward: 100, criteriaType: "challenge_completed", criteriaValue: 10, updatedAt: new Date() },
  { name: "First Promise", title: "First Promise", description: "Keep your first commitment", icon: "hand", xpReward: 10, criteriaType: "commitment_count", criteriaValue: 1, updatedAt: new Date() },
  { name: "Promise Keeper", title: "Promise Keeper", description: "Keep 50 commitments", icon: "shield", xpReward: 75, criteriaType: "commitment_count", criteriaValue: 50, updatedAt: new Date() },
  { name: "Iron Will", title: "Iron Will", description: "Keep 100 commitments", icon: "zap", xpReward: 150, criteriaType: "commitment_count", criteriaValue: 100, updatedAt: new Date() },
  { name: "Integrity Legend", title: "Integrity Legend", description: "Achieve an integrity score of 95+", icon: "award", xpReward: 200, criteriaType: "integrity_score", criteriaValue: 95, updatedAt: new Date() },
  { name: "Unbreakable", title: "Unbreakable", description: "Maintain a 30-day integrity streak", icon: "flame", xpReward: 250, criteriaType: "streak_days", criteriaValue: 30, updatedAt: new Date() },
  { name: "First Grooming", title: "First Grooming", description: "Complete your first grooming activity", icon: "sparkles", xpReward: 10, criteriaType: "grooming_completions", criteriaValue: 1, updatedAt: new Date() },
  { name: "Self-Care Novice", title: "Self-Care Novice", description: "Complete 30 grooming activities", icon: "heart", xpReward: 50, criteriaType: "grooming_completions", criteriaValue: 30, updatedAt: new Date() },
  { name: "Hair Care Master", title: "Hair Care Master", description: "Complete 50 hair-related grooming activities", icon: "droplet", xpReward: 75, criteriaType: "grooming_completions", criteriaValue: 50, updatedAt: new Date() },
  { name: "Dental Champion", title: "Dental Champion", description: "Complete 100 dental care activities", icon: "tooth", xpReward: 100, criteriaType: "grooming_completions", criteriaValue: 100, updatedAt: new Date() },
  { name: "Grooming Pro", title: "Grooming Pro", description: "Complete 500 grooming activities", icon: "star", xpReward: 200, criteriaType: "grooming_completions", criteriaValue: 500, updatedAt: new Date() },
  { name: "Self-Care Legend", title: "Self-Care Legend", description: "Complete 1000 grooming activities", icon: "award", xpReward: 500, criteriaType: "grooming_completions", criteriaValue: 1000, updatedAt: new Date() },
];

export const SEED_BADGES: Omit<GamificationBadge, "id" | "createdAt">[] = [
  { name: "First Habit", title: "First Habit", description: "Completed your first habit", icon: "star", category: "habits", tier: "bronze", updatedAt: new Date() },
  { name: "7 Day Streak", title: "7 Day Streak", description: "Maintained a 7 day streak", icon: "flame", category: "streaks", tier: "bronze", updatedAt: new Date() },
  { name: "30 Day Streak", title: "30 Day Streak", description: "Maintained a 30 day streak", icon: "flame", category: "streaks", tier: "silver", updatedAt: new Date() },
  { name: "100 Habits", title: "100 Habits", description: "Completed 100 habits", icon: "target", category: "habits", tier: "gold", updatedAt: new Date() },
  { name: "Early Bird", title: "Early Bird", description: "Completed a habit before 7 AM", icon: "sunrise", category: "general", tier: "bronze", updatedAt: new Date() },
  { name: "Night Owl", title: "Night Owl", description: "Completed a task after 10 PM", icon: "moon", category: "general", tier: "bronze", updatedAt: new Date() },
  { name: "Goal Crusher", title: "Goal Crusher", description: "Complete 5 goals", icon: "target", category: "general", tier: "silver", updatedAt: new Date() },
  { name: "Routine Champion", title: "Routine Champion", description: "Maintained routines for 14 days", icon: "repeat", category: "routines", tier: "silver", updatedAt: new Date() },
  { name: "Consistency King", title: "Consistency King", description: "Maintained a streak for 60 days", icon: "crown", category: "streaks", tier: "gold", updatedAt: new Date() },
  { name: "Task Tornado", title: "Task Tornado", description: "Completed 100 tasks", icon: "wind", category: "tasks", tier: "gold", updatedAt: new Date() },
  { name: "Man of His Word", title: "Man of His Word", description: "Kept your first commitment", icon: "hand", category: "integrity", tier: "bronze", updatedAt: new Date() },
  { name: "Reliable", title: "Reliable", description: "Kept 25 commitments", icon: "shield", category: "integrity", tier: "silver", updatedAt: new Date() },
  { name: "Disciplined", title: "Disciplined", description: "Kept 100 commitments", icon: "zap", category: "integrity", tier: "gold", updatedAt: new Date() },
  { name: "Consistency Master", title: "Consistency Master", description: "Maintained a 14-day integrity streak", icon: "flame", category: "integrity", tier: "silver", updatedAt: new Date() },
  { name: "Promise Keeper", title: "Promise Keeper", description: "Achieve 90%+ promise ratio with 50+ commitments", icon: "award", category: "integrity", tier: "gold", updatedAt: new Date() },
  { name: "Fresh Start", title: "Fresh Start", description: "Complete your first grooming activity", icon: "sparkles", category: "grooming", tier: "bronze", updatedAt: new Date() },
  { name: "Grooming Streak", title: "Grooming Streak", description: "Maintained a 7-day grooming streak", icon: "flame", category: "grooming", tier: "bronze", updatedAt: new Date() },
  { name: "Grooming Devotee", title: "Grooming Devotee", description: "Complete 200 grooming activities", icon: "star", category: "grooming", tier: "silver", updatedAt: new Date() },
];

export function generateChallenges(): Omit<GamificationChallenge, "id" | "createdAt">[] {
  const now = new Date();

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setHours(23, 59, 59, 999);

  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  endOfWeek.setHours(23, 59, 59, 999);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  return [
    { title: "5 Habits Today", description: "Complete 5 habits today", type: "daily", targetValue: 5, xpReward: 30, startDate: startOfDay, endDate: endOfDay, isActive: true, updatedAt: new Date() },
    { title: "3 Tasks Today", description: "Finish 3 tasks today", type: "daily", targetValue: 3, xpReward: 25, startDate: startOfDay, endDate: endOfDay, isActive: true, updatedAt: new Date() },
    { title: "Complete a Routine", description: "Complete a routine today", type: "daily", targetValue: 1, xpReward: 30, startDate: startOfDay, endDate: endOfDay, isActive: true, updatedAt: new Date() },
    { title: "Weekly Habit Blitz", description: "Complete 30 habits this week", type: "weekly", targetValue: 30, xpReward: 100, startDate: startOfWeek, endDate: endOfWeek, isActive: true, updatedAt: new Date() },
    { title: "Weekly Task Sprint", description: "Finish 15 tasks this week", type: "weekly", targetValue: 15, xpReward: 75, startDate: startOfWeek, endDate: endOfWeek, isActive: true, updatedAt: new Date() },
    { title: "Routine Perfection Week", description: "Complete all routines every day this week", type: "weekly", targetValue: 7, xpReward: 100, startDate: startOfWeek, endDate: endOfWeek, isActive: true, updatedAt: new Date() },
    { title: "Monthly Habit Marathon", description: "Complete 100 habits this month", type: "monthly", targetValue: 100, xpReward: 300, startDate: startOfMonth, endDate: endOfMonth, isActive: true, updatedAt: new Date() },
    { title: "Monthly Task Challenge", description: "Finish 50 tasks this month", type: "monthly", targetValue: 50, xpReward: 200, startDate: startOfMonth, endDate: endOfMonth, isActive: true, updatedAt: new Date() },
    { title: "5 Grooming Today", description: "Complete 5 grooming activities today", type: "daily", targetValue: 5, xpReward: 25, startDate: startOfDay, endDate: endOfDay, isActive: true, updatedAt: new Date() },
    { title: "Grooming Streak Week", description: "Complete 25 grooming activities this week", type: "weekly", targetValue: 25, xpReward: 75, startDate: startOfWeek, endDate: endOfWeek, isActive: true, updatedAt: new Date() },
    { title: "Monthly Grooming Marathon", description: "Complete 100 grooming activities this month", type: "monthly", targetValue: 100, xpReward: 250, startDate: startOfMonth, endDate: endOfMonth, isActive: true, updatedAt: new Date() },
  ];
}
