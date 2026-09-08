import { connectToDatabase } from "@/lib/mongodb";
import {
  CountdownEvent as CountdownEventModel,
  CountdownChecklistItem as CountdownChecklistItemModel,
  CountdownReminder as CountdownReminderModel,
  CountdownMemory as CountdownMemoryModel,
} from "@/lib/models/countdown";

function mapDoc(doc: any) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  const { _id, ...rest } = obj;
  return { id: _id.toString(), ...rest };
}

function mapDocs(docs: any[]) {
  return docs.map((doc) => {
    const obj = doc.toObject ? doc.toObject() : doc;
    const { _id, ...rest } = obj;
    return { id: _id.toString(), ...rest };
  });
}

export type CountdownEvent = any;
export type CountdownChecklistItem = any;
export type CountdownReminder = any;
export type CountdownMemory = any;

export type CreateCountdownEventInput = {
  userId: string;
  title: string;
  description?: string | null;
  category?: string | null;
  eventDate: Date;
  eventTime?: string | null;
  timezone?: string | null;
  location?: string | null;
  organizer?: string | null;
  coverImage?: string | null;
  bannerImage?: string | null;
  color?: string | null;
  icon?: string | null;
  notes?: string | null;
  isFavorited?: boolean;
  isArchived?: boolean;
  recurrence?: string | null;
  createTimelineEvent?: boolean;
  status?: string | null;
};

export type UpdateCountdownEventInput = Partial<Omit<CreateCountdownEventInput, "userId">>;

export type CreateChecklistItemInput = {
  eventId: string;
  text: string;
  order?: number;
};

export type CreateReminderInput = {
  eventId: string;
  offset: string;
  reminderAt: Date;
};

export type CreateMemoryInput = {
  eventId: string;
  photos?: string[];
  reflection?: string;
  rating?: number;
};

// ── Events ──

export async function createEvent(input: CreateCountdownEventInput) {
  await connectToDatabase();
  const doc = await CountdownEventModel.create({
    userId: input.userId,
    title: input.title,
    description: input.description ?? null,
    category: input.category ?? "personal",
    eventDate: input.eventDate,
    eventTime: input.eventTime ?? null,
    timezone: input.timezone ?? null,
    location: input.location ?? null,
    organizer: input.organizer ?? null,
    coverImage: input.coverImage ?? null,
    bannerImage: input.bannerImage ?? null,
    color: input.color ?? null,
    icon: input.icon ?? null,
    notes: input.notes ?? null,
    isFavorited: input.isFavorited ?? false,
    isArchived: input.isArchived ?? false,
    recurrence: input.recurrence ?? "none",
    createTimelineEvent: input.createTimelineEvent ?? true,
    status: input.status ?? "pending",
  });
  return mapDoc(doc);
}

export async function getEventById(id: string, userId: string) {
  await connectToDatabase();
  const doc = await CountdownEventModel.findOne({ _id: id, userId, deletedAt: null }).lean();
  return mapDoc(doc);
}

export async function getEventsForUser(userId: string, status?: string, limit?: number) {
  await connectToDatabase();
  const filter: any = { userId, deletedAt: null };
  if (status) filter.status = status;

  let query = CountdownEventModel.find(filter).sort({ eventDate: 1 });
  if (limit) query = query.limit(limit);
  const docs = await query.lean();
  return mapDocs(docs);
}

export async function updateEvent(id: string, userId: string, input: UpdateCountdownEventInput) {
  await connectToDatabase();
  const update: Record<string, unknown> = { ...input, updatedAt: new Date() };
  for (const key of Object.keys(update)) {
    if (update[key] === undefined) delete update[key];
  }
  const doc = await CountdownEventModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    update,
    { new: true },
  ).lean();
  return mapDoc(doc);
}

export async function softDeleteEvent(id: string, userId: string) {
  await connectToDatabase();
  const doc = await CountdownEventModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { deletedAt: new Date(), status: "archived" },
    { new: true },
  ).lean();
  return mapDoc(doc);
}

// ── Checklist Items ──

export async function createChecklistItem(input: CreateChecklistItemInput) {
  await connectToDatabase();
  const doc = await CountdownChecklistItemModel.create({
    eventId: input.eventId,
    text: input.text,
    order: input.order ?? 0,
  });
  return mapDoc(doc);
}

export async function getChecklistItems(eventId: string) {
  await connectToDatabase();
  const docs = await CountdownChecklistItemModel.find({ eventId }).sort({ order: 1 }).lean();
  return mapDocs(docs);
}

export async function updateChecklistItem(id: string, input: { text?: string; isCompleted?: boolean; order?: number }) {
  await connectToDatabase();
  const doc = await CountdownChecklistItemModel.findOneAndUpdate(
    { _id: id },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return mapDoc(doc);
}

export async function deleteChecklistItem(id: string) {
  await connectToDatabase();
  const doc = await CountdownChecklistItemModel.findOneAndDelete({ _id: id }).lean();
  return mapDoc(doc);
}

// ── Reminders ──

export async function createReminder(input: CreateReminderInput) {
  await connectToDatabase();
  const doc = await CountdownReminderModel.create({
    eventId: input.eventId,
    offset: input.offset,
    reminderAt: input.reminderAt,
  });
  return mapDoc(doc);
}

export async function getRemindersForEvent(eventId: string) {
  await connectToDatabase();
  const docs = await CountdownReminderModel.find({ eventId }).sort({ reminderAt: 1 }).lean();
  return mapDocs(docs);
}

export async function getDueReminders(now: Date) {
  await connectToDatabase();
  const docs = await CountdownReminderModel.find({
    reminderAt: { $lte: now },
    isSent: false,
  }).lean();
  return mapDocs(docs);
}

export async function markReminderSent(id: string) {
  await connectToDatabase();
  const doc = await CountdownReminderModel.findOneAndUpdate(
    { _id: id },
    { isSent: true },
    { new: true },
  ).lean();
  return mapDoc(doc);
}

export async function deleteReminder(id: string) {
  await connectToDatabase();
  const doc = await CountdownReminderModel.findOneAndDelete({ _id: id }).lean();
  return mapDoc(doc);
}

// ── Memories ──

export async function createMemory(input: CreateMemoryInput) {
  await connectToDatabase();
  const doc = await CountdownMemoryModel.create({
    eventId: input.eventId,
    photos: input.photos ?? [],
    reflection: input.reflection ?? null,
    rating: input.rating ?? null,
  });
  return mapDoc(doc);
}

export async function getMemoryForEvent(eventId: string) {
  await connectToDatabase();
  const doc = await CountdownMemoryModel.findOne({ eventId }).lean();
  return mapDoc(doc);
}

export async function updateMemory(id: string, input: { photos?: string[]; reflection?: string; rating?: number; archived?: boolean }) {
  await connectToDatabase();
  const doc = await CountdownMemoryModel.findOneAndUpdate(
    { _id: id },
    input,
    { new: true },
  ).lean();
  return mapDoc(doc);
}
