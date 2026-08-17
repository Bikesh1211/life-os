import { pgTable, text, uuid, timestamp, integer, doublePrecision, boolean, pgEnum, index, jsonb, date } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const tripStatusEnum = pgEnum("trip_status", ["planning", "booked", "in_progress", "completed", "cancelled"]);

export const wishlistPriorityEnum = pgEnum("wishlist_priority", ["low", "medium", "high", "dream"]);

export const wishlistCategoryEnum = pgEnum("wishlist_category", [
  "beach", "mountains", "historical", "food", "adventure", "nature", "city", "spiritual",
]);

export const journalMoodEnum = pgEnum("travel_journal_mood", [
  "excited", "loved_it", "peaceful", "emotional", "amazing", "difficult",
]);

export const expenseCategoryEnum = pgEnum("travel_expense_category", [
  "flights", "hotels", "food", "transportation", "shopping", "activities", "visa", "insurance", "miscellaneous",
]);

export const restaurantCategoryEnum = pgEnum("restaurant_category", [
  "fine_dining", "cafe", "street_food", "bakery", "fast_food", "vegetarian", "seafood",
]);

export const cuisineEnum = pgEnum("cuisine_type", [
  "italian", "japanese", "chinese", "indian", "mexican", "thai", "french", "american",
  "mediterranean", "korean", "vietnamese", "middle_eastern", "spanish", "other",
]);

/**
 * How hard the ground was, and how far along the planning got.
 *
 * Both belong to Explore Mode, and both are deliberately shared between a trip,
 * a place already reached and a place still on the list: an archive that grades
 * a finished trek on one scale and a planned one on another cannot compare them.
 */
export const travelDifficultyEnum = pgEnum("travel_difficulty", [
  "easy", "moderate", "hard", "extreme",
]);

export const travelPlanningStatusEnum = pgEnum("travel_planning_status", [
  "planned", "researching", "ready",
]);

export const travelTrips = pgTable(
  "travel_trips",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    title: text("title").notNull(),
    destination: text("destination").notNull(),
    country: text("country"),
    coverImage: text("cover_image"),
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    status: tripStatusEnum("status").default("planning").notNull(),
    budget: integer("budget"),
    currency: text("currency").default("USD"),
    travelers: integer("travelers").default(1),
    notes: text("notes"),
    /* ── Explore Mode ──────────────────────────────────────────────────────
       The expedition reading of a trip. Everything here is nullable: a trip
       entered through the ordinary planner is still a valid expedition, it
       simply prints fewer figures. See `modules/travel/explore`. */
    category: wishlistCategoryEnum("category"),
    distanceKm: integer("distance_km"),
    elevationM: integer("elevation_m"),
    transportation: text("transportation"),
    difficulty: travelDifficultyEnum("difficulty"),
    gallery: text("gallery").array().default([]).notNull(),
    featured: boolean("featured").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    userTripsIdx: index("idx_travel_trips_user").on(table.userId, table.createdAt.desc()),
    userActiveIdx: index("idx_travel_trips_active").on(table.userId, table.deletedAt, table.createdAt.desc()),
  }),
);

export const travelTripDays = pgTable(
  "travel_trip_days",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tripId: uuid("trip_id").notNull().references(() => travelTrips.id, { onDelete: "cascade" }),
    dayNumber: integer("day_number").notNull(),
    date: timestamp("date", { withTimezone: true }),
    title: text("title"),
    notes: text("notes"),
    places: jsonb("places").default([]),
    restaurants: jsonb("restaurants").default([]),
    activities: jsonb("activities").default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tripDaysIdx: index("idx_travel_trip_days").on(table.tripId, table.dayNumber),
  }),
);

export const travelWishlist = pgTable(
  "travel_wishlist",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    country: text("country"),
    city: text("city"),
    priority: wishlistPriorityEnum("priority").default("medium").notNull(),
    category: wishlistCategoryEnum("category"),
    estimatedBudget: integer("estimated_budget"),
    bestSeason: text("best_season"),
    coverImage: text("cover_image"),
    inspirationalQuote: text("inspirational_quote"),
    whyVisit: text("why_visit"),
    plannedYear: integer("planned_year"),
    isFavorited: boolean("is_favorited").default(false).notNull(),
    tags: text("tags").array().default([]).notNull(),
    isVisited: boolean("is_visited").default(false).notNull(),
    visitedAt: timestamp("visited_at", { withTimezone: true }),
    /* ── Explore Mode ──────────────────────────────────────────────────────
       A wishlist row *is* a bucket-list entry, so the archive needs no second
       table for one: flipping `isVisited` is what moves a destination out of
       "The Next Expeditions" and into the visited archive. */
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    difficulty: travelDifficultyEnum("difficulty"),
    planningStatus: travelPlanningStatusEnum("planning_status"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    userWishlistIdx: index("idx_travel_wishlist_user").on(table.userId, table.createdAt.desc()),
    wishlistCategoryIdx: index("idx_travel_wishlist_category").on(table.userId, table.category),
  }),
);

