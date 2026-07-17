import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { restoreVersion } from "@/modules/strategy";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const sections = await restoreVersion(userId, id);
    if (!sections) return NextResponse.json({ error: "Version not found" }, { status: 404 });
    return NextResponse.json(sections);
  } catch (error) {
    return NextResponse.json({ error: "Failed to restore version" }, { status: 500 });
  }
}
