import { connectToDatabase } from "@/lib/mongodb";
import {
  MovieMediaModel,
  MoviePersonModel,
  MovieFavoriteModel,
  MovieRatingModel,
  MovieWatchlistModel,
  MovieQuoteModel,
  MovieCollectionModel,
  MovieCollectionItemModel,
  MovieMemoryModel,
} from "@/lib/models/movies";

// ─── Helpers ──────────────────────────────────────────────────────

function mapId(doc: any): any {
  if (!doc) return doc;
  if (Array.isArray(doc)) return doc.map(mapId);
  const { _id, ...rest } = doc;
  return { id: _id?.toString() ?? rest.id, ...rest };
}

// === REFERENCE DATA ===

export async function upsertMedia(input: {
  tmdbId: string;
  mediaType: string;
  title: string;
  overview?: string;
  posterPath?: string;
  backdropPath?: string;
  releaseDate?: Date;
  genres?: string[];
  voteAverage?: number;
  runtime?: number;
  episodeRuntime?: number;
  seasons?: number;
  episodes?: number;
}) {
  await connectToDatabase();
  const existing = await MovieMediaModel.findOne({ tmdbId: input.tmdbId }).lean();
  if (existing) {
    const doc = await MovieMediaModel.findOneAndUpdate(
      { tmdbId: input.tmdbId },
      { ...input, updatedAt: new Date() },
      { new: true },
    ).lean();
    return mapId(doc);
  }
  const doc = await MovieMediaModel.create(input);
  return mapId(doc.toObject());
}

export async function upsertPerson(input: {
  tmdbId: string;
  name: string;
  profilePath?: string;
  knownForDepartment?: string;
}) {
  await connectToDatabase();
  const existing = await MoviePersonModel.findOne({ tmdbId: input.tmdbId }).lean();
  if (existing) {
    const doc = await MoviePersonModel.findOneAndUpdate(
      { tmdbId: input.tmdbId },
      { ...input, updatedAt: new Date() },
      { new: true },
    ).lean();
    return mapId(doc);
  }
  const doc = await MoviePersonModel.create(input);
  return mapId(doc.toObject());
}

export async function getMediaByTmdbId(tmdbId: string) {
  await connectToDatabase();
  const doc = await MovieMediaModel.findOne({ tmdbId }).lean();
  return doc ? mapId(doc) : null;
}

export async function getMediaByTmdbIds(tmdbIds: string[]) {
  if (tmdbIds.length === 0) return [];
  await connectToDatabase();
  const docs = await MovieMediaModel.find({ tmdbId: { $in: tmdbIds } }).lean();
  return mapId(docs);
}

export async function getPersonByTmdbId(tmdbId: string) {
  await connectToDatabase();
  const doc = await MoviePersonModel.findOne({ tmdbId }).lean();
  return doc ? mapId(doc) : null;
}

export async function searchLocalMedia(query: string, limit = 10) {
  await connectToDatabase();
  const docs = await MovieMediaModel.find({
    title: { $regex: query, $options: "i" },
  })
    .limit(limit)
    .lean();
  return mapId(docs);
}

export async function searchLocalPeople(query: string, limit = 10) {
  await connectToDatabase();
  const docs = await MoviePersonModel.find({
    name: { $regex: query, $options: "i" },
  })
    .limit(limit)
    .lean();
  return mapId(docs);
}

// === FAVORITES ===

export async function addFavorite(userId: string, mediaId: string) {
  await connectToDatabase();
  const doc = await MovieFavoriteModel.create({ userId, mediaId });
  return mapId(doc.toObject());
}

export async function removeFavorite(userId: string, mediaId: string) {
  await connectToDatabase();
  const doc = await MovieFavoriteModel.findOneAndDelete({ userId, mediaId }).lean();
  return doc ? mapId(doc) : null;
}

export async function getFavorites(userId: string) {
  await connectToDatabase();
  const docs = await MovieFavoriteModel.find({ userId })
    .sort({ addedAt: -1 })
    .lean();
  return mapId(docs);
}

export async function getFavoriteByMediaId(userId: string, mediaId: string) {
  await connectToDatabase();
  const doc = await MovieFavoriteModel.findOne({ userId, mediaId }).lean();
  return doc ? mapId(doc) : null;
}

export async function updateFavorite(id: string, userId: string, input: Partial<{ rewatchCount: number; personalNotes: string }>) {
  await connectToDatabase();
  const doc = await MovieFavoriteModel.findOneAndUpdate(
    { _id: id, userId },
    input,
    { new: true },
  ).lean();
  return doc ? mapId(doc) : null;
}

// === RATINGS ===

export async function addRating(userId: string, mediaId: string, score: number, review?: string) {
  await connectToDatabase();
  const doc = await MovieRatingModel.create({ userId, mediaId, score, review: review ?? null });
  return mapId(doc.toObject());
}

export async function getRatings(userId: string) {
  await connectToDatabase();
  const docs = await MovieRatingModel.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
  return mapId(docs);
}

