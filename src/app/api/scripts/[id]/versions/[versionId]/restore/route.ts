import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { restoreVersion } from "@/modules/scripts";

type Params = { params: Promise<{ id: string; versionId: string }> };

export async function POST(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { versionId } = await params;
    const result = await restoreVersion(versionId, userId);
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to restore version" }, { status: 500 });
  }
}
