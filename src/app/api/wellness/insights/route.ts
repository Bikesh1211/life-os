import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getWellnessInsights } from "@/modules/wellness";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const insights = await getWellnessInsights(userId);
    return NextResponse.json(insights);
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
  }
}
