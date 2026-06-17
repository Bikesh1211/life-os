import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { travelService } from "@/modules/travel";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const item = await travelService.markWishlistVisited(userId, id);
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Failed to mark as visited" }, { status: 500 });
  }
}
