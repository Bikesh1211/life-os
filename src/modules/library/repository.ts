import { connectToDatabase } from "@/lib/mongodb";
import {
  BookModel,
  BookChapterModel,
  JournalEntryModel,
  KnowledgeEntryModel,
  Note,
  TravelJournalModel,
} from "@/lib/models";

export type BookRow = any;
export type ChapterRow = any;
export type JournalRow = any;
export type KnowledgeRow = any;
export type NoteRow = any;
export type TravelJournalRow = any;

export interface LibraryRows {
  books: BookRow[];
  chapters: ChapterRow[];
  journal: JournalRow[];
  knowledge: KnowledgeRow[];
  notes: NoteRow[];
  travel: TravelJournalRow[];
}

export async function readLibraryRows(userId: string): Promise<LibraryRows> {
  await connectToDatabase();

  const [bookRows, journal, knowledge, noteRows, travel] = await Promise.all([
    BookModel.find({ userId, deletedAt: null })
      .sort({ updatedAt: -1 })
      .lean(),
    JournalEntryModel.find({ userId, deletedAt: null })
      .sort({ createdAt: -1 })
      .lean(),
    KnowledgeEntryModel.find({ userId, deletedAt: null })
      .sort({ dateLearned: -1 })
      .lean(),
    Note.find({ userId, deletedAt: null })
      .sort({ updatedAt: -1 })
      .lean(),
    TravelJournalModel.find({ userId, deletedAt: null })
      .sort({ date: -1 })
      .lean(),
  ]);

  const chapters =
    bookRows.length === 0
      ? []
      : await BookChapterModel.find({
          bookId: { $in: bookRows.map((b: any) => b._id) },
        })
          .sort({ order: 1 })
          .lean();

  return { books: bookRows, chapters, journal, knowledge, notes: noteRows, travel };
}
