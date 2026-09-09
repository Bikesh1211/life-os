import mongoose, { Schema, Document, Types } from "mongoose";

// ─── MovieMedia ──────────────────────────────────────────────────────────────

export interface IMovieMedia extends Document {
  _id: Types.ObjectId;
  tmdbId: string;
  mediaType: string;
  title: string;
  overview?: string;
  posterPath?: string;
  backdropPath?: string;
  releaseDate?: Date;
  genres: string[];
  voteAverage?: number;
  runtime?: number;
  episodeRuntime?: number;
  seasons?: number;
  episodes?: number;
  createdAt: Date;
  updatedAt: Date;
}

const MovieMediaSchema = new Schema<IMovieMedia>(
  {
    tmdbId: { type: String, unique: true },
    mediaType: { type: String, required: true },
    title: { type: String, required: true },
    overview: { type: String },
    posterPath: { type: String },
    backdropPath: { type: String },
    releaseDate: { type: Date },
    genres: { type: [String], default: [] },
    voteAverage: { type: Number },
    runtime: { type: Number },
    episodeRuntime: { type: Number },
    seasons: { type: Number },
    episodes: { type: Number },
  },
  { timestamps: true }
);

MovieMediaSchema.index({ title: 1 });

// ─── MoviePerson ─────────────────────────────────────────────────────────────

