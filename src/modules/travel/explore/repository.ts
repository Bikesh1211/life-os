import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/core/database";
import {
  travelJournals,
  travelPhotos,
  travelTripDays,
  travelTrips,
  travelVisitedPlaces,
  travelWishlist,
} from "../schema";

/**
 * The archive's reads.
 *
 * Every query here is scoped by `userId`, which is the reason this layer exists
 * separately from the derivation in `explore.server.ts`: an archive is one
 * person's record of where they have been, and a missing `where` clause on any
 * one of these six tables would quietly hand a reader somebody else's journeys.
 *
 * `travel_trip_days` is the one table with no `user_id` of its own — it is
 * owned through its trip — so its scope comes from trip ids the caller has
 * already been given, and never from a parameter a caller could widen.
 */

export type TripRow = typeof travelTrips.$inferSelect;
export type VisitedRow = typeof travelVisitedPlaces.$inferSelect;
export type WishRow = typeof travelWishlist.$inferSelect;
export type PhotoRow = typeof travelPhotos.$inferSelect;
export type JournalRow = typeof travelJournals.$inferSelect;
export type TripDayRow = typeof travelTripDays.$inferSelect;

export interface ArchiveRows {
  trips: TripRow[];
  visited: VisitedRow[];
  wishlist: WishRow[];
  album: PhotoRow[];
  journals: JournalRow[];
  days: TripDayRow[];
}

export async function readArchiveRows(userId: string): Promise<ArchiveRows> {
  const [trips, visited, wishlist, album, journals] = await Promise.all([
    db
      .select()
      .from(travelTrips)
      .where(and(eq(travelTrips.userId, userId), isNull(travelTrips.deletedAt)))
      .orderBy(desc(travelTrips.startDate)),
    db
      .select()
      .from(travelVisitedPlaces)
      .where(and(eq(travelVisitedPlaces.userId, userId), isNull(travelVisitedPlaces.deletedAt)))
      .orderBy(desc(travelVisitedPlaces.visitStart)),
    db
      .select()
      .from(travelWishlist)
      .where(and(eq(travelWishlist.userId, userId), isNull(travelWishlist.deletedAt))),
    db
      .select()
      .from(travelPhotos)
      .where(and(eq(travelPhotos.userId, userId), isNull(travelPhotos.deletedAt)))
      .orderBy(desc(travelPhotos.dateTaken)),
    db
      .select()
      .from(travelJournals)
      .where(and(eq(travelJournals.userId, userId), isNull(travelJournals.deletedAt)))
      .orderBy(desc(travelJournals.date)),
  ]);

  /* Skipped entirely when there are no trips, which also keeps `inArray` off an
     empty list — Postgres reads `IN ()` as a syntax error. */
  const days =
    trips.length === 0
      ? []
      : await db
          .select()
          .from(travelTripDays)
          .where(
            inArray(
              travelTripDays.tripId,
              trips.map((t) => t.id),
            ),
          )
          .orderBy(asc(travelTripDays.dayNumber));

  return { trips, visited, wishlist, album, journals, days };
}
