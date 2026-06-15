import { db } from "./client";
import { habits, habitCompletions } from "@/modules/habits/schema";
import { sql } from "drizzle-orm";

const userId: string = process.env.SEED_USER_ID ?? "";
if (!userId) {
  console.error("SEED_USER_ID environment variable is required");
  process.exit(1);
}

const demoHabits = [
  { title: "Morning Meditation", description: "10 minutes of mindfulness meditation", category: "mindfulness", frequency: "daily", userId },
  { title: "Read 20 Pages", description: "Read at least 20 pages of a book", category: "reading", frequency: "daily", userId },
  { title: "Go to the Gym", description: "Strength training or cardio session", category: "fitness", frequency: "weekly", userId },
  { title: "Learn TypeScript", description: "Study TypeScript for 30 minutes", category: "learning", frequency: "daily", userId },
  { title: "Write in Journal", description: "Reflect on the day in writing", category: "productivity", frequency: "daily", userId },
  { title: "Track Expenses", description: "Review and categorize daily expenses", category: "finance", frequency: "daily", userId },
  { title: "Call a Friend", description: "Catch up with a friend or family member", category: "social", frequency: "weekly", userId },
  { title: "Practice Guitar", description: "30 minutes of guitar practice", category: "creative", frequency: "daily", userId },
  { title: "Drink 8 Glasses of Water", description: "Stay hydrated throughout the day", category: "health", frequency: "daily", userId },
];

async function seed() {
  console.log("Clearing existing habit data...");
  await db.delete(habitCompletions);
  await db.delete(habits);

  console.log("Creating habits...");
  const createdHabits = await Promise.all(
    demoHabits.map((h) =>
      db
        .insert(habits)
        .values(h as typeof habits.$inferInsert)
        .returning(),
    ),
  );

  console.log("Generating completion data for 90 days...");
  const now = new Date();
  const completions: Array<{ habitId: string; userId: string; completedDate: string }> = [];

  for (const [habitResult] of createdHabits) {
    for (let dayOffset = 90; dayOffset >= 0; dayOffset--) {
      const date = new Date(now);
      date.setDate(date.getDate() - dayOffset);
      const dateStr = date.toISOString().slice(0, 10);
      const dayOfWeek = date.getDay();

      // Daily habits: ~80% completion rate with some streaks
      let shouldComplete = false;
      if (habitResult.frequency === "daily") {
        shouldComplete = Math.random() < 0.8;
        // Ensure some streaks: if last 5 days were completed, keep going
        if (dayOffset <= 7 && dayOffset > 0) shouldComplete = true;
        if (dayOffset <= 14 && dayOffset > 7 && Math.random() < 0.9) shouldComplete = true;
        // Weekend dip for work habits
        if (habitResult.title === "Learn TypeScript" && (dayOfWeek === 0 || dayOfWeek === 6)) {
          shouldComplete = Math.random() < 0.4;
        }
      } else if (habitResult.frequency === "weekly") {
        // Weekly: complete ~3-4 times per month
        if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
          shouldComplete = Math.random() < 0.6;
        }
      }

      if (shouldComplete) {
        completions.push({
          habitId: habitResult.id,
          userId,
          completedDate: dateStr,
        });
      }
    }
  }

  console.log(`Inserting ${completions.length} completions...`);
  for (let i = 0; i < completions.length; i += 100) {
    const batch = completions.slice(i, i + 100);
    await db.insert(habitCompletions).values(batch);
  }

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
