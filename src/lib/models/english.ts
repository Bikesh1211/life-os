import mongoose, { Schema, Document, Types } from "mongoose";

export interface IEnglishVocabulary extends Document {
  _id: Types.ObjectId;
  userId: string;
  word: string;
  definition: string;
  example?: string;
  partOfSpeech?: string;
  difficulty: string;
  tags: string[];
  masteryLevel: number;
  nextReviewDate?: Date;
  reviewCount: number;
  lastReviewedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EnglishVocabularySchema = new Schema<IEnglishVocabulary>(
  {
    userId: { type: String, required: true, index: true },
    word: { type: String, required: true, index: true },
    definition: { type: String, required: true },
    example: { type: String },
    partOfSpeech: { type: String },
    difficulty: { type: String, default: "beginner" },
    tags: { type: [String], default: [] },
    masteryLevel: { type: Number, default: 0 },
    nextReviewDate: { type: Date },
    reviewCount: { type: Number, default: 0 },
    lastReviewedAt: { type: Date },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

EnglishVocabularySchema.index({ userId: 1, word: 1 }, { unique: true });

export interface IEnglishQuiz extends Document {
  _id: Types.ObjectId;
  userId: string;
  type: string;
  score?: number;
  totalQuestions?: number;
  completedAt: Date;
  durationSeconds?: number;
  createdAt: Date;
  updatedAt: Date;
}

const EnglishQuizSchema = new Schema<IEnglishQuiz>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    score: { type: Number },
    totalQuestions: { type: Number },
    completedAt: { type: Date, default: Date.now },
    durationSeconds: { type: Number },
  },
  { timestamps: true }
);

export interface IEnglishQuizQuestion extends Document {
  _id: Types.ObjectId;
  quizId: Types.ObjectId;
  word: string;
  question: string;
  options: string[];
  correctAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EnglishQuizQuestionSchema = new Schema<IEnglishQuizQuestion>(
  {
    quizId: { type: Schema.Types.ObjectId, ref: "EnglishQuiz", required: true, index: true },
    word: { type: String, required: true },
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: String, required: true },
    userAnswer: { type: String },
    isCorrect: { type: Boolean },
  },
  { timestamps: true }
);

export interface IEnglishStudySession extends Document {
  _id: Types.ObjectId;
  userId: string;
  startTime: Date;
  endTime?: Date;
  wordsStudied: number;
  wordsMastered: number;
  durationSeconds?: number;
  createdAt: Date;
  updatedAt: Date;
}

const EnglishStudySessionSchema = new Schema<IEnglishStudySession>(
  {
    userId: { type: String, required: true, index: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    wordsStudied: { type: Number, default: 0 },
    wordsMastered: { type: Number, default: 0 },
    durationSeconds: { type: Number },
  },
  { timestamps: true }
);

export const EnglishVocabularyModel =
  mongoose.models.EnglishVocabulary ||
  mongoose.model<IEnglishVocabulary>("EnglishVocabulary", EnglishVocabularySchema);
export const EnglishQuizModel =
  mongoose.models.EnglishQuiz || mongoose.model<IEnglishQuiz>("EnglishQuiz", EnglishQuizSchema);
export const EnglishQuizQuestionModel =
  mongoose.models.EnglishQuizQuestion ||
  mongoose.model<IEnglishQuizQuestion>("EnglishQuizQuestion", EnglishQuizQuestionSchema);
export const EnglishStudySessionModel =
  mongoose.models.EnglishStudySession ||
  mongoose.model<IEnglishStudySession>("EnglishStudySession", EnglishStudySessionSchema);
