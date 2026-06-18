import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";

import { getMemoriesOnThisDay } from "@/modules/music/repository";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  try {
    const memories = await getMemoriesOnThisDay(userId, month, day);
    return NextResponse.json({ month, day, memories });
  } catch {
    return NextResponse.json({ error: "Failed to fetch memories" }, { status: 500 });
  }
}
