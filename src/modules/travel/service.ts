import { z } from "zod";
import { db } from "@/core/database";
import { eq, and, isNull, desc, asc } from "drizzle-orm";
import {
  travelTrips, travelTripDays, travelWishlist, travelVisitedPlaces,
  travelJournals, travelPhotos, travelExpenses, travelRestaurants,
} from "./schema";

const isoDate = z.string().datetime().optional().nullable();

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

function whereUser(table: any, userId: string) {
  return and(eq(table.userId, userId), isNull(table.deletedAt));
}

function delCol(table: any) {
  return "deletedAt" in table ? { deletedAt: new Date() } : {};
}

export const travelService = {
  async getTrips(userId: string) {
    return db.select().from(travelTrips).where(whereUser(travelTrips, userId)).orderBy(desc(travelTrips.createdAt));
  },
  async getTripById(userId: string, tripId: string) {
    const [r] = await db.select().from(travelTrips).where(and(eq(travelTrips.id, tripId), eq(travelTrips.userId, userId))).limit(1);
    return r ?? null;
  },
  async createTrip(userId: string, data: any) {
    const p = createTripSchema.parse(data);
    const [r] = await db.insert(travelTrips).values({ ...p, userId, startDate: p.startDate ? new Date(p.startDate) : null, endDate: p.endDate ? new Date(p.endDate) : null }).returning();
    return r;
  },
  async updateTrip(userId: string, id: string, data: any) {
    const p = updateTripSchema.parse(data);
    const upd: any = { ...p, updatedAt: new Date() };
    if (p.startDate !== undefined) upd.startDate = p.startDate ? new Date(p.startDate) : null;
    if (p.endDate !== undefined) upd.endDate = p.endDate ? new Date(p.endDate) : null;
    const [r] = await db.update(travelTrips).set(upd).where(and(eq(travelTrips.id, id), eq(travelTrips.userId, userId))).returning();
    return r;
  },
  async deleteTrip(userId: string, id: string) {
    const [r] = await db.update(travelTrips).set({ deletedAt: new Date() }).where(and(eq(travelTrips.id, id), eq(travelTrips.userId, userId))).returning();
    return r;
  },

  async getWishlist(userId: string) {
    return db.select().from(travelWishlist).where(whereUser(travelWishlist, userId)).orderBy(desc(travelWishlist.createdAt));
  },
  async getWishlistItem(userId: string, id: string) {
    const [r] = await db.select().from(travelWishlist).where(and(eq(travelWishlist.id, id), eq(travelWishlist.userId, userId))).limit(1);
    return r ?? null;
  },
  async createWishlist(userId: string, data: any) {
    const p = createWishlistSchema.parse(data);
    const [r] = await db.insert(travelWishlist).values({ ...p, userId }).returning();
    return r;
  },
  async updateWishlist(userId: string, id: string, data: any) {
    const p = updateWishlistSchema.parse(data);
    const [r] = await db.update(travelWishlist).set({ ...p, updatedAt: new Date() }).where(and(eq(travelWishlist.id, id), eq(travelWishlist.userId, userId))).returning();
    return r;
  },
  async deleteWishlist(userId: string, id: string) {
    const [r] = await db.update(travelWishlist).set({ deletedAt: new Date() }).where(and(eq(travelWishlist.id, id), eq(travelWishlist.userId, userId))).returning();
    return r;
  },
  async markWishlistVisited(userId: string, id: string) {
    const [r] = await db.update(travelWishlist).set({ isVisited: true, visitedAt: new Date() }).where(and(eq(travelWishlist.id, id), eq(travelWishlist.userId, userId))).returning();
    return r;
  },

  async getVisited(userId: string) {
    return db.select().from(travelVisitedPlaces).where(whereUser(travelVisitedPlaces, userId)).orderBy(desc(travelVisitedPlaces.visitStart));
  },
  async createVisited(userId: string, data: any) {
    const p = createVisitedSchema.parse(data);
    const [r] = await db.insert(travelVisitedPlaces).values({ ...p, userId, visitStart: p.visitStart ? new Date(p.visitStart) : null, visitEnd: p.visitEnd ? new Date(p.visitEnd) : null }).returning();
    return r;
  },
  async updateVisited(userId: string, id: string, data: any) {
    const p = createVisitedSchema.partial().parse(data);
    const upd: any = { ...p, updatedAt: new Date() };
    if (p.visitStart !== undefined) upd.visitStart = p.visitStart ? new Date(p.visitStart) : null;
    if (p.visitEnd !== undefined) upd.visitEnd = p.visitEnd ? new Date(p.visitEnd) : null;
    const [r] = await db.update(travelVisitedPlaces).set(upd).where(and(eq(travelVisitedPlaces.id, id), eq(travelVisitedPlaces.userId, userId))).returning();
    return r;
  },
  async deleteVisited(userId: string, id: string) {
    const [r] = await db.update(travelVisitedPlaces).set({ deletedAt: new Date() }).where(and(eq(travelVisitedPlaces.id, id), eq(travelVisitedPlaces.userId, userId))).returning();
    return r;
  },

  async getJournals(userId: string) {
    return db.select().from(travelJournals).where(whereUser(travelJournals, userId)).orderBy(desc(travelJournals.date));
  },
  async getJournalById(userId: string, id: string) {
    const [r] = await db.select().from(travelJournals).where(and(eq(travelJournals.id, id), eq(travelJournals.userId, userId))).limit(1);
    return r ?? null;
  },
  async createJournal(userId: string, data: any) {
    const p = createJournalSchema.parse(data);
    const [r] = await db.insert(travelJournals).values({ ...p, userId, date: p.date ? new Date(p.date) : null }).returning();
    return r;
  },
  async updateJournal(userId: string, id: string, data: any) {
    const p = createJournalSchema.partial().parse(data);
    const upd: any = { ...p, updatedAt: new Date() };
    if (p.date !== undefined) upd.date = p.date ? new Date(p.date) : null;
    const [r] = await db.update(travelJournals).set(upd).where(and(eq(travelJournals.id, id), eq(travelJournals.userId, userId))).returning();
    return r;
  },
  async deleteJournal(userId: string, id: string) {
    const [r] = await db.update(travelJournals).set({ deletedAt: new Date() }).where(and(eq(travelJournals.id, id), eq(travelJournals.userId, userId))).returning();
    return r;
  },

  async getPhotos(userId: string) {
    return db.select().from(travelPhotos).where(whereUser(travelPhotos, userId)).orderBy(desc(travelPhotos.dateTaken));
  },
  async createPhoto(userId: string, data: any) {
    const p = createPhotoSchema.parse(data);
    const [r] = await db.insert(travelPhotos).values({ ...p, userId, dateTaken: p.dateTaken ? new Date(p.dateTaken) : null }).returning();
    return r;
  },
  async deletePhoto(userId: string, id: string) {
    const [r] = await db.update(travelPhotos).set({ deletedAt: new Date() }).where(and(eq(travelPhotos.id, id), eq(travelPhotos.userId, userId))).returning();
    return r;
  },

  async getExpenses(userId: string, tripId?: string) {
    const conditions = [eq(travelExpenses.userId, userId)];
    if (tripId) conditions.push(eq(travelExpenses.tripId, tripId));
    return db.select().from(travelExpenses).where(and(...conditions)).orderBy(desc(travelExpenses.date));
  },
  async createExpense(userId: string, data: any) {
    const p = createExpenseSchema.parse(data);
    const [r] = await db.insert(travelExpenses).values({ ...p, userId, date: p.date ? new Date(p.date) : undefined }).returning();
    return r;
  },
  async deleteExpense(userId: string, id: string) {
    const [r] = await db.delete(travelExpenses).where(and(eq(travelExpenses.id, id), eq(travelExpenses.userId, userId))).returning();
    return r;
  },

  async getRestaurants(userId: string) {
    return db.select().from(travelRestaurants).where(whereUser(travelRestaurants, userId)).orderBy(desc(travelRestaurants.createdAt));
  },
  async createRestaurant(userId: string, data: any) {
    const p = createRestaurantSchema.parse(data);
    const [r] = await db.insert(travelRestaurants).values({ ...p, userId }).returning();
    return r;
  },
  async updateRestaurant(userId: string, id: string, data: any) {
    const p = createRestaurantSchema.partial().parse(data);
    const [r] = await db.update(travelRestaurants).set({ ...p, updatedAt: new Date() }).where(and(eq(travelRestaurants.id, id), eq(travelRestaurants.userId, userId))).returning();
    return r;
  },
  async deleteRestaurant(userId: string, id: string) {
    const [r] = await db.update(travelRestaurants).set({ deletedAt: new Date() }).where(and(eq(travelRestaurants.id, id), eq(travelRestaurants.userId, userId))).returning();
    return r;
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
