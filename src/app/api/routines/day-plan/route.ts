import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDayPlan } from "@/modules/routines";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const date = request.nextUrl.searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "Missing date parameter" }, { status: 400 });
  }

  try {
    const plan = await getDayPlan(userId, date);
    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch day plan" }, { status: 500 });
  }
}
