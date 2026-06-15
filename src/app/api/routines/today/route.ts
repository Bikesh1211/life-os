import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getTodayRoutines } from "@/modules/routines";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const routines = await getTodayRoutines(userId);
    return NextResponse.json(routines);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch today's routines" }, { status: 500 });
  }
}
