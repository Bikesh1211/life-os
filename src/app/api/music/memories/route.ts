import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { createMemory, getMemories, createMemorySchema } from "@/modules/music";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const memories = await getMemories(userId);
    return NextResponse.json(memories);
  } catch {
    return NextResponse.json({ error: "Failed to fetch memories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = createMemorySchema.parse(body);
    const memory = await createMemory(userId, parsed);
    return NextResponse.json(memory, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create memory" }, { status: 500 });
  }
}
