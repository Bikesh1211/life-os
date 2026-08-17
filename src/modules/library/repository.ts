import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/core/database";
import { books, bookChapters } from "@/modules/books/schema";
import { journalEntries } from "@/modules/journal/schema";
import { knowledgeEntries } from "@/modules/knowledge/schema";
import { notes } from "@/modules/notes/schema";
import { travelJournals } from "@/modules/travel/schema";

/**
 * The library's reads.
 *
 * Five tables owned by four other modules, and not one of them belongs to the
 * library — which is exactly why this layer is thin and read-only. The library
 * shows writing; the modules own it.
 *
 * Every query is scoped by `userId`. `book_chapters` is the one table with no
 * `user_id` of its own — it is owned through its book — so its scope comes from
 * book ids already fetched, never from a parameter a caller could widen.
 */

export type BookRow = typeof books.$inferSelect;
export type ChapterRow = typeof bookChapters.$inferSelect;
export type JournalRow = typeof journalEntries.$inferSelect;
export type KnowledgeRow = typeof knowledgeEntries.$inferSelect;
export type NoteRow = typeof notes.$inferSelect;
export type TravelJournalRow = typeof travelJournals.$inferSelect;

export interface LibraryRows {
  books: BookRow[];
  chapters: ChapterRow[];
  journal: JournalRow[];
  knowledge: KnowledgeRow[];
  notes: NoteRow[];
  travel: TravelJournalRow[];
}

export async function readLibraryRows(userId: string): Promise<LibraryRows> {
  const [bookRows, journal, knowledge, noteRows, travel] = await Promise.all([
    db
      .select()
      .from(books)
      .where(and(eq(books.userId, userId), isNull(books.deletedAt)))
      .orderBy(desc(books.updatedAt)),
    db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.userId, userId), isNull(journalEntries.deletedAt)))
      .orderBy(desc(journalEntries.createdAt)),
    db
      .select()
      .from(knowledgeEntries)
      .where(and(eq(knowledgeEntries.userId, userId), isNull(knowledgeEntries.deletedAt)))
      .orderBy(desc(knowledgeEntries.dateLearned)),
    db
      .select()
      .from(notes)
      .where(and(eq(notes.userId, userId), isNull(notes.deletedAt)))
      .orderBy(desc(notes.updatedAt)),
    db
      .select()
      .from(travelJournals)
      .where(and(eq(travelJournals.userId, userId), isNull(travelJournals.deletedAt)))
      .orderBy(desc(travelJournals.date)),
  ]);

  /* Skipped entirely when there are no books, which also keeps `inArray` off an
     empty list — Postgres reads `IN ()` as a syntax error. */
  const chapters =
    bookRows.length === 0
      ? []
      : await db
          .select()
          .from(bookChapters)
          .where(
            inArray(
              bookChapters.bookId,
              bookRows.map((b) => b.id),
            ),
          )
          .orderBy(asc(bookChapters.order));

  return { books: bookRows, chapters, journal, knowledge, notes: noteRows, travel };
}
