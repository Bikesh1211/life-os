import { connectToDatabase } from "@/lib/mongodb";
import {
  MusicArtistModel,
  MusicAlbumModel,
  MusicTrackModel,
  MusicListeningHistoryModel,
  MusicJournalModel,
  MusicMemoryModel,
  MusicMemorySongModel,
  MusicLibraryModel,
  MusicRatingModel,
  MusicFavoriteModel,
  MusicCollectionModel,
  MusicCollectionItemModel,
  MusicGoalConfigModel,
  MusicNoteModel,
  MusicMoodEntryModel,
  MusicJournalSongModel,
} from "@/lib/models/music";

// ─── Types ────────────────────────────────────────────────────────

export type Artist = {
  id: string;
  musicBrainzId?: string;
  name: string;
  country?: string;
  type?: string;
  genres: string[];
  imageUrl?: string;
  spotifyId?: string;
  spotifyPopularity?: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Album = {
  id: string;
  musicBrainzId?: string;
  artistId: string;
  title: string;
  releaseDate?: Date;
  coverArtUrl?: string;
  totalTracks?: number;
  spotifyId?: string;
  spotifyPopularity?: number;
  label?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Track = {
  id: string;
  musicBrainzId?: string;
  albumId?: string;
  artistId: string;
  title: string;
  duration?: number;
  trackNumber?: number;
  isrc?: string;
  spotifyUri?: string;
  spotifyId?: string;
  spotifyPopularity?: number;
  explicit: boolean;
  previewUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ListeningEntry = {
  id: string;
  userId: string;
  trackId?: string;
  artistName?: string;
  trackName?: string;
  listenedAt: Date;
  duration?: number;
  msPlayed?: number;
  spotifyPlayId?: string;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type MusicJournalEntry = {
  id: string;
  userId: string;
  trackId?: string;
  albumId?: string;
  artistId?: string;
  mood?: string;
  journalEntry: string;
  photoUrls: string[];
  location?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Memory = {
  id: string;
  userId: string;
  trackId?: string;
  albumId?: string;
  artistId?: string;
  title?: string;
  contextText: string;
  mood?: string;
  photoUrls: string[];
  memoryDate?: Date;
  linkedEventId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Rating = {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  score: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Favorite = {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Collection = {
  id: string;
  userId: string;
  title: string;
  description?: string;
  coverArtUrl?: string;
  isSmart: boolean;
  smartFilter?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type CollectionItem = {
  id: string;
  collectionId: string;
  entityType: string;
  entityId: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};

export type GoalConfig = {
  id: string;
  userId: string;
  goalId: string;
  targetType: string;
  targetValue?: string;
  targetCount?: number;
  currentCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type LibraryEntry = {
  id: string;
  userId: string;
  trackId: string;
  addedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateArtistInput = {
  musicBrainzId?: string;
  name: string;
  country?: string;
  type?: string;
  genres?: string[];
  imageUrl?: string;
  spotifyId?: string;
  spotifyPopularity?: number;
};

export type CreateAlbumInput = {
  musicBrainzId?: string;
  artistId: string;
  title: string;
  releaseDate?: Date;
  coverArtUrl?: string;
  totalTracks?: number;
  spotifyId?: string;
  spotifyPopularity?: number;
  label?: string;
};

export type CreateTrackInput = {
  musicBrainzId?: string;
  albumId?: string;
  artistId: string;
  title: string;
  duration?: number;
  trackNumber?: number;
  isrc?: string;
  spotifyUri?: string;
  spotifyId?: string;
  spotifyPopularity?: number;
  explicit?: boolean;
  previewUrl?: string;
};

export type CreateListeningInput = {
  userId: string;
  trackId?: string;
  artistName?: string;
  trackName?: string;
  listenedAt: Date;
  duration?: number;
  msPlayed?: number;
  spotifyPlayId?: string;
  sessionId?: string;
};

export type CreateJournalInput = {
  userId: string;
  trackId?: string;
  albumId?: string;
  artistId?: string;
  mood?: string;
  journalEntry: string;
  photoUrls?: string[];
  location?: string;
};

export type CreateMemoryInput = {
  userId: string;
  trackId?: string;
  albumId?: string;
  artistId?: string;
  title?: string;
  contextText: string;
  mood?: string;
  photoUrls?: string[];
  memoryDate?: Date;
  linkedEventId?: string;
};

export type CreateRatingInput = {
  userId: string;
  entityType: string;
  entityId: string;
  score: number;
  review?: string;
};

export type CreateFavoriteInput = {
  userId: string;
  entityType: string;
  entityId: string;
};

export type CreateCollectionInput = {
  userId: string;
  title: string;
  description?: string;
  coverArtUrl?: string;
  isSmart?: boolean;
  smartFilter?: string;
};

export type CreateCollectionItemInput = {
  collectionId: string;
  entityType: string;
  entityId: string;
  position?: number;
};

export type CreateGoalConfigInput = {
  userId: string;
  goalId: string;
  targetType: string;
  targetValue?: string;
  targetCount?: number;
  currentCount?: number;
};

export type CreateLibraryInput = {
  userId: string;
  trackId: string;
  addedAt?: Date;
};

export type MemorySong = {
  id: string;
  memoryId: string;
  trackId: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateMemorySongInput = {
  memoryId: string;
  trackId: string;
  position?: number;
};

export type MusicNote = {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  content: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateNoteInput = {
  userId: string;
  entityType: string;
  entityId: string;
  content: string;
};

export type JournalSong = {
  id: string;
  journalId: string;
  trackId?: string;
  albumId?: string;
  artistId?: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateJournalSongInput = {
  journalId: string;
  trackId?: string;
  albumId?: string;
  artistId?: string;
  position?: number;
};

export type MoodEntry = {
  id: string;
  userId: string;
  mood: string;
  note?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateMoodEntryInput = {
  userId: string;
  mood: string;
  note?: string;
  date: Date;
};

// ─── Helpers ──────────────────────────────────────────────────────

function toId(doc: any): string {
  return doc._id?.toString() ?? doc.id;
}

function mapId(doc: any): any {
  if (!doc) return doc;
  if (Array.isArray(doc)) return doc.map(mapId);
  const { _id, ...rest } = doc;
  return { id: _id?.toString() ?? rest.id, ...rest };
}

// ─── Batch entity fetching ─────────────────────────────────────────

export async function getArtistsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  await connectToDatabase();
  const docs = await MusicArtistModel.find({ _id: { $in: ids } }).lean();
  return mapId(docs);
}

export async function getAlbumsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  await connectToDatabase();
  const docs = await MusicAlbumModel.find({ _id: { $in: ids } }).lean();
  return mapId(docs);
}

export async function getTracksByIds(ids: string[]) {
  if (ids.length === 0) return [];
  await connectToDatabase();
  const docs = await MusicTrackModel.find({ _id: { $in: ids } }).lean();
  const albumIds = [...new Set(docs.filter((d: any) => d.albumId).map((d: any) => d.albumId.toString()))];
  const albums = albumIds.length > 0
    ? await MusicAlbumModel.find({ _id: { $in: albumIds } }).lean()
    : [];
  const albumMap = new Map(albums.map((a: any) => [a._id.toString(), a]));
  return docs.map((d: any) => {
    const album = d.albumId ? albumMap.get(d.albumId.toString()) : undefined;
    return {
      id: d._id.toString(),
      title: d.title,
      albumId: d.albumId?.toString(),
      artistId: d.artistId?.toString(),
      duration: d.duration,
      albumCoverArtUrl: album?.coverArtUrl,
      albumTitle: album?.title,
    };
  });
}

// ─── Artists ──────────────────────────────────────────────────────

export async function createArtist(input: CreateArtistInput) {
  await connectToDatabase();
  const doc = await MusicArtistModel.create(input);
  return mapId(doc.toObject());
}

export async function getArtistById(id: string) {
  await connectToDatabase();
  const doc = await MusicArtistModel.findOne({ _id: id }).lean();
  return doc ? mapId(doc) : null;
}

export async function getArtistByMusicBrainzId(mbid: string) {
  await connectToDatabase();
  const doc = await MusicArtistModel.findOne({ musicBrainzId: mbid }).lean();
  return doc ? mapId(doc) : null;
}

export async function getArtistBySpotifyId(spotifyId: string) {
  await connectToDatabase();
  const doc = await MusicArtistModel.findOne({ spotifyId }).lean();
  return doc ? mapId(doc) : null;
}

export async function upsertArtistBySpotifyId(input: CreateArtistInput) {
  if (!input.spotifyId) return createArtist(input);
  await connectToDatabase();
  const existing = await MusicArtistModel.findOne({ spotifyId: input.spotifyId }).lean();
  if (existing) {
    const doc = await MusicArtistModel.findOneAndUpdate(
      { _id: existing._id },
      { ...input, updatedAt: new Date() },
      { new: true },
    ).lean();
    return mapId(doc);
  }
  const doc = await MusicArtistModel.create(input);
  return mapId(doc.toObject());
}

export async function searchArtistsByName(query: string) {
  await connectToDatabase();
  const docs = await MusicArtistModel.find({ name: { $regex: query, $options: "i" } })
    .sort({ name: 1 })
    .limit(20)
    .lean();
  return mapId(docs);
}

export async function updateArtist(id: string, input: Partial<CreateArtistInput>) {
  await connectToDatabase();
  const doc = await MusicArtistModel.findOneAndUpdate(
    { _id: id },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapId(doc) : null;
}

// ─── Albums ───────────────────────────────────────────────────────

export async function createAlbum(input: CreateAlbumInput) {
  await connectToDatabase();
  const doc = await MusicAlbumModel.create(input);
  return mapId(doc.toObject());
}

export async function getAlbumById(id: string) {
  await connectToDatabase();
  const doc = await MusicAlbumModel.findOne({ _id: id }).lean();
  return doc ? mapId(doc) : null;
}

export async function getAlbumByMusicBrainzId(mbid: string) {
  await connectToDatabase();
  const doc = await MusicAlbumModel.findOne({ musicBrainzId: mbid }).lean();
  return doc ? mapId(doc) : null;
}

export async function getAlbumBySpotifyId(spotifyId: string) {
  await connectToDatabase();
  const doc = await MusicAlbumModel.findOne({ spotifyId }).lean();
  return doc ? mapId(doc) : null;
}

export async function upsertAlbumBySpotifyId(input: CreateAlbumInput) {
  if (!input.spotifyId) return createAlbum(input);
  await connectToDatabase();
  const existing = await MusicAlbumModel.findOne({ spotifyId: input.spotifyId }).lean();
  if (existing) {
    const doc = await MusicAlbumModel.findOneAndUpdate(
      { _id: existing._id },
      { ...input, updatedAt: new Date() },
      { new: true },
    ).lean();
    return mapId(doc);
  }
  const doc = await MusicAlbumModel.create(input);
  return mapId(doc.toObject());
}

export async function getAlbumsByArtist(artistId: string) {
  await connectToDatabase();
  const docs = await MusicAlbumModel.find({ artistId }).sort({ releaseDate: 1 }).lean();
  return mapId(docs);
}

export async function searchAlbumsByTitle(query: string) {
  await connectToDatabase();
  const docs = await MusicAlbumModel.find({ title: { $regex: query, $options: "i" } })
    .sort({ title: 1 })
    .limit(20)
    .lean();
  return mapId(docs);
}

export async function updateAlbum(id: string, input: Partial<CreateAlbumInput>) {
  await connectToDatabase();
  const doc = await MusicAlbumModel.findOneAndUpdate(
    { _id: id },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapId(doc) : null;
}

// ─── Tracks ───────────────────────────────────────────────────────

export async function createTrack(input: CreateTrackInput) {
  await connectToDatabase();
  const doc = await MusicTrackModel.create(input);
  return mapId(doc.toObject());
}

export async function getTrackById(id: string) {
  await connectToDatabase();
  const doc = await MusicTrackModel.findOne({ _id: id }).lean();
  return doc ? mapId(doc) : null;
}

export async function getTrackByMusicBrainzId(mbid: string) {
  await connectToDatabase();
  const doc = await MusicTrackModel.findOne({ musicBrainzId: mbid }).lean();
  return doc ? mapId(doc) : null;
}

export async function getTrackBySpotifyId(spotifyId: string) {
  await connectToDatabase();
  const doc = await MusicTrackModel.findOne({ spotifyId }).lean();
  return doc ? mapId(doc) : null;
}

export async function upsertTrackBySpotifyId(input: CreateTrackInput) {
  if (!input.spotifyId) return createTrack(input);
  await connectToDatabase();
  const existing = await MusicTrackModel.findOne({ spotifyId: input.spotifyId }).lean();
  if (existing) {
    const doc = await MusicTrackModel.findOneAndUpdate(
      { _id: existing._id },
      { ...input, updatedAt: new Date() },
      { new: true },
    ).lean();
    return mapId(doc);
  }
  const doc = await MusicTrackModel.create(input);
  return mapId(doc.toObject());
}

export async function getTracksByAlbum(albumId: string) {
  await connectToDatabase();
  const docs = await MusicTrackModel.find({ albumId }).sort({ title: 1 }).lean();
  return mapId(docs);
}

export async function getTracksByArtist(artistId: string) {
  await connectToDatabase();
  const docs = await MusicTrackModel.find({ artistId }).sort({ title: 1 }).lean();
  return mapId(docs);
}

export async function searchTracksByTitle(query: string) {
  await connectToDatabase();
  const docs = await MusicTrackModel.find({ title: { $regex: query, $options: "i" } })
    .sort({ title: 1 })
    .limit(20)
    .lean();
  return mapId(docs);
}

export async function updateTrack(id: string, input: Partial<CreateTrackInput>) {
  await connectToDatabase();
  const doc = await MusicTrackModel.findOneAndUpdate(
    { _id: id },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapId(doc) : null;
}

// ─── Listening History ────────────────────────────────────────────

export async function createListeningEntry(input: CreateListeningInput) {
  await connectToDatabase();
  const doc = await MusicListeningHistoryModel.create(input);
  return mapId(doc.toObject());
}

export async function getListeningHistory(userId: string, limit = 50, offset = 0) {
  await connectToDatabase();
  const docs = await MusicListeningHistoryModel.find({ userId })
    .sort({ listenedAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean();
  return mapId(docs);
}

export async function getListeningHistoryByDateRange(userId: string, start: Date, end: Date) {
  await connectToDatabase();
  const docs = await MusicListeningHistoryModel.find({
    userId,
    listenedAt: { $gte: start, $lte: end },
  })
    .sort({ listenedAt: -1 })
    .lean();
  return mapId(docs);
}

export async function getListeningHistoryByTrack(userId: string, trackId: string) {
  await connectToDatabase();
  const docs = await MusicListeningHistoryModel.find({ userId, trackId })
    .sort({ listenedAt: -1 })
    .lean();
  return mapId(docs);
}

// ─── Journal ──────────────────────────────────────────────────────

export async function createJournalEntry(input: CreateJournalInput) {
  await connectToDatabase();
  const doc = await MusicJournalModel.create(input);
  return mapId(doc.toObject());
}

export async function getJournalEntryById(id: string, userId: string) {
  await connectToDatabase();
  const doc = await MusicJournalModel.findOne({ _id: id, userId }).lean();
  return doc ? mapId(doc) : null;
}

export async function getJournalEntries(userId: string, limit = 50, offset = 0) {
  await connectToDatabase();
  const docs = await MusicJournalModel.find({ userId })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean();
  return mapId(docs);
}

export async function getJournalEntriesByTrack(userId: string, trackId: string) {
  await connectToDatabase();
  const docs = await MusicJournalModel.find({ userId, trackId })
    .sort({ createdAt: -1 })
    .lean();
  return mapId(docs);
}

export async function updateJournalEntry(id: string, userId: string, input: Partial<CreateJournalInput>) {
  await connectToDatabase();
  const doc = await MusicJournalModel.findOneAndUpdate(
    { _id: id, userId },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapId(doc) : null;
}

export async function deleteJournalEntry(id: string, userId: string) {
  await connectToDatabase();
  const doc = await MusicJournalModel.findOneAndDelete({ _id: id, userId }).lean();
  return doc ? mapId(doc) : null;
}

// ─── Memories ─────────────────────────────────────────────────────

export async function createMemory(input: CreateMemoryInput) {
  await connectToDatabase();
  const doc = await MusicMemoryModel.create(input);
  return mapId(doc.toObject());
}

export async function getMemories(userId: string, limit = 50, offset = 0) {
  await connectToDatabase();
  const docs = await MusicMemoryModel.find({ userId })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean();
  return mapId(docs);
}

export async function getMemoryById(id: string, userId: string) {
  await connectToDatabase();
  const doc = await MusicMemoryModel.findOne({ _id: id, userId }).lean();
  return doc ? mapId(doc) : null;
}

export async function getMemoriesByTrack(userId: string, trackId: string) {
  await connectToDatabase();
  const docs = await MusicMemoryModel.find({ userId, trackId })
    .sort({ createdAt: -1 })
    .lean();
  return mapId(docs);
}

export async function getMemoriesByEvent(userId: string, linkedEventId: string) {
  await connectToDatabase();
  const docs = await MusicMemoryModel.find({ userId, linkedEventId })
    .sort({ createdAt: -1 })
    .lean();
  return mapId(docs);
}

export async function deleteMemory(id: string, userId: string) {
  await connectToDatabase();
  const doc = await MusicMemoryModel.findOneAndDelete({ _id: id, userId }).lean();
  return doc ? mapId(doc) : null;
}

// ─── Ratings ──────────────────────────────────────────────────────

export async function createRating(input: CreateRatingInput) {
  await connectToDatabase();
  const doc = await MusicRatingModel.create(input);
  return mapId(doc.toObject());
}

export async function getRatingByEntity(userId: string, entityType: string, entityId: string) {
  await connectToDatabase();
  const doc = await MusicRatingModel.findOne({ userId, entityType, entityId }).lean();
  return doc ? mapId(doc) : null;
}

export async function getRatingsByUser(userId: string, limit = 50, offset = 0) {
  await connectToDatabase();
  const docs = await MusicRatingModel.find({ userId })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean();
  return mapId(docs);
}

export async function getRatingsByType(userId: string, entityType: string) {
  await connectToDatabase();
  const docs = await MusicRatingModel.find({ userId, entityType })
    .sort({ score: -1 })
    .lean();
  return mapId(docs);
}

export async function updateRating(id: string, userId: string, input: { score?: number; review?: string }) {
  await connectToDatabase();
  const doc = await MusicRatingModel.findOneAndUpdate(
    { _id: id, userId },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapId(doc) : null;
}

export async function deleteRating(id: string, userId: string) {
  await connectToDatabase();
  const doc = await MusicRatingModel.findOneAndDelete({ _id: id, userId }).lean();
  return doc ? mapId(doc) : null;
}

// ─── Favorites ────────────────────────────────────────────────────

export async function createFavorite(input: CreateFavoriteInput) {
  await connectToDatabase();
  const doc = await MusicFavoriteModel.create(input);
  return mapId(doc.toObject());
}

export async function getFavorites(userId: string) {
  await connectToDatabase();
  const docs = await MusicFavoriteModel.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
  return mapId(docs);
}

export async function getFavoritesByType(userId: string, entityType: string) {
  await connectToDatabase();
  const docs = await MusicFavoriteModel.find({ userId, entityType })
    .sort({ createdAt: -1 })
    .lean();
  return mapId(docs);
}

export async function isFavorite(userId: string, entityType: string, entityId: string) {
  await connectToDatabase();
  const doc = await MusicFavoriteModel.findOne({ userId, entityType, entityId }).lean();
  return !!doc;
}

export async function deleteFavorite(userId: string, entityType: string, entityId: string) {
  await connectToDatabase();
  const doc = await MusicFavoriteModel.findOneAndDelete({ userId, entityType, entityId }).lean();
  return doc ? mapId(doc) : null;
}

// ─── Collections ──────────────────────────────────────────────────

export async function createCollection(input: CreateCollectionInput) {
  await connectToDatabase();
  const doc = await MusicCollectionModel.create(input);
  return mapId(doc.toObject());
}

export async function getCollections(userId: string) {
  await connectToDatabase();
  const docs = await MusicCollectionModel.find({ userId, deletedAt: null })
    .sort({ title: 1 })
    .lean();
  return mapId(docs);
}

export async function getCollectionById(id: string, userId: string) {
  await connectToDatabase();
  const doc = await MusicCollectionModel.findOne({ _id: id, userId, deletedAt: null }).lean();
  return doc ? mapId(doc) : null;
}

export async function updateCollection(id: string, userId: string, input: Partial<CreateCollectionInput>) {
  await connectToDatabase();
  const doc = await MusicCollectionModel.findOneAndUpdate(
    { _id: id, userId },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapId(doc) : null;
}

export async function deleteCollection(id: string, userId: string) {
  await connectToDatabase();
  const doc = await MusicCollectionModel.findOneAndUpdate(
    { _id: id, userId },
    { deletedAt: new Date(), updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapId(doc) : null;
}

// ─── Collection Items ─────────────────────────────────────────────

async function getUserCollectionIds(userId: string): Promise<string[]> {
  const cols = await MusicCollectionModel.find({ userId }, { _id: 1 }).lean();
  return cols.map((c: any) => c._id.toString());
}

export async function addCollectionItem(input: CreateCollectionItemInput, userId: string) {
  await connectToDatabase();
  const col = await MusicCollectionModel.findOne({ _id: input.collectionId, userId }).lean();
  if (!col) return null;
  const doc = await MusicCollectionItemModel.create(input);
  return mapId(doc.toObject());
}

export async function getCollectionItems(collectionId: string, userId: string) {
  await connectToDatabase();
  const colIds = await getUserCollectionIds(userId);
  if (!colIds.includes(collectionId)) return [];
  const docs = await MusicCollectionItemModel.find({ collectionId })
    .sort({ position: 1 })
    .lean();
  return mapId(docs);
}

export async function getCollectionItemsForEntity(
  userId: string,
  entityType: string,
  entityId: string,
) {
  await connectToDatabase();
  const colIds = await getUserCollectionIds(userId);
  if (colIds.length === 0) return [];
  const docs = await MusicCollectionItemModel.find({
    entityType,
    entityId,
    collectionId: { $in: colIds },
  }).lean();
  return mapId(docs);
}

export async function removeCollectionItem(id: string, userId: string) {
  await connectToDatabase();
  const colIds = await getUserCollectionIds(userId);
  if (colIds.length === 0) return null;
  const doc = await MusicCollectionItemModel.findOneAndDelete({
    _id: id,
    collectionId: { $in: colIds },
  }).lean();
  return doc ? mapId(doc) : null;
}

export async function evaluateSmartFilter(userId: string, filter: Record<string, unknown>) {
  const type = filter.type as string | undefined;

  if (type === "most-listened") {
    await connectToDatabase();
    const period = (filter.period as string) ?? "month";
    const daysAgo = period === "week" ? 7 : period === "year" ? 365 : 30;
    const since = new Date(Date.now() - daysAgo * 86400000);

    const rows = await MusicListeningHistoryModel.aggregate([
      { $match: { userId, listenedAt: { $gte: since } } },
      { $group: { _id: "$trackId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: (filter.limit as number) ?? 20 },
    ]);

    return rows
      .filter((r: any) => r._id)
      .map((r: any) => ({
        entityType: "track" as const,
        entityId: r._id.toString(),
      }));
  }

  if (type === "highest-rated") {
    await connectToDatabase();
    const minScore = (filter.minScore as number) ?? 8;
    const docs = await MusicRatingModel.find({ userId, score: { $gte: minScore } })
      .limit((filter.limit as number) ?? 20)
      .lean();
    return docs.map((d: any) => ({
      entityType: d.entityType,
      entityId: d.entityId,
    }));
  }

  return [];
}

export async function reorderCollectionItem(id: string, position: number) {
  await connectToDatabase();
  const doc = await MusicCollectionItemModel.findOneAndUpdate(
    { _id: id },
    { position },
    { new: true },
  ).lean();
  return doc ? mapId(doc) : null;
}

// ─── Goal Config ──────────────────────────────────────────────────

export async function createGoalConfig(input: CreateGoalConfigInput) {
  await connectToDatabase();
  const doc = await MusicGoalConfigModel.create(input);
  return mapId(doc.toObject());
}

export async function getGoalConfigs(userId: string) {
  await connectToDatabase();
  const docs = await MusicGoalConfigModel.find({ userId }).lean();
  return mapId(docs);
}

export async function getGoalConfigByGoalId(userId: string, goalId: string) {
  await connectToDatabase();
  const doc = await MusicGoalConfigModel.findOne({ userId, goalId }).lean();
  return doc ? mapId(doc) : null;
}

export async function updateGoalConfig(id: string, userId: string, input: Partial<CreateGoalConfigInput>) {
  await connectToDatabase();
  const doc = await MusicGoalConfigModel.findOneAndUpdate(
    { _id: id, userId },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapId(doc) : null;
}

export async function incrementGoalCount(id: string, userId: string, amount = 1) {
  await connectToDatabase();
  const doc = await MusicGoalConfigModel.findOneAndUpdate(
    { _id: id, userId },
    { $inc: { currentCount: amount }, updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapId(doc) : null;
}

export async function deleteGoalConfig(id: string, userId: string) {
  await connectToDatabase();
  const doc = await MusicGoalConfigModel.findOneAndDelete({ _id: id, userId }).lean();
  return doc ? mapId(doc) : null;
}

// ─── Analytics Queries ────────────────────────────────────────────

export async function getMostListenedArtists(userId: string, limit = 10) {
  await connectToDatabase();
  const rows = await MusicListeningHistoryModel.aggregate([
    { $match: { userId } },
    {
      $lookup: {
        from: "musictracks",
        localField: "trackId",
        foreignField: "_id",
        as: "track",
      },
    },
    { $unwind: { path: "$track", preserveNullAndEmptyArrays: false } },
    { $group: { _id: "$track.artistId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);
  return rows.map((r: any) => ({
    artistId: r._id.toString(),
    count: r.count,
  }));
}

export async function getListeningStreaks(userId: string, lookbackDays = 400) {
  await connectToDatabase();
  const since = new Date();
  since.setDate(since.getDate() - lookbackDays);

  const rows = await MusicListeningHistoryModel.aggregate([
    { $match: { userId, listenedAt: { $gte: since } } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$listenedAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
  ]);
  return rows.map((r: any) => ({
    date: r._id,
    count: r.count,
  }));
}

export async function getTotalListeningHours(userId: string) {
  await connectToDatabase();
  const rows = await MusicListeningHistoryModel.aggregate([
    { $match: { userId } },
    { $group: { _id: null, totalSeconds: { $sum: { $ifNull: ["$duration", 0] } } } },
  ]);
  return ((rows[0]?.totalSeconds ?? 0) as number) / 3600;
}

export async function getYearlyListeningStats(userId: string, year: number) {
  await connectToDatabase();
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);

  const rows = await MusicListeningHistoryModel.aggregate([
    { $match: { userId, listenedAt: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: { $month: "$listenedAt" },
        count: { $sum: 1 },
        totalDuration: { $sum: { $ifNull: ["$duration", 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return rows.map((r: any) => ({
    month: r._id,
    count: r.count,
    totalDuration: r.totalDuration,
  }));
}

// ─── Notes ─────────────────────────────────────────────────────────

export async function createNote(input: CreateNoteInput) {
  await connectToDatabase();
  const doc = await MusicNoteModel.create(input);
  return mapId(doc.toObject());
}

export async function getNotesByEntity(userId: string, entityType: string, entityId: string) {
  await connectToDatabase();
  const docs = await MusicNoteModel.find({ userId, entityType, entityId, deletedAt: null })
    .sort({ createdAt: -1 })
    .lean();
  return mapId(docs);
}

export async function getNoteById(id: string, userId: string) {
  await connectToDatabase();
  const doc = await MusicNoteModel.findOne({ _id: id, userId, deletedAt: null }).lean();
  return doc ? mapId(doc) : null;
}

export async function updateNote(id: string, userId: string, input: { content: string }) {
  await connectToDatabase();
  const doc = await MusicNoteModel.findOneAndUpdate(
    { _id: id, userId },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapId(doc) : null;
}

export async function deleteNote(id: string, userId: string) {
  await connectToDatabase();
  const doc = await MusicNoteModel.findOneAndUpdate(
    { _id: id, userId },
    { deletedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapId(doc) : null;
}

// ─── Journal Songs (junction) ─────────────────────────────────────

export async function addSongToJournal(input: CreateJournalSongInput) {
  await connectToDatabase();
  const doc = await MusicJournalSongModel.create(input);
  return mapId(doc.toObject());
}

export async function getJournalSongs(journalId: string) {
  await connectToDatabase();
  const docs = await MusicJournalSongModel.find({ journalId })
    .sort({ position: 1 })
    .lean();
  return mapId(docs);
}

export async function removeSongFromJournal(id: string) {
  await connectToDatabase();
  const doc = await MusicJournalSongModel.findOneAndDelete({ _id: id }).lean();
  return doc ? mapId(doc) : null;
}

// ─── Mood Entries ─────────────────────────────────────────────────

export async function createMoodEntry(input: CreateMoodEntryInput) {
  await connectToDatabase();
  const doc = await MusicMoodEntryModel.create(input);
  return mapId(doc.toObject());
}

export async function getMoodEntries(
  userId: string,
  options?: { dateFrom?: Date; dateTo?: Date; limit?: number; offset?: number },
) {
  await connectToDatabase();
  const filter: any = { userId };
  if (options?.dateFrom || options?.dateTo) {
    filter.date = {};
    if (options.dateFrom) filter.date.$gte = options.dateFrom;
    if (options.dateTo) filter.date.$lte = options.dateTo;
  }
  const docs = await MusicMoodEntryModel.find(filter)
    .sort({ date: -1 })
    .skip(options?.offset ?? 0)
    .limit(options?.limit ?? 50)
    .lean();
  return mapId(docs);
}

export async function getMoodAnalytics(userId: string, days = 90) {
  await connectToDatabase();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const rows = await MusicMoodEntryModel.aggregate([
    { $match: { userId, date: { $gte: since } } },
    { $group: { _id: "$mood", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  return rows.map((r: any) => ({
    mood: r._id,
    count: r.count,
  }));
}

// ─── Enhanced Memories ────────────────────────────────────────────

export async function updateMemory(
  id: string,
  userId: string,
  input: Partial<CreateMemoryInput>,
) {
  await connectToDatabase();
  const doc = await MusicMemoryModel.findOneAndUpdate(
    { _id: id, userId },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapId(doc) : null;
}

export async function getMemoriesByDateRange(
  userId: string,
  dateFrom: Date,
  dateTo: Date,
) {
  await connectToDatabase();
  const docs = await MusicMemoryModel.find({
    userId,
    memoryDate: { $gte: dateFrom, $lte: dateTo },
  })
    .sort({ memoryDate: -1 })
    .lean();
  return mapId(docs);
}

export async function getMemoriesByMood(userId: string, mood: string) {
  await connectToDatabase();
  const docs = await MusicMemoryModel.find({ userId, mood })
    .sort({ createdAt: -1 })
    .lean();
  return mapId(docs);
}

export async function getMemoriesOnThisDay(userId: string, month: number, day: number) {
  await connectToDatabase();
  const docs = await MusicMemoryModel.find({
    userId,
    memoryDate: { $ne: null },
  }).lean();
  const filtered = docs.filter((d: any) => {
    if (!d.memoryDate) return false;
    const dt = new Date(d.memoryDate);
    return dt.getMonth() + 1 === month && dt.getDate() === day;
  });
  return mapId(filtered).sort((a: any, b: any) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

// ─── Library ────────────────────────────────────────────────────────

export async function addToLibrary(input: CreateLibraryInput) {
  await connectToDatabase();
  const doc = await MusicLibraryModel.create(input);
  return mapId(doc.toObject());
}

export async function getLibrary(userId: string, limit = 100, offset = 0) {
  await connectToDatabase();
  const docs = await MusicLibraryModel.find({ userId })
    .sort({ addedAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean();
  return mapId(docs);
}

export async function removeFromLibrary(id: string, userId: string) {
  await connectToDatabase();
  const doc = await MusicLibraryModel.findOneAndDelete({ _id: id, userId }).lean();
  return doc ? mapId(doc) : null;
}

export async function removeTrackFromLibrary(userId: string, trackId: string) {
  await connectToDatabase();
  const doc = await MusicLibraryModel.findOneAndDelete({ userId, trackId }).lean();
  return doc ? mapId(doc) : null;
}

export async function isInLibrary(userId: string, trackId: string) {
  await connectToDatabase();
  const doc = await MusicLibraryModel.findOne({ userId, trackId }).lean();
  return !!doc;
}

export async function getLibraryTrackIds(userId: string) {
  await connectToDatabase();
  const docs = await MusicLibraryModel.find({ userId }, { trackId: 1 }).lean();
  return docs.map((r: any) => r.trackId.toString());
}

// ─── Memory Songs (junction) ────────────────────────────────────────

export async function addSongToMemory(input: CreateMemorySongInput) {
  await connectToDatabase();
  const doc = await MusicMemorySongModel.create(input);
  return mapId(doc.toObject());
}

export async function getMemorySongs(memoryId: string) {
  await connectToDatabase();
  const docs = await MusicMemorySongModel.find({ memoryId })
    .sort({ position: 1 })
    .lean();
  return mapId(docs);
}

export async function removeSongFromMemory(id: string) {
  await connectToDatabase();
  const doc = await MusicMemorySongModel.findOneAndDelete({ _id: id }).lean();
  return doc ? mapId(doc) : null;
}

export async function getMemoriesByTrackViaSongs(userId: string, trackId: string) {
  await connectToDatabase();
  const rows = await MusicMemorySongModel.aggregate([
    { $match: { trackId } },
    {
      $lookup: {
        from: "musicmemories",
        localField: "memoryId",
        foreignField: "_id",
        as: "memory",
      },
    },
    { $unwind: { path: "$memory", preserveNullAndEmptyArrays: false } },
    { $match: { "memory.userId": userId } },
    { $project: { memoryId: 1 } },
  ]);
  return rows.map((r: any) => ({
    memoryId: r.memoryId.toString(),
  }));
}
