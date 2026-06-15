import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/core/database";
import { musicMemories } from "@/modules/music";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ working: true, userId });
}
