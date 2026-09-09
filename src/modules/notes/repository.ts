import { connectToDatabase } from "@/lib/mongodb";
import { Note as NoteModel, NoteTag as NoteTagModel, NoteFolder as NoteFolderModel, NoteLink as NoteLinkModel } from "@/lib/models/notes";

export type Note = {
  id: string;
  userId: string;
  title: string;
  content: string | null;
  contentJson: unknown;
  excerpt: string | null;
  coverImage: string | null;
  category: string;
  tags: string[];
  isPinned: boolean;
  status: string;
  folderId: string | null;
  reminderDate: Date | null;
  color: string | null;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type NoteTag = {
  id: string;
  userId: string;
  name: string;
  color: string;
};

export type NoteFolder = {
  id: string;
  userId: string;
  name: string;
  parentId: string | null;
  color: string;
  icon: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

export type NoteLink = {
  id: string;
  noteId: string;
  linkedNoteId: string;
  createdAt: Date;
};

export type CreateNoteInput = {
  userId: string;
  title: string;
  content?: string;
  contentJson?: unknown;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
  isPinned?: boolean;
  status?: string;
  folderId?: string;
  reminderDate?: Date;
  color?: string;
  priority?: string;
};

export type UpdateNoteInput = Partial<Omit<CreateNoteInput, "userId">>;

export type CreateNoteTagInput = {
  userId: string;
  name: string;
  color?: string;
};

export type CreateNoteFolderInput = {
  userId: string;
  name: string;
  parentId?: string;
  color?: string;
  icon?: string;
  order?: number;
};

export type NoteFilters = {
  search?: string;
  category?: string;
  tags?: string[];
  status?: string;
  isPinned?: boolean;
  priority?: string;
  folderId?: string;
  includeArchived?: boolean;
  includeDeleted?: boolean;
  sortBy?: "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
};

export const noteColumns = [
  "id", "userId", "title", "content", "contentJson", "excerpt", "coverImage",
  "category", "tags", "isPinned", "status", "folderId", "reminderDate",
  "color", "priority", "createdAt", "updatedAt", "deletedAt",
];

const noteColumnsDashboard = [
  "id", "title", "category", "tags", "isPinned", "color", "priority",
  "createdAt", "updatedAt",
];

function mapNote(doc: any): Note {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    title: doc.title,
    content: doc.content ?? null,
    contentJson: doc.contentJson ?? null,
    excerpt: doc.excerpt ?? null,
    coverImage: doc.coverImage ?? null,
    category: doc.category,
    tags: doc.tags ?? [],
    isPinned: doc.isPinned,
    status: doc.status,
    folderId: doc.folderId ?? null,
    reminderDate: doc.reminderDate ?? null,
    color: doc.color ?? null,
    priority: doc.priority,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    deletedAt: doc.deletedAt ?? null,
  };
}

function mapNoteDashboard(doc: any) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    category: doc.category,
    tags: doc.tags ?? [],
    isPinned: doc.isPinned,
    color: doc.color ?? null,
    priority: doc.priority,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function mapTag(doc: any): NoteTag {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    name: doc.name,
    color: doc.color,
  };
}

