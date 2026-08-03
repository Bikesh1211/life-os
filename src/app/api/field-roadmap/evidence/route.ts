import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { addSkillEvidence, addEvidenceSchema, removeSkillEvidence } from "@/modules/field-roadmap";

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const input = addEvidenceSchema.parse(body);
    const evidence = await addSkillEvidence(userId, input);
    if (!evidence) return NextResponse.json({ error: "Could not add evidence" }, { status: 409 });
    return NextResponse.json(evidence);
  } catch {
    return NextResponse.json({ error: "Failed to add evidence" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const evidenceId = searchParams.get("evidenceId");
  if (!evidenceId) return NextResponse.json({ error: "evidenceId required" }, { status: 400 });

  try {
    const removed = await removeSkillEvidence(userId, evidenceId);
    if (!removed) return NextResponse.json({ error: "Evidence not found" }, { status: 404 });
    return NextResponse.json(removed);
  } catch {
    return NextResponse.json({ error: "Failed to remove evidence" }, { status: 400 });
  }
}