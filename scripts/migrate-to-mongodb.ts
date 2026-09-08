#!/usr/bin/env tsx
/**
 * PostgreSQL → MongoDB Migration Script
 *
 * Reads all data from a PostgreSQL database (Drizzle schema) and writes
 * it into the corresponding MongoDB collections via Mongoose.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." MONGODB_URI="mongodb+srv://..." npx tsx scripts/migrate-to-mongodb.ts
 *
 * Flags:
 *   --dry-run   Preview counts without writing
 *   --drop      Drop target collections before migrating
 *   --tables=X  Migrate only comma-separated table list
 */

import * as pg from "pg";
import mongoose from "mongoose";
import { connectToDatabase } from "../src/lib/mongodb";

// ─── Models ──────────────────────────────────────────────────────────────────
import { UserModel } from "../src/lib/models/user";
import { JournalEntryModel } from "../src/lib/models/journal";
import { TimelineEvent } from "../src/lib/models/timeline";
import { Task, TaskProject, TaskLabel } from "../src/lib/models/tasks";
import { Habit, HabitCompletion, HabitAnalytics } from "../src/lib/models/habits";
import { Note, NoteTag, NoteFolder } from "../src/lib/models/notes";
import { Goal, GoalMilestone } from "../src/lib/models/goals";
import { Account, Transaction, Budget, ExpenseCategory, ExpenseTag, TransactionTag } from "../src/lib/models/expenses";
import { MusicArtistModel, MusicAlbumModel, MusicTrackModel, MusicListeningHistoryModel, MusicJournalModel, MusicJournalSongModel, MusicMoodEntryModel, MusicMemoryModel, MusicMemorySongModel, MusicLibraryModel, MusicRatingModel, MusicFavoriteModel, MusicCollectionModel, MusicCollectionItemModel, MusicGoalConfigModel, MusicSpotifyTokenModel, MusicNoteModel } from "../src/lib/models/music";
import { MovieMediaModel, MoviePersonModel, MovieFavoriteModel, MovieRatingModel, MovieWatchlistModel, MovieQuoteModel, MovieCollectionModel, MovieCollectionItemModel, MovieMemoryModel } from "../src/lib/models/movies";
import { KnowledgeEntryModel, KnowledgeEntryLinkModel } from "../src/lib/models/knowledge";
import { RoutineModel, RoutineItemModel, RoutineExecutionModel, RoutineExecutionItemModel, RoutineTemplateModel, RoutineTemplateItemModel } from "../src/lib/models/routines";
import { WellnessMoodLog, WellnessSleepRecord, WellnessUserPreference, WellnessHydrationEntry, WellnessConfidenceCheckin, WellnessHabitEnrichment, WellnessWeightEntry, WellnessWorkoutEntry, WellnessStepEntry, WellnessCalorieEntry, WellnessBloodPressureEntry, WellnessHeartRateEntry, WellnessMedicineReminder, WellnessMedicineLog, WellnessUserGoal, WellnessAchievement } from "../src/lib/models/wellness";
import { IntegrityCommitment, IntegrityCommitmentEvent, IntegrityDailyCheckin, IntegrityDailySnapshot } from "../src/lib/models/integrity";
import { GamificationUserMetric, GamificationXpTransaction, GamificationAchievement, GamificationUserAchievement, GamificationBadge, GamificationUserBadge, GamificationChallenge, GamificationUserChallenge } from "../src/lib/models/gamification";
import { ConnectionModel, NetworkMemoryModel, NetworkMemoryConnectionModel, NetworkMeetupModel, NetworkMeetupConnectionModel, NetworkEventModel, NetworkEventConnectionModel, NetworkGiftModel } from "../src/lib/models/network";
import { CountdownEvent, CountdownChecklistItem, CountdownReminder, CountdownMemory } from "../src/lib/models/countdown";
import { CareerProfileModel, CareerResumeModel, CareerResumeVersionModel, JobApplicationModel, CareerInterviewPrepModel } from "../src/lib/models/career";
import { CareerCertificationModel } from "../src/lib/models/career-certifications";
import { PortfolioProjectModel } from "../src/lib/models/career-portfolio";
import { CareerAchievementModel } from "../src/lib/models/career-achievements";
import { SalaryRecordModel } from "../src/lib/models/career-salary";
import { ReadingItemModel, ReadingAnnotationModel, ReadingNoteModel, ReadingSessionModel } from "../src/lib/models/reading";
import { FeedbackEntryModel } from "../src/lib/models/feedback";
import { StrategySectionModel, StrategyVersionModel } from "../src/lib/models/strategy";
import { FitnessProfileModel, FitnessBodyMeasurementModel, FitnessExerciseLibraryModel, FitnessWorkoutProgramModel, FitnessProgramDayModel, FitnessProgramExerciseModel, FitnessWorkoutSessionModel, FitnessExerciseSetModel, FitnessPersonalRecordModel } from "../src/lib/models/fitness";
import { TimeEntryModel, TimeCategoryModel, TimeActiveTimerModel, TimeBudgetModel, TimeUserPreferenceModel } from "../src/lib/models/time-audit";
import { CurbCategoryModel, CurbHabitModel, CurbLogModel } from "../src/lib/models/curb";
import { TravelTripModel, TravelTripDayModel, TravelWishlistModel, TravelVisitedPlaceModel, TravelJournalModel, TravelPhotoModel, TravelExpenseModel, TravelRestaurantModel } from "../src/lib/models/travel";
import { TravelHelperRouteModel } from "../src/lib/models/travel-helper";
import { FieldBlueprintModel, FieldRoadmapModel, FieldRoadmapPhaseModel, FieldRoadmapMilestoneModel, FieldRoadmapSkillModel, FieldRoadmapSkillEvidenceModel } from "../src/lib/models/field-roadmap";
import { EnglishVocabularyModel, EnglishQuizModel, EnglishQuizQuestionModel, EnglishStudySessionModel } from "../src/lib/models/english";
import { BookModel, BookPartModel, BookChapterModel, BookVersionModel, BookCollaboratorModel, BookCommentModel, BookReadingProgressModel, BookBookmarkModel, BookHighlightModel } from "../src/lib/models/books";
import { ScriptModel, ScriptSectionModel, ScriptSpeakerNoteModel, ScriptCategoryModel, ScriptStructureTemplateModel, ScriptPracticeSessionModel, ScriptQuestionModel, ScriptActionItemModel, ScriptChecklistTemplateModel, ScriptVersionModel } from "../src/lib/models/scripts";
import { LoanModel, LoanEventModel, LoanRepaymentModel } from "../src/lib/models/loans";
import { TechItemModel, TechSetupModel, TechSetupItemModel, TechMaintenanceLogModel } from "../src/lib/models/tech-gear";
import { ClothingItemModel, ClothingImageModel, OutfitModel, OutfitItemModel, WearHistoryModel, LaundryItemModel, WishlistItemModel, PackingListModel, PackingListItemModel, WardrobeTagModel, WardrobeItemTagModel } from "../src/lib/models/wardrobe";
import { CoreTagModel, CoreTaggingModel, SidebarPreferenceModel } from "../src/lib/models/core";

