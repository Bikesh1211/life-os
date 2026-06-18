import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import * as repo from "@/modules/movies/repository";
import { createMemory } from "@/modules/movies/service";

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const onThisDay = searchParams.get("onThisDay");

  try {
    let memories;
    if (onThisDay === "true") {
      const now = new Date();
      memories = await repo.getMemoriesOnThisDay(userId, now.getMonth() + 1, now.getDate());
    } else {
      memories = await repo.getMemories(userId);
    }
    return NextResponse.json(memories);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const rawDate = body.watchDate ?? body.memoryDate;
    const mapped = {
      ...body,
      contextText: body.context ?? body.contextText,
      watchDate: rawDate ? (rawDate.includes("T") ? rawDate : `${rawDate}T00:00:00Z`) : undefined,
    };
    const memory = await createMemory(userId, mapped);
    return NextResponse.json(memory, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Failed" }, { status: 500 });
  }
}