export async function getRatingForMedia(userId: string, mediaId: string) {
  await connectToDatabase();
  const doc = await MovieRatingModel.findOne({ userId, mediaId }).lean();
  return doc ? mapId(doc) : null;
}

// === WATCHLIST ===

export async function addToWatchlist(input: {
  userId: string;
  mediaId: string;
  status?: string;
  priority?: string;
  tags?: string[];
  notes?: string;
  reminder?: Date;
  currentSeason?: number;
  currentEpisode?: number;
  totalSeasons?: number;
  totalEpisodes?: number;
  startedAt?: Date;
  completedAt?: Date;
}) {
  await connectToDatabase();
  const doc = await MovieWatchlistModel.create(input);
  return mapId(doc.toObject());
}

export async function updateWatchlistItem(
  id: string,
  userId: string,
  input: Partial<{
    status: string;
    priority: string;
    tags: string[];
    notes: string;
    reminder: Date;
    currentSeason: number;
    currentEpisode: number;
    totalSeasons: number;
    totalEpisodes: number;
    startedAt: Date;
    completedAt: Date;
  }>,
) {
  await connectToDatabase();
  const doc = await MovieWatchlistModel.findOneAndUpdate(
    { _id: id, userId },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapId(doc) : null;
}

export async function removeFromWatchlist(id: string, userId: string) {
  await connectToDatabase();
  const doc = await MovieWatchlistModel.findOneAndDelete({ _id: id, userId }).lean();
  return doc ? mapId(doc) : null;
}

export async function getWatchlist(userId: string) {
  await connectToDatabase();
  const docs = await MovieWatchlistModel.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
  return mapId(docs);
}

export async function getWatchlistByMediaId(userId: string, mediaId: string) {
  await connectToDatabase();
  const doc = await MovieWatchlistModel.findOne({ userId, mediaId }).lean();
  return doc ? mapId(doc) : null;
}

export async function getWatchlistByStatus(userId: string, status: "plan_to_watch" | "watching" | "completed" | "dropped" | "rewatching") {
  await connectToDatabase();
  const docs = await MovieWatchlistModel.find({ userId, status })
    .sort({ updatedAt: -1 })
    .lean();
  return mapId(docs);
}

// === MEMORIES ===

export async function createMemory(input: {
  userId: string;
  mediaId?: string;
  title?: string;
  watchedWith?: string;
  location?: string;
  mood?: string;
  contextText: string;
  photoUrls?: string[];
  ticketUrls?: string[];
  screenshotUrls?: string[];
  tags?: string[];
  watchDate?: Date;
  linkedEventId?: string;
}) {
  await connectToDatabase();
  const doc = await MovieMemoryModel.create(input);
  return mapId(doc.toObject());
}

export async function getMemories(userId: string, limit = 50, offset = 0) {
  await connectToDatabase();
  const docs = await MovieMemoryModel.find({ userId })
    .sort({ watchDate: -1 })
    .skip(offset)
    .limit(limit)
    .lean();
  return mapId(docs);
}

export async function getMemoryById(id: string, userId: string) {
  await connectToDatabase();
  const doc = await MovieMemoryModel.findOne({ _id: id, userId }).lean();
  return doc ? mapId(doc) : null;
}

export async function updateMemory(
  id: string,
  userId: string,
  input: Partial<{
    mediaId: string;
    title: string;
    watchedWith: string;
    location: string;
    mood: string;
    contextText: string;
    photoUrls: string[];
    ticketUrls: string[];
    screenshotUrls: string[];
    tags: string[];
    watchDate: Date;
    linkedEventId: string;
  }>,
) {
  await connectToDatabase();
  const doc = await MovieMemoryModel.findOneAndUpdate(
    { _id: id, userId },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapId(doc) : null;
}

export async function deleteMemory(id: string, userId: string) {
  await connectToDatabase();
  const doc = await MovieMemoryModel.findOneAndDelete({ _id: id, userId }).lean();
  return doc ? mapId(doc) : null;
}

export async function getMemoriesByDateRange(userId: string, dateFrom: Date, dateTo: Date) {
  await connectToDatabase();
  const docs = await MovieMemoryModel.find({
    userId,
    watchDate: { $gte: dateFrom, $lte: dateTo },
  })
    .sort({ watchDate: -1 })
    .lean();
  return mapId(docs);
}

export async function getMemoriesOnThisDay(userId: string, month: number, day: number) {
  await connectToDatabase();
  const docs = await MovieMemoryModel.find({ userId }).lean();
  const filtered = docs.filter((d: any) => {
    if (!d.watchDate) return false;
    const dt = new Date(d.watchDate);
    return dt.getMonth() + 1 === month && dt.getDate() === day;
  });
  return mapId(filtered).sort((a: any, b: any) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function getMemoriesByMediaId(userId: string, mediaId: string, limit = 20) {
  await connectToDatabase();
  const docs = await MovieMemoryModel.find({ userId, mediaId })
    .sort({ watchDate: -1 })
    .limit(limit)
    .lean();
  return mapId(docs);
}

// === QUOTES ===

export async function createQuote(input: {
  userId: string;
  mediaId?: string;
  quote: string;
  character?: string;
  timestamp?: string;
  personalMeaning?: string;
  isFavorite?: boolean;
}) {
  await connectToDatabase();
  const doc = await MovieQuoteModel.create(input);
  return mapId(doc.toObject());
}

export async function getQuotes(userId: string) {
  await connectToDatabase();
  const docs = await MovieQuoteModel.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
  return mapId(docs);
}

export async function getQuoteById(id: string, userId: string) {
  await connectToDatabase();
  const doc = await MovieQuoteModel.findOne({ _id: id, userId }).lean();
  return doc ? mapId(doc) : null;
}

export async function deleteQuote(id: string, userId: string) {
  await connectToDatabase();
  const doc = await MovieQuoteModel.findOneAndDelete({ _id: id, userId }).lean();
  return doc ? mapId(doc) : null;
}

// === COLLECTIONS ===

export async function createCollection(input: {
  userId: string;
  name: string;
  description?: string;
  coverUrl?: string;
  tags?: string[];
}) {
  await connectToDatabase();
  const doc = await MovieCollectionModel.create(input);
  return mapId(doc.toObject());
}

export async function getCollections(userId: string) {
  await connectToDatabase();
  const docs = await MovieCollectionModel.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
  return mapId(docs);
}

export async function getCollectionById(id: string, userId: string) {
  await connectToDatabase();
  const doc = await MovieCollectionModel.findOne({ _id: id, userId }).lean();
  return doc ? mapId(doc) : null;
}

export async function updateCollection(
  id: string,
  userId: string,
  input: Partial<{ name: string; description: string; coverUrl: string; tags: string[] }>,
) {
  await connectToDatabase();
  const doc = await MovieCollectionModel.findOneAndUpdate(
    { _id: id, userId },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapId(doc) : null;
}

export async function deleteCollection(id: string, userId: string) {
  await connectToDatabase();
  const doc = await MovieCollectionModel.findOneAndDelete({ _id: id, userId }).lean();
  return doc ? mapId(doc) : null;
}

export async function addCollectionItem(collectionId: string, mediaId: string, position = 0) {
  await connectToDatabase();
  const doc = await MovieCollectionItemModel.create({ collectionId, mediaId, position });
  return mapId(doc.toObject());
}

export async function getCollectionItems(collectionId: string) {
  await connectToDatabase();
  const docs = await MovieCollectionItemModel.find({ collectionId })
    .sort({ position: 1 })
    .lean();
  return mapId(docs);
}

export async function removeCollectionItem(id: string) {
  await connectToDatabase();
  const doc = await MovieCollectionItemModel.findOneAndDelete({ _id: id }).lean();
  return doc ? mapId(doc) : null;
}

// === DASHBOARD / STATS ===

export async function getDashboardStats(userId: string) {
  await connectToDatabase();
  const [favCount, memCount, watchCount, quoteCount, colCount] = await Promise.all([
    MovieFavoriteModel.countDocuments({ userId }),
    MovieMemoryModel.countDocuments({ userId }),
    MovieWatchlistModel.countDocuments({ userId, status: "completed" }),
    MovieQuoteModel.countDocuments({ userId }),
    MovieCollectionModel.countDocuments({ userId }),
  ]);

  return {
    totalFavorites: favCount,
    totalMemories: memCount,
    totalCompleted: watchCount,
    totalQuotes: quoteCount,
    totalCollections: colCount,
  };
}

export async function getRatingsStats(userId: string) {
  await connectToDatabase();
  const rows = await MovieRatingModel.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        average: { $avg: "$score" },
      },
    },
  ]);
  if (rows.length === 0) return { count: 0, average: 0 };
  return {
    count: rows[0].count,
    average: Math.round(rows[0].average * 10) / 10,
  };
}

export async function getWatchlistStats(userId: string) {
  await connectToDatabase();
  const rows = await MovieWatchlistModel.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
        watching: {
          $sum: { $cond: [{ $eq: ["$status", "watching"] }, 1, 0] },
        },
      },
    },
  ]);
  if (rows.length === 0) return { total: 0, completed: 0, watching: 0 };
  return {
    total: rows[0].total,
    completed: rows[0].completed,
    watching: rows[0].watching,
  };
}

export async function countMemories(userId: string) {
  await connectToDatabase();
  return MovieMemoryModel.countDocuments({ userId });
}

export async function countFavorites(userId: string) {
  await connectToDatabase();
  return MovieFavoriteModel.countDocuments({ userId });
}

export async function getMoviesWatchedPerMonth(userId: string) {
  await connectToDatabase();
  const rows = await MovieMemoryModel.aggregate([
    { $match: { userId, watchDate: { $ne: null } } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m", date: "$watchDate" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return rows.map((r: any) => ({
    month: r._id,
    count: r.count,
  }));
}
