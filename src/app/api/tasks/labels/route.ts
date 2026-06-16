import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createTaskLabel, getUserTaskLabels } from "@/modules/tasks";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const labels = await getUserTaskLabels(userId);
    return NextResponse.json(labels);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch labels" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const label = await createTaskLabel(userId, body);
    return NextResponse.json(label, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: (error as any).errors ?? error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create label" }, { status: 500 });
  }
}
