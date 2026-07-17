import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as tasksSchema from "@/modules/tasks/schema";
import * as habitsSchema from "@/modules/habits/schema";
import * as notesSchema from "@/modules/notes/schema";
import * as journalSchema from "@/modules/journal/schema";
import * as goalsSchema from "@/modules/goals/schema";
import * as timelineSchema from "@/modules/timeline/schema";
import * as expensesSchema from "@/modules/expenses/schema";
import * as musicSchema from "@/modules/music/schema";
import * as moviesSchema from "@/modules/movies/schema";
import * as knowledgeSchema from "@/modules/knowledge/schema";
import * as wardrobeSchema from "@/modules/wardrobe/schema";
import * as routinesSchema from "@/modules/routines/schema";
import { coreTags, coreTaggings } from "@/core/tags/schema";
import * as techGearSchema from "@/modules/tech-gear/schema";
import * as countdownSchema from "@/modules/countdown/schema";
import * as gamificationSchema from "@/modules/gamification/schema";
import * as travelSchema from "@/modules/travel/schema";
import * as readingSchema from "@/modules/reading/schema";
import * as networkSchema from "@/modules/network/schema";
import * as feedbackSchema from "@/modules/feedback/schema";
import * as integritySchema from "@/modules/integrity/schema";
import * as careerSchema from "@/modules/career/schema";
import * as loansSchema from "@/modules/loans/schema";
import * as booksSchema from "@/modules/books/schema";
import * as curbSchema from "@/modules/curb/schema";
import * as timeAuditSchema from "@/modules/time-audit/schema";
import * as strategySchema from "@/modules/strategy/schema";
import { sidebarPreferences } from "@/core/database/sidebar-preferences.schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required but not set. Check your .env file.");
}

const queryClient = postgres(databaseUrl, {
  ssl: { rejectUnauthorized: false },
  max: 10,
  idle_timeout: 600,
  max_lifetime: 3600,
  connect_timeout: 15,
});

export const db = drizzle(queryClient, {
  schema: {
    ...tasksSchema,
    ...habitsSchema,
    ...notesSchema,
    ...journalSchema,
    ...goalsSchema,
    ...timelineSchema,
    ...expensesSchema,
     ...musicSchema,
      ...moviesSchema,
      ...knowledgeSchema,
     ...wardrobeSchema,
       ...routinesSchema,
     ...techGearSchema,
     ...countdownSchema,
    ...gamificationSchema,
    ...travelSchema,
    ...readingSchema,
    ...networkSchema,
    ...feedbackSchema,
     ...integritySchema,
     ...careerSchema,
     ...loansSchema,
      ...booksSchema,
      ...curbSchema,
      ...timeAuditSchema,
      ...strategySchema,
    coreTags,
    coreTaggings,
    sidebarPreferences,
  },
});

export type DB = typeof db;
