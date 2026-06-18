import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getEntrySubjects } from "@/modules/knowledge";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const subjects = await getEntrySubjects(userId);
    return NextResponse.json(subjects);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 },
    );
  }
}
