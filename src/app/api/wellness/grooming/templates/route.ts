import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { setupGroomingTemplates } from "@/modules/wellness";

export async function POST() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const result = await setupGroomingTemplates(userId);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to setup templates" }, { status: 500 });
  }
}
