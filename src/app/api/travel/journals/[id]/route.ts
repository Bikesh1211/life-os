import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { travelService } from "@/modules/travel";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const journal = await travelService.getJournalById(userId, id);
    if (!journal) return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    return NextResponse.json(journal);
  } catch {
    return NextResponse.json({ error: "Failed to fetch journal" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await request.json();
    const journal = await travelService.updateJournal(userId, id, body);
    if (!journal) return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    return NextResponse.json(journal);
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update journal" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const journal = await travelService.deleteJournal(userId, id);
    if (!journal) return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete journal" }, { status: 500 });
  }
}
