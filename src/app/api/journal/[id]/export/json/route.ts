import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { exportEntryAsJson } from "@/modules/journal";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const data = await exportEntryAsJson(id, userId);
    if (!data) return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to export entry" }, { status: 500 });
  }
}