function mapFolder(doc: any): NoteFolder {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    name: doc.name,
    parentId: doc.parentId ?? null,
    color: doc.color,
    icon: doc.icon ?? null,
    order: doc.order,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// ── Notes ──

export async function createNote(input: CreateNoteInput) {
  await connectToDatabase();
  const doc = await NoteModel.create({
    userId: input.userId,
    title: input.title,
    content: input.content ?? undefined,
    contentJson: input.contentJson ?? undefined,
    excerpt: input.excerpt ?? undefined,
    coverImage: input.coverImage ?? undefined,
    category: input.category ?? "personal",
    tags: input.tags ?? [],
    isPinned: input.isPinned ?? false,
    status: input.status ?? "published",
    folderId: input.folderId ?? undefined,
    reminderDate: input.reminderDate ?? undefined,
    color: input.color ?? undefined,
    priority: input.priority ?? "medium",
  } as any);
  return mapNote(doc.toObject());
}

export async function getNoteById(id: string, userId: string) {
  await connectToDatabase();
  const doc = await NoteModel.findOne({
    _id: id,
    userId,
    deletedAt: null,
  }).lean();
  return doc ? mapNote(doc) : null;
}

export async function getNotesForUser(userId: string, filters: NoteFilters = {}) {
  await connectToDatabase();

  const filter: any = { userId };

  if (filters.includeDeleted) {
    filter.deletedAt = { $ne: null };
  } else {
    filter.deletedAt = null;

    if (filters.includeArchived) {
      // show all statuses including archived
    } else if (filters.status) {
      filter.status = filters.status;
    } else {
      filter.status = { $in: ["published", "draft"] };
    }
  }

  if (filters.search) {
    filter.$or = [
      { title: { $regex: filters.search, $options: "i" } },
      { content: { $regex: filters.search, $options: "i" } },
    ];
  }
  if (filters.category) {
    filter.category = filters.category;
  }
  if (filters.tags && filters.tags.length > 0) {
    filter.tags = { $all: filters.tags };
  }
  if (filters.isPinned !== undefined) {
    filter.isPinned = filters.isPinned;
  }
  if (filters.priority) {
    filter.priority = filters.priority;
  }
  if (filters.folderId) {
    filter.folderId = filters.folderId;
  }

  const sortBy = filters.sortBy ?? "updatedAt";
  const sortOrder = filters.sortOrder === "asc" ? 1 : -1;

  const docs = await NoteModel.find(filter)
    .sort({ isPinned: -1, [sortBy]: sortOrder })
    .skip(filters.offset ?? 0)
    .limit(filters.limit ?? 50)
    .lean();

  return docs.map(mapNote);
}

export async function updateNote(id: string, userId: string, input: UpdateNoteInput) {
  await connectToDatabase();
  const doc = await NoteModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { $set: { ...input, updatedAt: new Date() } },
    { new: true },
  ).lean();
  return doc ? mapNote(doc) : null;
}

export async function softDeleteNote(id: string, userId: string) {
  await connectToDatabase();
  const doc = await NoteModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { $set: { deletedAt: new Date(), status: "archived" } },
    { new: true },
  ).lean();
  return doc ? mapNote(doc) : null;
}

export async function restoreNote(id: string, userId: string) {
  await connectToDatabase();
  const doc = await NoteModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: { deletedAt: null, status: "published" } },
    { new: true },
  ).lean();
  return doc ? mapNote(doc) : null;
}

export async function duplicateNote(id: string, userId: string) {
  const original = await getNoteById(id, userId);
  if (!original) return null;

  await connectToDatabase();
  const doc = await NoteModel.create({
    userId,
    title: `${original.title} (Copy)`,
    content: original.content,
    contentJson: original.contentJson,
    excerpt: original.excerpt,
    category: original.category ?? "personal",
    tags: original.tags ?? [],
    isPinned: false,
    status: "draft",
    folderId: original.folderId,
    color: original.color,
    priority: original.priority ?? "medium",
  } as any);
  return mapNote(doc.toObject());
}

export async function hardDeleteExpiredNotes(daysRetained = 30) {
  await connectToDatabase();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysRetained);
  await NoteModel.deleteMany({
    deletedAt: { $ne: null, $lt: cutoff },
  });
}

export async function getNoteCountForUser(userId: string, status?: string) {
  await connectToDatabase();
  const filter: any = { userId, deletedAt: null };
  if (status) {
    filter.status = status;
  } else {
    filter.status = { $in: ["published", "draft"] };
  }
  return NoteModel.countDocuments(filter);
}

export async function getRecentNotesForUser(userId: string, limit = 10) {
  await connectToDatabase();
  const docs = await NoteModel.find({
    userId,
    deletedAt: null,
    status: { $in: ["published", "draft"] },
  })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();
  return docs.map(mapNote);
}

export async function getRecentNotesForUserDashboard(userId: string, limit = 5) {
  await connectToDatabase();
  const docs = await NoteModel.find({
    userId,
    deletedAt: null,
    status: { $in: ["published", "draft"] },
  })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();
  return docs.map(mapNoteDashboard);
}

// ── Tags ──

export async function createTag(input: CreateNoteTagInput) {
  await connectToDatabase();
  try {
    const doc = await NoteTagModel.create({
      userId: input.userId,
      name: input.name,
      color: input.color ?? "blue",
    });
    return mapTag(doc.toObject());
  } catch {
    return null;
  }
}

