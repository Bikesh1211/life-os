import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { ensureDefaults } from "@/modules/curb";

export async function POST() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await ensureDefaults(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to seed defaults" }, { status: 500 });
  }
}
