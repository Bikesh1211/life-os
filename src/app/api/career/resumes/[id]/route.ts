import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getResumeById, updateResume, deleteResume, updateResumeSchema } from "@/modules/career";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const resume = await getResumeById(userId, id);
    if (!resume) return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    return NextResponse.json(resume);
  } catch {
    return NextResponse.json({ error: "Failed to fetch resume" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateResumeSchema.parse(body);
    const resume = await updateResume(userId, id, parsed);
    if (!resume) return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    return NextResponse.json(resume);
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update resume" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const resume = await deleteResume(userId, id);
    if (!resume) return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete resume" }, { status: 500 });
  }
}
