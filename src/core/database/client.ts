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
import * as knowledgeSchema from "@/modules/knowledge/schema";
import { sidebarPreferences } from "@/core/database/sidebar-preferences.schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required but not set. Check your .env file.");
}

const queryClient = postgres(databaseUrl, {
  ssl: { rejectUnauthorized: false },
  max: 20,
  idle_timeout: 30,
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
     ...knowledgeSchema,
     sidebarPreferences,
    },
  });

export type DB = typeof db;
