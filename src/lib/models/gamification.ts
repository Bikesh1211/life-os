import mongoose, { Schema, Document, Types } from "mongoose";

export interface IGamificationUserMetric extends Document {
  userId: string;
  totalXp: number;
  level: number;
  consistencyScore: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GamificationUserMetricSchema = new Schema<IGamificationUserMetric>(
  {
    userId: { type: String, required: true, unique: true },
    totalXp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    consistencyScore: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActivityDate: { type: Date },
  },
  { timestamps: true }
);

export interface IGamificationXpTransaction extends Document {
  userId: string;
  amount: number;
  eventType: string;
  entityId?: string;
  entityTypeName?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GamificationXpTransactionSchema = new Schema<IGamificationXpTransaction>(
  {
    userId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    eventType: { type: String, required: true },
    entityId: { type: String },
    entityTypeName: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

GamificationXpTransactionSchema.index({ userId: 1, createdAt: 1 });

export interface IGamificationAchievement extends Document {
  name: string;
  title: string;
  description?: string;
  icon?: string;
  criteriaType: string;
  criteriaValue: number;
  xpReward: number;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GamificationAchievementSchema = new Schema<IGamificationAchievement>(
  {
    name: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    icon: { type: String },
    criteriaType: { type: String, required: true },
    criteriaValue: { type: Number, required: true },
    xpReward: { type: Number, default: 0 },
    category: { type: String },
  },
  { timestamps: true }
);

export interface IGamificationUserAchievement extends Document {
  userId: string;
  achievementId: Types.ObjectId;
  unlockedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GamificationUserAchievementSchema = new Schema<IGamificationUserAchievement>(
  {
    userId: { type: String, required: true, index: true },
    achievementId: { type: Schema.Types.ObjectId, ref: "GamificationAchievement", required: true },
    unlockedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

GamificationUserAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

export interface IGamificationBadge extends Document {
  name: string;
  title: string;
  description?: string;
  icon?: string;
  category: string;
  tier: string;
  createdAt: Date;
  updatedAt: Date;
}

const GamificationBadgeSchema = new Schema<IGamificationBadge>(
  {
    name: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    icon: { type: String },
    category: { type: String, required: true },
    tier: { type: String, default: "bronze" },
  },
  { timestamps: true }
);

export interface IGamificationUserBadge extends Document {
  userId: string;
  badgeId: Types.ObjectId;
  earnedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GamificationUserBadgeSchema = new Schema<IGamificationUserBadge>(
  {
    userId: { type: String, required: true, index: true },
    badgeId: { type: Schema.Types.ObjectId, ref: "GamificationBadge", required: true },
    earnedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

GamificationUserBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

export interface IGamificationChallenge extends Document {
  title: string;
  description?: string;
  type: string;
  xpReward: number;
  targetValue: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GamificationChallengeSchema = new Schema<IGamificationChallenge>(
  {
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, required: true },
    xpReward: { type: Number, default: 0 },
    targetValue: { type: Number, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export interface IGamificationUserChallenge extends Document {
  userId: string;
  challengeId: Types.ObjectId;
  progress: number;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GamificationUserChallengeSchema = new Schema<IGamificationUserChallenge>(
  {
    userId: { type: String, required: true, index: true },
    challengeId: { type: Schema.Types.ObjectId, ref: "GamificationChallenge", required: true },
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

GamificationUserChallengeSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

export const GamificationUserMetric =
  mongoose.models.GamificationUserMetric || mongoose.model<IGamificationUserMetric>("GamificationUserMetric", GamificationUserMetricSchema);
export const GamificationXpTransaction =
  mongoose.models.GamificationXpTransaction || mongoose.model<IGamificationXpTransaction>("GamificationXpTransaction", GamificationXpTransactionSchema);
export const GamificationAchievement =
  mongoose.models.GamificationAchievement || mongoose.model<IGamificationAchievement>("GamificationAchievement", GamificationAchievementSchema);
export const GamificationUserAchievement =
  mongoose.models.GamificationUserAchievement || mongoose.model<IGamificationUserAchievement>("GamificationUserAchievement", GamificationUserAchievementSchema);
export const GamificationBadge =
  mongoose.models.GamificationBadge || mongoose.model<IGamificationBadge>("GamificationBadge", GamificationBadgeSchema);
export const GamificationUserBadge =
  mongoose.models.GamificationUserBadge || mongoose.model<IGamificationUserBadge>("GamificationUserBadge", GamificationUserBadgeSchema);
export const GamificationChallenge =
  mongoose.models.GamificationChallenge || mongoose.model<IGamificationChallenge>("GamificationChallenge", GamificationChallengeSchema);
export const GamificationUserChallenge =
  mongoose.models.GamificationUserChallenge || mongoose.model<IGamificationUserChallenge>("GamificationUserChallenge", GamificationUserChallengeSchema);
