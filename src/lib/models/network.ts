import mongoose, { Schema, Document, Types } from "mongoose";

export interface IConnection extends Document {
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
  relationshipTypes: string[];
  notes?: string;
  isFavorite: boolean;
  firstMetDate?: Date;
  friendshipAnniversary?: Date;
  lastMetDate?: Date;
  lastCallDate?: Date;
  lastMessageDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConnectionSchema = new Schema<IConnection>(
  {
    userId: { type: String, required: true, index: true },
    fullName: { type: String, required: true },
    nickname: { type: String },
    profilePictureUrl: { type: String },
    gender: { type: String },
    birthday: { type: Date },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    country: { type: String },
    city: { type: String },
    occupation: { type: String },
    socialLinks: { type: Schema.Types.Mixed },
    relationshipTypes: { type: [String], default: [] },
    notes: { type: String },
    isFavorite: { type: Boolean, default: false },
    firstMetDate: { type: Date },
    friendshipAnniversary: { type: Date },
    lastMetDate: { type: Date },
    lastCallDate: { type: Date },
    lastMessageDate: { type: Date },
  },
  { timestamps: true }
);

ConnectionSchema.index({ userId: 1, isFavorite: 1 });

export interface INetworkMemory extends Document {
  userId: string;
  title: string;
  description?: string;
  photoUrls: string[];
  videoUrls: string[];
  audioUrl?: string;
  quotes?: string;
  memoryDate?: Date;
  location?: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NetworkMemorySchema = new Schema<INetworkMemory>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    photoUrls: { type: [String], default: [] },
    videoUrls: { type: [String], default: [] },
    audioUrl: { type: String },
    quotes: { type: String },
    memoryDate: { type: Date },
    location: { type: String },
    tags: { type: [String], default: [] },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface INetworkMemoryConnection extends Document {
  memoryId: Types.ObjectId;
  connectionId: Types.ObjectId;
}

const NetworkMemoryConnectionSchema = new Schema<INetworkMemoryConnection>({
  memoryId: { type: Schema.Types.ObjectId, ref: "NetworkMemory", required: true, index: true },
  connectionId: { type: Schema.Types.ObjectId, ref: "Connection", required: true, index: true },
});

NetworkMemoryConnectionSchema.index({ memoryId: 1, connectionId: 1 }, { unique: true });

export interface INetworkMeetup extends Document {
  userId: string;
  title: string;
  date: Date;
  location?: string;
  photos: string[];
  expense?: number;
  notes?: string;
  mood?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NetworkMeetupSchema = new Schema<INetworkMeetup>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    location: { type: String },
    photos: { type: [String], default: [] },
    expense: { type: Number },
    notes: { type: String },
    mood: { type: String },
  },
  { timestamps: true }
);

export interface INetworkMeetupConnection extends Document {
  meetupId: Types.ObjectId;
  connectionId: Types.ObjectId;
}

const NetworkMeetupConnectionSchema = new Schema<INetworkMeetupConnection>({
  meetupId: { type: Schema.Types.ObjectId, ref: "NetworkMeetup", required: true, index: true },
  connectionId: { type: Schema.Types.ObjectId, ref: "Connection", required: true, index: true },
});

NetworkMeetupConnectionSchema.index({ meetupId: 1, connectionId: 1 }, { unique: true });

export interface INetworkEvent extends Document {
  userId: string;
  eventType: string;
  date: Date;
  location?: string;
  photos: string[];
  expense?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NetworkEventSchema = new Schema<INetworkEvent>(
  {
    userId: { type: String, required: true, index: true },
    eventType: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    location: { type: String },
    photos: { type: [String], default: [] },
    expense: { type: Number },
    notes: { type: String },
  },
  { timestamps: true }
);

export interface INetworkEventConnection extends Document {
  eventId: Types.ObjectId;
  connectionId: Types.ObjectId;
}

const NetworkEventConnectionSchema = new Schema<INetworkEventConnection>({
  eventId: { type: Schema.Types.ObjectId, ref: "NetworkEvent", required: true, index: true },
  connectionId: { type: Schema.Types.ObjectId, ref: "Connection", required: true, index: true },
});

NetworkEventConnectionSchema.index({ eventId: 1, connectionId: 1 }, { unique: true });

export interface INetworkGift extends Document {
  userId: string;
  connectionId: Types.ObjectId;
  direction: string;
  giftName: string;
  occasion?: string;
  price?: number;
  date?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NetworkGiftSchema = new Schema<INetworkGift>(
  {
    userId: { type: String, required: true, index: true },
    connectionId: { type: Schema.Types.ObjectId, ref: "Connection", required: true, index: true },
    direction: { type: String, required: true },
    giftName: { type: String, required: true },
    occasion: { type: String },
    price: { type: Number },
    date: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

export const ConnectionModel =
  mongoose.models.Connection || mongoose.model<IConnection>("Connection", ConnectionSchema);
export const NetworkMemoryModel =
  mongoose.models.NetworkMemory || mongoose.model<INetworkMemory>("NetworkMemory", NetworkMemorySchema);
export const NetworkMemoryConnectionModel =
  mongoose.models.NetworkMemoryConnection || mongoose.model<INetworkMemoryConnection>("NetworkMemoryConnection", NetworkMemoryConnectionSchema);
export const NetworkMeetupModel =
  mongoose.models.NetworkMeetup || mongoose.model<INetworkMeetup>("NetworkMeetup", NetworkMeetupSchema);
export const NetworkMeetupConnectionModel =
  mongoose.models.NetworkMeetupConnection || mongoose.model<INetworkMeetupConnection>("NetworkMeetupConnection", NetworkMeetupConnectionSchema);
export const NetworkEventModel =
  mongoose.models.NetworkEvent || mongoose.model<INetworkEvent>("NetworkEvent", NetworkEventSchema);
export const NetworkEventConnectionModel =
  mongoose.models.NetworkEventConnection || mongoose.model<INetworkEventConnection>("NetworkEventConnection", NetworkEventConnectionSchema);
export const NetworkGiftModel =
  mongoose.models.NetworkGift || mongoose.model<INetworkGift>("NetworkGift", NetworkGiftSchema);
