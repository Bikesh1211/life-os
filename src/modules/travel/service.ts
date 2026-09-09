import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import {
  TravelTripModel,
  TravelWishlistModel,
  TravelVisitedPlaceModel,
  TravelJournalModel,
  TravelPhotoModel,
  TravelExpenseModel,
  TravelRestaurantModel,
} from "@/lib/models/travel";
import { createTimelineEvent } from "@/modules/timeline";

const isoDate = z.string().datetime().optional().nullable();

/**
 * The Explore Mode vocabulary, shared by a trip, a visited place and a wishlist
 * row. Declared once here for the same reason it is one enum on the database:
 * a category that means something different on a trip than on a place cannot be
 * filtered across both.
 */
const travelCategory = z.enum([
  "beach", "mountains", "historical", "food", "adventure", "nature", "city", "spiritual",
]);
const travelDifficulty = z.enum(["easy", "moderate", "hard", "extreme"]);
const planningStatus = z.enum(["planned", "researching", "ready"]);

/** A real coordinate, or nothing. Out-of-range values are rejected rather than
    clamped: a place at latitude 400 is a typo, and putting it on the equator
    would be the archive inventing a position it was never given. */
const latitude = z.number().min(-90).max(90).optional().nullable();
const longitude = z.number().min(-180).max(180).optional().nullable();

export const createTripSchema = z.object({
  title: z.string().min(1).max(300),
  destination: z.string().min(1).max(300),
  country: z.string().max(100).optional().nullable(),
  coverImage: z.string().max(2000).optional().nullable(),
  startDate: isoDate,
  endDate: isoDate,
  status: z.enum(["planning", "booked", "in_progress", "completed", "cancelled"]).default("planning"),
  budget: z.number().int().optional().nullable(),
  currency: z.string().max(10).default("USD"),
  travelers: z.number().int().default(1),
  notes: z.string().optional().nullable(),
  /* Explore Mode — the expedition reading of a trip. */
  category: travelCategory.optional().nullable(),
  distanceKm: z.number().int().nonnegative().optional().nullable(),
  elevationM: z.number().int().optional().nullable(),
  transportation: z.string().max(200).optional().nullable(),
  difficulty: travelDifficulty.optional().nullable(),
  gallery: z.array(z.string().max(2000)).optional(),
  featured: z.boolean().optional(),
});
export const updateTripSchema = createTripSchema.partial();

export const createWishlistSchema = z.object({
  title: z.string().min(1).max(300),
  country: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  description: z.string().optional().nullable(),
  priority: z.enum(["low", "medium", "high", "dream"]).default("medium"),
  category: z.enum(["beach", "mountains", "historical", "food", "adventure", "nature", "city", "spiritual"]).optional().nullable(),
  estimatedBudget: z.number().int().optional().nullable(),
  bestSeason: z.string().max(50).optional().nullable(),
  coverImage: z.string().max(2000).optional().nullable(),
  inspirationalQuote: z.string().optional().nullable(),
  whyVisit: z.string().optional().nullable(),
  plannedYear: z.number().int().optional().nullable(),
  tags: z.array(z.string()).optional(),
  isFavorited: z.boolean().optional(),
  /* Explore Mode — what the bucket list needs to place and grade a plan. */
  latitude,
  longitude,
  difficulty: travelDifficulty.optional().nullable(),
  planningStatus: planningStatus.optional().nullable(),
  /* Ticking a destination off. This is the whole of "completed destinations
     move into the visited archive" — Explore reads `isVisited` as the row's
     status, so there is no second record to create and none to reconcile. */
  isVisited: z.boolean().optional(),
  visitedAt: isoDate,
});
export const updateWishlistSchema = createWishlistSchema.partial();

