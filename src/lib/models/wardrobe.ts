import mongoose, { Schema, Document, Types } from "mongoose";

export interface IClothingItem extends Document {
  _id: Types.ObjectId;
  userId: string;
  name: string;
  category: string;
  subcategory?: string;
  brand?: string;
  color?: string;
  size?: string;
  condition: string;
  season: string[];
  purchaseDate?: Date;
  purchasePrice?: number;
  wherePurchased?: string;
  isFavorite: boolean;
  isArchived: boolean;
  tags: string[];
  notes?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ClothingItemSchema = new Schema<IClothingItem>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true, index: true },
    subcategory: { type: String },
    brand: { type: String },
    color: { type: String },
    size: { type: String },
    condition: { type: String, default: "good" },
    season: { type: [String], default: [] },
    purchaseDate: { type: Date },
    purchasePrice: { type: Number },
    wherePurchased: { type: String },
    isFavorite: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    notes: { type: String },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export interface IClothingImage extends Document {
  _id: Types.ObjectId;
  itemId: Types.ObjectId;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const ClothingImageSchema = new Schema<IClothingImage>(
  {
    itemId: { type: Schema.Types.ObjectId, ref: "ClothingItem", required: true, index: true },
    url: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export interface IOutfit extends Document {
  _id: Types.ObjectId;
  userId: string;
  name: string;
  occasion?: string;
  mood?: string;
  notes?: string;
  isFavorite: boolean;
  timesWorn: number;
  lastWornAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OutfitSchema = new Schema<IOutfit>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    occasion: { type: String },
    mood: { type: String },
    notes: { type: String },
    isFavorite: { type: Boolean, default: false },
    timesWorn: { type: Number, default: 0 },
    lastWornAt: { type: Date },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export interface IOutfitItem extends Document {
  _id: Types.ObjectId;
  outfitId: Types.ObjectId;
  itemId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OutfitItemSchema = new Schema<IOutfitItem>(
  {
    outfitId: { type: Schema.Types.ObjectId, ref: "Outfit", required: true, index: true },
    itemId: { type: Schema.Types.ObjectId, ref: "ClothingItem", required: true, index: true },
  },
  { timestamps: true }
);

OutfitItemSchema.index({ outfitId: 1, itemId: 1 }, { unique: true });

export interface IWearHistory extends Document {
  _id: Types.ObjectId;
  userId: string;
  itemId: Types.ObjectId;
  outfitId?: Types.ObjectId;
  wornAt: Date;
  location?: string;
  weather?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WearHistorySchema = new Schema<IWearHistory>(
  {
    userId: { type: String, required: true, index: true },
    itemId: { type: Schema.Types.ObjectId, ref: "ClothingItem", required: true, index: true },
    outfitId: { type: Schema.Types.ObjectId, ref: "Outfit" },
    wornAt: { type: Date, default: Date.now },
    location: { type: String },
    weather: { type: String },
  },
  { timestamps: true }
);

export interface ILaundryItem extends Document {
  _id: Types.ObjectId;
  userId: string;
  itemId: Types.ObjectId;
  status: string;
  addedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LaundryItemSchema = new Schema<ILaundryItem>(
  {
    userId: { type: String, required: true, index: true },
    itemId: { type: Schema.Types.ObjectId, ref: "ClothingItem", required: true, index: true },
    status: { type: String, default: "ready" },
    addedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export interface IWishlistItem extends Document {
  _id: Types.ObjectId;
  userId: string;
  name: string;
  category?: string;
  brand?: string;
  estimatedPrice?: number;
  url?: string;
  priority: string;
  notes?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistItemSchema = new Schema<IWishlistItem>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    category: { type: String },
    brand: { type: String },
    estimatedPrice: { type: Number },
    url: { type: String },
    priority: { type: String, default: "medium" },
    notes: { type: String },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export interface IPackingList extends Document {
  _id: Types.ObjectId;
  userId: string;
  name: string;
  tripId?: string;
  destination?: string;
  startDate?: Date;
  endDate?: Date;
  isComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PackingListSchema = new Schema<IPackingList>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    tripId: { type: String },
    destination: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    isComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface IPackingListItem extends Document {
  _id: Types.ObjectId;
  packingListId: Types.ObjectId;
  name: string;
  isPacked: boolean;
  category?: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const PackingListItemSchema = new Schema<IPackingListItem>(
  {
    packingListId: { type: Schema.Types.ObjectId, ref: "PackingList", required: true, index: true },
    name: { type: String, required: true },
    isPacked: { type: Boolean, default: false },
    category: { type: String },
    quantity: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export interface IWardrobeTag extends Document {
  _id: Types.ObjectId;
  userId: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const WardrobeTagSchema = new Schema<IWardrobeTag>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    color: { type: String, default: "blue" },
  },
  { timestamps: true }
);

WardrobeTagSchema.index({ userId: 1, name: 1 }, { unique: true });

export interface IWardrobeItemTag extends Document {
  _id: Types.ObjectId;
  itemId: Types.ObjectId;
  tagId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WardrobeItemTagSchema = new Schema<IWardrobeItemTag>(
  {
    itemId: { type: Schema.Types.ObjectId, ref: "ClothingItem", required: true, index: true },
    tagId: { type: Schema.Types.ObjectId, ref: "WardrobeTag", required: true, index: true },
  },
  { timestamps: true }
);

WardrobeItemTagSchema.index({ itemId: 1, tagId: 1 }, { unique: true });

export const ClothingItemModel =
  mongoose.models.ClothingItem || mongoose.model<IClothingItem>("ClothingItem", ClothingItemSchema);
export const ClothingImageModel =
  mongoose.models.ClothingImage || mongoose.model<IClothingImage>("ClothingImage", ClothingImageSchema);
export const OutfitModel =
  mongoose.models.Outfit || mongoose.model<IOutfit>("Outfit", OutfitSchema);
export const OutfitItemModel =
  mongoose.models.OutfitItem || mongoose.model<IOutfitItem>("OutfitItem", OutfitItemSchema);
export const WearHistoryModel =
  mongoose.models.WearHistory || mongoose.model<IWearHistory>("WearHistory", WearHistorySchema);
export const LaundryItemModel =
  mongoose.models.LaundryItem || mongoose.model<ILaundryItem>("LaundryItem", LaundryItemSchema);
export const WishlistItemModel =
  mongoose.models.WishlistItem || mongoose.model<IWishlistItem>("WishlistItem", WishlistItemSchema);
export const PackingListModel =
  mongoose.models.PackingList || mongoose.model<IPackingList>("PackingList", PackingListSchema);
export const PackingListItemModel =
  mongoose.models.PackingListItem || mongoose.model<IPackingListItem>("PackingListItem", PackingListItemSchema);
export const WardrobeTagModel =
  mongoose.models.WardrobeTag || mongoose.model<IWardrobeTag>("WardrobeTag", WardrobeTagSchema);
export const WardrobeItemTagModel =
  mongoose.models.WardrobeItemTag || mongoose.model<IWardrobeItemTag>("WardrobeItemTag", WardrobeItemTagSchema);
