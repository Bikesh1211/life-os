import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { travelService } from "@/modules/travel";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const photo = await travelService.deletePhoto(userId, id);
    if (!photo) return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 });
  }
}