export const travelVisitedPlaces = pgTable(
  "travel_visited_places",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    tripId: uuid("trip_id").references(() => travelTrips.id, { onDelete: "set null" }),
    country: text("country").notNull(),
    city: text("city").notNull(),
    place: text("place"),
    visitStart: timestamp("visit_start", { withTimezone: true }),
    visitEnd: timestamp("visit_end", { withTimezone: true }),
    rating: integer("rating"),
    mood: text("mood"),
    weather: text("weather"),
    notes: text("notes"),
    companions: text("companions").array().default([]).notNull(),
    activities: text("activities").array().default([]).notNull(),
    totalDays: integer("total_days"),
    isFavorited: boolean("is_favorited").default(false).notNull(),
    /* ── Explore Mode ──────────────────────────────────────────────────────
       A position on the map, and the plate on its record. `latitude` and
       `longitude` are what put a place on the expedition map at all; a place
       without them still appears everywhere else in the archive. */
    category: wishlistCategoryEnum("category"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    elevation: integer("elevation"),
    coverImage: text("cover_image"),
    gallery: text("gallery").array().default([]).notNull(),
    mapsUrl: text("maps_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    userVisitedIdx: index("idx_travel_visited_user").on(table.userId, table.visitStart.desc()),
    visitedCountryIdx: index("idx_travel_visited_country").on(table.userId, table.country),
  }),
);

export const travelJournals = pgTable(
  "travel_journals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    tripId: uuid("trip_id").references(() => travelTrips.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    coverImage: text("cover_image"),
    location: text("location"),
    date: timestamp("date", { withTimezone: true }),
    mood: journalMoodEnum("mood"),
    content: text("content"),
    story: text("story"),
    lessonsLearned: text("lessons_learned"),
    favoriteMoment: text("favorite_moment"),
    foodTried: text("food_tried"),
    peopleMet: text("people_met"),
    wouldDoAgain: text("would_do_again"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    userJournalsIdx: index("idx_travel_journals_user").on(table.userId, table.date.desc()),
    journalTripIdx: index("idx_travel_journals_trip").on(table.tripId),
  }),
);

export const travelPhotos = pgTable(
  "travel_photos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    tripId: uuid("trip_id").references(() => travelTrips.id, { onDelete: "set null" }),
    album: text("album"),
    url: text("url").notNull(),
    thumbnail: text("thumbnail"),
    caption: text("caption"),
    dateTaken: timestamp("date_taken", { withTimezone: true }),
    camera: text("camera"),
    location: text("location"),
    weather: text("weather"),
    latitude: text("latitude"),
    longitude: text("longitude"),
    tags: text("tags").array().default([]).notNull(),
    isFavorited: boolean("is_favorited").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    userPhotosIdx: index("idx_travel_photos_user").on(table.userId, table.dateTaken.desc()),
    photoTripIdx: index("idx_travel_photos_trip").on(table.tripId),
    photoAlbumIdx: index("idx_travel_photos_album").on(table.userId, table.album),
  }),
);

export const travelExpenses = pgTable(
  "travel_expenses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    tripId: uuid("trip_id").references(() => travelTrips.id, { onDelete: "cascade" }),
    category: expenseCategoryEnum("category").notNull(),
    amount: integer("amount").notNull(),
    currency: text("currency").default("USD").notNull(),
    convertedAmount: integer("converted_amount"),
    convertedCurrency: text("converted_currency").default("USD"),
    description: text("description"),
    date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),
    receiptUrl: text("receipt_url"),
    isSplit: boolean("is_split").default(false).notNull(),
    splitWith: text("split_with").array().default([]).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    expenseTripIdx: index("idx_travel_expenses_trip").on(table.tripId),
    expenseCategoryIdx: index("idx_travel_expenses_category").on(table.userId, table.category),
    expenseDateIdx: index("idx_travel_expenses_date").on(table.userId, table.date.desc()),
  }),
);

export const travelRestaurants = pgTable(
  "travel_restaurants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    tripId: uuid("trip_id").references(() => travelTrips.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    country: text("country"),
    city: text("city"),
    cuisine: cuisineEnum("cuisine"),
    category: restaurantCategoryEnum("category"),
    rating: integer("rating"),
    priceRange: integer("price_range"),
    photos: text("photos").array().default([]).notNull(),
    notes: text("notes"),
    bestDish: text("best_dish"),
    favoriteDrink: text("favorite_drink"),
    visitCount: integer("visit_count").default(1).notNull(),
    lastVisit: timestamp("last_visit", { withTimezone: true }),
    foodMemory: text("food_memory"),
    foodMemoryMood: text("food_memory_mood"),
    isFavorited: boolean("is_favorited").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    userRestaurantsIdx: index("idx_travel_restaurants_user").on(table.userId, table.createdAt.desc()),
    restaurantCountryIdx: index("idx_travel_restaurants_country").on(table.userId, table.country),
  }),
);
