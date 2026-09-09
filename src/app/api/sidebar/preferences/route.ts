import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { SidebarPreferenceModel } from "@/lib/models";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const doc = await SidebarPreferenceModel.findOne({ userId }).lean();

  if (!doc) {
    return NextResponse.json({
      favorites: ["dashboard", "notes", "timeline", "calendar"],
      visibility: { hiddenGroups: [], hiddenItems: [] },
    });
  }

  return NextResponse.json({
    favorites: doc.favorites ?? [],
    visibility: doc.visibility ?? { hiddenGroups: [], hiddenItems: [] },
  });
}

export async function PUT(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { favorites, visibility } = body;

  if (favorites !== undefined && !Array.isArray(favorites)) {
    return NextResponse.json({ error: "Invalid favorites" }, { status: 400 });
  }
  if (
    visibility !== undefined &&
    (typeof visibility !== "object" || !Array.isArray(visibility.hiddenGroups) || !Array.isArray(visibility.hiddenItems))
  ) {
    return NextResponse.json({ error: "Invalid visibility" }, { status: 400 });
  }

  await connectToDatabase();

  const update: Record<string, any> = {};
  if (favorites !== undefined) update.favorites = favorites;
  if (visibility !== undefined) update.visibility = visibility;

  await SidebarPreferenceModel.findOneAndUpdate(
    { userId },
    { $set: update },
    { upsert: true, new: true },
  );

  return NextResponse.json({ success: true });
}
