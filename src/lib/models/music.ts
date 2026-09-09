import mongoose, { Schema, Document, Types } from "mongoose";

// ─── MusicArtist ─────────────────────────────────────────────────────────────

export interface IMusicArtist extends Document {
  _id: Types.ObjectId;
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
}

const MusicArtistSchema = new Schema<IMusicArtist>(
  {
    musicBrainzId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    country: { type: String },
    type: { type: String },
    genres: { type: [String], default: [] },
    imageUrl: { type: String },
    spotifyId: { type: String, unique: true, sparse: true },
    spotifyPopularity: { type: Number },
  },
  { timestamps: true }
);

MusicArtistSchema.index({ name: 1 });

// ─── MusicAlbum ──────────────────────────────────────────────────────────────

export interface IMusicAlbum extends Document {
  _id: Types.ObjectId;
  musicBrainzId?: string;
  artistId: Types.ObjectId;
  title: string;
  releaseDate?: Date;
  coverArtUrl?: string;
  totalTracks?: number;
  spotifyId?: string;
  spotifyPopularity?: number;
  label?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MusicAlbumSchema = new Schema<IMusicAlbum>(
  {
    musicBrainzId: { type: String, unique: true, sparse: true },
    artistId: { type: Schema.Types.ObjectId, ref: "MusicArtist", required: true, index: true },
    title: { type: String, required: true },
    releaseDate: { type: Date },
    coverArtUrl: { type: String },
    totalTracks: { type: Number },
    spotifyId: { type: String, unique: true, sparse: true },
    spotifyPopularity: { type: Number },
    label: { type: String },
  },
  { timestamps: true }
);

// ─── MusicTrack ──────────────────────────────────────────────────────────────

export interface IMusicTrack extends Document {
  _id: Types.ObjectId;
  musicBrainzId?: string;
  albumId?: Types.ObjectId;
  artistId: Types.ObjectId;
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
}

const MusicTrackSchema = new Schema<IMusicTrack>(
  {
    musicBrainzId: { type: String, unique: true, sparse: true },
    albumId: { type: Schema.Types.ObjectId, ref: "MusicAlbum", index: true },
    artistId: { type: Schema.Types.ObjectId, ref: "MusicArtist", required: true, index: true },
    title: { type: String, required: true },
    duration: { type: Number },
    trackNumber: { type: Number },
    isrc: { type: String },
    spotifyUri: { type: String },
    spotifyId: { type: String, unique: true, sparse: true },
    spotifyPopularity: { type: Number },
    explicit: { type: Boolean, default: false },
    previewUrl: { type: String },
  },
  { timestamps: true }
);

MusicTrackSchema.index({ albumId: 1 });

// ─── MusicListeningHistory ───────────────────────────────────────────────────

export interface IMusicListeningHistory extends Document {
  _id: Types.ObjectId;
  userId: string;
  trackId?: Types.ObjectId;
  artistName?: string;
  trackName?: string;
  listenedAt: Date;
  duration?: number;
  msPlayed?: number;
  spotifyPlayId?: string;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MusicListeningHistorySchema = new Schema<IMusicListeningHistory>(
  {
    userId: { type: String, required: true, index: true },
    trackId: { type: Schema.Types.ObjectId, ref: "MusicTrack", index: true },
    artistName: { type: String },
    trackName: { type: String },
    listenedAt: { type: Date, default: Date.now },
    duration: { type: Number },
    msPlayed: { type: Number },
    spotifyPlayId: { type: String },
    sessionId: { type: String },
  },
  { timestamps: true }
);

MusicListeningHistorySchema.index({ userId: 1, listenedAt: -1 });

// ─── MusicJournal ────────────────────────────────────────────────────────────

export interface IMusicJournal extends Document {
  _id: Types.ObjectId;
  userId: string;
  trackId?: Types.ObjectId;
  albumId?: Types.ObjectId;
  artistId?: Types.ObjectId;
  mood?: string;
  journalEntry: string;
  photoUrls: string[];
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MusicJournalSchema = new Schema<IMusicJournal>(
  {
    userId: { type: String, required: true, index: true },
    trackId: { type: Schema.Types.ObjectId, ref: "MusicTrack" },
    albumId: { type: Schema.Types.ObjectId, ref: "MusicAlbum" },
    artistId: { type: Schema.Types.ObjectId, ref: "MusicArtist" },
    mood: { type: String },
    journalEntry: { type: String, required: true },
    photoUrls: { type: [String], default: [] },
    location: { type: String },
  },
  { timestamps: true }
);

// ─── MusicJournalSong ────────────────────────────────────────────────────────

export interface IMusicJournalSong extends Document {
  _id: Types.ObjectId;
  journalId: Types.ObjectId;
  trackId?: Types.ObjectId;
  albumId?: Types.ObjectId;
  artistId?: Types.ObjectId;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

const MusicJournalSongSchema = new Schema<IMusicJournalSong>(
  {
    journalId: { type: Schema.Types.ObjectId, ref: "MusicJournal", required: true, index: true },
    trackId: { type: Schema.Types.ObjectId, ref: "MusicTrack" },
    albumId: { type: Schema.Types.ObjectId, ref: "MusicAlbum" },
    artistId: { type: Schema.Types.ObjectId, ref: "MusicArtist" },
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ─── MusicMoodEntry ──────────────────────────────────────────────────────────

export interface IMusicMoodEntry extends Document {
  _id: Types.ObjectId;
  userId: string;
  mood: string;
  note?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MusicMoodEntrySchema = new Schema<IMusicMoodEntry>(
  {
    userId: { type: String, required: true, index: true },
    mood: { type: String, required: true },
    note: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ─── MusicMemory ─────────────────────────────────────────────────────────────

export interface IMusicMemory extends Document {
  _id: Types.ObjectId;
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
}

const MusicMemorySchema = new Schema<IMusicMemory>(
  {
    userId: { type: String, required: true, index: true },
    trackId: { type: String },
    albumId: { type: String },
    artistId: { type: String },
    title: { type: String },
    contextText: { type: String, required: true },
    mood: { type: String },
    photoUrls: { type: [String], default: [] },
    memoryDate: { type: Date },
    linkedEventId: { type: String },
  },
  { timestamps: true }
);

// ─── MusicMemorySong ─────────────────────────────────────────────────────────

export interface IMusicMemorySong extends Document {
  _id: Types.ObjectId;
  memoryId: Types.ObjectId;
  trackId: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

const MusicMemorySongSchema = new Schema<IMusicMemorySong>(
  {
    memoryId: { type: Schema.Types.ObjectId, ref: "MusicMemory", required: true, index: true },
    trackId: { type: String, required: true },
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ─── MusicLibrary ────────────────────────────────────────────────────────────

export interface IMusicLibrary extends Document {
  _id: Types.ObjectId;
  userId: string;
  trackId: Types.ObjectId;
  addedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MusicLibrarySchema = new Schema<IMusicLibrary>(
  {
    userId: { type: String, required: true, index: true },
    trackId: { type: Schema.Types.ObjectId, ref: "MusicTrack", required: true, index: true },
    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

MusicLibrarySchema.index({ userId: 1, trackId: 1 }, { unique: true });

// ─── MusicRating ─────────────────────────────────────────────────────────────

export interface IMusicRating extends Document {
  _id: Types.ObjectId;
  userId: string;
  entityType: string;
  entityId: Types.ObjectId;
  score: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MusicRatingSchema = new Schema<IMusicRating>(
  {
    userId: { type: String, required: true, index: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    score: { type: Number, required: true },
    review: { type: String },
  },
  { timestamps: true }
);

MusicRatingSchema.index({ userId: 1, entityType: 1, entityId: 1 }, { unique: true });

// ─── MusicFavorite ───────────────────────────────────────────────────────────

export interface IMusicFavorite extends Document {
  _id: Types.ObjectId;
  userId: string;
  entityType: string;
  entityId: string;
  createdAt: Date;
  updatedAt: Date;
}

const MusicFavoriteSchema = new Schema<IMusicFavorite>(
  {
    userId: { type: String, required: true, index: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
  },
  { timestamps: true }
);

MusicFavoriteSchema.index({ userId: 1, entityType: 1, entityId: 1 }, { unique: true });

// ─── MusicCollection ─────────────────────────────────────────────────────────

export interface IMusicCollection extends Document {
  _id: Types.ObjectId;
  userId: string;
  title: string;
  description?: string;
  coverArtUrl?: string;
  isSmart: boolean;
  smartFilter?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MusicCollectionSchema = new Schema<IMusicCollection>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    coverArtUrl: { type: String },
    isSmart: { type: Boolean, default: false },
    smartFilter: { type: String },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// ─── MusicCollectionItem ─────────────────────────────────────────────────────

export interface IMusicCollectionItem extends Document {
  _id: Types.ObjectId;
  collectionId: Types.ObjectId;
  entityType: string;
  entityId: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

const MusicCollectionItemSchema = new Schema<IMusicCollectionItem>(
  {
    collectionId: { type: Schema.Types.ObjectId, ref: "MusicCollection", required: true, index: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

MusicCollectionItemSchema.index({ entityId: 1 });

// ─── MusicGoalConfig ─────────────────────────────────────────────────────────

export interface IMusicGoalConfig extends Document {
  _id: Types.ObjectId;
  userId: string;
  goalId: string;
  targetType: string;
  targetValue?: string;
  targetCount?: number;
  currentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const MusicGoalConfigSchema = new Schema<IMusicGoalConfig>(
  {
    userId: { type: String, required: true, index: true },
    goalId: { type: String, required: true },
    targetType: { type: String, required: true },
    targetValue: { type: String },
    targetCount: { type: Number },
    currentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ─── MusicSpotifyToken ───────────────────────────────────────────────────────

export interface IMusicSpotifyToken extends Document {
  _id: Types.ObjectId;
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope?: string;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MusicSpotifyTokenSchema = new Schema<IMusicSpotifyToken>(
  {
    userId: { type: String, required: true, unique: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    scope: { type: String },
    lastSyncedAt: { type: Date },
  },
  { timestamps: true }
);

// ─── MusicNote ───────────────────────────────────────────────────────────────

export interface IMusicNote extends Document {
  _id: Types.ObjectId;
  userId: string;
  entityType: string;
  entityId: string;
  content: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MusicNoteSchema = new Schema<IMusicNote>(
  {
    userId: { type: String, required: true, index: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    content: { type: String, required: true },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

MusicNoteSchema.index({ userId: 1, entityType: 1, entityId: 1 });

// ─── Exports ─────────────────────────────────────────────────────────────────

export const MusicArtistModel =
  mongoose.models.MusicArtist || mongoose.model<IMusicArtist>("MusicArtist", MusicArtistSchema);

export const MusicAlbumModel =
  mongoose.models.MusicAlbum || mongoose.model<IMusicAlbum>("MusicAlbum", MusicAlbumSchema);

export const MusicTrackModel =
  mongoose.models.MusicTrack || mongoose.model<IMusicTrack>("MusicTrack", MusicTrackSchema);

export const MusicListeningHistoryModel =
  mongoose.models.MusicListeningHistory ||
  mongoose.model<IMusicListeningHistory>("MusicListeningHistory", MusicListeningHistorySchema);

export const MusicJournalModel =
  mongoose.models.MusicJournal || mongoose.model<IMusicJournal>("MusicJournal", MusicJournalSchema);

export const MusicJournalSongModel =
  mongoose.models.MusicJournalSong ||
  mongoose.model<IMusicJournalSong>("MusicJournalSong", MusicJournalSongSchema);

export const MusicMoodEntryModel =
  mongoose.models.MusicMoodEntry || mongoose.model<IMusicMoodEntry>("MusicMoodEntry", MusicMoodEntrySchema);

export const MusicMemoryModel =
  mongoose.models.MusicMemory || mongoose.model<IMusicMemory>("MusicMemory", MusicMemorySchema);

export const MusicMemorySongModel =
  mongoose.models.MusicMemorySong ||
  mongoose.model<IMusicMemorySong>("MusicMemorySong", MusicMemorySongSchema);

export const MusicLibraryModel =
  mongoose.models.MusicLibrary || mongoose.model<IMusicLibrary>("MusicLibrary", MusicLibrarySchema);

export const MusicRatingModel =
  mongoose.models.MusicRating || mongoose.model<IMusicRating>("MusicRating", MusicRatingSchema);

export const MusicFavoriteModel =
  mongoose.models.MusicFavorite || mongoose.model<IMusicFavorite>("MusicFavorite", MusicFavoriteSchema);

export const MusicCollectionModel =
  mongoose.models.MusicCollection ||
  mongoose.model<IMusicCollection>("MusicCollection", MusicCollectionSchema);

export const MusicCollectionItemModel =
  mongoose.models.MusicCollectionItem ||
  mongoose.model<IMusicCollectionItem>("MusicCollectionItem", MusicCollectionItemSchema);

export const MusicGoalConfigModel =
  mongoose.models.MusicGoalConfig ||
  mongoose.model<IMusicGoalConfig>("MusicGoalConfig", MusicGoalConfigSchema);

export const MusicSpotifyTokenModel =
  mongoose.models.MusicSpotifyToken ||
  mongoose.model<IMusicSpotifyToken>("MusicSpotifyToken", MusicSpotifyTokenSchema);

export const MusicNoteModel =
  mongoose.models.MusicNote || mongoose.model<IMusicNote>("MusicNote", MusicNoteSchema);
