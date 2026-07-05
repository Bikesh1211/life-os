import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getJournalCoverageForUser } from "@/modules/journal";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const coverage = await getJournalCoverageForUser(userId);
    return NextResponse.json(coverage);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch coverage" }, { status: 500 });
  }
}