// ─── Table → Model mapping ──────────────────────────────────────────────────
// Each entry: [postgresql_table_name, mongoose_model, transform_function?]
type MigrationEntry = {
  table: string;
  model: mongoose.Model<any>;
  /** Transform a PG row into a Mongoose-compatible document. Return null to skip. */
  transform?: (row: any) => any | null;
};

const MIGRATIONS: MigrationEntry[] = [
  // ── Auth ──
  { table: "users", model: UserModel, transform: (r) => ({
    _id: r.id, email: r.email, fullName: r.fullName || r.full_name || null,
    avatarUrl: r.avatarUrl || r.avatar_url || null, createdAt: r.createdAt || r.created_at,
    updatedAt: r.updatedAt || r.updated_at,
  })},

  // ── Journal ──
  { table: "journal_entries", model: JournalEntryModel, transform: (r) => ({
    _id: r.id, userId: r.userId || r.user_id, title: r.title, content: r.content,
    mood: r.mood, tags: r.tags || [], reflectionScore: r.reflectionScore || r.reflection_score,
    isPinned: r.isPinned || r.is_pinned, isPrivate: r.isPrivate ?? r.is_private ?? true,
    eventDate: r.eventDate || r.event_date, deletedAt: r.deletedAt || r.deleted_at,
    createdAt: r.createdAt || r.created_at, updatedAt: r.updatedAt || r.updated_at,
  })},

  // ── Timeline ──
  { table: "timeline_events", model: TimelineEvent, transform: (r) => ({
    _id: r.id, userId: r.userId || r.user_id, title: r.title, description: r.description,
    category: r.category, importance: r.importance || "medium",
    eventDate: r.eventDate || r.event_date, startTime: r.startTime || r.start_time,
    endTime: r.endTime || r.end_time, location: r.location, mood: r.mood,
    tags: r.tags || [], recurrence: r.recurrence || "none",
    linkedEntityType: r.linkedEntityType || r.linked_entity_type,
    linkedEntityId: r.linkedEntityId || r.linked_entity_id,
    createdAt: r.createdAt || r.created_at, updatedAt: r.updatedAt || r.updated_at,
  })},

  // ── Tasks ──
  { table: "tasks", model: Task },
  { table: "task_projects", model: TaskProject },
  { table: "task_labels", model: TaskLabel },

  // ── Habits ──
  { table: "habits", model: Habit },
  { table: "habit_completions", model: HabitCompletion },
  { table: "habit_analytics", model: HabitAnalytics },

  // ── Notes ──
  { table: "notes", model: Note },
  { table: "note_tags", model: NoteTag },
  { table: "note_folders", model: NoteFolder },

  // ── Goals ──
  { table: "goals", model: Goal },
  { table: "goal_milestones", model: GoalMilestone },

  // ── Expenses ──
  { table: "accounts", model: Account },
  { table: "transactions", model: Transaction },
  { table: "budgets", model: Budget },
  { table: "expense_categories", model: ExpenseCategory },
  { table: "expense_tags", model: ExpenseTag },
  { table: "transaction_tags", model: TransactionTag },

  // ── Music ──
  { table: "music_artists", model: MusicArtistModel },
  { table: "music_albums", model: MusicAlbumModel },
  { table: "music_tracks", model: MusicTrackModel },
  { table: "music_listening_history", model: MusicListeningHistoryModel },
  { table: "music_journal", model: MusicJournalModel },
  { table: "music_journal_songs", model: MusicJournalSongModel },
  { table: "music_mood_entries", model: MusicMoodEntryModel },
  { table: "music_memories", model: MusicMemoryModel },
  { table: "music_memory_songs", model: MusicMemorySongModel },
  { table: "music_library", model: MusicLibraryModel },
  { table: "music_ratings", model: MusicRatingModel },
  { table: "music_favorites", model: MusicFavoriteModel },
  { table: "music_collections", model: MusicCollectionModel },
  { table: "music_collection_items", model: MusicCollectionItemModel },
  { table: "music_goal_configs", model: MusicGoalConfigModel },
  { table: "music_spotify_tokens", model: MusicSpotifyTokenModel },
  { table: "music_notes", model: MusicNoteModel },

  // ── Movies ──
  { table: "movies_media", model: MovieMediaModel },
  { table: "movies_people", model: MoviePersonModel },
  { table: "movie_favorites", model: MovieFavoriteModel },
  { table: "movie_ratings", model: MovieRatingModel },
  { table: "movie_watchlist", model: MovieWatchlistModel },
  { table: "movie_quotes", model: MovieQuoteModel },
  { table: "movie_collections", model: MovieCollectionModel },
  { table: "movie_collection_items", model: MovieCollectionItemModel },
  { table: "movie_memories", model: MovieMemoryModel },

  // ── Knowledge ──
  { table: "knowledge_entries", model: KnowledgeEntryModel },
  { table: "knowledge_entry_links", model: KnowledgeEntryLinkModel },

  // ── Routines ──
  { table: "routines", model: RoutineModel },
  { table: "routine_items", model: RoutineItemModel },
  { table: "routine_executions", model: RoutineExecutionModel },
  { table: "routine_execution_items", model: RoutineExecutionItemModel },
  { table: "routine_templates", model: RoutineTemplateModel },
  { table: "routine_template_items", model: RoutineTemplateItemModel },

  // ── Wellness ──
  { table: "wellness_mood_logs", model: WellnessMoodLog },
  { table: "wellness_sleep_records", model: WellnessSleepRecord },
  { table: "wellness_user_preferences", model: WellnessUserPreference },
  { table: "wellness_hydration_entries", model: WellnessHydrationEntry },
  { table: "wellness_confidence_checkins", model: WellnessConfidenceCheckin },
  { table: "wellness_habit_enrichments", model: WellnessHabitEnrichment },
  { table: "wellness_weight_entries", model: WellnessWeightEntry },
  { table: "wellness_workout_entries", model: WellnessWorkoutEntry },
  { table: "wellness_step_entries", model: WellnessStepEntry },
  { table: "wellness_calorie_entries", model: WellnessCalorieEntry },
  { table: "wellness_blood_pressure_entries", model: WellnessBloodPressureEntry },
  { table: "wellness_heart_rate_entries", model: WellnessHeartRateEntry },
  { table: "wellness_medicine_reminders", model: WellnessMedicineReminder },
  { table: "wellness_medicine_logs", model: WellnessMedicineLog },
  { table: "wellness_user_goals", model: WellnessUserGoal },
  { table: "wellness_achievements", model: WellnessAchievement },

  // ── Integrity ──
  { table: "integrity_commitments", model: IntegrityCommitment },
  { table: "integrity_commitment_events", model: IntegrityCommitmentEvent },
  { table: "integrity_daily_checkins", model: IntegrityDailyCheckin },
  { table: "integrity_daily_snapshots", model: IntegrityDailySnapshot },

  // ── Gamification ──
  { table: "gamification_user_metrics", model: GamificationUserMetric },
  { table: "gamification_xp_transactions", model: GamificationXpTransaction },
  { table: "gamification_achievements", model: GamificationAchievement },
  { table: "gamification_user_achievements", model: GamificationUserAchievement },
  { table: "gamification_badges", model: GamificationBadge },
  { table: "gamification_user_badges", model: GamificationUserBadge },
  { table: "gamification_challenges", model: GamificationChallenge },
  { table: "gamification_user_challenges", model: GamificationUserChallenge },

  // ── Network ──
  { table: "connections", model: ConnectionModel },
  { table: "network_memories", model: NetworkMemoryModel },
  { table: "network_memory_connections", model: NetworkMemoryConnectionModel },
  { table: "network_meetups", model: NetworkMeetupModel },
  { table: "network_meetup_connections", model: NetworkMeetupConnectionModel },
  { table: "network_events", model: NetworkEventModel },
  { table: "network_event_connections", model: NetworkEventConnectionModel },
  { table: "network_gifts", model: NetworkGiftModel },

  // ── Countdown ──
  { table: "countdown_events", model: CountdownEvent },
  { table: "countdown_checklist_items", model: CountdownChecklistItem },
  { table: "countdown_reminders", model: CountdownReminder },
  { table: "countdown_memories", model: CountdownMemory },

  // ── Career ──
  { table: "career_profiles", model: CareerProfileModel },
  { table: "career_resumes", model: CareerResumeModel },
  { table: "career_resume_versions", model: CareerResumeVersionModel },
  { table: "job_applications", model: JobApplicationModel },
  { table: "career_interview_preps", model: CareerInterviewPrepModel },
  { table: "career_certifications", model: CareerCertificationModel },
  { table: "portfolio_projects", model: PortfolioProjectModel },
  { table: "career_achievements", model: CareerAchievementModel },
  { table: "salary_records", model: SalaryRecordModel },

  // ── Reading ──
  { table: "reading_items", model: ReadingItemModel },
  { table: "reading_annotations", model: ReadingAnnotationModel },
  { table: "reading_notes", model: ReadingNoteModel },
  { table: "reading_sessions", model: ReadingSessionModel },

  // ── Feedback ──
  { table: "feedback_entries", model: FeedbackEntryModel },

  // ── Strategy ──
  { table: "strategy_sections", model: StrategySectionModel },
  { table: "strategy_versions", model: StrategyVersionModel },

  // ── Fitness ──
  { table: "fitness_profiles", model: FitnessProfileModel },
  { table: "fitness_body_measurements", model: FitnessBodyMeasurementModel },
  { table: "fitness_exercise_library", model: FitnessExerciseLibraryModel },
  { table: "fitness_workout_programs", model: FitnessWorkoutProgramModel },
  { table: "fitness_program_days", model: FitnessProgramDayModel },
  { table: "fitness_program_exercises", model: FitnessProgramExerciseModel },
  { table: "fitness_workout_sessions", model: FitnessWorkoutSessionModel },
  { table: "fitness_exercise_sets", model: FitnessExerciseSetModel },
  { table: "fitness_personal_records", model: FitnessPersonalRecordModel },

  // ── Time Audit ──
  { table: "time_entries", model: TimeEntryModel },
  { table: "time_categories", model: TimeCategoryModel },
  { table: "time_active_timers", model: TimeActiveTimerModel },
  { table: "time_budgets", model: TimeBudgetModel },
  { table: "time_user_preferences", model: TimeUserPreferenceModel },

  // ── Curb ──
  { table: "curb_categories", model: CurbCategoryModel },
  { table: "curb_habits", model: CurbHabitModel },
  { table: "curb_logs", model: CurbLogModel },

  // ── Travel ──
  { table: "travel_trips", model: TravelTripModel },
  { table: "travel_trip_days", model: TravelTripDayModel },
  { table: "travel_wishlists", model: TravelWishlistModel },
  { table: "travel_visited_places", model: TravelVisitedPlaceModel },
  { table: "travel_journals", model: TravelJournalModel },
  { table: "travel_photos", model: TravelPhotoModel },
  { table: "travel_expenses", model: TravelExpenseModel },
  { table: "travel_restaurants", model: TravelRestaurantModel },

  // ── Travel Helper ──
  { table: "travel_helper_routes", model: TravelHelperRouteModel },

  // ── Field Roadmap ──
  { table: "field_blueprints", model: FieldBlueprintModel },
  { table: "field_roadmaps", model: FieldRoadmapModel },
  { table: "field_roadmap_phases", model: FieldRoadmapPhaseModel },
  { table: "field_roadmap_milestones", model: FieldRoadmapMilestoneModel },
  { table: "field_roadmap_skills", model: FieldRoadmapSkillModel },
  { table: "field_roadmap_skill_evidences", model: FieldRoadmapSkillEvidenceModel },

  // ── English ──
  { table: "english_vocabularies", model: EnglishVocabularyModel },
  { table: "english_quizzes", model: EnglishQuizModel },
  { table: "english_quiz_questions", model: EnglishQuizQuestionModel },
  { table: "english_study_sessions", model: EnglishStudySessionModel },

  // ── Books ──
  { table: "books", model: BookModel },
  { table: "book_parts", model: BookPartModel },
  { table: "book_chapters", model: BookChapterModel },
  { table: "book_versions", model: BookVersionModel },
  { table: "book_collaborators", model: BookCollaboratorModel },
  { table: "book_comments", model: BookCommentModel },
  { table: "book_reading_progresses", model: BookReadingProgressModel },
  { table: "book_bookmarks", model: BookBookmarkModel },
  { table: "book_highlights", model: BookHighlightModel },

  // ── Scripts ──
  { table: "scripts", model: ScriptModel },
  { table: "script_sections", model: ScriptSectionModel },
  { table: "script_speaker_notes", model: ScriptSpeakerNoteModel },
  { table: "script_categories", model: ScriptCategoryModel },
  { table: "script_structure_templates", model: ScriptStructureTemplateModel },
  { table: "script_practice_sessions", model: ScriptPracticeSessionModel },
  { table: "script_questions", model: ScriptQuestionModel },
  { table: "script_action_items", model: ScriptActionItemModel },
  { table: "script_checklist_templates", model: ScriptChecklistTemplateModel },
  { table: "script_versions", model: ScriptVersionModel },

  // ── Loans ──
  { table: "loans", model: LoanModel },
  { table: "loan_events", model: LoanEventModel },
  { table: "loan_repayments", model: LoanRepaymentModel },

  // ── Tech Gear ──
  { table: "tech_items", model: TechItemModel },
  { table: "tech_setups", model: TechSetupModel },
  { table: "tech_setup_items", model: TechSetupItemModel },
  { table: "tech_maintenance_logs", model: TechMaintenanceLogModel },

  // ── Wardrobe ──
  { table: "clothing_items", model: ClothingItemModel },
  { table: "clothing_images", model: ClothingImageModel },
  { table: "outfits", model: OutfitModel },
  { table: "outfit_items", model: OutfitItemModel },
  { table: "wear_histories", model: WearHistoryModel },
  { table: "laundry_items", model: LaundryItemModel },
  { table: "wishlist_items", model: WishlistItemModel },
  { table: "packing_lists", model: PackingListModel },
  { table: "packing_list_items", model: PackingListItemModel },
  { table: "wardrobe_tags", model: WardrobeTagModel },
  { table: "wardrobe_item_tags", model: WardrobeItemTagModel },

  // ── Core ──
  { table: "core_tags", model: CoreTagModel },
  { table: "core_taggings", model: CoreTaggingModel },
  { table: "sidebar_preferences", model: SidebarPreferenceModel },
];

