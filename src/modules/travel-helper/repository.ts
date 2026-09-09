import { connectToDatabase } from "@/lib/mongodb";
import { TravelHelperRouteModel } from "@/lib/models/travel-helper";
import type { RouteFilterParams } from "./types";

export type TravelHelperRoute = {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  origin: any;
  destination: any;
  waypoints: any[];
  polyline?: string | null;
  totalDistanceKm?: number | null;
  totalDurationMinutes?: number | null;
  transportMode: string;
  routeDate?: string | null;
  isArchived: boolean;
  isFavorite: boolean;
  tags: string[];
  notes?: string | null;
  elevationMin?: number | null;
  elevationMax?: number | null;
  elevationGain?: number | null;
  elevationLoss?: number | null;
  geometries?: any;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};

export type CreateRouteInput = {
  userId: string;
  name: string;
  description?: string | null;
  origin: any;
  destination: any;
  waypoints?: any[];
  polyline?: string | null;
  totalDistanceKm?: number | null;
  totalDurationMinutes?: number | null;
  transportMode?: string;
  routeDate?: string | null;
  isFavorite?: boolean;
  tags?: string[];
  notes?: string | null;
  elevationMin?: number | null;
  elevationMax?: number | null;
  elevationGain?: number | null;
  elevationLoss?: number | null;
  geometries?: any;
};

function toPlain(doc: any) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  const { _id, __v, ...rest } = obj;
  return { ...rest, id: _id.toString() };
}

function toPlainArray(docs: any[]) {
  return docs.map(toPlain);
}

export async function getRoutes(userId: string, filters?: RouteFilterParams) {
  await connectToDatabase();
  const filter: any = { userId, deletedAt: null };

  if (filters) {
    if (filters.search) {
      filter.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }
    if (filters.transportMode) filter.transportMode = filters.transportMode;
    if (filters.isFavorite !== undefined) filter.isFavorite = filters.isFavorite;
    if (filters.isArchived !== undefined) filter.isArchived = filters.isArchived;
    if (filters.tag) filter.tags = filters.tag;
    if (filters.dateFrom || filters.dateTo) {
      filter.routeDate = {};
      if (filters.dateFrom) filter.routeDate.$gte = filters.dateFrom;
      if (filters.dateTo) filter.routeDate.$lte = filters.dateTo;
    }
  }

  const docs = await TravelHelperRouteModel.find(filter)
    .sort({ isFavorite: -1, createdAt: -1 })
    .lean();
  return toPlainArray(docs);
}

export async function getRouteById(id: string, userId: string) {
  await connectToDatabase();
  const doc = await TravelHelperRouteModel.findOne({ _id: id, userId, deletedAt: null }).lean();
  return toPlain(doc);
}

export async function createRoute(input: CreateRouteInput) {
  await connectToDatabase();
  const doc = await TravelHelperRouteModel.create({
    ...input,
    waypoints: input.waypoints ?? [],
    tags: input.tags ?? [],
    isFavorite: input.isFavorite ?? false,
    isArchived: false,
  });
  return toPlain(doc);
}

export async function updateRoute(id: string, userId: string, input: Partial<CreateRouteInput>) {
  await connectToDatabase();
  const doc = await TravelHelperRouteModel.findOneAndUpdate(
    { _id: id, userId },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function softDeleteRoute(id: string, userId: string) {
  await connectToDatabase();
  const doc = await TravelHelperRouteModel.findOneAndUpdate(
    { _id: id, userId },
    { deletedAt: new Date(), updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function getRoutesByDate(userId: string, date: string) {
  await connectToDatabase();
  const docs = await TravelHelperRouteModel.find({
    userId,
    routeDate: date,
    deletedAt: null,
    isArchived: false,
  })
    .sort({ name: 1 })
    .lean();
  return toPlainArray(docs);
}

export async function getUpcomingRoutes(userId: string, limit = 5) {
  await connectToDatabase();
  const today = new Date().toISOString().slice(0, 10);
  const docs = await TravelHelperRouteModel.find({
    userId,
    routeDate: { $gte: today },
    deletedAt: null,
    isArchived: false,
  })
    .sort({ routeDate: 1 })
    .limit(limit)
    .lean();
  return toPlainArray(docs);
}

export async function getRouteCount(userId: string) {
  await connectToDatabase();
  const count = await TravelHelperRouteModel.countDocuments({
    userId,
    deletedAt: null,
    isArchived: false,
  });
  return count;
}
