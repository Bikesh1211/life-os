import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getTaskSummary } from "@/modules/tasks";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const summary = await getTaskSummary(userId);
    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch task summary" }, { status: 500 });
  }
}
