import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITravelTrip extends Document {
  _id: Types.ObjectId;
  userId: string;
  title: string;
  description?: string;
  destination: string;
  startDate?: Date;
  endDate?: Date;
  status: string;
  coverImage?: string;
  photos: string[];
  budget?: number;
  spent: number;
  rating?: number;
  notes?: string;
  isPublic: boolean;
  tags: string[];
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TravelTripSchema = new Schema<ITravelTrip>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    destination: { type: String, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    status: { type: String, default: "planning" },
    coverImage: { type: String },
    photos: { type: [String], default: [] },
    budget: { type: Number },
    spent: { type: Number, default: 0 },
    rating: { type: Number },
    notes: { type: String },
    isPublic: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export interface ITravelTripDay extends Document {
  _id: Types.ObjectId;
  tripId: Types.ObjectId;
  date: Date;
  dayNumber: number;
  title?: string;
  description?: string;
  activities: Record<string, any>[];
  photos: string[];
  expenses: Record<string, any>[];
  createdAt: Date;
  updatedAt: Date;
}

const TravelTripDaySchema = new Schema<ITravelTripDay>(
  {
    tripId: { type: Schema.Types.ObjectId, ref: "TravelTrip", required: true, index: true },
    date: { type: Date, required: true },
    dayNumber: { type: Number, required: true },
    title: { type: String },
    description: { type: String },
    activities: { type: [{ type: Schema.Types.Mixed }], default: [] },
    photos: { type: [String], default: [] },
    expenses: { type: [{ type: Schema.Types.Mixed }], default: [] },
  },
  { timestamps: true }
);

export interface ITravelWishlist extends Document {
  _id: Types.ObjectId;
  userId: string;
  destination: string;
  description?: string;
  imageUrl?: string;
  priority: string;
  category?: string;
  country?: string;
  estimatedBudget?: number;
  notes?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TravelWishlistSchema = new Schema<ITravelWishlist>(
  {
    userId: { type: String, required: true, index: true },
    destination: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    priority: { type: String, default: "medium" },
    category: { type: String },
    country: { type: String },
    estimatedBudget: { type: Number },
    notes: { type: String },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export interface ITravelVisitedPlace extends Document {
  _id: Types.ObjectId;
  userId: string;
  destination: string;
  country?: string;
  visitedDate?: Date;
  rating?: number;
  review?: string;
  photos: string[];
  notes?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TravelVisitedPlaceSchema = new Schema<ITravelVisitedPlace>(
  {
    userId: { type: String, required: true, index: true },
    destination: { type: String, required: true },
    country: { type: String },
    visitedDate: { type: Date },
    rating: { type: Number },
    review: { type: String },
    photos: { type: [String], default: [] },
    notes: { type: String },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export interface ITravelJournal extends Document {
  _id: Types.ObjectId;
  userId: string;
  tripId?: Types.ObjectId;
  title: string;
  content?: string;
  mood?: string;
  date: Date;
  location?: string;
  photos: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TravelJournalSchema = new Schema<ITravelJournal>(
  {
    userId: { type: String, required: true, index: true },
    tripId: { type: Schema.Types.ObjectId, ref: "TravelTrip" },
    title: { type: String, required: true },
    content: { type: String },
    mood: { type: String },
    date: { type: Date, required: true, index: true },
    location: { type: String },
    photos: { type: [String], default: [] },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface ITravelPhoto extends Document {
  _id: Types.ObjectId;
  userId: string;
  tripId?: Types.ObjectId;
  url: string;
  caption?: string;
  location?: string;
  date?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TravelPhotoSchema = new Schema<ITravelPhoto>(
  {
    userId: { type: String, required: true, index: true },
    tripId: { type: Schema.Types.ObjectId, ref: "TravelTrip" },
    url: { type: String, required: true },
    caption: { type: String },
    location: { type: String },
    date: { type: Date },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export interface ITravelExpense extends Document {
  _id: Types.ObjectId;
  userId: string;
  tripId?: Types.ObjectId;
  category: string;
  amount: number;
  currency: string;
  description?: string;
  date: Date;
  receipt?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TravelExpenseSchema = new Schema<ITravelExpense>(
  {
    userId: { type: String, required: true, index: true },
    tripId: { type: Schema.Types.ObjectId, ref: "TravelTrip" },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "NPR" },
    description: { type: String },
    date: { type: Date, required: true, index: true },
    receipt: { type: String },
  },
  { timestamps: true }
);

export interface ITravelRestaurant extends Document {
  _id: Types.ObjectId;
  userId: string;
  tripId?: Types.ObjectId;
  name: string;
  category?: string;
  cuisine?: string;
  rating?: number;
  priceRange?: string;
  location?: string;
  notes?: string;
  photos: string[];
  dateVisited?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TravelRestaurantSchema = new Schema<ITravelRestaurant>(
  {
    userId: { type: String, required: true, index: true },
    tripId: { type: Schema.Types.ObjectId, ref: "TravelTrip" },
    name: { type: String, required: true },
    category: { type: String },
    cuisine: { type: String },
    rating: { type: Number },
    priceRange: { type: String },
    location: { type: String },
    notes: { type: String },
    photos: { type: [String], default: [] },
    dateVisited: { type: Date },
  },
  { timestamps: true }
);

export const TravelTripModel =
  mongoose.models.TravelTrip || mongoose.model<ITravelTrip>("TravelTrip", TravelTripSchema);
export const TravelTripDayModel =
  mongoose.models.TravelTripDay || mongoose.model<ITravelTripDay>("TravelTripDay", TravelTripDaySchema);
export const TravelWishlistModel =
  mongoose.models.TravelWishlist || mongoose.model<ITravelWishlist>("TravelWishlist", TravelWishlistSchema);
export const TravelVisitedPlaceModel =
  mongoose.models.TravelVisitedPlace ||
  mongoose.model<ITravelVisitedPlace>("TravelVisitedPlace", TravelVisitedPlaceSchema);
export const TravelJournalModel =
  mongoose.models.TravelJournal || mongoose.model<ITravelJournal>("TravelJournal", TravelJournalSchema);
export const TravelPhotoModel =
  mongoose.models.TravelPhoto || mongoose.model<ITravelPhoto>("TravelPhoto", TravelPhotoSchema);
export const TravelExpenseModel =
  mongoose.models.TravelExpense || mongoose.model<ITravelExpense>("TravelExpense", TravelExpenseSchema);
export const TravelRestaurantModel =
  mongoose.models.TravelRestaurant ||
  mongoose.model<ITravelRestaurant>("TravelRestaurant", TravelRestaurantSchema);
