import { connectToDatabase } from "@/lib/mongodb";
import {
  TravelTripModel,
  TravelVisitedPlaceModel,
  TravelWishlistModel,
  TravelPhotoModel,
  TravelJournalModel,
  TravelTripDayModel,
} from "@/lib/models";

export type TripRow = any;
export type VisitedRow = any;
export type WishRow = any;
export type PhotoRow = any;
export type JournalRow = any;
export type TripDayRow = any;

export interface ArchiveRows {
  trips: TripRow[];
  visited: VisitedRow[];
  wishlist: WishRow[];
  album: PhotoRow[];
  journals: JournalRow[];
  days: TripDayRow[];
}

export async function readArchiveRows(userId: string): Promise<ArchiveRows> {
  await connectToDatabase();

  const [trips, visited, wishlist, album, journals] = await Promise.all([
    TravelTripModel.find({ userId, deletedAt: null })
      .sort({ startDate: -1 })
      .lean(),
    TravelVisitedPlaceModel.find({ userId, deletedAt: null })
      .sort({ visitStart: -1 })
      .lean(),
    TravelWishlistModel.find({ userId, deletedAt: null }).lean(),
    TravelPhotoModel.find({ userId, deletedAt: null })
      .sort({ dateTaken: -1 })
      .lean(),
    TravelJournalModel.find({ userId, deletedAt: null })
      .sort({ date: -1 })
      .lean(),
  ]);

  const days =
    trips.length === 0
      ? []
      : await TravelTripDayModel.find({
          tripId: { $in: trips.map((t: any) => t._id) },
        })
          .sort({ dayNumber: 1 })
          .lean();

  return { trips, visited, wishlist, album, journals, days };
}
