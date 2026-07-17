import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { duplicateTimeEntry } from "@/modules/time-audit";

type Props = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Props) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const entry = await duplicateTimeEntry(id, userId);
    if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to duplicate entry" }, { status: 500 });
  }
}
