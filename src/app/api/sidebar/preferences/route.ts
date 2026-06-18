import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { eq } from "drizzle-orm";
import { db } from "@/core/database/client";
import { sidebarPreferences } from "@/core/database/sidebar-preferences.schema";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(sidebarPreferences)
    .where(eq(sidebarPreferences.userId, userId))
    .limit(1);

  if (rows.length === 0) {
    return NextResponse.json({
      favorites: ["dashboard", "quick_note", "timeline", "calendar"],
      visibility: { hiddenGroups: [], hiddenItems: [] },
    });
  }

  return NextResponse.json({
    favorites: JSON.parse(rows[0].favorites),
    visibility: JSON.parse(rows[0].visibility),
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

  const update: Record<string, string> = {};
  if (favorites !== undefined) update.favorites = JSON.stringify(favorites);
  if (visibility !== undefined) update.visibility = JSON.stringify(visibility);

  await db
    .insert(sidebarPreferences)
    .values({
      userId,
      favorites: update.favorites ?? "[]",
      visibility: update.visibility ?? '{"hiddenGroups":[],"hiddenItems":[]}',
    })
    .onConflictDoUpdate({
      target: sidebarPreferences.userId,
      set: update,
    });

  return NextResponse.json({ success: true });
}
