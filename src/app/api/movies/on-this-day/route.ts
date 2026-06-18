import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import * as repo from "@/modules/movies/repository";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const now = new Date();
  const memories = await repo.getMemoriesOnThisDay(userId, now.getMonth() + 1, now.getDate());
  return NextResponse.json({ month: now.getMonth() + 1, day: now.getDate(), memories });
}
