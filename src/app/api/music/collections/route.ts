import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { createCollection, getCollections, createCollectionSchema } from "@/modules/music";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const collections = await getCollections(userId);
    return NextResponse.json(collections);
  } catch {
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = createCollectionSchema.parse(body);
    const collection = await createCollection(userId, parsed);
    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }
}
