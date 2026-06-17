import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getStory } from "@/modules/timeline";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const sourcesParam = searchParams.get("sources");
    const keyword = searchParams.get("keyword") ?? undefined;

    if (!dateFrom || !dateTo) {
      return NextResponse.json(
        { error: "dateFrom and dateTo are required" },
        { status: 400 },
      );
    }

    const sources = sourcesParam
      ? (sourcesParam.split(",") as Array<"journal" | "mood" | "habit" | "travel" | "timeline">)
      : undefined;

    const days = await getStory({
      userId,
      dateFrom,
      dateTo,
      sources,
      keyword,
    });

    return NextResponse.json(days);
  } catch (error) {
    console.error("Failed to fetch story:", error);
    return NextResponse.json(
      { error: "Failed to fetch story" },
      { status: 500 },
    );
  }
}
