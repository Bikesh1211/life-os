import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getCommitmentById, updateCommitment, deleteCommitment } from "@/modules/integrity";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const commitment = await getCommitmentById(userId, id);
    if (!commitment) return NextResponse.json({ error: "Commitment not found" }, { status: 404 });
    return NextResponse.json(commitment);
  } catch {
    return NextResponse.json({ error: "Failed to fetch commitment" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const commitment = await updateCommitment(userId, id, body);
    if (!commitment) return NextResponse.json({ error: "Commitment not found" }, { status: 404 });
    return NextResponse.json(commitment);
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update commitment" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const commitment = await deleteCommitment(userId, id);
    if (!commitment) return NextResponse.json({ error: "Commitment not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete commitment" }, { status: 500 });
  }
}