// ─── CLI args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const DROP = args.includes("--drop");
const tablesArg = args.find((a) => a.startsWith("--tables="));
const ONLY_TABLES = tablesArg ? tablesArg.split("=")[1].split(",").map((s) => s.trim()) : null;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const snakeToPascal = (s: string) =>
  s.replace(/(^|_)([a-z])/g, (_, __, c) => c.toUpperCase());

/** Convert PG column names (snake_case) to camelCase for Drizzle-style rows */
function camelize(row: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = v;
  }
  return out;
}

/** Convert a JS value to a safe MongoDB value */
function mongoValue(v: any): any {
  if (v === null || v === undefined) return undefined;
  if (v instanceof Date) return v;
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)) return new Date(v);
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) return new Date(v + "T00:00:00Z");
  if (Array.isArray(v)) return v.map(mongoValue);
  if (typeof v === "object") {
    const out: Record<string, any> = {};
    for (const [k, val] of Object.entries(v)) out[k] = mongoValue(val);
    return out;
  }
  return v;
}

/** Recursively convert a PG row to a Mongoose-compatible document */
function defaultTransform(row: Record<string, any>): Record<string, any> {
  const camel = camelize(row);
  const doc: Record<string, any> = {};

  for (const [k, v] of Object.entries(camel)) {
    // Map id → _id (PG uses `id`, Mongoose uses `_id`)
    if (k === "id") {
      doc._id = v;
    } else {
      doc[k] = mongoValue(v);
    }
  }

  return doc;
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const pgUrl = process.env.DATABASE_URL;
  const mongoUri = process.env.MONGODB_URI;

  if (!pgUrl) {
    console.error("DATABASE_URL environment variable is required");
    process.exit(1);
  }
  if (!mongoUri) {
    console.error("MONGODB_URI environment variable is required");
    process.exit(1);
  }

  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║       PostgreSQL → MongoDB Migration Script         ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log();

  if (DRY_RUN) console.log("🔍 DRY RUN MODE — no data will be written\n");
  if (DROP) console.log("🗑️  DROP MODE — target collections will be dropped\n");

  // Connect to PostgreSQL
  console.log("Connecting to PostgreSQL...");
  const pgClient = new pg.Client({ connectionString: pgUrl, ssl: { rejectUnauthorized: false } });
  await pgClient.connect();
  console.log("✓ PostgreSQL connected\n");

  // Connect to MongoDB
  console.log("Connecting to MongoDB...");
  mongoose.set("strictQuery", false);
  await connectToDatabase();
  console.log("✓ MongoDB connected\n");

  // Filter migrations
  const migrations = ONLY_TABLES
    ? MIGRATIONS.filter((m) => ONLY_TABLES.includes(m.table))
    : MIGRATIONS;

  console.log(`Tables to migrate: ${migrations.length}\n`);

  let totalRows = 0;
  let totalInserted = 0;
  let totalSkipped = 0;
  const results: { table: string; pgRows: number; mongoInserted: number; status: string }[] = [];

  for (const { table, model, transform } of migrations) {
    const collectionName = model.collection.name;

    // Check if PG table exists
    const tableCheck = await pgClient.query(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)`,
      [table]
    );
    if (!tableCheck.rows[0].exists) {
      results.push({ table, pgRows: 0, mongoInserted: 0, status: "SKIP (no PG table)" });
      continue;
    }

    // Count rows
    const countResult = await pgClient.query(`SELECT COUNT(*)::int as count FROM "${table}"`);
    const pgRows = countResult.rows[0].count;
    totalRows += pgRows;

    if (pgRows === 0) {
      results.push({ table, pgRows: 0, mongoInserted: 0, status: "EMPTY" });
      continue;
    }

    if (DRY_RUN) {
      results.push({ table, pgRows, mongoInserted: 0, status: "DRY RUN" });
      continue;
    }

    // Drop if requested
    if (DROP) {
      await model.deleteMany({});
    }

    // Read all rows in batches
    const BATCH_SIZE = 1000;
    let offset = 0;
    let inserted = 0;

    while (offset < pgRows) {
      const rows = await pgClient.query(`SELECT * FROM "${table}" ORDER BY id LIMIT $1 OFFSET $2`, [
        BATCH_SIZE,
        offset,
      ]);

      const docs = rows.rows
        .map((row) => {
          const t = transform || defaultTransform;
          return t(row);
        })
        .filter(Boolean);

      if (docs.length > 0) {
        try {
          await model.insertMany(docs, { ordered: false });
          inserted += docs.length;
        } catch (err: any) {
          // Handle duplicate key errors gracefully
          if (err.code === 11000) {
            // Insert one by one, skipping duplicates
            for (const doc of docs) {
              try {
                await model.create(doc);
                inserted++;
              } catch (e: any) {
                if (e.code === 11000) {
                  totalSkipped++;
                } else {
                  console.error(`  ⚠ Error inserting into ${collectionName}:`, e.message);
                }
              }
            }
          } else {
            console.error(`  ⚠ Batch error in ${collectionName}:`, err.message);
          }
        }
      }

      offset += BATCH_SIZE;
    }

    totalInserted += inserted;
    results.push({
      table,
      pgRows,
      mongoInserted: inserted,
      status: inserted === pgRows ? "✓" : `${inserted}/${pgRows}`,
    });
  }

  // Print results
  console.log("\n┌──────────────────────────────────────────────────────┐");
  console.log("│ Migration Results                                    │");
  console.log("├──────────────────────────────────────────────────────┤");

  const maxTableLen = Math.max(...results.map((r) => r.table.length), 10);
  for (const r of results) {
    const status = r.status.padEnd(20);
    const count = String(r.pgRows).padStart(6);
    console.log(`│ ${r.table.padEnd(maxTableLen)} │ ${count} rows │ ${status} │`);
  }

  console.log("├──────────────────────────────────────────────────────┤");
  console.log(`│ Total PG rows:      ${String(totalRows).padStart(8)}                        │`);
  console.log(`│ Total inserted:     ${String(totalInserted).padStart(8)}                        │`);
  console.log(`│ Duplicates skipped: ${String(totalSkipped).padStart(8)}                        │`);
  console.log("└──────────────────────────────────────────────────────┘");

  // Cleanup
  await pgClient.end();
  await mongoose.disconnect();

  console.log("\n✓ Migration complete. PostgreSQL and MongoDB connections closed.");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
