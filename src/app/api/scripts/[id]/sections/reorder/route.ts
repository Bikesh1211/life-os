import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { reorderScriptSections } from "@/modules/scripts";

export async function PUT(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    await reorderScriptSections(body);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to reorder sections";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
