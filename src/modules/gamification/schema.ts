import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  boolean,
  pgEnum,
  unique,
  index,
} from "drizzle-orm/pg-core";

export const xpEventTypeEnum = pgEnum("xp_event_type", [
  "habit_completed",
  "task_completed",
  "routine_completed",
  "daily_login",
  "streak_bonus",
  "achievement_bonus",
  "badge_bonus",
  "challenge_completed",
  "mood_logged",
  "sleep_logged",
  "hydration_logged",
  "confidence_checkin",
  "wellness_streak_bonus",
  "workout_logged",
  "steps_logged",
  "connection_added",
  "meetup_logged",
  "event_logged",
  "memory_created",
  "commitment_completed",
  "commitment_streak_bonus",
  "integrity_milestone",
  "grooming_completed",
  "grooming_streak_bonus",
  "grooming_perfect_week",
] as const);

export const challengeTypeEnum = pgEnum("challenge_type", ["daily", "weekly", "monthly"] as const);

export const achievementCriteriaTypeEnum = pgEnum("achievement_criteria_type", [
  "habit_count",
  "task_count",
  "routine_count",
  "level_reached",
  "streak_days",
  "challenge_completed",
  "commitment_count",
  "integrity_score",
  "grooming_completions",
] as const);

export const badgeCategoryEnum = pgEnum("badge_category", [
  "habits",
  "tasks",
  "routines",
  "streaks",
  "general",
  "integrity",
  "grooming",
] as const);

export const gamificationUserMetrics = pgTable("gamification_user_metrics", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().unique(),
  totalXp: integer("total_xp").default(0).notNull(),
  currentLevel: integer("current_level").default(1).notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  consistencyScore: integer("consistency_score").default(0).notNull(),
  lastSyncedAt: timestamp("last_synced_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const gamificationXpTransactions = pgTable(
  "gamification_xp_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    eventType: xpEventTypeEnum("event_type").notNull(),
    eventSource: text("event_source").notNull(),
    xpAmount: integer("xp_amount").notNull(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userCreatedIdx: index("idx_gamification_xp_transactions_user_created").on(
      table.userId,
      table.createdAt.desc(),
    ),
  }),
);

export const gamificationAchievements = pgTable("gamification_achievements", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  xpReward: integer("xp_reward").default(0).notNull(),
  criteriaType: achievementCriteriaTypeEnum("criteria_type").notNull(),
  criteriaValue: integer("criteria_value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const gamificationUserAchievements = pgTable(
  "gamification_user_achievements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    achievementId: uuid("achievement_id")
      .notNull()
      .references(() => gamificationAchievements.id, { onDelete: "cascade" }),
    unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
  },
  (table) => ({
    uniq: unique().on(table.userId, table.achievementId),
  }),
);

export const gamificationBadges = pgTable("gamification_badges", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: badgeCategoryEnum("category").notNull(),
  xpReward: integer("xp_reward").default(0).notNull(),
  criteriaType: achievementCriteriaTypeEnum("criteria_type").notNull(),
  criteriaValue: integer("criteria_value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const gamificationUserBadges = pgTable(
  "gamification_user_badges",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    badgeId: uuid("badge_id")
      .notNull()
      .references(() => gamificationBadges.id, { onDelete: "cascade" }),
    unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
  },
  (table) => ({
    uniq: unique().on(table.userId, table.badgeId),
  }),
);

export const gamificationChallenges = pgTable("gamification_challenges", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  challengeType: challengeTypeEnum("challenge_type").notNull(),
  criteriaType: achievementCriteriaTypeEnum("criteria_type").notNull(),
  criteriaValue: integer("criteria_value").notNull(),
  xpReward: integer("xp_reward").default(0).notNull(),
  badgeId: uuid("badge_id").references(() => gamificationBadges.id, {
    onDelete: "set null",
  }),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const gamificationUserChallenges = pgTable(
  "gamification_user_challenges",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    challengeId: uuid("challenge_id")
      .notNull()
      .references(() => gamificationChallenges.id, { onDelete: "cascade" }),
    progress: integer("progress").default(0).notNull(),
    isCompleted: boolean("is_completed").default(false).notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    uniq: unique().on(table.userId, table.challengeId),
  }),
);