export interface IMoviePerson extends Document {
  _id: Types.ObjectId;
  tmdbId: string;
  name: string;
  profilePath?: string;
  knownForDepartment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MoviePersonSchema = new Schema<IMoviePerson>(
  {
    tmdbId: { type: String, unique: true },
    name: { type: String, required: true },
    profilePath: { type: String },
    knownForDepartment: { type: String },
  },
  { timestamps: true }
);

MoviePersonSchema.index({ name: 1 });

// ─── MovieFavorite ───────────────────────────────────────────────────────────

export interface IMovieFavorite extends Document {
  _id: Types.ObjectId;
  userId: string;
  mediaId: string;
  rewatchCount: number;
  personalNotes?: string;
  addedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MovieFavoriteSchema = new Schema<IMovieFavorite>(
  {
    userId: { type: String, required: true, index: true },
    mediaId: { type: String, required: true },
    rewatchCount: { type: Number, default: 0 },
    personalNotes: { type: String },
    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

MovieFavoriteSchema.index({ userId: 1, mediaId: 1 }, { unique: true });

// ─── MovieRating ─────────────────────────────────────────────────────────────

export interface IMovieRating extends Document {
  _id: Types.ObjectId;
  userId: string;
  mediaId: string;
  score: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MovieRatingSchema = new Schema<IMovieRating>(
  {
    userId: { type: String, required: true, index: true },
    mediaId: { type: String, required: true },
    score: { type: Number, required: true },
    review: { type: String },
  },
  { timestamps: true }
);

MovieRatingSchema.index({ userId: 1, mediaId: 1 }, { unique: true });

// ─── MovieWatchlist ──────────────────────────────────────────────────────────

export interface IMovieWatchlist extends Document {
  _id: Types.ObjectId;
  userId: string;
  mediaId: string;
  status: string;
  priority: string;
  tags: string[];
  notes?: string;
  reminder?: Date;
  currentSeason: number;
  currentEpisode: number;
  totalSeasons?: number;
  totalEpisodes?: number;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MovieWatchlistSchema = new Schema<IMovieWatchlist>(
  {
    userId: { type: String, required: true, index: true },
    mediaId: { type: String, required: true },
    status: { type: String, default: "plan_to_watch" },
    priority: { type: String, default: "medium" },
    tags: { type: [String], default: [] },
    notes: { type: String },
    reminder: { type: Date },
    currentSeason: { type: Number, default: 1 },
    currentEpisode: { type: Number, default: 0 },
    totalSeasons: { type: Number },
    totalEpisodes: { type: Number },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

MovieWatchlistSchema.index({ userId: 1, mediaId: 1 }, { unique: true });

// ─── MovieQuote ──────────────────────────────────────────────────────────────

export interface IMovieQuote extends Document {
  _id: Types.ObjectId;
  userId: string;
  mediaId?: string;
  quote: string;
  character?: string;
  timestamp?: string;
  personalMeaning?: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MovieQuoteSchema = new Schema<IMovieQuote>(
  {
    userId: { type: String, required: true, index: true },
    mediaId: { type: String },
    quote: { type: String, required: true },
    character: { type: String },
    timestamp: { type: String },
    personalMeaning: { type: String },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ─── MovieCollection ─────────────────────────────────────────────────────────

export interface IMovieCollection extends Document {
  _id: Types.ObjectId;
  userId: string;
  name: string;
  description?: string;
  coverUrl?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MovieCollectionSchema = new Schema<IMovieCollection>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    coverUrl: { type: String },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

// ─── MovieCollectionItem ─────────────────────────────────────────────────────

export interface IMovieCollectionItem extends Document {
  _id: Types.ObjectId;
  collectionId: Types.ObjectId;
  mediaId: string;
  position: number;
  addedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MovieCollectionItemSchema = new Schema<IMovieCollectionItem>(
  {
    collectionId: { type: Schema.Types.ObjectId, ref: "MovieCollection", required: true, index: true },
    mediaId: { type: String, required: true },
    position: { type: Number, default: 0 },
    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

MovieCollectionItemSchema.index({ mediaId: 1 });

// ─── MovieMemory ─────────────────────────────────────────────────────────────

export interface IMovieMemory extends Document {
  _id: Types.ObjectId;
  userId: string;
  mediaId?: string;
  title?: string;
  watchedWith?: string;
  location?: string;
  mood?: string;
  contextText: string;
  photoUrls: string[];
  ticketUrls: string[];
  screenshotUrls: string[];
  tags: string[];
  watchDate?: Date;
  linkedEventId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MovieMemorySchema = new Schema<IMovieMemory>(
  {
    userId: { type: String, required: true, index: true },
    mediaId: { type: String },
    title: { type: String },
    watchedWith: { type: String },
    location: { type: String },
    mood: { type: String },
    contextText: { type: String, required: true },
    photoUrls: { type: [String], default: [] },
    ticketUrls: { type: [String], default: [] },
    screenshotUrls: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    watchDate: { type: Date },
    linkedEventId: { type: String },
  },
  { timestamps: true }
);

MovieMemorySchema.index({ watchDate: -1 });

// ─── Exports ─────────────────────────────────────────────────────────────────

export const MovieMediaModel =
  mongoose.models.MovieMedia || mongoose.model<IMovieMedia>("MovieMedia", MovieMediaSchema);

export const MoviePersonModel =
  mongoose.models.MoviePerson || mongoose.model<IMoviePerson>("MoviePerson", MoviePersonSchema);

export const MovieFavoriteModel =
  mongoose.models.MovieFavorite || mongoose.model<IMovieFavorite>("MovieFavorite", MovieFavoriteSchema);

export const MovieRatingModel =
  mongoose.models.MovieRating || mongoose.model<IMovieRating>("MovieRating", MovieRatingSchema);

export const MovieWatchlistModel =
  mongoose.models.MovieWatchlist || mongoose.model<IMovieWatchlist>("MovieWatchlist", MovieWatchlistSchema);

export const MovieQuoteModel =
  mongoose.models.MovieQuote || mongoose.model<IMovieQuote>("MovieQuote", MovieQuoteSchema);

export const MovieCollectionModel =
  mongoose.models.MovieCollection ||
  mongoose.model<IMovieCollection>("MovieCollection", MovieCollectionSchema);

export const MovieCollectionItemModel =
  mongoose.models.MovieCollectionItem ||
  mongoose.model<IMovieCollectionItem>("MovieCollectionItem", MovieCollectionItemSchema);

export const MovieMemoryModel =
  mongoose.models.MovieMemory || mongoose.model<IMovieMemory>("MovieMemory", MovieMemorySchema);
