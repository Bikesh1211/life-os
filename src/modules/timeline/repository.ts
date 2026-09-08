import { connectToDatabase } from "@/lib/mongodb";
import { TimelineEvent as TimelineEventModel } from "@/lib/models/timeline";

export type TimelineEvent = {
  id: string;
  userId: string;
  title: string;
  description?: string;
  eventDate: Date;
  category: string;
  importance: string;
  recurrence: string;
  color?: string;
  icon?: string;
  isPinned: boolean;
  activityType?: string;
  tags: string[];
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  mood?: number;
  energy?: number;
  location?: string;
  linkedEntityId?: string;
  linkedEntityType?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateTimelineEventInput = {
  userId: string;
  title: string;
  description?: string;
  eventDate: Date;
  category?: string;
  importance?: string;
  recurrence?: string;
  color?: string;
  icon?: string;
  isPinned?: boolean;
  activityType?: string;
  tags?: string[];
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  mood?: number;
  energy?: number;
  location?: string;
  linkedEntityId?: string;
  linkedEntityType?: string;
};

export type UpdateTimelineEventInput = Partial<Omit<CreateTimelineEventInput, "userId">>;

function mapEvent(doc: any): TimelineEvent {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    title: doc.title,
    description: doc.description,
    eventDate: doc.eventDate,
    category: doc.category,
    importance: doc.importance,
    recurrence: doc.recurrence,
    color: doc.color,
    icon: doc.icon,
    isPinned: doc.isPinned,
    activityType: doc.activityType,
    tags: doc.tags,
    startTime: doc.startTime,
    endTime: doc.endTime,
    durationMinutes: doc.durationMinutes,
    mood: doc.mood,
    energy: doc.energy,
    location: doc.location,
    linkedEntityId: doc.linkedEntityId,
    linkedEntityType: doc.linkedEntityType,
    deletedAt: doc.deletedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function createEvent(input: CreateTimelineEventInput): Promise<TimelineEvent> {
  await connectToDatabase();
  const doc = await TimelineEventModel.create({
    userId: input.userId,
    title: input.title,
    description: input.description,
    eventDate: input.eventDate,
    category: input.category ?? "personal",
    importance: input.importance ?? "medium",
    recurrence: input.recurrence ?? "none",
    color: input.color,
    icon: input.icon,
    isPinned: input.isPinned ?? false,
    activityType: input.activityType,
    tags: input.tags,
    startTime: input.startTime,
    endTime: input.endTime,
    durationMinutes: input.durationMinutes,
    mood: input.mood,
    energy: input.energy,
    location: input.location,
    linkedEntityId: input.linkedEntityId,
    linkedEntityType: input.linkedEntityType,
  });
  return mapEvent(doc);
}

export async function getEventsForUser(userId: string): Promise<TimelineEvent[]> {
  await connectToDatabase();
  const docs = await TimelineEventModel.find({ userId, deletedAt: null })
    .sort({ isPinned: -1, eventDate: 1 })
    .lean();
  return docs.map(mapEvent);
}

export async function getEventById(id: string, userId: string): Promise<TimelineEvent | null> {
  await connectToDatabase();
  const doc = await TimelineEventModel.findOne({
    _id: id,
    userId,
    deletedAt: null,
  }).lean();
  return doc ? mapEvent(doc) : null;
}

export async function updateEvent(
  id: string,
  userId: string,
  input: UpdateTimelineEventInput,
): Promise<TimelineEvent | null> {
  await connectToDatabase();
  const doc = await TimelineEventModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapEvent(doc) : null;
}

export async function deleteEvent(id: string, userId: string): Promise<TimelineEvent | null> {
  await connectToDatabase();
  const doc = await TimelineEventModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { deletedAt: new Date(), updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapEvent(doc) : null;
}

export async function getEventsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<TimelineEvent[]> {
  await connectToDatabase();
  const docs = await TimelineEventModel.find({
    userId,
    deletedAt: null,
    eventDate: { $gte: startDate, $lte: endDate },
  })
    .sort({ eventDate: 1 })
    .lean();
  return docs.map(mapEvent);
}

export async function getEventsByCategory(
  userId: string,
  category: string,
): Promise<TimelineEvent[]> {
  await connectToDatabase();
  const docs = await TimelineEventModel.find({
    userId,
    category,
    deletedAt: null,
  })
    .sort({ eventDate: -1 })
    .lean();
  return docs.map(mapEvent);
}

export async function getEventsByIds(ids: string[], userId: string): Promise<TimelineEvent[]> {
  await connectToDatabase();
  const docs = await TimelineEventModel.find({
    _id: { $in: ids },
    userId,
    deletedAt: null,
  })
    .sort({ eventDate: 1 })
    .lean();
  return docs.map(mapEvent);
}

export async function getEventStatsForUser(
  userId: string,
): Promise<{ total: number; past: number; future: number; pinned: number }> {
  await connectToDatabase();
  const now = new Date();
  const [result] = await TimelineEventModel.aggregate([
    {
      $match: { userId, deletedAt: null },
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        past: {
          $sum: { $cond: [{ $lt: ["$eventDate", now] }, 1, 0] },
        },
        future: {
          $sum: { $cond: [{ $gte: ["$eventDate", now] }, 1, 0] },
        },
        pinned: {
          $sum: { $cond: ["$isPinned", 1, 0] },
        },
      },
    },
  ]);
  return result ?? { total: 0, past: 0, future: 0, pinned: 0 };
}

export async function getUpcomingEventsForUser(
  userId: string,
  limit = 5,
): Promise<TimelineEvent[]> {
  await connectToDatabase();
  const docs = await TimelineEventModel.find({
    userId,
    deletedAt: null,
    eventDate: { $gte: new Date() },
  })
    .sort({ eventDate: 1 })
    .limit(limit)
    .lean();
  return docs.map(mapEvent);
}
