import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as tasksSchema from "../src/modules/tasks/schema";
import * as habitsSchema from "../src/modules/habits/schema";
import * as notesSchema from "../src/modules/notes/schema";
import * as journalSchema from "../src/modules/journal/schema";
import * as goalsSchema from "../src/modules/goals/schema";
import * as timelineSchema from "../src/modules/timeline/schema";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required but not set.");
}

const queryClient = postgres(databaseUrl, {
  ssl: { rejectUnauthorized: false },
  max: 10,
});

const db = drizzle(queryClient, {
  schema: {
    ...tasksSchema,
    ...habitsSchema,
    ...notesSchema,
    ...journalSchema,
    ...goalsSchema,
    ...timelineSchema,
  },
});

async function main() {
  console.log("Pushing schema...");
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id text NOT NULL,
      project_id uuid,
      title text NOT NULL,
      description text,
      status text DEFAULT 'todo' NOT NULL,
      priority text DEFAULT 'medium' NOT NULL,
      due_date timestamp,
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL,
      deleted_at timestamp
    );

    CREATE TABLE IF NOT EXISTS task_projects (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id text NOT NULL,
      title text NOT NULL,
      color text,
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL,
      deleted_at timestamp
    );

    CREATE TABLE IF NOT EXISTS habits (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id text NOT NULL,
      title text NOT NULL,
      description text,
      frequency text,
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL,
      deleted_at timestamp
    );

    CREATE TABLE IF NOT EXISTS notes (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id text NOT NULL,
      title text NOT NULL,
      content text,
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL,
      deleted_at timestamp
    );

    CREATE TABLE IF NOT EXISTS journal_entries (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id text NOT NULL,
      title text NOT NULL,
      content text,
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL,
      deleted_at timestamp
    );

    CREATE TABLE IF NOT EXISTS goals (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id text NOT NULL,
      title text NOT NULL,
      description text,
      status text DEFAULT 'active' NOT NULL,
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL,
      deleted_at timestamp
    );

    CREATE TABLE IF NOT EXISTS timeline_events (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id text NOT NULL,
      title text NOT NULL,
      description text,
      category text DEFAULT 'personal' NOT NULL,
      importance text DEFAULT 'medium' NOT NULL,
      recurrence text DEFAULT 'none' NOT NULL,
      event_date timestamp NOT NULL,
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL,
      deleted_at timestamp
    );
  `);
  console.log("Tables created successfully!");
  await queryClient.end();
}

main().catch((e) => {
  console.error("Migration failed:", e.message);
  process.exit(1);
});
