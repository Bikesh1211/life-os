import mongoose, { Schema } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import {
  ConnectionModel,
  NetworkMemoryModel,
  NetworkMemoryConnectionModel,
  NetworkMeetupModel,
  NetworkMeetupConnectionModel,
  NetworkEventModel,
  NetworkEventConnectionModel,
  NetworkGiftModel,
} from "@/lib/models/network";

const NetworkTripParticipantSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    connectionId: { type: Schema.Types.ObjectId, ref: "Connection", required: true, index: true },
    tripId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

const NetworkTripParticipantModel =
  mongoose.models.NetworkTripParticipant ||
  mongoose.model("NetworkTripParticipant", NetworkTripParticipantSchema);

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

export type NetworkConnection = any;
export type NetworkMeetup = any;
export type NetworkEvent = any;
export type NetworkMemory = any;
export type NetworkGift = any;
export type NetworkTripParticipant = any;

export type CreateConnectionInput = {
  userId: string;
  fullName: string;
  nickname?: string;
  profilePictureUrl?: string;
  gender?: string;
  birthday?: Date;
  phone?: string;
  email?: string;
  address?: string;
  country?: string;
  city?: string;
  occupation?: string;
  socialLinks?: Record<string, unknown>;
  relationshipTypes?: string[];
  notes?: string;
  isFavorite?: boolean;
  firstMetDate?: Date;
  friendshipAnniversary?: Date;
  lastMetDate?: Date;
  lastCallDate?: Date;
  lastMessageDate?: Date;
};

export type CreateMeetupInput = {
  userId: string;
  title: string;
  date: Date;
  location?: string;
  photos?: string[];
  expense?: number;
  notes?: string;
  mood?: string;
};

export type CreateEventInput = {
  userId: string;
  eventType: string;
  date: Date;
  location?: string;
  photos?: string[];
  expense?: number;
  notes?: string;
};

export type CreateMemoryInput = {
  userId: string;
  title: string;
  description?: string;
  photoUrls?: string[];
  videoUrls?: string[];
  audioUrl?: string;
  quotes?: string;
  memoryDate?: Date;
  location?: string;
  tags?: string[];
  isFavorite?: boolean;
};

export type CreateGiftInput = {
  userId: string;
  connectionId: string;
  direction: string;
  giftName: string;
  occasion?: string;
  price?: number;
  date?: Date;
  notes?: string;
};

export type CreateTripParticipantInput = {
  userId: string;
  connectionId: string;
  tripId: string;
};

// ── Connections ──

export async function createConnection(input: CreateConnectionInput) {
  await connectToDatabase();
  const doc = await ConnectionModel.create(input);
  return mapDoc(doc);
}

export async function updateConnection(id: string, userId: string, input: Partial<CreateConnectionInput>) {
  await connectToDatabase();
  const doc = await ConnectionModel.findOneAndUpdate(
    { _id: id, userId },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return mapDoc(doc);
}

export async function deleteConnection(id: string, userId: string) {
  await connectToDatabase();
  await ConnectionModel.findOneAndDelete({ _id: id, userId });
}

export async function getConnection(id: string, userId: string) {
  await connectToDatabase();
  const doc = await ConnectionModel.findOne({ _id: id, userId }).lean();
  return mapDoc(doc);
}

export async function getConnections(userId: string) {
  await connectToDatabase();
  const docs = await ConnectionModel.find({ userId }).sort({ createdAt: -1 }).lean();
  return mapDocs(docs);
}

export async function getConnectionsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  await connectToDatabase();
  const docs = await ConnectionModel.find({ _id: { $in: ids } }).lean();
  return mapDocs(docs);
}

export async function getFavoriteConnections(userId: string) {
  await connectToDatabase();
  const docs = await ConnectionModel.find({ userId, isFavorite: true })
    .sort({ createdAt: -1 })
    .lean();
  return mapDocs(docs);
}

export async function getUpcomingBirthdays(userId: string) {
  await connectToDatabase();
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  const docs = await ConnectionModel.aggregate([
    { $match: { userId } },
    {
      $addFields: {
        birthMonth: { $month: "$birthday" },
        birthDay: { $dayOfMonth: "$birthday" },
      },
    },
    {
      $match: {
        $or: [
          { birthMonth: { $gt: month } },
          { birthMonth: month, birthDay: { $gte: day } },
        ],
      },
    },
    { $sort: { birthMonth: 1, birthDay: 1 } },
    { $limit: 20 },
  ]);

  return mapDocs(docs);
}

// ── Meetups ──

