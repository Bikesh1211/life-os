import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { db } from "@/core/database/client";

import { notes, noteTags, noteFolders } from "@/modules/notes/schema";
import { timelineEvents } from "@/modules/timeline/schema";
import { expenseTransactions, expenseAccounts, expenseBudgets, expenseSubscriptions } from "@/modules/expenses/schema";
import { musicArtists, musicAlbums, musicTracks, musicListeningHistory } from "@/modules/music/schema";
import { moviesMedia, movieFavorites, movieRatings, movieWatchlist } from "@/modules/movies/schema";
import { goals, goalMilestones } from "@/modules/goals/schema";
import { tasks, taskLabels } from "@/modules/tasks/schema";
import { routines, routineItems, routineTemplates } from "@/modules/routines/schema";
import { habits, habitCompletions } from "@/modules/habits/schema";
import { knowledgeEntries } from "@/modules/knowledge/schema";
import { networkConnections } from "@/modules/network/schema";
import { readingItems } from "@/modules/reading/schema";
import { travelTrips } from "@/modules/travel/schema";
import { feedbackEntries } from "@/modules/feedback/schema";
import { journalEntries } from "@/modules/journal/schema";
import {
  wellnessMoodLogs,
  wellnessSleepRecords,
  wellnessHydrationEntries,
  wellnessWeightEntries,
  wellnessWorkouts,
} from "@/modules/wellness/schema";

import type { RouteParamMap } from "./types";

interface SeedTable {
  name: string;
  routePrefix: string;
  table: any;
  generateRows: (userId: string, count: number) => Record<string, any>[];
  idField: string;
}

