import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { saveManualVersion, getManualVersions } from "@/modules/strategy";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const versions = await getManualVersions(userId);
    return NextResponse.json(versions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch versions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const version = await saveManualVersion(userId, body.summary);
    return NextResponse.json(version, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save version" }, { status: 500 });
  }
}