export const createVisitedSchema = z.object({
  tripId: z.string().uuid().optional().nullable(),
  country: z.string().min(1).max(100),
  city: z.string().min(1).max(100),
  place: z.string().max(300).optional().nullable(),
  visitStart: isoDate,
  visitEnd: isoDate,
  rating: z.number().int().min(1).max(10).optional().nullable(),
  mood: z.string().max(50).optional().nullable(),
  weather: z.string().max(50).optional().nullable(),
  notes: z.string().optional().nullable(),
  companions: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
  isFavorited: z.boolean().optional(),
  /* Explore Mode — the position on the map and the plate on the record. */
  category: travelCategory.optional().nullable(),
  latitude,
  longitude,
  elevation: z.number().int().optional().nullable(),
  coverImage: z.string().max(2000).optional().nullable(),
  gallery: z.array(z.string().max(2000)).optional(),
  mapsUrl: z.string().max(2000).optional().nullable(),
});

export const createJournalSchema = z.object({
  tripId: z.string().uuid().optional().nullable(),
  title: z.string().min(1).max(300),
  coverImage: z.string().max(2000).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  date: isoDate,
  mood: z.enum(["excited", "loved_it", "peaceful", "emotional", "amazing", "difficult"]).optional().nullable(),
  content: z.string().optional().nullable(),
  story: z.string().optional().nullable(),
  lessonsLearned: z.string().optional().nullable(),
  favoriteMoment: z.string().optional().nullable(),
  foodTried: z.string().optional().nullable(),
  peopleMet: z.string().optional().nullable(),
  wouldDoAgain: z.string().optional().nullable(),
});

export const createPhotoSchema = z.object({
  tripId: z.string().uuid().optional().nullable(),
  album: z.string().max(100).optional().nullable(),
  url: z.string().min(1).max(2000),
  thumbnail: z.string().max(2000).optional().nullable(),
  caption: z.string().optional().nullable(),
  dateTaken: isoDate,
  camera: z.string().max(100).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  tags: z.array(z.string()).optional(),
});

export const createExpenseSchema = z.object({
  tripId: z.string().uuid().optional().nullable(),
  category: z.enum(["flights", "hotels", "food", "transportation", "shopping", "activities", "visa", "insurance", "miscellaneous"]),
  amount: z.number().int().positive(),
  currency: z.string().max(10).default("USD"),
  description: z.string().optional().nullable(),
  date: isoDate,
  receiptUrl: z.string().max(2000).optional().nullable(),
});

export const createRestaurantSchema = z.object({
  tripId: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(300),
  country: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  cuisine: z.enum(["italian", "japanese", "chinese", "indian", "mexican", "thai", "french", "american", "mediterranean", "korean", "vietnamese", "middle_eastern", "spanish", "other"]).optional().nullable(),
  category: z.enum(["fine_dining", "cafe", "street_food", "bakery", "fast_food", "vegetarian", "seafood"]).optional().nullable(),
  rating: z.number().int().min(1).max(10).optional().nullable(),
  priceRange: z.number().int().min(1).max(5).optional().nullable(),
  notes: z.string().optional().nullable(),
  bestDish: z.string().max(200).optional().nullable(),
  favoriteDrink: z.string().max(200).optional().nullable(),
});

function mapDoc(doc: any) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  const { _id, __v, ...rest } = obj;
  return { ...rest, id: _id.toString() };
}

function mapDocs(docs: any[]) {
  return docs.map(mapDoc);
}

function toIdFilter(id: string, userId: string) {
  return { _id: id, userId };
}

function softDeleteFields() {
  return { deletedAt: new Date(), updatedAt: new Date() };
}

