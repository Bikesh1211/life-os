import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { eq } from "drizzle-orm";
import { db } from "@/core/database";
import { musicListeningHistory, musicJournal } from "@/modules/music/schema";

const DEMO_TRACKS = [
  { artistName: "Taylor Swift", trackName: "Cruel Summer", duration: 178 },
  { artistName: "Olivia Rodrigo", trackName: "vampire", duration: 219 },
  { artistName: "Dua Lipa", trackName: "Houdini", duration: 205 },
  { artistName: "The Weeknd", trackName: "Blinding Lights", duration: 200 },
  { artistName: "Billie Eilish", trackName: "What Was I Made For?", duration: 222 },
  { artistName: "Drake", trackName: "God's Plan", duration: 198 },
  { artistName: "SZA", trackName: "Kill Bill", duration: 153 },
  { artistName: "Bad Bunny", trackName: "Tití Me Preguntó", duration: 244 },
  { artistName: "Harry Styles", trackName: "As It Was", duration: 167 },
  { artistName: "Doja Cat", trackName: "Paint The Town Red", duration: 210 },
  { artistName: "Morgan Wallen", trackName: "Last Night", duration: 163 },
  { artistName: "Rema", trackName: "Calm Down", duration: 219 },
  { artistName: "Metro Boomin", trackName: "Creepin'", duration: 221 },
  { artistName: "Miley Cyrus", trackName: "Flowers", duration: 200 },
  { artistName: "Rihanna", trackName: "Lift Me Up", duration: 196 },
  { artistName: "Led Zeppelin", trackName: "Stairway to Heaven", duration: 482 },
  { artistName: "Pink Floyd", trackName: "Comfortably Numb", duration: 383 },
  { artistName: "Radiohead", trackName: "Creep", duration: 238 },
  { artistName: "Nirvana", trackName: "Smells Like Teen Spirit", duration: 301 },
  { artistName: "Tame Impala", trackName: "The Less I Know The Better", duration: 218 },
];

export async function POST() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Clear existing data for this user
    await db.delete(musicListeningHistory).where(eq(musicListeningHistory.userId, userId));
    await db.delete(musicJournal).where(eq(musicJournal.userId, userId));

    const now = new Date();

    // Insert listening history spread over the past 14 days
    const listeningEntries = [];
    for (let day = 14; day >= 0; day--) {
      const playsPerDay = Math.floor(Math.random() * 5) + 3;
      for (let p = 0; p < playsPerDay; p++) {
        const track = DEMO_TRACKS[Math.floor(Math.random() * DEMO_TRACKS.length)];
        const hour = Math.floor(Math.random() * 18) + 6;
        const minute = Math.floor(Math.random() * 60);
        const listenedAt = new Date(now);
        listenedAt.setDate(listenedAt.getDate() - day);
        listenedAt.setHours(hour, minute, 0, 0);

        listeningEntries.push({
          userId,
          artistName: track.artistName,
          trackName: track.trackName,
          duration: track.duration,
          listenedAt,
        });
      }
    }
    await db.insert(musicListeningHistory).values(listeningEntries);

    // Insert some journal entries
    const journalEntries = [
      { mood: "nostalgic", journalEntry: "Been listening to a lot of classic rock today. Stairway to Heaven never gets old. The guitar solo still gives me chills after all these years." },
      { mood: "energetic", journalEntry: "Olivia Rodrigo's new album is incredible. vampire is on repeat. Love how her songwriting has matured while keeping that raw emotional honesty." },
      { mood: "chill", journalEntry: "Perfect Sunday morning with Tame Impala. Currents is the kind of album that makes you feel like everything is going to be okay." },
      { mood: "focused", journalEntry: "Listening to Blinding Lights while working. The Weeknd's production is so clean and drives focus. Synthwave vibes are great for deep work." },
      { mood: "reflective", journalEntry: "Discovered some hidden gems in my recommendations today. There's something special about finding a new artist that speaks to you." },
    ];

    for (const entry of journalEntries) {
      await db.insert(musicJournal).values({
        userId,
        mood: entry.mood,
        journalEntry: entry.journalEntry,
      });
    }

    return NextResponse.json({
      success: true,
      listeningCount: listeningEntries.length,
      journalCount: journalEntries.length,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed data" }, { status: 500 });
  }
}
