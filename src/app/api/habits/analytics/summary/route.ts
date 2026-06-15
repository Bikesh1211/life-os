import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSummary } from "@/modules/habits";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await getSummary(userId);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 });
  }
}