export const travelService = {
  async getTrips(userId: string) {
    await connectToDatabase();
    const docs = await TravelTripModel.find({ userId, deletedAt: null })
      .sort({ createdAt: -1 })
      .lean();
    return mapDocs(docs);
  },
  async getTripById(userId: string, tripId: string) {
    await connectToDatabase();
    const doc = await TravelTripModel.findOne({ _id: tripId, userId, deletedAt: null }).lean();
    return mapDoc(doc);
  },
  async createTrip(userId: string, data: any) {
    const p = createTripSchema.parse(data);
    await connectToDatabase();
    const doc = await TravelTripModel.create({
      ...p,
      userId,
      startDate: p.startDate ? new Date(p.startDate) : null,
      endDate: p.endDate ? new Date(p.endDate) : null,
    });
    const r = mapDoc(doc);

    try {
      const eventDate = r.startDate ?? r.endDate ?? r.createdAt;
      await createTimelineEvent(userId, {
        title: `Trip: ${r.title}`,
        description: `${r.destination}${r.country ? `, ${r.country}` : ""}`,
        eventDate: eventDate.toISOString(),
        category: "travel",
        importance: "high",
        linkedEntityId: r.id,
        linkedEntityType: "trip",
        location: r.destination,
      });
    } catch {}

    return r;
  },
  async updateTrip(userId: string, id: string, data: any) {
    const p = updateTripSchema.parse(data);
    await connectToDatabase();
    const upd: any = { ...p, updatedAt: new Date() };
    if (p.startDate !== undefined) upd.startDate = p.startDate ? new Date(p.startDate) : null;
    if (p.endDate !== undefined) upd.endDate = p.endDate ? new Date(p.endDate) : null;
    const doc = await TravelTripModel.findOneAndUpdate(
      toIdFilter(id, userId),
      upd,
      { new: true },
    ).lean();
    return mapDoc(doc);
  },
  async deleteTrip(userId: string, id: string) {
    await connectToDatabase();
    const doc = await TravelTripModel.findOneAndUpdate(
      toIdFilter(id, userId),
      softDeleteFields(),
      { new: true },
    ).lean();
    return mapDoc(doc);
  },

  async getWishlist(userId: string) {
    await connectToDatabase();
    const docs = await TravelWishlistModel.find({ userId, deletedAt: null })
      .sort({ createdAt: -1 })
      .lean();
    return mapDocs(docs);
  },
  async getWishlistItem(userId: string, id: string) {
    await connectToDatabase();
    const doc = await TravelWishlistModel.findOne({ _id: id, userId, deletedAt: null }).lean();
    return mapDoc(doc);
  },
  async createWishlist(userId: string, data: any) {
    const p = createWishlistSchema.parse(data);
    await connectToDatabase();
    const doc = await TravelWishlistModel.create({
      ...p,
      userId,
      visitedAt: p.visitedAt ? new Date(p.visitedAt) : null,
    });
    return mapDoc(doc);
  },
  async updateWishlist(userId: string, id: string, data: any) {
    const p = updateWishlistSchema.parse(data);
    await connectToDatabase();
    const upd: any = { ...p, updatedAt: new Date() };
    if (p.visitedAt !== undefined) upd.visitedAt = p.visitedAt ? new Date(p.visitedAt) : null;
    /* Ticking a destination off without naming a day stamps today. A visited
       row with no date drops to the foot of the timeline as undated, which is
       the wrong answer when the caller has just said it happened. */
    if (p.isVisited === true && p.visitedAt === undefined) {
      const current = await TravelWishlistModel.findOne({ _id: id, userId })
        .select({ visitedAt: 1 })
        .lean();
      if (!current?.visitedAt) upd.visitedAt = new Date();
    }
    const doc = await TravelWishlistModel.findOneAndUpdate(
      toIdFilter(id, userId),
      upd,
      { new: true },
    ).lean();
    return mapDoc(doc);
  },
  async deleteWishlist(userId: string, id: string) {
    await connectToDatabase();
    const doc = await TravelWishlistModel.findOneAndUpdate(
      toIdFilter(id, userId),
      softDeleteFields(),
      { new: true },
    ).lean();
    return mapDoc(doc);
  },
  async markWishlistVisited(userId: string, id: string) {
    await connectToDatabase();
    const doc = await TravelWishlistModel.findOneAndUpdate(
      toIdFilter(id, userId),
      { isVisited: true, visitedAt: new Date() },
      { new: true },
    ).lean();
    return mapDoc(doc);
  },

  async getVisited(userId: string) {
    await connectToDatabase();
    const docs = await TravelVisitedPlaceModel.find({ userId, deletedAt: null })
      .sort({ visitStart: -1 })
      .lean();
    return mapDocs(docs);
  },
  async createVisited(userId: string, data: any) {
    const p = createVisitedSchema.parse(data);
    await connectToDatabase();
    const doc = await TravelVisitedPlaceModel.create({
      ...p,
      userId,
      visitStart: p.visitStart ? new Date(p.visitStart) : null,
      visitEnd: p.visitEnd ? new Date(p.visitEnd) : null,
    });
    return mapDoc(doc);
  },
  async updateVisited(userId: string, id: string, data: any) {
    const p = createVisitedSchema.partial().parse(data);
    await connectToDatabase();
    const upd: any = { ...p, updatedAt: new Date() };
    if (p.visitStart !== undefined) upd.visitStart = p.visitStart ? new Date(p.visitStart) : null;
    if (p.visitEnd !== undefined) upd.visitEnd = p.visitEnd ? new Date(p.visitEnd) : null;
    const doc = await TravelVisitedPlaceModel.findOneAndUpdate(
      toIdFilter(id, userId),
      upd,
      { new: true },
    ).lean();
    return mapDoc(doc);
  },
  async deleteVisited(userId: string, id: string) {
    await connectToDatabase();
    const doc = await TravelVisitedPlaceModel.findOneAndUpdate(
      toIdFilter(id, userId),
      softDeleteFields(),
      { new: true },
    ).lean();
    return mapDoc(doc);
  },

  async getJournals(userId: string) {
    await connectToDatabase();
    const docs = await TravelJournalModel.find({ userId, deletedAt: null })
      .sort({ date: -1 })
      .lean();
    return mapDocs(docs);
  },
  async getJournalById(userId: string, id: string) {
    await connectToDatabase();
    const doc = await TravelJournalModel.findOne({ _id: id, userId, deletedAt: null }).lean();
    return mapDoc(doc);
  },
  async createJournal(userId: string, data: any) {
    const p = createJournalSchema.parse(data);
    await connectToDatabase();
    const doc = await TravelJournalModel.create({
      ...p,
      userId,
      date: p.date ? new Date(p.date) : null,
    });
    return mapDoc(doc);
  },
  async updateJournal(userId: string, id: string, data: any) {
    const p = createJournalSchema.partial().parse(data);
    await connectToDatabase();
    const upd: any = { ...p, updatedAt: new Date() };
    if (p.date !== undefined) upd.date = p.date ? new Date(p.date) : null;
    const doc = await TravelJournalModel.findOneAndUpdate(
      toIdFilter(id, userId),
      upd,
      { new: true },
    ).lean();
    return mapDoc(doc);
  },
  async deleteJournal(userId: string, id: string) {
    await connectToDatabase();
    const doc = await TravelJournalModel.findOneAndUpdate(
      toIdFilter(id, userId),
      softDeleteFields(),
      { new: true },
    ).lean();
    return mapDoc(doc);
  },

  async getPhotos(userId: string) {
    await connectToDatabase();
    const docs = await TravelPhotoModel.find({ userId, deletedAt: null })
      .sort({ dateTaken: -1 })
      .lean();
    return mapDocs(docs);
  },
  async createPhoto(userId: string, data: any) {
    const p = createPhotoSchema.parse(data);
    await connectToDatabase();
    const doc = await TravelPhotoModel.create({
      ...p,
      userId,
      dateTaken: p.dateTaken ? new Date(p.dateTaken) : null,
    });
    return mapDoc(doc);
  },
  async deletePhoto(userId: string, id: string) {
    await connectToDatabase();
    const doc = await TravelPhotoModel.findOneAndUpdate(
      toIdFilter(id, userId),
      softDeleteFields(),
      { new: true },
    ).lean();
    return mapDoc(doc);
  },

  async getExpenses(userId: string, tripId?: string) {
    await connectToDatabase();
    const filter: any = { userId, deletedAt: null };
    if (tripId) filter.tripId = tripId;
    const docs = await TravelExpenseModel.find(filter)
      .sort({ date: -1 })
      .lean();
    return mapDocs(docs);
  },
  async createExpense(userId: string, data: any) {
    const p = createExpenseSchema.parse(data);
    await connectToDatabase();
    const doc = await TravelExpenseModel.create({
      ...p,
      userId,
      date: p.date ? new Date(p.date) : undefined,
    });
    return mapDoc(doc);
  },
  async deleteExpense(userId: string, id: string) {
    await connectToDatabase();
    const doc = await TravelExpenseModel.findOneAndDelete({
      _id: id,
      userId,
    });
    return mapDoc(doc);
  },

  async getRestaurants(userId: string) {
    await connectToDatabase();
    const docs = await TravelRestaurantModel.find({ userId, deletedAt: null })
      .sort({ createdAt: -1 })
      .lean();
    return mapDocs(docs);
  },
  async createRestaurant(userId: string, data: any) {
    const p = createRestaurantSchema.parse(data);
    await connectToDatabase();
    const doc = await TravelRestaurantModel.create({ ...p, userId });
    return mapDoc(doc);
  },
  async updateRestaurant(userId: string, id: string, data: any) {
    const p = createRestaurantSchema.partial().parse(data);
    await connectToDatabase();
    const doc = await TravelRestaurantModel.findOneAndUpdate(
      toIdFilter(id, userId),
      { ...p, updatedAt: new Date() },
      { new: true },
    ).lean();
    return mapDoc(doc);
  },
  async deleteRestaurant(userId: string, id: string) {
    await connectToDatabase();
    const doc = await TravelRestaurantModel.findOneAndUpdate(
      toIdFilter(id, userId),
      softDeleteFields(),
      { new: true },
    ).lean();
    return mapDoc(doc);
  },

  async getDashboard(userId: string) {
    const [trips, wishlist, visited, journals, photos, expenses] = await Promise.all([
      this.getTrips(userId),
      this.getWishlist(userId),
      this.getVisited(userId),
      this.getJournals(userId),
      this.getPhotos(userId),
      this.getExpenses(userId),
    ]);
    const countries = new Set(visited.map((v: any) => v.country));
    const cities = new Set(visited.map((v: any) => v.city));
    const visitedCountries = [...countries].sort();
    const totalSpent = expenses.reduce((s: number, e: any) => s + Number(e.amount), 0);
    const spendingByCategory: Record<string, number> = {};
    expenses.forEach((e: any) => { spendingByCategory[e.category] = (spendingByCategory[e.category] || 0) + Number(e.amount); });
    const topRated = [...visited].sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));

    return {
      countriesVisited: countries.size,
      visitedCountries,
      citiesExplored: cities.size,
      totalTrips: trips.length,
      completedTrips: trips.filter((t: any) => t.status === "completed").length,
      upcomingTrips: trips.filter((t: any) => t.status === "planning" || t.status === "booked").length,
      wishlistCount: wishlist.length,
      journalCount: journals.length,
      photoCount: photos.length,
      restaurantCount: (await this.getRestaurants(userId)).length,
      totalSpent,
      spendingByCategory,
      averageTripCost: trips.filter((t: any) => t.status === "completed").length > 0
        ? Math.round(totalSpent / trips.filter((t: any) => t.status === "completed").length)
        : 0,
      favoriteDestination: topRated[0]?.city ?? null,
      lastTrip: trips.filter((t: any) => t.status === "completed").sort((a: any, b: any) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0] ?? null,
    };
  },
};
