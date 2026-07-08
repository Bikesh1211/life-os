import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getAchievementById, updateAchievement, deleteAchievement, updateAchievementSchema } from "@/modules/career";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const achievement = await getAchievementById(userId, id);
    if (!achievement) return NextResponse.json({ error: "Achievement not found" }, { status: 404 });
    return NextResponse.json(achievement);
  } catch {
    return NextResponse.json({ error: "Failed to fetch achievement" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateAchievementSchema.parse(body) as Record<string, unknown>;
    const achievement = await updateAchievement(userId, id, parsed as any);
    if (!achievement) return NextResponse.json({ error: "Achievement not found" }, { status: 404 });
    return NextResponse.json(achievement);
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update achievement" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const achievement = await deleteAchievement(userId, id);
    if (!achievement) return NextResponse.json({ error: "Achievement not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete achievement" }, { status: 500 });
  }
}