const TABLES: SeedTable[] = [
  {
    name: "notes",
    routePrefix: "/api/notes/",
    table: notes,
    idField: "id",
    generateRows: (userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        userId,
        title: sample(TITLES.notes) + ` #${i}`,
        content: "Benchmark seed content for testing API performance with realistic payload sizes that vary to simulate real usage patterns.",
        category: sample(["personal", "work", "study", "ideas", "journal"]),
        tags: [sample(["typescript", "react", "design", "ideas", "todo"])],
        isPinned: Math.random() < 0.1,
        status: "published",
        priority: sample(["low", "medium", "high"]),
        folderId: null,
        createdAt: randomPastDate(),
        updatedAt: new Date(),
      })),
  },
  {
    name: "note_tags",
    routePrefix: "/api/notes/tags/",
    table: noteTags,
    idField: "id",
    generateRows: (userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        userId,
        name: sample(["typescript", "react", "nextjs", "design", "ideas", "todo", "urgent", "reference"]) + `_${i}`,
        color: sample(["blue", "red", "green", "yellow", "purple"]),
        createdAt: randomPastDate(),
      })),
  },
  {
    name: "note_folders",
    routePrefix: "/api/notes/folders/",
    table: noteFolders,
    idField: "id",
    generateRows: (userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        userId,
        name: sample(["Work", "Personal", "Projects", "Learning", "Archive"]) + ` ${i}`,
        color: sample(["blue", "red", "green", "yellow", "purple"]),
        icon: sample(["folder", "star", "heart", "book", "lightbulb"]),
        order: i,
        createdAt: randomPastDate(),
        updatedAt: new Date(),
      })),
  },
  {
    name: "timeline_events",
    routePrefix: "/api/timeline/",
    table: timelineEvents,
    idField: "id",
    generateRows: (userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        userId,
        title: sample(EVENTS) + ` #${i}`,
        description: "Seed data for benchmark testing.",
        eventDate: randomPastDate(),
        category: sample(["personal", "career", "health", "travel", "entertainment"]),
        importance: sample(["low", "medium", "high", "critical"]),
        recurrence: "none",
        activityType: sample(["Walking", "Coding", "Reading", "Eating", "Working out"]),
        tags: [sample(["fun", "important", "daily", "weekend"])],
        startTime: "09:00",
        endTime: "10:00",
        durationMinutes: 60,
        mood: Math.floor(Math.random() * 5) + 1,
        energy: Math.floor(Math.random() * 5) + 1,
        location: sample(["Home", "Office", "Gym", "Park", "Cafe"]),
        isPinned: false,
        createdAt: randomPastDate(),
        updatedAt: new Date(),
      })),
  },
  {
    name: "expense_transactions",
    routePrefix: "/api/expenses/transactions/",
    table: expenseTransactions,
    idField: "id",
    generateRows: (userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        userId,
        amount: Math.floor(Math.random() * 20000) / 100,
        type: sample(["income", "expense"]),
        category: sample(["food", "transport", "shopping", "bills", "entertainment", "salary", "freelance"]),
        description: sample(["Groceries", "Uber ride", "Netflix", "Electric bill", "Freelance payment"]),
        date: randomPastDate(),
        notes: null,
        accountId: null,
        createdAt: randomPastDate(),
        updatedAt: new Date(),
      })),
  },
  {
    name: "expense_accounts",
    routePrefix: "/api/expenses/accounts/",
    table: expenseAccounts,
    idField: "id",
    generateRows: (userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        userId,
        name: sample(["Checking Account", "Savings", "Credit Card", "Cash Wallet", "UPI"]) + ` ${i}`,
        type: sample(["checking", "savings", "credit", "cash", "upi"]),
        balance: Math.floor(Math.random() * 100000) / 100,
        currency: "USD",
        isActive: true,
        createdAt: randomPastDate(),
        updatedAt: new Date(),
      })),
  },
  {
    name: "expense_budgets",
    routePrefix: "/api/expenses/budgets/",
    table: expenseBudgets,
    idField: "id",
    generateRows: (userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        userId,
        name: sample(["Monthly Food", "Transport", "Entertainment", "Shopping"]) + ` ${i}`,
        amount: Math.floor(Math.random() * 50000) / 100,
        period: sample(["weekly", "monthly", "yearly"]),
        category: sample(["food", "transport", "entertainment", "shopping"]),
        startDate: randomPastDate(),
        endDate: randomFutureDate(),
        createdAt: randomPastDate(),
        updatedAt: new Date(),
      })),
  },
  {
    name: "expense_subscriptions",
    routePrefix: "/api/expenses/subscriptions/",
    table: expenseSubscriptions,
    idField: "id",
    generateRows: (userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        userId,
        name: sample(["Netflix", "Spotify", "AWS", "GitHub", "Notion"]) + ` ${i}`,
        amount: Math.floor(Math.random() * 3000) / 100,
        currency: "USD",
        billingCycle: sample(["monthly", "yearly"]),
        category: sample(["entertainment", "software", "cloud"]),
        nextBillingDate: randomFutureDate(),
        active: true,
        createdAt: randomPastDate(),
        updatedAt: new Date(),
      })),
  },
  {
    name: "music_artists",
    routePrefix: "/api/music/artists/",
    table: musicArtists,
    idField: "id",
    generateRows: (_userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        name: sample(["The Weeknd", "Taylor Swift", "Kendrick Lamar", "Daft Punk", "Radiohead"]) + ` ${i}`,
        country: sample(["US", "UK", "Canada", "France", "Australia"]),
        type: sample(["person", "group", "orchestra"]),
        genres: [sample(["pop", "rock", "hip-hop", "electronic", "indie"])],
        createdAt: randomPastDate(),
        updatedAt: new Date(),
      })),
  },
  {
    name: "music_albums",
    routePrefix: "/api/music/albums/",
    table: musicAlbums,
    idField: "id",
    generateRows: (_userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        artistId: "00000000-0000-0000-0000-000000000001",
        title: sample(["After Hours", "Midnights", "DAMN.", "Random Access Memories", "OK Computer"]) + ` ${i}`,
        releaseDate: randomPastDate(),
        coverArtUrl: null,
        totalTracks: Math.floor(Math.random() * 15) + 8,
        createdAt: randomPastDate(),
        updatedAt: new Date(),
      })),
  },
  {
    name: "music_tracks",
    routePrefix: "/api/music/tracks/",
    table: musicTracks,
    idField: "id",
    generateRows: (_userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        artistId: "00000000-0000-0000-0000-000000000001",
        albumId: null,
        title: sample(["Blinding Lights", "Anti-Hero", "HUMBLE.", "Get Lucky", "No Surprises"]) + ` ${i}`,
        duration: Math.floor(Math.random() * 300) + 120,
        trackNumber: (i % 15) + 1,
        createdAt: randomPastDate(),
        updatedAt: new Date(),
      })),
  },
  {
    name: "music_listening_history",
    routePrefix: "/api/music/history/",
    table: musicListeningHistory,
    idField: "id",
    generateRows: (userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        userId,
        trackId: null,
        artistName: sample(["The Weeknd", "Taylor Swift", "Kendrick Lamar"]),
        trackName: sample(["Blinding Lights", "Anti-Hero", "HUMBLE."]) + ` ${i}`,
        listenedAt: randomPastDate(),
        duration: Math.floor(Math.random() * 300) + 120,
        createdAt: randomPastDate(),
      })),
  },
  {
    name: "goals",
    routePrefix: "/api/goals/",
    table: goals,
    idField: "id",
    generateRows: (userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        userId,
        title: sample(["Learn TypeScript", "Run a Marathon", "Read 50 Books", "Save $10k", "Build a Portfolio"]) + ` ${i}`,
        description: "A benchmark seed goal for performance testing.",
        type: sample(["short-term", "long-term"]),
        deadline: randomFutureDate(),
        progress: Math.floor(Math.random() * 100),
        status: sample(["active", "draft", "completed", "cancelled"]),
        category: sample(["career", "health", "finance", "education"]),
        createdAt: randomPastDate(),
        updatedAt: new Date(),
      })),
  },
  {
    name: "goal_milestones",
    routePrefix: "/api/goals/",
    table: goalMilestones,
    idField: "id",
    generateRows: (_userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        goalId: "00000000-0000-0000-0000-000000000001",
        title: sample(["Phase 1", "Milestone A", "First Draft", "Review", "Launch"]) + ` ${i}`,
        completed: Math.random() < 0.5,
        order: i,
        targetDate: randomFutureDate(),
        createdAt: randomPastDate(),
      })),
  },
  {
    name: "tasks",
    routePrefix: "/api/tasks/",
    table: tasks,
    idField: "id",
    generateRows: (userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        userId,
        title: sample(["Fix login bug", "Write tests", "Design homepage", "Review PR", "Update docs"]) + ` ${i}`,
        description: null,
        status: sample(["todo", "in_progress", "done"]) as any,
        priority: sample(["low", "medium", "high"]) as any,
        dueDate: Math.random() < 0.5 ? randomFutureDate() : null,
        projectId: null,
        createdAt: randomPastDate(),
        updatedAt: new Date(),
      })),
  },
  {
    name: "task_labels",
    routePrefix: "/api/tasks/labels/",
    table: taskLabels,
    idField: "id",
    generateRows: (userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        userId,
        name: sample(["bug", "feature", "enhancement", "urgent", "backend", "frontend"]) + `_${i}`,
        color: sample(["red", "blue", "green", "yellow", "purple"]),
        createdAt: randomPastDate(),
      })),
  },
  {
    name: "routines",
    routePrefix: "/api/routines/",
    table: routines,
    idField: "id",
    generateRows: (userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        userId,
        name: sample(["Morning Routine", "Deep Work", "Evening Wind-down", "Fitness", "Study Session"]) + ` ${i}`,
        description: "A benchmark seeded routine.",
        color: sample(["blue", "green", "red", "yellow", "purple"]),
        icon: sample(["sun", "moon", "zap", "heart", "star"]),
        scheduleType: sample(["daily", "weekdays", "weekends", "custom"]) as any,
        customDays: [1, 2, 3, 4, 5],
        isActive: true,
        createdAt: randomPastDate(),
        updatedAt: new Date(),
      })),
  },
  {
    name: "routine_items",
    routePrefix: "/api/routines/",
    table: routineItems,
    idField: "id",
    generateRows: (userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        userId,
        routineId: "00000000-0000-0000-0000-000000000001",
        title: sample(["Meditate", "Exercise", "Read", "Write journal", "Plan day"]) + ` ${i}`,
        startTime: "09:00",
        endTime: "09:30",
        order: i,
        category: sample(["personal", "health", "career", "education"]),
        priority: sample(["low", "medium", "high"]),
        location: null,
        isOptional: Math.random() < 0.2,
        createdAt: randomPastDate(),
        updatedAt: new Date(),
      })),
  },
  {
    name: "habits",
    routePrefix: "/api/habits/",
    table: habits,
    idField: "id",
    generateRows: (userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        userId,
        title: sample(["Morning Meditation", "Read 20 Pages", "Go to Gym", "Track Expenses", "Call a Friend"]) + ` ${i}`,
        description: "Benchmark seed habit for API testing.",
        category: sample(["mindfulness", "reading", "fitness", "finance", "social"]),
        frequency: sample(["daily", "weekly"]),
        createdAt: randomPastDate(),
        updatedAt: new Date(),
      })),
  },
  {
    name: "knowledge_entries",
    routePrefix: "/api/knowledge/",
    table: knowledgeEntries,
    idField: "id",
    generateRows: (userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        userId,
        title: sample(["TypeScript Generics", "React Server Components", "Postgres Indexing", "System Design", "AWS Lambda"]) + ` ${i}`,
        subject: sample(["Technology", "Career", "Personal Growth"]),
        summary: "A summary of key learnings from this knowledge entry for benchmarks.",
        detailedNotes: "Detailed notes with markdown content for realistic payload sizes in benchmark testing scenarios.",
        difficulty: sample(["beginner", "intermediate", "advanced"]) as any,
        source: sample(["Course", "Book", "Article", "Video"]),
        timeSpent: Math.floor(Math.random() * 120) + 10,
        masteryLevel: Math.floor(Math.random() * 10) + 1,
        confidenceScore: Math.floor(Math.random() * 10) + 1,
        reviewStatus: sample(["not_reviewed", "reviewing", "mastered"]) as any,
        tags: [sample(["typescript", "react", "backend", "architecture"])],
        dateLearned: randomPastDate(),
        createdAt: randomPastDate(),
        updatedAt: new Date(),
      })),
  },
  {
    name: "network_connections",
    routePrefix: "/api/network/connections/",
    table: networkConnections,
    idField: "id",
    generateRows: (userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        userId,
        fullName: sample(["Alice Johnson", "Bob Smith", "Charlie Brown", "Diana Prince", "Eve Williams"]) + ` ${i}`,
        nickname: null,
        profilePictureUrl: null,
        birthday: randomPastDate(),
        phone: null,
        email: `user${i}@example.com`,
        address: null,
        country: sample(["US", "UK", "Canada", "India", "Australia"]),
        city: sample(["New York", "London", "Toronto", "Mumbai", "Sydney"]),
        occupation: sample(["Engineer", "Designer", "Manager", "Student", "Freelancer"]),
        socialLinks: {},
        relationshipTypes: [sample(["Friend", "Colleague", "Mentor", "Family"])],
        notes: null,
        isFavorite: Math.random() < 0.2,
        firstMetDate: Math.random() < 0.5 ? randomPastDate() : null,
        createdAt: randomPastDate(),
        updatedAt: new Date(),
      })),
  },
  {
    name: "reading_items",
    routePrefix: "/api/reading/items/",
    table: readingItems,
    idField: "id",
    generateRows: (userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        userId,
        title: sample(["Clean Code", "Design Patterns", "System Design Interview", "Atomic Habits", "Deep Work"]) + ` ${i}`,
        author: sample(["Robert C. Martin", "Erich Gamma", "Alex Xu", "James Clear", "Cal Newport"]),
        format: sample(["book", "article", "paper"]) as any,
        status: sample(["want_to_read", "reading", "completed", "abandoned"]) as any,
        totalPages: Math.floor(Math.random() * 500) + 100,
        currentPage: Math.floor(Math.random() * 200),
        rating: Math.floor(Math.random() * 5) + 1,
        notes: null,
        startedAt: randomPastDate(),
        completedAt: null,
        createdAt: randomPastDate(),
        updatedAt: new Date(),
      })),
  },
  {
    name: "travel_trips",
    routePrefix: "/api/travel/trips/",
    table: travelTrips,
    idField: "id",
    generateRows: (userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        userId,
        name: sample(["Summer Vacation", "Business Trip", "Weekend Getaway", "Backpacking Adventure", "Road Trip"]) + ` ${i}`,
        destination: sample(["Paris", "Tokyo", "New York", "Bali", "London"]),
        startDate: randomPastDate(),
        endDate: randomFutureDate(),
        budget: Math.floor(Math.random() * 500000) / 100,
        currency: "USD",
        notes: null,
        status: sample(["planned", "in_progress", "completed", "cancelled"]),
        isWishlist: false,
        createdAt: randomPastDate(),
        updatedAt: new Date(),
      })),
  },
  {
    name: "journal_entries",
    routePrefix: "/api/journal/",
    table: journalEntries,
    idField: "id",
    generateRows: (userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        userId,
        title: sample(["Daily Reflection", "Weekend Thoughts", "Gratitude Entry", "Dream Log", "Idea Dump"]) + ` ${i}`,
        content: "Journal content for benchmark testing with realistic text length for payload simulation.",
        mood: Math.floor(Math.random() * 5) + 1,
        tags: [sample(["reflection", "gratitude", "ideas", "dreams"])],
        isPrivate: Math.random() < 0.5,
        eventDate: Math.random() < 0.3 ? randomPastDate() : null,
        createdAt: randomPastDate(),
        updatedAt: new Date(),
      })),
  },
  {
    name: "feedback_entries",
    routePrefix: "/api/feedback/",
    table: feedbackEntries,
    idField: "id",
    generateRows: (userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        userId,
        category: sample(["bug", "feature", "idea", "praise", "general"]),
        message: "Benchmark feedback entry for performance testing of the feedback API endpoint.",
        isAnonymous: Math.random() < 0.3,
        pageUrl: "/benchmark",
        createdAt: randomPastDate(),
      })),
  },
  {
    name: "movies_media",
    routePrefix: "/api/movies/media/",
    table: moviesMedia,
    idField: "id",
    generateRows: (_userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        tmdbId: String(100000 + i),
        mediaType: sample(["movie", "tv"]),
        title: sample(["Inception", "The Matrix", "Interstellar", "Parasite", "Dark Knight"]) + ` ${i}`,
        overview: "A benchmark movie entry for API performance testing with realistic payload sizes.",
        posterPath: null,
        backdropPath: null,
        releaseDate: randomPastDate(),
        genres: [sample(["Action", "Drama", "Sci-Fi", "Comedy", "Thriller"])],
        voteAverage: Math.random() * 5 + 5,
        runtime: Math.floor(Math.random() * 120) + 90,
        createdAt: randomPastDate(),
        updatedAt: new Date(),
      })),
  },
  {
    name: "movie_favorites",
    routePrefix: "/api/movies/favorites/",
    table: movieFavorites,
    idField: "id",
    generateRows: (userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        userId,
        mediaId: "00000000-0000-0000-0000-000000000001",
        rewatchCount: Math.floor(Math.random() * 5),
        personalNotes: null,
        addedAt: randomPastDate(),
      })),
  },
  {
    name: "movie_ratings",
    routePrefix: "/api/movies/ratings/",
    table: movieRatings,
    idField: "id",
    generateRows: (userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        userId,
        mediaId: "00000000-0000-0000-0000-000000000001",
        score: Math.floor(Math.random() * 10) + 1,
        review: Math.random() < 0.3 ? "Great movie for benchmark testing." : null,
        createdAt: randomPastDate(),
      })),
  },
  {
    name: "movie_watchlist",
    routePrefix: "/api/movies/watchlist/",
    table: movieWatchlist,
    idField: "id",
    generateRows: (userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        userId,
        mediaId: "00000000-0000-0000-0000-000000000001",
        status: sample(["plan_to_watch", "watching", "completed", "dropped"]),
        addedAt: randomPastDate(),
        updatedAt: new Date(),
      })),
  },
  {
    name: "wellness_mood_logs",
    routePrefix: "/api/wellness/mood/",
    table: wellnessMoodLogs,
    idField: "id",
    generateRows: (userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        userId,
        happiness: Math.floor(Math.random() * 10) + 1,
        stress: Math.floor(Math.random() * 10) + 1,
        anxiety: Math.floor(Math.random() * 10) + 1,
        motivation: Math.floor(Math.random() * 10) + 1,
        energy: Math.floor(Math.random() * 10) + 1,
        confidence: Math.floor(Math.random() * 10) + 1,
        focus: Math.floor(Math.random() * 10) + 1,
        mentalFatigue: Math.floor(Math.random() * 10) + 1,
        notes: Math.random() < 0.3 ? "Benchmark mood entry." : null,
        emoji: sample(["😊", "😌", "😴", "😤", "🤔"]),
        createdAt: randomPastDate(),
      })),
  },
  {
    name: "wellness_sleep_records",
    routePrefix: "/api/wellness/sleep/",
    table: wellnessSleepRecords,
    idField: "id",
    generateRows: (userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        userId,
        bedtime: new Date(Date.now() - Math.random() * 86400000 * 30),
        wakeTime: new Date(Date.now() - Math.random() * 86400000 * 30 + 28800000),
        quality: Math.floor(Math.random() * 10) + 1,
        interruptions: Math.floor(Math.random() * 3),
        notes: null,
        createdAt: randomPastDate(),
      })),
  },
  {
    name: "wellness_hydration_entries",
    routePrefix: "/api/wellness/hydration/",
    table: wellnessHydrationEntries,
    idField: "id",
    generateRows: (userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        userId,
        amountMl: 250 * (Math.floor(Math.random() * 4) + 1),
        loggedAt: randomPastDate(),
        createdAt: randomPastDate(),
      })),
  },
  {
    name: "wellness_weight_entries",
    routePrefix: "/api/wellness/weight/",
    table: wellnessWeightEntries,
    idField: "id",
    generateRows: (userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        userId,
        weightKg: 65 + Math.random() * 20,
        date: randomPastDate(),
        notes: null,
        createdAt: randomPastDate(),
      })),
  },
  {
    name: "wellness_workouts",
    routePrefix: "/api/wellness/workouts/",
    table: wellnessWorkouts,
    idField: "id",
    generateRows: (userId, count) =>
      Array.from({ length: count }, (_, i) => ({
        userId,
        name: sample(["Morning Run", "Upper Body", "HIIT", "Yoga", "Cycling"]) + ` ${i}`,
        type: sample(["cardio", "strength", "flexibility", "hiit"]),
        durationMinutes: Math.floor(Math.random() * 60) + 15,
        caloriesBurned: Math.floor(Math.random() * 500) + 100,
        date: randomPastDate(),
        notes: null,
        createdAt: randomPastDate(),
      })),
  },
];

