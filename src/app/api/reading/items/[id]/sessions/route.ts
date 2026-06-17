import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  createReadingSession,
  getReadingSessions,
  createSessionSchema,
} from "@/modules/reading";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sessions = await getReadingSessions(userId, { readingItemId: id });
  return NextResponse.json(sessions);
}

export async function POST(request: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { id } = await params;
    const parsed = createSessionSchema.parse({ ...body, readingItemId: id });
    const session = await createReadingSession(userId, parsed);
    return NextResponse.json(session, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create session";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