export async function createMeetup(input: CreateMeetupInput) {
  await connectToDatabase();
  const doc = await NetworkMeetupModel.create(input);
  return mapDoc(doc);
}

export async function updateMeetup(id: string, userId: string, input: Partial<CreateMeetupInput>) {
  await connectToDatabase();
  const doc = await NetworkMeetupModel.findOneAndUpdate(
    { _id: id, userId },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return mapDoc(doc);
}

export async function deleteMeetup(id: string, userId: string) {
  await connectToDatabase();
  await NetworkMeetupModel.findOneAndDelete({ _id: id, userId });
}

export async function getMeetup(id: string, userId: string) {
  await connectToDatabase();
  const doc = await NetworkMeetupModel.findOne({ _id: id, userId }).lean();
  return mapDoc(doc);
}

export async function getMeetups(userId: string) {
  await connectToDatabase();
  const docs = await NetworkMeetupModel.find({ userId }).sort({ date: -1 }).lean();
  return mapDocs(docs);
}

export async function getMeetupConnectionIds(meetupId: string) {
  await connectToDatabase();
  const rows = await NetworkMeetupConnectionModel.find({ meetupId })
    .select({ connectionId: 1 })
    .lean();
  return rows.map((r: any) => r.connectionId.toString());
}

export async function setMeetupConnections(meetupId: string, connectionIds: string[]) {
  await connectToDatabase();
  await NetworkMeetupConnectionModel.deleteMany({ meetupId });
  if (connectionIds.length > 0) {
    await NetworkMeetupConnectionModel.insertMany(
      connectionIds.map((connectionId) => ({ meetupId, connectionId })),
    );
  }
}

// ── Events ──

export async function createEvent(input: CreateEventInput) {
  await connectToDatabase();
  const doc = await NetworkEventModel.create(input);
  return mapDoc(doc);
}

export async function updateEvent(id: string, userId: string, input: Partial<CreateEventInput>) {
  await connectToDatabase();
  const doc = await NetworkEventModel.findOneAndUpdate(
    { _id: id, userId },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return mapDoc(doc);
}

export async function deleteEvent(id: string, userId: string) {
  await connectToDatabase();
  await NetworkEventModel.findOneAndDelete({ _id: id, userId });
}

export async function getEvent(id: string, userId: string) {
  await connectToDatabase();
  const doc = await NetworkEventModel.findOne({ _id: id, userId }).lean();
  return mapDoc(doc);
}

export async function getEvents(userId: string) {
  await connectToDatabase();
  const docs = await NetworkEventModel.find({ userId }).sort({ date: -1 }).lean();
  return mapDocs(docs);
}

export async function getEventConnectionIds(eventId: string) {
  await connectToDatabase();
  const rows = await NetworkEventConnectionModel.find({ eventId })
    .select({ connectionId: 1 })
    .lean();
  return rows.map((r: any) => r.connectionId.toString());
}

export async function setEventConnections(eventId: string, connectionIds: string[]) {
  await connectToDatabase();
  await NetworkEventConnectionModel.deleteMany({ eventId });
  if (connectionIds.length > 0) {
    await NetworkEventConnectionModel.insertMany(
      connectionIds.map((connectionId) => ({ eventId, connectionId })),
    );
  }
}

// ── Memories ──

export async function createMemory(input: CreateMemoryInput) {
  await connectToDatabase();
  const doc = await NetworkMemoryModel.create(input);
  return mapDoc(doc);
}

export async function updateMemory(id: string, userId: string, input: Partial<CreateMemoryInput>) {
  await connectToDatabase();
  const doc = await NetworkMemoryModel.findOneAndUpdate(
    { _id: id, userId },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return mapDoc(doc);
}

export async function deleteMemory(id: string, userId: string) {
  await connectToDatabase();
  await NetworkMemoryModel.findOneAndDelete({ _id: id, userId });
}

export async function getMemory(id: string, userId: string) {
  await connectToDatabase();
  const doc = await NetworkMemoryModel.findOne({ _id: id, userId }).lean();
  return mapDoc(doc);
}

export async function getMemories(userId: string) {
  await connectToDatabase();
  const docs = await NetworkMemoryModel.find({ userId }).sort({ memoryDate: -1 }).lean();
  return mapDocs(docs);
}

export async function getFavoriteMemories(userId: string) {
  await connectToDatabase();
  const docs = await NetworkMemoryModel.find({ userId, isFavorite: true })
    .sort({ memoryDate: -1 })
    .lean();
  return mapDocs(docs);
}

export async function getMemoryConnectionIds(memoryId: string) {
  await connectToDatabase();
  const rows = await NetworkMemoryConnectionModel.find({ memoryId })
    .select({ connectionId: 1 })
    .lean();
  return rows.map((r: any) => r.connectionId.toString());
}

export async function setMemoryConnections(memoryId: string, connectionIds: string[]) {
  await connectToDatabase();
  await NetworkMemoryConnectionModel.deleteMany({ memoryId });
  if (connectionIds.length > 0) {
    await NetworkMemoryConnectionModel.insertMany(
      connectionIds.map((connectionId) => ({ memoryId, connectionId })),
    );
  }
}

// ── Gifts ──

export async function createGift(input: CreateGiftInput) {
  await connectToDatabase();
  const doc = await NetworkGiftModel.create(input);
  return mapDoc(doc);
}

export async function updateGift(id: string, userId: string, input: Partial<CreateGiftInput>) {
  await connectToDatabase();
  const doc = await NetworkGiftModel.findOneAndUpdate(
    { _id: id, userId },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return mapDoc(doc);
}

export async function deleteGift(id: string, userId: string) {
  await connectToDatabase();
  await NetworkGiftModel.findOneAndDelete({ _id: id, userId });
}

export async function getGift(id: string, userId: string) {
  await connectToDatabase();
  const doc = await NetworkGiftModel.findOne({ _id: id, userId }).lean();
  return mapDoc(doc);
}

export async function getGifts(userId: string) {
  await connectToDatabase();
  const docs = await NetworkGiftModel.find({ userId }).sort({ date: -1 }).lean();
  return mapDocs(docs);
}

export async function getGiftsByConnection(connectionId: string, userId: string) {
  await connectToDatabase();
  const docs = await NetworkGiftModel.find({ connectionId, userId }).sort({ date: -1 }).lean();
  return mapDocs(docs);
}

// ── Trip Participants ──

export async function addTripParticipant(input: CreateTripParticipantInput) {
  await connectToDatabase();
  const doc = await NetworkTripParticipantModel.create(input);
  return mapDoc(doc);
}

export async function removeTripParticipant(connectionId: string, tripId: string, userId: string) {
  await connectToDatabase();
  await NetworkTripParticipantModel.findOneAndDelete({ connectionId, tripId, userId });
}

export async function getTripParticipantIds(tripId: string) {
  await connectToDatabase();
  const rows = await NetworkTripParticipantModel.find({ tripId }).select({ connectionId: 1 }).lean();
  return rows.map((r: any) => r.connectionId.toString());
}

export async function getConnectionsForTrip(tripId: string, userId: string) {
  await connectToDatabase();
  const rows = await NetworkTripParticipantModel.find({ tripId, userId }).lean();
  const connectionIds = rows.map((r: any) => r.connectionId.toString());
  if (connectionIds.length === 0) return [];
  const docs = await ConnectionModel.find({ _id: { $in: connectionIds } }).lean();
  return mapDocs(docs);
}

export async function getTripIdsForConnection(connectionId: string) {
  await connectToDatabase();
  const rows = await NetworkTripParticipantModel.find({ connectionId }).select({ tripId: 1 }).lean();
  return rows.map((r: any) => r.tripId.toString());
}

export async function getRecentMeetups(userId: string, limit = 5) {
  await connectToDatabase();
  const docs = await NetworkMeetupModel.find({ userId })
    .sort({ date: -1 })
    .limit(limit)
    .lean();
  return mapDocs(docs);
}

export async function getUpcomingEvents(userId: string, limit = 5) {
  await connectToDatabase();
  const today = new Date().toISOString().split("T")[0];
  const docs = await NetworkEventModel.find({ userId, date: { $gte: today } })
    .sort({ date: 1 })
    .limit(limit)
    .lean();
  return mapDocs(docs);
}

export async function getDashboardStats(userId: string) {
  await connectToDatabase();

  const [connectionCount, meetupCount, memoryCount, eventCount, giftCount, favoriteCount, tripCount] =
    await Promise.all([
      ConnectionModel.countDocuments({ userId }),
      NetworkMeetupModel.countDocuments({ userId }),
      NetworkMemoryModel.countDocuments({ userId }),
      NetworkEventModel.countDocuments({ userId }),
      NetworkGiftModel.countDocuments({ userId }),
      ConnectionModel.countDocuments({ userId, isFavorite: true }),
      NetworkTripParticipantModel.countDocuments({ userId }),
    ]);

  return {
    totalConnections: connectionCount,
    totalMeetups: meetupCount,
    totalMemories: memoryCount,
    totalEvents: eventCount,
    totalGifts: giftCount,
    totalTrips: tripCount,
    favoriteCount,
  };
}
