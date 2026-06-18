import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import * as repo from "@/modules/movies/repository";
import { collectionSchema } from "@/modules/movies/service";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await repo.getCollections(userId));
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const validated = collectionSchema.parse(body);
  return NextResponse.json(await repo.createCollection({ userId, ...validated }), { status: 201 });
}