const TITLES = {
  notes: [
    "Project Planning", "Meeting Notes", "API Design", "Research Findings", "Todo List",
    "Ideas Brainstorm", "Code Review Notes", "Architecture Discussion", "Sprint Retro", "Learning Log",
    "Bug Report", "Feature Spec", "Interview Prep", "Book Notes", "Travel Plan",
  ],
};

const EVENTS = [
  "Morning walk", "Team standup", "Lunch with team", "Code review session", "Gym workout",
  "Read chapters", "Write documentation", "Plan sprint", "Client meeting", "Deep work session",
  "Meditation", "Journal entry", "Learn new technology", "Review PRs", "Evening run",
];

function sample<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPastDate(): Date {
  const days = Math.floor(Math.random() * 365);
  return new Date(Date.now() - days * 86400000);
}

function randomFutureDate(): Date {
  const days = Math.floor(Math.random() * 365) + 30;
  return new Date(Date.now() + days * 86400000);
}

async function seed() {
  const userId = process.env.SEED_USER_ID ?? process.env.BENCHMARK_USER_ID;
  if (!userId) {
    console.error("SEED_USER_ID or BENCHMARK_USER_ID environment variable required");
    process.exit(1);
  }

  const recordsPerTable = process.env.BENCHMARK_RECORDS
    ? parseInt(process.env.BENCHMARK_RECORDS, 10)
    : 250;

  console.log(`\n  Seeding benchmark data for user: ${userId}`);
  console.log(`  Records per table: ${recordsPerTable}`);
  console.log(`  ${"─".repeat(50)}`);

  const paramMap: RouteParamMap = {};

  for (const tableDef of TABLES) {
    const count = Math.min(recordsPerTable, 1000);
    const rows = tableDef.generateRows(userId, count);

    try {
      const inserted = await db.insert(tableDef.table).values(rows).returning();
      const ids = inserted.map((r: any) => r[tableDef.idField]);

      const routePattern = `${tableDef.routePrefix}:id`;
      paramMap[routePattern] = { id: ids[0] };

      console.log(`  ✓ ${tableDef.name.padEnd(30)} ${inserted.length} records`);
    } catch (err: any) {
      if (err.code === "42P01") {
        console.log(`  ✗ ${tableDef.name.padEnd(30)} table does not exist`);
      } else if (err.code === "23505") {
        console.log(`  ~ ${tableDef.name.padEnd(30)} duplicate, skipping (${err.message?.slice(0, 60)})`);
      } else {
        console.log(`  ✗ ${tableDef.name.padEnd(30)} ${err.message?.slice(0, 60) ?? "unknown error"}`);
      }
    }
  }

  const paramPath = join(process.cwd(), "benchmarks/route-params.json");
  const fs = await import("fs");
  fs.writeFileSync(paramPath, JSON.stringify(paramMap, null, 2));
  console.log(`\n  Route param map written to: ${paramPath}`);
  console.log(`  ${"─".repeat(50)}\n`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
