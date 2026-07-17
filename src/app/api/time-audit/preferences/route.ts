import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getPreferences, updateWidgetVisibility } from "@/modules/time-audit";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const prefs = await getPreferences(userId);
    return NextResponse.json(prefs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const prefs = await updateWidgetVisibility(userId, body.widgetVisibility);
    return NextResponse.json(prefs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
  }
}