export async function getTagsForUser(userId: string) {
  await connectToDatabase();
  const docs = await NoteTagModel.find({ userId })
    .sort({ name: 1 })
    .lean();
  return docs.map(mapTag);
}

export async function updateTag(id: string, userId: string, input: { name?: string; color?: string }) {
  await connectToDatabase();
  const doc = await NoteTagModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: input },
    { new: true },
  ).lean();
  return doc ? mapTag(doc) : null;
}

export async function deleteTag(id: string, userId: string) {
  await connectToDatabase();
  const doc = await NoteTagModel.findOneAndDelete({ _id: id, userId });
  return doc ? mapTag(doc.toObject()) : null;
}

// ── Folders ──

export async function createFolder(input: CreateNoteFolderInput) {
  await connectToDatabase();
  const doc = await NoteFolderModel.create({
    userId: input.userId,
    name: input.name,
    parentId: input.parentId ?? undefined,
    color: input.color ?? "blue",
    icon: input.icon ?? undefined,
    order: input.order ?? 0,
  } as any);
  return mapFolder(doc.toObject());
}

export async function getFoldersForUser(userId: string) {
  await connectToDatabase();
  const docs = await NoteFolderModel.find({ userId })
    .sort({ order: 1, name: 1 })
    .lean();
  return docs.map(mapFolder);
}

export async function getFolderById(id: string, userId: string) {
  await connectToDatabase();
  const doc = await NoteFolderModel.findOne({ _id: id, userId }).lean();
  return doc ? mapFolder(doc) : null;
}

export async function updateFolder(id: string, userId: string, input: Partial<CreateNoteFolderInput>) {
  await connectToDatabase();
  const doc = await NoteFolderModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: { ...input, updatedAt: new Date() } },
    { new: true },
  ).lean();
  return doc ? mapFolder(doc) : null;
}

export async function deleteFolder(id: string, userId: string) {
  await connectToDatabase();
  await NoteModel.updateMany(
    { folderId: id, userId },
    { $set: { folderId: null } },
  );

  await NoteFolderModel.updateMany(
    { parentId: id, userId },
    { $set: { parentId: null } },
  );

  const doc = await NoteFolderModel.findOneAndDelete({ _id: id, userId });
  return doc ? mapFolder(doc.toObject()) : null;
}

// ── Note Links ──

export async function createNoteLink(noteId: string, linkedNoteId: string) {
  await connectToDatabase();
  const doc = await NoteLinkModel.create({ noteId, linkedNoteId });
  return {
    id: doc._id.toString(),
    noteId: doc.noteId,
    linkedNoteId: doc.linkedNoteId,
    createdAt: doc.createdAt,
  };
}

export async function getNoteLinks(noteId: string) {
  await connectToDatabase();
  const rows = await NoteLinkModel.find({ noteId })
    .populate({
      path: "linkedNoteId",
      model: "Note",
      select: "title excerpt",
    })
    .lean();

  return rows.map((r: any) => ({
    id: r._id.toString(),
    noteId: r.noteId,
    linkedNoteId: r.linkedNoteId._id.toString(),
    createdAt: r.createdAt,
    linkedNote: {
      id: r.linkedNoteId._id.toString(),
      title: r.linkedNoteId.title,
      excerpt: r.linkedNoteId.excerpt ?? null,
    },
  }));
}

export async function getBacklinks(noteId: string) {
  await connectToDatabase();
  const rows = await NoteLinkModel.find({ linkedNoteId: noteId })
    .populate({
      path: "noteId",
      model: "Note",
      select: "title excerpt",
    })
    .lean();

  return rows.map((r: any) => ({
    id: r._id.toString(),
    noteId: r.noteId._id.toString(),
    linkedNoteId: r.linkedNoteId,
    createdAt: r.createdAt,
    sourceNote: {
      id: r.noteId._id.toString(),
      title: r.noteId.title,
      excerpt: r.noteId.excerpt ?? null,
    },
  }));
}

export async function deleteNoteLink(linkId: string) {
  await connectToDatabase();
  const doc = await NoteLinkModel.findOneAndDelete({ _id: linkId });
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    noteId: doc.noteId,
    linkedNoteId: doc.linkedNoteId,
    createdAt: doc.createdAt,
  };
}
