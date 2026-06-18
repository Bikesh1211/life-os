import { pgTable, text, uuid, timestamp, integer, date, boolean, index, uniqueIndex } from "drizzle-orm/pg-core";

export const networkConnections = pgTable(
  "network_connections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),

    name: text("name").notNull(),
    nickname: text("nickname"),
    profilePictureUrl: text("profile_picture_url"),
    gender: text("gender"),
    birthday: date("birthday"),
    phone: text("phone"),
    email: text("email"),
    address: text("address"),
    country: text("country"),
    city: text("city"),
    occupation: text("occupation"),
    socialLinks: text("social_links").array().default([]).notNull(),
    relationshipTypes: text("relationship_types").array().default([]).notNull(),
    isFavorite: boolean("is_favorite").default(false).notNull(),
    notes: text("notes"),

    firstMetDate: date("first_met_date"),
    friendshipAnniversary: date("friendship_anniversary"),
    lastMetDate: date("last_met_date"),
    lastCallDate: date("last_call_date"),
    lastMessageDate: date("last_message_date"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("idx_network_connections_user").on(table.userId, table.createdAt.desc()),
    favoriteIdx: index("idx_network_connections_fav").on(table.userId, table.isFavorite),
    birthdayIdx: index("idx_network_connections_bday").on(table.birthday),
  }),
);

export const networkMeetups = pgTable(
  "network_meetups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),

    title: text("title").notNull(),
    date: date("date").notNull(),
    location: text("location"),
    photos: text("photos").array().default([]).notNull(),
    expense: integer("expense"),
    notes: text("notes"),
    mood: text("mood"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userDateIdx: index("idx_network_meetups_user_date").on(table.userId, table.date.desc()),
  }),
);

export const networkMeetupConnections = pgTable(
  "network_meetup_connections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    meetupId: uuid("meetup_id").notNull().references(() => networkMeetups.id, { onDelete: "cascade" }),
    connectionId: uuid("connection_id").notNull().references(() => networkConnections.id, { onDelete: "cascade" }),
  },
  (table) => ({
    meetupConnIdx: uniqueIndex("idx_network_meetup_conn").on(table.meetupId, table.connectionId),
  }),
);

export const networkEvents = pgTable(
  "network_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),

    eventType: text("event_type").notNull(),
    title: text("title").notNull(),
    date: date("date").notNull(),
    location: text("location"),
    photos: text("photos").array().default([]).notNull(),
    expense: integer("expense"),
    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userDateIdx: index("idx_network_events_user_date").on(table.userId, table.date.desc()),
    typeIdx: index("idx_network_events_type").on(table.userId, table.eventType),
  }),
);

export const networkEventConnections = pgTable(
  "network_event_connections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id").notNull().references(() => networkEvents.id, { onDelete: "cascade" }),
    connectionId: uuid("connection_id").notNull().references(() => networkConnections.id, { onDelete: "cascade" }),
  },
  (table) => ({
    eventConnIdx: uniqueIndex("idx_network_event_conn").on(table.eventId, table.connectionId),
  }),
);

export const networkMemories = pgTable(
  "network_memories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),

    title: text("title").notNull(),
    description: text("description"),
    photoUrls: text("photo_urls").array().default([]).notNull(),
    videoUrls: text("video_urls").array().default([]).notNull(),
    audioUrl: text("audio_url"),
    quotes: text("quotes"),
    memoryDate: date("memory_date"),
    location: text("location"),
    tags: text("tags").array().default([]).notNull(),
    isFavorite: boolean("is_favorite").default(false).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userDateIdx: index("idx_network_memories_user_date").on(table.userId, table.memoryDate.desc()),
    userFavIdx: index("idx_network_memories_fav").on(table.userId, table.isFavorite),
  }),
);

export const networkMemoryConnections = pgTable(
  "network_memory_connections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    memoryId: uuid("memory_id").notNull().references(() => networkMemories.id, { onDelete: "cascade" }),
    connectionId: uuid("connection_id").notNull().references(() => networkConnections.id, { onDelete: "cascade" }),
  },
  (table) => ({
    memoryConnIdx: uniqueIndex("idx_network_memory_conn").on(table.memoryId, table.connectionId),
  }),
);

export const networkGifts = pgTable(
  "network_gifts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    connectionId: uuid("connection_id").notNull().references(() => networkConnections.id, { onDelete: "cascade" }),

    direction: text("direction", { enum: ["given", "received"] }).notNull(),
    giftName: text("gift_name").notNull(),
    occasion: text("occasion"),
    price: integer("price"),
    date: date("date").notNull(),
    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userConnIdx: index("idx_network_gifts_user_conn").on(table.userId, table.connectionId),
    directionIdx: index("idx_network_gifts_dir").on(table.userId, table.direction),
  }),
);

export const networkTripParticipants = pgTable(
  "network_trip_participants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    connectionId: uuid("connection_id").notNull().references(() => networkConnections.id, { onDelete: "cascade" }),
    tripId: uuid("trip_id").notNull(),
  },
  (table) => ({
    connTripIdx: uniqueIndex("idx_network_trip_participant").on(table.connectionId, table.tripId),
    tripIdx: index("idx_network_trip_trip").on(table.tripId),
  }),
);
